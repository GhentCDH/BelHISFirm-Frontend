#!/usr/bin/env python3
"""
Varnish Cache Test Script for BelHISFirm
Tests SPARQL queries against Ontop (direct) and Varnish (cached)

NOTE: This Varnish instance uses the bodyaccess VMOD to cache POST requests
by hashing the request body. Different SPARQL queries receive different cache
entries. This script uses POST requests by default (standard SPARQL method).
"""

import sys
import time
import urllib.request
import urllib.parse
import urllib.error
import json
from typing import Dict, Tuple, Optional

# ANSI color codes
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    BOLD = '\033[1m'
    NC = '\033[0m'  # No Color

# Endpoints
ONTOP_ENDPOINT = "http://localhost:8080/sparql"
VARNISH_ENDPOINT = "http://localhost:8082/sparql"

# Sample SPARQL queries
QUERIES = {
    'small': "SELECT * WHERE { ?s ?p ?o } LIMIT 10",
    'corporations': """PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?corporation ?name WHERE {
  ?corporation a bhf:Corporation ;
               bhf:hasName/rdfs:label ?name .
} LIMIT 50""",
    'securities': """PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?stock ?name WHERE {
  ?stock a bhf:Stock ;
         bhf:hasName/rdfs:label ?name .
} LIMIT 50""",
    'complex': """PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?corporation ?corpName ?legalForm ?address WHERE {
  ?corporation a bhf:Corporation ;
               bhf:hasName/rdfs:label ?corpName .
  OPTIONAL { ?corporation bhf:hasLegalForm/rdfs:label ?legalForm . }
  OPTIONAL { ?corporation bhf:hasAddress ?address . }
} LIMIT 100"""
}

def print_header(text: str):
    """Print a section header"""
    print(f"\n{Colors.BLUE}{'=' * 40}{Colors.NC}")
    print(f"{Colors.BLUE}{text}{Colors.NC}")
    print(f"{Colors.BLUE}{'=' * 40}{Colors.NC}\n")

def print_subsection(text: str):
    """Print a subsection header"""
    print(f"{Colors.YELLOW}--- {text} ---{Colors.NC}")

def execute_query(endpoint: str, query: str, description: str, method: str = 'POST') -> Dict:
    """
    Execute a SPARQL query and return timing and cache information
    """
    # Extract first and last 3 words of query for debugging
    query_words = query.strip().split()
    first_words = ' '.join(query_words[:3]) if len(query_words) >= 3 else query.strip()
    last_words = ' '.join(query_words[-3:]) if len(query_words) >= 3 else query.strip()

    print(f"{Colors.GREEN}Query: {description} [{method}]{Colors.NC}")
    print(f"  SPARQL: {first_words} ... {last_words}")

    if method == 'POST':
        # Prepare POST data
        data = urllib.parse.urlencode({'query': query}).encode('utf-8')
        url = endpoint
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/sparql-results+json'
            },
            method='POST'
        )
    else:  # GET
        # SPARQL spec allows GET requests with query in URL parameter
        query_params = urllib.parse.urlencode({'query': query})
        url = f"{endpoint}?{query_params}"
        req = urllib.request.Request(
            url,
            headers={
                'Accept': 'application/sparql-results+json'
            },
            method='GET'
        )

    # Execute with timing
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            end_time = time.time()
            duration = end_time - start_time

            # Read response
            body = response.read().decode('utf-8')
            http_code = response.status

            # Get headers
            headers = dict(response.headers)
            cache_status = headers.get('X-Cache', headers.get('x-cache', ''))
            cache_hits = headers.get('X-Cache-Hits', headers.get('x-cache-hits', ''))
            backend_health = headers.get('X-Backend-Health', headers.get('x-backend-health', ''))

            # Try to parse JSON and count results
            result_count = 0
            try:
                data = json.loads(body)
                if 'results' in data and 'bindings' in data['results']:
                    result_count = len(data['results']['bindings'])
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

            if cache_hits:
                print(f"  Cache Hits: {cache_hits}")

            if backend_health:
                print(f"  Backend Health: {backend_health}")

            print()

            return {
                'success': True,
                'http_code': http_code,
                'duration': duration,
                'cache_status': cache_status,
                'cache_hits': cache_hits,
                'result_count': result_count
            }

    except urllib.error.HTTPError as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"  {Colors.RED}HTTP Error: {e.code} - {e.reason}{Colors.NC}")
        print(f"  Response Time: {duration:.3f}s\n")
        return {
            'success': False,
            'http_code': e.code,
            'duration': duration,
            'error': str(e)
        }
    except urllib.error.URLError as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"  {Colors.RED}Connection Error: {e.reason}{Colors.NC}")
        print(f"  Response Time: {duration:.3f}s\n")
        return {
            'success': False,
            'duration': duration,
            'error': str(e)
        }
    except Exception as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"  {Colors.RED}Error: {str(e)}{Colors.NC}")
        print(f"  Response Time: {duration:.3f}s\n")
        return {
            'success': False,
            'duration': duration,
            'error': str(e)
        }

def test_query_caching(endpoint: str, query: str, description: str, iterations: int = 3, method: str = 'POST'):
    """Test query multiple times to verify caching"""
    print_subsection(description)

    results = []
    for i in range(1, iterations + 1):
        print(f"{Colors.BLUE}Request #{i}:{Colors.NC}")
        result = execute_query(endpoint, query, description, method)
        results.append(result)
        time.sleep(0.5)

    return results

def compare_endpoints(query: str, description: str, method: str = 'POST'):
    """Compare direct Ontop vs Varnish performance"""
    print_subsection(f"Comparing: {description}")

    print(f"{Colors.YELLOW}Direct to Ontop (no cache):{Colors.NC}")
    execute_query(ONTOP_ENDPOINT, query, description, method)

    print(f"{Colors.YELLOW}Through Varnish (first request - MISS expected):{Colors.NC}")
    execute_query(VARNISH_ENDPOINT, query, description, method)

    print(f"{Colors.YELLOW}Through Varnish (second request - HIT expected):{Colors.NC}")
    execute_query(VARNISH_ENDPOINT, query, description, method)

    print(f"{Colors.YELLOW}Through Varnish (third request - HIT expected):{Colors.NC}")
    execute_query(VARNISH_ENDPOINT, query, description, method)

def purge_cache():
    """Purge Varnish cache using BAN (clears all /sparql entries)"""
    print_subsection("Purging Varnish Cache")

    # Use BAN method to clear all cached entries for /sparql
    # This works for POST requests with different bodies
    req = urllib.request.Request(VARNISH_ENDPOINT, method='PURGE')
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            http_code = response.status
            body = response.read().decode('utf-8')
            if http_code == 200:
                print(f"{Colors.GREEN}✓ Cache banned successfully (HTTP {http_code}){Colors.NC}")
                print(f"  All cached entries for /sparql have been invalidated\n")
            else:
                print(f"{Colors.YELLOW}Cache ban response: HTTP {http_code}{Colors.NC}\n")
    except urllib.error.HTTPError as e:
        if e.code == 200:
            print(f"{Colors.GREEN}✓ Cache banned successfully (HTTP {e.code}){Colors.NC}\n")
        else:
            print(f"{Colors.RED}✗ Cache ban failed (HTTP {e.code}){Colors.NC}\n")
    except Exception as e:
        print(f"{Colors.RED}✗ Cache ban error: {str(e)}{Colors.NC}\n")

def check_endpoints():
    """Check if endpoints are available"""
    print("Checking endpoints...")

    # Check Ontop
    try:
        req = urllib.request.Request(ONTOP_ENDPOINT, method='GET')
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"{Colors.GREEN}✓ Ontop endpoint available at {ONTOP_ENDPOINT}{Colors.NC}")
    except Exception:
        print(f"{Colors.RED}✗ Ontop endpoint not available at {ONTOP_ENDPOINT}{Colors.NC}")
        print(f"  Make sure Ontop is running: docker compose up vkg-scob")

    # Check Varnish
    try:
        req = urllib.request.Request(VARNISH_ENDPOINT, method='GET')
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"{Colors.GREEN}✓ Varnish endpoint available at {VARNISH_ENDPOINT}{Colors.NC}")
    except Exception:
        print(f"{Colors.RED}✗ Varnish endpoint not available at {VARNISH_ENDPOINT}{Colors.NC}")
        print(f"  Make sure Varnish is running: docker compose up varnish")

    print()

# Test functions
def test_simple():
    print_header("Test 1: Simple Query")
    compare_endpoints(QUERIES['small'], "Simple Query (10 triples)")

def test_corporations():
    print_header("Test 2: Corporations Query")
    compare_endpoints(QUERIES['corporations'], "Corporations (50 results)")

def test_securities():
    print_header("Test 3: Securities Query")
    compare_endpoints(QUERIES['securities'], "Securities (50 results)")

def test_complex():
    print_header("Test 4: Complex Query")
    compare_endpoints(QUERIES['complex'], "Complex Query (100 results with joins)")

def test_compare_all():
    print_header("Test 5: Compare All Queries")
    test_simple()
    test_corporations()
    test_securities()
    test_complex()

def test_persistence():
    print_header("Test 6: Cache Persistence")
    test_query_caching(VARNISH_ENDPOINT, QUERIES['corporations'], "Corporations Query", 3)

def run_full_suite():
    print_header("Running Full Test Suite")

    # Purge cache first
    purge_cache()

    # Run all tests
    test_simple()
    time.sleep(1)
    test_corporations()
    time.sleep(1)
    test_securities()
    time.sleep(1)
    test_complex()
    time.sleep(1)
    test_persistence()

    print(f"\n{Colors.GREEN}✓ Full test suite completed{Colors.NC}")

def show_menu():
    """Display main menu"""
    print("\033[2J\033[H")  # Clear screen
    print(f"{Colors.GREEN}╔════════════════════════════════════════════╗{Colors.NC}")
    print(f"{Colors.GREEN}║   Varnish Cache Test Script - BelHISFirm  ║{Colors.NC}")
    print(f"{Colors.GREEN}╚════════════════════════════════════════════╝{Colors.NC}")
    print()
    print("1. Test Simple Query (10 triples)")
    print("2. Test Corporations Query (50 results)")
    print("3. Test Securities Query (50 results)")
    print("4. Test Complex Query (100 results with joins)")
    print("5. Compare Direct vs Cached (all queries)")
    print("6. Test Cache Persistence (3 identical requests)")
    print("7. Purge Varnish Cache")
    print("8. Check Endpoints Status")
    print("9. Run Full Test Suite")
    print("0. Exit")
    print()

def main():
    """Main interactive loop"""
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        # Automatic mode
        check_endpoints()
        run_full_suite()
        return

    # Interactive mode
    while True:
        show_menu()
        try:
            choice = input("Select option: ").strip()

            if choice == '1':
                test_simple()
            elif choice == '2':
                test_corporations()
            elif choice == '3':
                test_securities()
            elif choice == '4':
                test_complex()
            elif choice == '5':
                test_compare_all()
            elif choice == '6':
                test_persistence()
            elif choice == '7':
                purge_cache()
            elif choice == '8':
                check_endpoints()
            elif choice == '9':
                run_full_suite()
            elif choice == '0':
                print(f"\n{Colors.GREEN}Goodbye!{Colors.NC}\n")
                break
            else:
                print(f"\n{Colors.RED}Invalid option{Colors.NC}\n")
                time.sleep(1)
                continue

            input("\nPress Enter to continue...")

        except KeyboardInterrupt:
            print(f"\n\n{Colors.GREEN}Goodbye!{Colors.NC}\n")
            break
        except EOFError:
            print(f"\n\n{Colors.GREEN}Goodbye!{Colors.NC}\n")
            break

if __name__ == '__main__':
    main()
