#!/usr/bin/env python3
"""
Cache Test Script for BelHISFirm
Tests SPARQL queries against the caching proxy.
"""

import sys
import time
import urllib.request
import urllib.parse
import urllib.error
import json

# ANSI color codes
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    BOLD = '\033[1m'
    NC = '\033[0m'  # No Color

# Endpoints
DIRECT_ENDPOINT = "https://data.belhisfirm.be/sparql"
CACHE_ENDPOINT = "http://localhost:8099/sparql"

# Sample SPARQL query
TEST_QUERY = """PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?sub ?pred ?obj .
}
LIMIT 1088"""


def execute_query(endpoint: str, query: str, description: str):
    """Execute a SPARQL query and return timing and cache information"""
    print(f"{Colors.GREEN}Query: {description}{Colors.NC}")
    print(f"  Endpoint: {endpoint}")

    # Prepare POST data with proper URL encoding (+ for spaces, like browsers do)
    data = urllib.parse.urlencode({'query': query}).encode('utf-8')
    req = urllib.request.Request(
        endpoint,
        data=data,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/sparql-results+json'
        },
        method='POST'
    )

    # Execute with timing
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            end_time = time.time()
            duration = end_time - start_time

            body = response.read().decode('utf-8')
            http_code = response.status
            headers = dict(response.headers)

            # Cache headers
            cache_status = headers.get('X-Cache-Status', headers.get('x-cache-status', ''))
            request_id = headers.get('X-Request-ID', headers.get('x-request-id', ''))

            # Count results
            result_count = 0
            try:
                json_data = json.loads(body)
                if 'results' in json_data and 'bindings' in json_data['results']:
                    result_count = len(json_data['results']['bindings'])
            except json.JSONDecodeError:
                pass

            # Display results
            print(f"  HTTP Status: {http_code}")
            print(f"  Response Time: {duration:.3f}s")
            print(f"  Result Count: {result_count}")

            if cache_status:
                if cache_status.upper() == 'HIT':
                    print(f"  Cache Status: {Colors.GREEN}{cache_status}{Colors.NC}")
                else:
                    print(f"  Cache Status: {Colors.YELLOW}{cache_status}{Colors.NC}")

            if request_id:
                print(f"  Request ID: {request_id}")

            print()

            return {
                'success': True,
                'http_code': http_code,
                'duration': duration,
                'cache_status': cache_status,
                'result_count': result_count
            }

    except urllib.error.HTTPError as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"  {Colors.RED}HTTP Error: {e.code} - {e.reason}{Colors.NC}")
        print(f"  Response Time: {duration:.3f}s\n")
        return {'success': False, 'http_code': e.code, 'duration': duration}
    except urllib.error.URLError as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"  {Colors.RED}Connection Error: {e.reason}{Colors.NC}")
        print(f"  Response Time: {duration:.3f}s\n")
        return {'success': False, 'duration': duration, 'error': str(e)}
    except Exception as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"  {Colors.RED}Error: {str(e)}{Colors.NC}")
        print(f"  Response Time: {duration:.3f}s\n")
        return {'success': False, 'duration': duration, 'error': str(e)}


def check_cache():
    """Check if the cache endpoint is available by doing a simple SPARQL query"""
    print("Checking cache endpoint...")
    try:
        query = "SELECT * WHERE { ?s ?p ?o } LIMIT 1"
        data = urllib.parse.urlencode({'query': query}).encode('utf-8')
        req = urllib.request.Request(
            CACHE_ENDPOINT,
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            print(f"{Colors.GREEN}✓ Cache available at {CACHE_ENDPOINT}{Colors.NC}\n")
            return True
    except urllib.error.HTTPError as e:
        print(f"{Colors.YELLOW}✓ Cache reachable at {CACHE_ENDPOINT} but upstream returned HTTP {e.code}{Colors.NC}")
        print("  Check if the backend SPARQL endpoint is healthy.\n")
        return True
    except urllib.error.URLError as e:
        print(f"{Colors.RED}✗ Cache not available at {CACHE_ENDPOINT}{Colors.NC}")
        print(f"  Error: {e.reason}")
        print(f"  Start it with: docker compose up -d\n")
        return False


def test_cache():
    """Test caching with multiple requests"""
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}")
    print(f"{Colors.BLUE}Cache Test{Colors.NC}")
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}\n")

    if not check_cache():
        return

    # Use a unique query with timestamp to ensure fresh cache entry
    unique_query = f"""PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
# Test query generated at {int(time.time())}
SELECT * WHERE {{
  ?sub ?pred ?obj .
}}
LIMIT 10"""

    print(f"{Colors.YELLOW}--- Request 1 (MISS expected) ---{Colors.NC}")
    result1 = execute_query(CACHE_ENDPOINT, unique_query, "First request")

    time.sleep(0.5)

    print(f"{Colors.YELLOW}--- Request 2 (HIT expected) ---{Colors.NC}")
    result2 = execute_query(CACHE_ENDPOINT, unique_query, "Second request")

    time.sleep(0.5)

    print(f"{Colors.YELLOW}--- Request 3 (HIT expected) ---{Colors.NC}")
    result3 = execute_query(CACHE_ENDPOINT, unique_query, "Third request")

    # Summary
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}")
    print(f"{Colors.BLUE}Summary{Colors.NC}")
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}")

    results = [result1, result2, result3]
    for i, r in enumerate(results, 1):
        if r['success']:
            cache = r.get('cache_status', 'N/A')
            print(f"  Request {i}: {r['duration']:.3f}s - Cache: {cache}")
        else:
            print(f"  Request {i}: FAILED")

    # Check caching by comparing response times (HIT should be much faster)
    if all(r['success'] for r in results):
        if result2['duration'] < result1['duration'] * 0.5:
            print(f"\n{Colors.GREEN}✓ Caching is working! (2nd request {result1['duration']/result2['duration']:.1f}x faster){Colors.NC}")
        elif result2.get('cache_status', '').upper() == 'HIT':
            print(f"\n{Colors.GREEN}✓ Caching is working!{Colors.NC}")
        else:
            print(f"\n{Colors.YELLOW}⚠ Cache status shows MISS - check CACHE config{Colors.NC}")


def compare_direct_vs_cached():
    """Compare direct endpoint vs cached"""
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}")
    print(f"{Colors.BLUE}Direct vs Cached Comparison{Colors.NC}")
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}\n")

    print(f"{Colors.YELLOW}--- Direct to data.belhisfirm.be ---{Colors.NC}")
    direct_result = execute_query(DIRECT_ENDPOINT, TEST_QUERY, "Direct request")

    if not check_cache():
        return

    print(f"{Colors.YELLOW}--- Through CACHE (first - MISS) ---{Colors.NC}")
    proxy_result1 = execute_query(CACHE_ENDPOINT, TEST_QUERY, "CACHE first")

    time.sleep(0.5)

    print(f"{Colors.YELLOW}--- Through CACHE (second - HIT) ---{Colors.NC}")
    proxy_result2 = execute_query(CACHE_ENDPOINT, TEST_QUERY, "CACHE second")

    # Summary
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}")
    print(f"{Colors.BLUE}Summary{Colors.NC}")
    print(f"{Colors.BLUE}{'=' * 50}{Colors.NC}")

    if direct_result['success']:
        print(f"  Direct:         {direct_result['duration']:.3f}s")
    if proxy_result1['success']:
        print(f"  CACHE (MISS): {proxy_result1['duration']:.3f}s")
    if proxy_result2['success']:
        print(f"  CACHE (HIT):  {proxy_result2['duration']:.3f}s")

        if direct_result['success'] and proxy_result2['duration'] < direct_result['duration']:
            speedup = direct_result['duration'] / proxy_result2['duration']
            print(f"\n{Colors.GREEN}✓ Cache speedup: {speedup:.1f}x faster{Colors.NC}")


def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == '--compare':
            compare_direct_vs_cached()
        elif sys.argv[1] == '--help':
            print("Usage: python test_cache.py [--compare]")
            print("  (no args)  - Test caching")
            print("  --compare  - Compare direct vs cached performance")
        else:
            test_cache()
    else:
        test_cache()


if __name__ == '__main__':
    main()
