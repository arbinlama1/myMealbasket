#!/usr/bin/env python3
"""
Complete Diagnosis of Rating System Issues
Identifies the exact error preventing star ratings from working
"""

import subprocess
import time
import sys
import os

def check_java_and_maven():
    """Check if Java and Maven are installed"""
    print("=== CHECKING JAVA AND MAVEN ===")
    
    try:
        # Check Java
        java_result = subprocess.run(["java", "-version"], capture_output=True, text=True)
        if java_result.returncode == 0:
            print("Java is installed:")
            print(java_result.stderr.strip())  # Java version is often in stderr
        else:
            print("Java is NOT installed or not in PATH")
            return False
    except FileNotFoundError:
        print("Java is NOT installed or not in PATH")
        return False
    
    try:
        # Check Maven
        maven_result = subprocess.run(["mvn", "-version"], capture_output=True, text=True)
        if maven_result.returncode == 0:
            print("Maven is installed:")
            print(maven_result.stdout.split('\n')[0])
        else:
            print("Maven is NOT installed or not in PATH")
            return False
    except FileNotFoundError:
        print("Maven is NOT installed or not in PATH")
        return False
    
    return True

def check_postgresql():
    """Check if PostgreSQL is running and accessible"""
    print("\n=== CHECKING POSTGRESQL ===")
    
    try:
        # Check if PostgreSQL service is running
        pg_result = subprocess.run(["pg_isready"], capture_output=True, text=True)
        if pg_result.returncode == 0:
            print("PostgreSQL is running")
        else:
            print("PostgreSQL is NOT running")
            return False
    except FileNotFoundError:
        print("PostgreSQL is NOT installed or not in PATH")
        return False
    
    try:
        # Check database connection
        db_result = subprocess.run([
            "psql", "-U", "postgres", "-d", "mealbasketsystem",
            "-c", "SELECT COUNT(*) FROM ratings;"
        ], capture_output=True, text=True)
        
        if db_result.returncode == 0:
            print("Database connection successful")
            print(f"Current ratings count: {db_result.stdout.strip()}")
            return True
        else:
            print("Database connection failed")
            print(f"Error: {db_result.stderr}")
            return False
    except Exception as e:
        print(f"Database test error: {e}")
        return False

def check_spring_boot():
    """Check if Spring Boot is running"""
    print("\n=== CHECKING SPRING BOOT ===")
    
    try:
        # Check if port 8081 is in use
        netstat_result = subprocess.run([
            "netstat", "-an"
        ], capture_output=True, text=True)
        
        if ":8081" in netstat_result.stdout:
            print("Port 8081 is in use - Spring Boot might be running")
            return True
        else:
            print("Port 8081 is NOT in use - Spring Boot is NOT running")
            return False
    except Exception as e:
        print(f"Port check error: {e}")
        return False

def start_spring_boot():
    """Start Spring Boot application"""
    print("\n=== STARTING SPRING BOOT ===")
    
    try:
        print("Starting Spring Boot application...")
        print("This may take a few minutes...")
        
        # Change to project directory
        project_dir = r"c:\Users\User\Downloads\myMealbasket"
        
        # Start Spring Boot
        start_cmd = f"cd {project_dir} && mvn spring-boot:run"
        
        print(f"Running: {start_cmd}")
        
        # Start in background (this won't work in Windows CMD, but let's try)
        process = subprocess.Popen(
            ["mvn", "spring-boot:run"],
            cwd=project_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for startup
        print("Waiting for Spring Boot to start...")
        time.sleep(30)
        
        # Check if it started
        if check_spring_boot():
            print("Spring Boot started successfully!")
            return True
        else:
            print("Spring Boot failed to start")
            return False
            
    except Exception as e:
        print(f"Error starting Spring Boot: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints with requests library"""
    print("\n=== TESTING API ENDPOINTS ===")
    
    try:
        import requests
        
        base_url = "http://localhost:8081/api/recommendations"
        
        # Test 1: Get user ratings
        try:
            response = requests.get(f"{base_url}/user/1/ratings", timeout=5)
            print(f"Get user ratings: Status {response.status_code}")
            if response.status_code == 200:
                print("API is working!")
                print(f"Response: {response.json()}")
                return True
            else:
                print(f"API returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"API test failed: {e}")
            return False
            
    except ImportError:
        print("requests library not installed")
        return False

def diagnose_star_rating_issue():
    """Complete diagnosis of star rating issue"""
    print("=== COMPLETE STAR RATING DIAGNOSIS ===")
    print("This will identify the exact issue preventing star ratings from working")
    
    issues_found = []
    
    # Step 1: Check Java and Maven
    if not check_java_and_maven():
        issues_found.append("Java/Maven not installed or not in PATH")
    
    # Step 2: Check PostgreSQL
    if not check_postgresql():
        issues_found.append("PostgreSQL not running or not accessible")
    
    # Step 3: Check Spring Boot
    spring_boot_running = check_spring_boot()
    if not spring_boot_running:
        issues_found.append("Spring Boot not running on port 8081")
    
    # Step 4: Try to start Spring Boot if not running
    if not spring_boot_running:
        print("\nAttempting to start Spring Boot...")
        if not start_spring_boot():
            issues_found.append("Failed to start Spring Boot application")
    
    # Step 5: Test API endpoints
    if spring_boot_running:
        if not test_api_endpoints():
            issues_found.append("API endpoints not responding correctly")
    
    # Step 6: Summary
    print("\n=== DIAGNOSIS COMPLETE ===")
    if issues_found:
        print("ISSUES FOUND:")
        for i, issue in enumerate(issues_found, 1):
            print(f"{i}. {issue}")
        
        print("\nRECOMMENDED FIXES:")
        print("1. Install Java and Maven if not installed")
        print("2. Start PostgreSQL service")
        print("3. Start Spring Boot application")
        print("4. Check database connection")
        print("5. Verify API endpoints")
        
        return False
    else:
        print("NO ISSUES FOUND - System should be working!")
        print("If star ratings still don't work, check:")
        print("1. Frontend component rendering")
        print("2. Browser console for JavaScript errors")
        print("3. Network tab for API requests")
        
        return True

def main():
    """Main diagnosis function"""
    print("Starting complete star rating system diagnosis...")
    
    success = diagnose_star_rating_issue()
    
    if success:
        print("\n=== SUCCESS ===")
        print("The star rating system should now be working!")
        print("Test it in the browser at http://localhost:3000")
    else:
        print("\n=== ACTION REQUIRED ===")
        print("Please fix the issues identified above and run this test again.")

if __name__ == "__main__":
    main()
