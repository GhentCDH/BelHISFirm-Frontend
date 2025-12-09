# Varnish Cache Configuration

This directory contains the Varnish caching layer configuration for the BelHISFirm development environment.

## Files

- **default.vcl** - Varnish Configuration Language file that defines caching behavior
- **test-cache.py** - Interactive Python script for testing cache functionality

## Varnish Configuration (default.vcl)

### Key Features

1. **POST Request Body Caching**: Uses the `bodyaccess` VMOD to hash POST request bodies, allowing SPARQL POST queries to be cached. Different queries receive different cache entries based on their request body content.

2. **Request Size Limit**: POST requests up to 10MB are cacheable. Larger requests return HTTP 413.

3. **Cache TTL**:
   - Default TTL: 1 hour
   - Grace period: 6 hours (serves stale content if backend is down)

4. **Debug Headers**:
   - `X-Cache: HIT/MISS` - Indicates cache hit or miss
   - `X-Cache-Hits` - Number of times this object has been served from cache
   - `X-Backend-Health` - Ontop backend health status

5. **Backend Configuration**:
   - Host: `localhost` (Varnish uses host networking)
   - Port: `8080` (Ontop endpoint)
   - Health checks every 10 seconds

### VCL Workflow

```
POST Request → vcl_recv (cache body with std.cache_req_body)
             → vcl_hash (hash URL + host + request body)
             → vcl_hit/vcl_miss (serve from cache or fetch)
             → vcl_backend_fetch (restore POST method)
             → vcl_backend_response (set TTL and grace)
             → vcl_deliver (add debug headers)

GET Request  → vcl_recv (allow caching)
             → vcl_hash (hash URL + host)
             → vcl_hit/vcl_miss (serve from cache or fetch)
             → vcl_backend_response (set TTL and grace)
             → vcl_deliver (add debug headers)
```

### How POST Caching Works

1. **Body Buffering**: `std.cache_req_body(10MB)` buffers the POST body in memory
2. **Body Hashing**: `bodyaccess.hash_req_body()` includes the body in the cache key
3. **Method Restoration**: `bereq.method = "POST"` ensures backend receives POST
4. **Unique Cache Keys**: Different SPARQL queries get different cache entries

This implementation follows the official Varnish tutorial: https://www.varnish-software.com/developers/tutorials/caching-post-requests-varnish/

## Testing Cache Functionality

### Quick Test

```bash
# Make sure services are running
docker compose up -d vkg-scob varnish

# Run the test script
./varnish/test-cache.py
```

### Test Script Features

The `test-cache.py` script provides an interactive menu with the following options:

1. **Test Simple Query** - Test with a basic 10-triple query
2. **Test Corporations Query** - Test with 50 corporation results
3. **Test Securities Query** - Test with 50 securities results
4. **Test Complex Query** - Test with 100 results including JOINs
5. **Compare Direct vs Cached** - Compare all queries against Ontop and Varnish
6. **Test Cache Persistence** - Send 3 identical requests to verify HIT behavior
7. **Purge Varnish Cache** - Clear all cached entries
8. **Show Cache Statistics** - Display Varnish hit/miss statistics
9. **Run Full Test Suite** - Execute all tests automatically

### Automatic Mode

Run all tests without interaction:

```bash
./varnish/test-cache.py --auto
```

### Manual Testing with curl

**Test direct to Ontop:**
```bash
curl -X POST http://localhost:8080/sparql \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/sparql-results+json" \
  --data-urlencode "query=SELECT * WHERE { ?s ?p ?o } LIMIT 10" \
  -i
```

**Test through Varnish (first request - MISS):**
```bash
curl -X POST http://localhost:8082/sparql \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/sparql-results+json" \
  --data-urlencode "query=SELECT * WHERE { ?s ?p ?o } LIMIT 10" \
  -i
```

**Test through Varnish (second request - HIT):**
```bash
# Run the same command again - should see X-Cache: HIT
curl -X POST http://localhost:8082/sparql \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/sparql-results+json" \
  --data-urlencode "query=SELECT * WHERE { ?s ?p ?o } LIMIT 10" \
  -i
```

## Monitoring Cache Performance

### View Real-Time Statistics

```bash
docker exec belhisfirm-varnish-dev varnishstat
```

Key metrics to watch:
- `cache_hit` - Number of cache hits
- `cache_miss` - Number of cache misses
- `n_object` - Number of objects in cache
- `n_expired` - Number of expired objects

### View Hit Rate

```bash
docker exec belhisfirm-varnish-dev varnishstat -1 | grep -E "cache_hit|cache_miss"
```

### View Cache Logs

```bash
# Real-time log of all requests
docker exec belhisfirm-varnish-dev varnishlog

# Filter for cache hits only
docker exec belhisfirm-varnish-dev varnishlog -q "VCL_call eq 'HIT'"

# Filter for backend requests (cache misses)
docker exec belhisfirm-varnish-dev varnishlog -q "VCL_call eq 'MISS'"
```

### Check Backend Health

```bash
docker exec belhisfirm-varnish-dev varnishadm backend.list
```

Expected output:
```
Backend name    Admin      Probe      Health
ontop           probe      Healthy    5/5
```

## Cache Management

### Purge Entire Cache

```bash
curl -X PURGE http://localhost:8082/sparql
```

### Restart Varnish

```bash
docker compose restart varnish
```

### Reload VCL Without Restart

```bash
# After editing default.vcl
docker compose restart varnish
```

Note: Varnish doesn't support hot reload in Docker. Restart is required for VCL changes.

## Troubleshooting

### Issue: "Undefined acl localhost"

**Symptom:** Varnish container exits with error about undefined ACL.

**Solution:** Ensure `default.vcl` defines the `acl localhost` block before it's used in `vcl_recv`.

### Issue: No Cache Hits (Always MISS)

**Symptom:** `X-Cache: MISS` on every request.

**Possible causes:**
1. **Request body not being hashed**: Check that `import blob;` is at the top of `default.vcl`
2. **VCL compilation errors**: Check logs: `docker logs belhisfirm-varnish-dev`
3. **Cache-Control headers**: Ontop might be sending `Cache-Control: no-cache`

**Debug:**
```bash
# Check if POST body caching is enabled
docker exec belhisfirm-varnish-dev varnishlog -g request -q "ReqMethod eq 'POST'"

# Check cache key hash
docker exec belhisfirm-varnish-dev varnishlog -q "Hash"
```

### Issue: Backend Unhealthy

**Symptom:** `X-Backend-Health: unhealthy` in response headers.

**Solution:**
1. Verify Ontop is running: `docker compose ps vkg-scob`
2. Check Ontop logs: `docker compose logs vkg-scob`
3. Test direct connection: `curl http://localhost:8080/`
4. Check health probe in VCL: Backend `.probe` configuration

### Issue: Stale Data Being Served

**Symptom:** UI shows outdated data after database updates.

**Solutions:**
1. Purge cache: `curl -X PURGE http://localhost:8082/sparql`
2. Reduce TTL in `default.vcl`: Change `beresp.ttl = 1h` to `beresp.ttl = 5m`
3. Implement smarter invalidation based on query patterns

### Issue: High Memory Usage

**Symptom:** Varnish container using excessive memory.

**Solution:** Adjust cache size in `compose.yml`:
```yaml
environment:
  VARNISH_SIZE: 128M  # Reduce from 256M
```

## Performance Tuning

### Increase Cache Size (for larger datasets)

Edit `compose.yml`:
```yaml
varnish:
  environment:
    VARNISH_SIZE: 512M  # or 1G for production
```

### Adjust TTL by Query Type

Edit `default.vcl` to set different TTL based on query complexity:

```vcl
sub vcl_backend_response {
    if (bereq.url ~ "^/sparql") {
        # Simple queries - cache longer
        if (beresp.http.Content-Length < "10000") {
            set beresp.ttl = 6h;
        }
        # Complex queries - cache shorter
        else {
            set beresp.ttl = 30m;
        }
    }
}
```

### Enable HTTP/2 (experimental)

Add to `compose.yml` command:
```yaml
command:
  - "-p"
  - "feature=+http2"
```

## Cache Strategy for Different Query Types

| Query Type | TTL | Reasoning |
|------------|-----|-----------|
| Facet counts | 6h | Changes infrequently |
| Search results | 1h | Balance freshness vs performance |
| Instance pages | 2h | Individual entities change rarely |
| Aggregations | 30m | May reflect recent data changes |

Adjust TTLs in `default.vcl` based on your data update frequency.

## Production Considerations

When deploying to production:

1. **Remove from production**: Varnish is currently development-only. To add to production, update `compose-prod.yml`.

2. **Increase cache size**: Use at least 1-2GB for production workloads.

3. **Add SSL/TLS**: Place Varnish behind nginx or another SSL termination proxy.

4. **Implement cache warming**: Pre-populate cache with common queries on startup.

5. **Monitor cache hit rate**: Set up Prometheus/Grafana for Varnish metrics.

6. **Configure cache invalidation**: Set up webhooks or triggers to purge cache on data updates.
