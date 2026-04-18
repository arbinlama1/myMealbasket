#!/usr/bin/env python3
"""
Fix Database Storage Issue for Star Rating System
Identifies why ratings are not being stored in PostgreSQL database
"""

import subprocess
import time
import sys

def check_database_connection():
    """Check if database connection is working"""
    print("=== CHECKING DATABASE CONNECTION ===")
    
    try:
        # Test basic PostgreSQL connection
        result = subprocess.run([
            "psql", "-U", "postgres", "-d", "mealbasketsystem",
            "-c", "SELECT version();"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("PostgreSQL connection: WORKING")
            print(f"Database version: {result.stdout.strip()}")
            return True
        else:
            print("PostgreSQL connection: FAILED")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

def check_ratings_table():
    """Check if ratings table exists and has correct schema"""
    print("\n=== CHECKING RATINGS TABLE ===")
    
    try:
        # Check if table exists
        result = subprocess.run([
            "psql", "-U", "postgres", "-d", "mealbasketsystem",
            "-c", "\\dt ratings"
        ], capture_output=True, text=True)
        
        if result.returncode == 0 and "ratings" in result.stdout:
            print("Ratings table: EXISTS")
            
            # Check table structure
            schema_result = subprocess.run([
                "psql", "-U", "postgres", "-d", "mealbasketsystem",
                "-c", "\\d ratings"
            ], capture_output=True, text=True)
            
            if schema_result.returncode == 0:
                print("Table structure:")
                print(schema_result.stdout)
                
                # Check for required columns
                if "user_id" in schema_result.stdout and "product_id" in schema_result.stdout:
                    print("Required columns: PRESENT")
                    return True
                else:
                    print("Required columns: MISSING")
                    return False
            else:
                print("Could not check table structure")
                return False
        else:
            print("Ratings table: NOT FOUND")
            return False
    except Exception as e:
        print(f"Table check error: {e}")
        return False

def check_database_permissions():
    """Check if database has proper permissions for writing"""
    print("\n=== CHECKING DATABASE PERMISSIONS ===")
    
    try:
        # Test write permission by inserting and deleting a test record
        test_sql = """
        BEGIN;
        INSERT INTO ratings (user_id, product_id, rating) VALUES (9999, 9999, 5);
        SELECT COUNT(*) FROM ratings WHERE user_id = 9999;
        DELETE FROM ratings WHERE user_id = 9999;
        ROLLBACK;
        """
        
        result = subprocess.run([
            "psql", "-U", "postgres", "-d", "mealbasketsystem",
            "-c", test_sql
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Database write permissions: WORKING")
            return True
        else:
            print("Database write permissions: FAILED")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"Permission check error: {e}")
        return False

def check_spring_boot_connection():
    """Check if Spring Boot can connect to database"""
    print("\n=== CHECKING SPRING BOOT DATABASE CONNECTION ===")
    
    try:
        # Check if Spring Boot is running
        netstat_result = subprocess.run([
            "netstat", "-an"
        ], capture_output=True, text=True)
        
        if ":8081" in netstat_result.stdout:
            print("Spring Boot: RUNNING on port 8081")
            
            # Test API endpoint
            try:
                import requests
                response = requests.get("http://localhost:8081/api/recommendations/user/1/ratings", timeout=5)
                if response.status_code == 200:
                    print("API connection: WORKING")
                    print(f"Current ratings: {response.json()}")
                    return True
                else:
                    print(f"API connection: FAILED with status {response.status_code}")
                    return False
            except ImportError:
                print("requests library not available for API test")
                return True
            except Exception as e:
                print(f"API connection error: {e}")
                return False
        else:
            print("Spring Boot: NOT RUNNING")
            return False
    except Exception as e:
        print(f"Spring Boot check error: {e}")
        return False

def test_rating_storage():
    """Test if ratings are actually being stored"""
    print("\n=== TESTING RATING STORAGE ===")
    
    try:
        # Get current count
        count_result = subprocess.run([
            "psql", "-U", "postgres", "-d", "mealbasketsystem",
            "-c", "SELECT COUNT(*) FROM ratings;"
        ], capture_output=True, text=True)
        
        if count_result.returncode == 0:
            initial_count = int(count_result.stdout.strip())
            print(f"Initial ratings count: {initial_count}")
            
            # Test API call to submit rating
            try:
                import requests
                rating_data = {
                    "userId": 1,
                    "productId": 8888,
                    "rating": 4
                }
                
                response = requests.post(
                    "http://localhost:8081/api/recommendations/rate",
                    json=rating_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                print(f"API submission status: {response.status_code}")
                print(f"API response: {response.text}")
                
                if response.status_code == 200:
                    # Check if rating was stored
                    time.sleep(2)  # Wait for database update
                    
                    new_count_result = subprocess.run([
                        "psql", "-U", "postgres", "-d", "mealbasketsystem",
                        "-c", "SELECT COUNT(*) FROM ratings;"
                    ], capture_output=True, text=True)
                    
                    if new_count_result.returncode == 0:
                        new_count = int(new_count_result.stdout.strip())
                        print(f"New ratings count: {new_count}")
                        
                        if new_count > initial_count:
                            print("Rating storage: WORKING")
                            
                            # Show the new rating
                            rating_result = subprocess.run([
                                "psql", "-U", "postgres", "-d", "mealbasketsystem",
                                "-c", "SELECT user_id, product_id, rating, created_at FROM ratings WHERE product_id = 8888;"
                            ], capture_output=True, text=True)
                            
                            if rating_result.returncode == 0:
                                print("Stored rating:")
                                print(rating_result.stdout)
                            
                            return True
                        else:
                            print("Rating storage: FAILED - No new record in database")
                            return False
                    else:
                        print("Could not check new count")
                        return False
                else:
                    print("API submission failed")
                    return False
                    
            except ImportError:
                print("requests library not available for API test")
                return False
            except Exception as e:
                print(f"API test error: {e}")
                return False
        else:
            print("Could not get initial count")
            return False
    except Exception as e:
        print(f"Storage test error: {e}")
        return False

def diagnose_database_issue():
    """Complete diagnosis of database storage issue"""
    print("=== DATABASE STORAGE ISSUE DIAGNOSIS ===")
    print("This will identify why ratings are not being stored in database")
    
    issues = []
    
    # Step 1: Check database connection
    if not check_database_connection():
        issues.append("PostgreSQL connection failed")
    
    # Step 2: Check ratings table
    if not check_ratings_table():
        issues.append("Ratings table missing or incorrect schema")
    
    # Step 3: Check database permissions
    if not check_database_permissions():
        issues.append("Database write permissions issue")
    
    # Step 4: Check Spring Boot connection
    if not check_spring_boot_connection():
        issues.append("Spring Boot not running or not connected to database")
    
    # Step 5: Test actual rating storage
    if not test_rating_storage():
        issues.append("Rating submission not storing in database")
    
    # Summary
    print("\n=== DIAGNOSIS RESULTS ===")
    if issues:
        print("ISSUES FOUND:")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}")
        
        print("\nFIXES NEEDED:")
        print("1. Start PostgreSQL service")
        print("2. Create/update ratings table schema")
        print("3. Check database user permissions")
        print("4. Start Spring Boot application")
        print("5. Verify application.properties database settings")
        
        return False
    else:
        print("NO ISSUES FOUND - Database storage should be working!")
        return True

def main():
    """Main diagnosis function"""
    print("Starting database storage issue diagnosis...")
    
    success = diagnose_database_issue()
    
    if success:
        print("\n=== SUCCESS ===")
        print("Database storage is working correctly!")
        print("If ratings still don't persist, check:")
        print("1. Frontend state management")
        print("2. Browser console for JavaScript errors")
        print("3. Spring Boot logs for transaction issues")
    else:
        print("\n=== ACTION REQUIRED ===")
        print("Please fix the issues identified above")

if __name__ == "__main__":
    main()
