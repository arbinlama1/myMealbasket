#!/usr/bin/env python3
import requests
import json
import psycopg2
import sys
from datetime import datetime

print("=== DATABASE RATING STORAGE DIAGNOSTIC ===")
print()

def test_database_connection():
    print("1. Testing Database Connection...")
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5433,
            database='mealbasketsystem',
            user='postgres',
            password='password'  # Update with your password
        )
        cur = conn.cursor()
        
        # Test basic connection
        cur.execute('SELECT 1')
        result = cur.fetchone()
        print(f"   Database connection: SUCCESS ({result[0]})")
        
        # Check if ratings table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'ratings'
            )
        """)
        table_exists = cur.fetchone()[0]
        print(f"   Ratings table exists: {table_exists}")
        
        if table_exists:
            # Check table structure
            cur.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'ratings'
                ORDER BY ordinal_position
            """)
            columns = cur.fetchall()
            print("   Ratings table structure:")
            for col in columns:
                print(f"     - {col[0]}: {col[1]} ({'NULL' if col[2] == 'YES' else 'NOT NULL'})")
            
            # Check current data count
            cur.execute('SELECT COUNT(*) FROM ratings')
            count = cur.fetchone()[0]
            print(f"   Current ratings count: {count}")
            
            # Show recent ratings
            cur.execute("""
                SELECT id, user_id, product_id, rating, created_at 
                FROM ratings 
                ORDER BY created_at DESC 
                LIMIT 5
            """)
            recent = cur.fetchall()
            if recent:
                print("   Recent ratings:")
                for rating in recent:
                    print(f"     - ID: {rating[0]}, User: {rating[1]}, Product: {rating[2]}, Rating: {rating[3]}, Created: {rating[4]}")
            else:
                print("   No ratings found in database")
        
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        print(f"   Database connection: FAILED - {e}")
        print("   Possible causes:")
        print("     - PostgreSQL not running")
        print("     - Wrong connection details")
        print("     - Database doesn't exist")
        return False
    except Exception as e:
        print(f"   Database test: ERROR - {e}")
        return False

def test_backend_api():
    print("\n2. Testing Backend API...")
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8081/api/ratings/health", timeout=5)
        if response.status_code == 200:
            print("   Backend API: RUNNING")
        else:
            print(f"   Backend API: Status {response.status_code}")
            return False
            
        # Test rating submission
        test_data = {
            "userId": 1,
            "productId": 123,
            "rating": 4
        }
        
        response = requests.post(
            "http://localhost:8081/api/ratings/rate",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=10
        )
        
        print(f"   Rating submission: Status {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Response: {result}")
            return True
        else:
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   Backend API: NOT RUNNING")
        return False
    except Exception as e:
        print(f"   Backend API test: ERROR - {e}")
        return False

def test_complete_flow():
    print("\n3. Testing Complete Flow...")
    try:
        # Submit rating
        test_data = {
            "userId": 1,
            "productId": 999,  # Use unique product ID
            "rating": 5
        }
        
        print(f"   Submitting rating: {test_data}")
        response = requests.post(
            "http://localhost:8081/api/ratings/rate",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   API Response: {result}")
            
            # Check database immediately
            conn = psycopg2.connect(
                host='localhost',
                port=5433,
                database='mealbasketsystem',
                user='postgres',
                password='password'
            )
            cur = conn.cursor()
            
            # Check if rating was stored
            cur.execute("""
                SELECT id, user_id, product_id, rating, created_at 
                FROM ratings 
                WHERE product_id = 999 
                ORDER BY created_at DESC 
                LIMIT 1
            """)
            stored_rating = cur.fetchone()
            
            if stored_rating:
                print(f"   Rating stored in database: YES")
                print(f"   Stored rating: ID={stored_rating[0]}, User={stored_rating[1]}, Product={stored_rating[2]}, Rating={stored_rating[3]}")
                return True
            else:
                print(f"   Rating stored in database: NO")
                print("   This is the problem - API succeeded but database didn't store!")
                return False
                
        else:
            print(f"   Rating submission failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   Complete flow test: ERROR - {e}")
        return False

def main():
    print("Starting comprehensive database storage diagnostic...")
    print()
    
    # Test database connection
    db_ok = test_database_connection()
    
    # Test backend API
    api_ok = test_backend_api()
    
    # Test complete flow
    if db_ok and api_ok:
        flow_ok = test_complete_flow()
        
        print("\n=== DIAGNOSTIC RESULTS ===")
        print(f"Database Connection: {'OK' if db_ok else 'FAILED'}")
        print(f"Backend API: {'OK' if api_ok else 'FAILED'}")
        print(f"Complete Flow: {'OK' if flow_ok else 'FAILED'}")
        
        if db_ok and api_ok and not flow_ok:
            print("\nPROBLEM IDENTIFIED:")
            print("API works but database storage fails!")
            print("\nPOSSIBLE CAUSES:")
            print("1. Transaction rollback")
            print("2. Entity mapping issue")
            print("3. Database permissions")
            print("4. Hibernate configuration")
            print("5. Unique constraint violation")
            
            print("\nNEXT STEPS:")
            print("1. Check Spring Boot logs for database errors")
            print("2. Enable SQL logging in application.properties")
            print("3. Check @Transactional annotations")
            print("4. Verify entity mappings")
            print("5. Check database user permissions")
        else:
            print("\nBasic connectivity issues found - fix those first")
    else:
        print("\n=== DIAGNOSTIC RESULTS ===")
        print(f"Database Connection: {'OK' if db_ok else 'FAILED'}")
        print(f"Backend API: {'OK' if api_ok else 'FAILED'}")
        print("Fix basic connectivity issues before testing complete flow")

if __name__ == "__main__":
    main()
