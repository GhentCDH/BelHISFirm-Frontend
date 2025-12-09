vcl 4.1;

# Import std module for cache operations
import std;
# Import bodyaccess for POST request body hashing
import bodyaccess;

# Define ACL for localhost (used for cache purging)
acl localhost {
    "localhost";
    "127.0.0.1";
    "::1";
}

# Backend definition - Ontop SPARQL endpoint
backend ontop {
    # Use host.docker.internal to access services on host network from bridge network
    .host = "localhost";
    .port = "8080";

    # Connection timeouts
    .connect_timeout = 10s;
    .first_byte_timeout = 60s;
    .between_bytes_timeout = 10s;

    # Health probe to check if Ontop is available
    .probe = {
        .url = "/";
        .interval = 10s;
        .timeout = 3s;
        .window = 5;
        .threshold = 3;
    }
}

# Called at the beginning of a request, after the complete request has been received
sub vcl_recv {
    # Set backend
    set req.backend_hint = ontop;

    # Clear the body length marker
    unset req.http.X-Body-Len;

    # Cache POST requests to SPARQL endpoint
    if (req.method == "POST" && req.url ~ "^/sparql") {
        std.log("Caching POST request for: " + req.http.host + req.url);

        # Check body size limit (10MB for SPARQL queries)
        if (std.integer(req.http.content-length, 0) > 10485760) {
            return(synth(413, "Request body too large (max 10MB)"));
        }

        # Cache the request body (up to 10MB)
        if (!std.cache_req_body(10MB)) {
            std.log("Failed to cache request body, passing through");
            return(pass);
        }

        # Mark that we have a body to hash
        set req.http.X-Body-Len = bodyaccess.len_req_body();

        return(hash);
    }

    # Allow GET and HEAD caching (standard behavior)
    if (req.method == "GET" || req.method == "HEAD") {
        return(hash);
    }

    # Allow cache purging from localhost
    # Use BAN instead of PURGE to clear all /sparql entries regardless of body
    if (req.method == "PURGE" || req.method == "BAN") {
        if (!client.ip ~ localhost) {
            return (synth(403, "Not allowed."));
        }
        # BAN clears all cached objects matching the URL pattern
        # This works for POST requests with different bodies
        ban("req.url ~ " + req.url);
        return (synth(200, "Banned"));
    }

    # Pass through other methods (PUT, DELETE, etc.) without caching
    return(pass);
}

# Called to create a hash value for the request
# This determines the cache key - different keys = different cache entries
sub vcl_hash {
    # Always include the URL in the hash
    hash_data(req.url);

    # Include the host header
    if (req.http.host) {
        hash_data(req.http.host);
    } else {
        hash_data(server.ip);
    }

    # For POST requests, hash the request body
    # This ensures different SPARQL queries get different cache entries
    if (req.http.X-Body-Len) {
        bodyaccess.hash_req_body();
    } else {
        hash_data("");
    }

    return(lookup);
}

# Called after a response has been retrieved from the backend
sub vcl_backend_response {
    # Cache successful SPARQL responses
    if (beresp.status == 200 && bereq.url ~ "^/sparql") {
        # Cache for 1 hour by default
        set beresp.ttl = 1h;

        # Enable grace mode - serve stale content for up to 6 hours if backend is down
        set beresp.grace = 6h;

        # Keep stale content for error recovery
        set beresp.keep = 10m;
    }

    # Respect Cache-Control headers from Ontop if present
    # Ontop may set: max-age, stale-while-revalidate, stale-if-error
    if (beresp.http.Cache-Control) {
        # Let Varnish use the Cache-Control header
        # This allows backend to override default TTL
    }

    # Don't cache error responses
    if (beresp.status >= 400) {
        set beresp.ttl = 0s;
        set beresp.uncacheable = true;
        return(deliver);
    }

    return(deliver);
}

# Called before a cached object is delivered to the client
sub vcl_deliver {
    # Add debug headers to show cache status
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
        set resp.http.X-Cache-Hits = obj.hits;
    } else {
        set resp.http.X-Cache = "MISS";
    }

    # Add backend health status for debugging
    if (std.healthy(req.backend_hint)) {
        set resp.http.X-Backend-Health = "healthy";
    } else {
        set resp.http.X-Backend-Health = "unhealthy";
    }

    # Add age header
    set resp.http.X-Cache-Age = resp.http.Age;

    # Remove internal Varnish headers (optional, for security)
    # Uncomment these lines to hide Varnish presence
    # unset resp.http.Via;
    # unset resp.http.X-Varnish;

    return(deliver);
}

# Called when hitting an object, but the request otherwise indicates pass mode
sub vcl_hit {
    # Serve content if it's still valid
    if (obj.ttl >= 0s) {
        # Normal cache hit
        return(deliver);
    }

    # Serve stale content if backend is unhealthy or within grace period
    if (!std.healthy(req.backend_hint)) {
        # Backend is unhealthy, serve stale content if available
        if (obj.ttl + obj.grace > 0s) {
            return(deliver);
        }
    } else {
        # Backend is healthy but object is slightly stale
        if (obj.ttl + 10s > 0s) {
            # Trigger background fetch and serve stale
            return(deliver);
        }
    }

    # Object is too stale and backend unavailable, fetch from backend
    return(restart);
}

# Called when no cached object is found
sub vcl_miss {
    # Fetch from backend
    return(fetch);
}

# Called when backend fetch is about to be done
sub vcl_backend_fetch {
    # Restore POST method for backend requests
    # Varnish converts POST to GET by default after caching
    if (bereq.http.X-Body-Len) {
        set bereq.method = "POST";
    }

    return(fetch);
}
