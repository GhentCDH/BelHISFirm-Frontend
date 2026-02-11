## Belhisfirm - Cache layer

This cache layer is based on the NGINX configuration from the NOI Techpark Open Data Hub SPARQL project. Source file (commit eda53616c252691a73a8eb87963664cd06ca3e93):
https://github.com/noi-techpark/opendatahub-kg-sparql/blob/eda53616c252691a73a8eb87963664cd06ca3e93/infrastructure/docker/nginx/default.conf

Credits: NOI Techpark / Open Data Hub team and contributors. License and attribution follow the upstream repository.

### Required environment variables

The endpoint do cache, the hostname used in the request to the endpoint and the cache time to live duration. 24h keeps the cache alive for many requests while also allowing new data coming in in a reasonable time. 


- CACHE_ENDPOINT=https://data.belhisfirm.be
- CACHE_HOST=data.belhisfirm.be
- CACHE_DURATION=24h
- CACHE_MAX_SIZE=1g



This directory contains the Nginx configuration template used for the frontend caching layer. The Nginx configuration uses a **template file** (typically `default.conf.template`) instead of a static configuration file. This approach allows the configuration to be dynamically generated at container startup by substituting **environment variables** into the template.

- **Environment-specific configuration**: The same Docker image can be deployed across multiple environments (development, staging, production) without rebuilding. Environment variables control behavior like backend API URLs, cache durations, and port bindings.
- **12-Factor App compliance**: Configuration is stored in the environment, not in code.
- **Flexibility**: Values such as upstream server addresses, cache sizes, and timeouts can be adjusted at runtime.

When the container starts, `envsubst` (a utility bundled with the Nginx Docker image) processes the template file and replaces placeholders (e.g., `${API_URL}`, `${CACHE_TTL}`) with their corresponding environment variable values. The resulting file is then used as the active Nginx configuration.


### What it does (summary)

- Caches GET/HEAD/POST responses from the SPARQL endpoint
- Uses request body as part of the cache key (when the body is small enough to be buffered)
- Enables gzip and increases proxy read timeout for long SPARQL queries