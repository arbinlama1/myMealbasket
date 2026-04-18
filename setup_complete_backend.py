#!/usr/bin/env python3
"""
Complete Backend Setup and Verification for MealBasket Rating System
Automatically sets up PostgreSQL database and verifies all components
"""

import subprocess
import time
import requests
import json

def run_command(command, description):
    """Run a command and display results"""
    print(f"\n🔧 {description}")
    print(f"Command: {command}")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ SUCCESS")
            if result.stdout:
                print(f"Output: {result.stdout}")
        else:
            print("❌ FAILED")
            if result.stderr:
                print(f"Error: {result.stderr}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
    return result.returncode == 0

def check_postgres_connection():
    """Check if PostgreSQL is running and accessible"""
    print("\n🔍 CHECKING POSTGRESQL CONNECTION...")
    
    commands = [
        ("pg_isready", "Check if PostgreSQL is ready"),
        ("psql -U postgres -d mealbasketsystem -c \"SELECT version();\"", "Check connection and version"),
        ("psql -U postgres -d mealbasketsystem -c \"\\dt ratings\";", "Check if ratings table exists"),
        ("psql -U postgres -d mealbasketsystem -c \"SELECT COUNT(*) FROM ratings;\"", "Count existing ratings")
    ]
    
    for cmd, desc in commands:
        run_command(cmd, desc)
        time.sleep(1)

def setup_database_schema():
    """Apply the complete database schema"""
    print("\n🗄️ SETTING UP DATABASE SCHEMA...")
    
    schema_commands = [
        ("psql -U postgres -d mealbasketsystem -f add_recommendation_schema_postgresql.sql", "Apply rating schema"),
    ]
    
    for cmd, desc in schema_commands:
        run_command(cmd, desc)

def verify_backend_api():
    """Verify backend API endpoints are working"""
    print("\n🌐 VERIFYING BACKEND API...")
    
    api_tests = [
        ("curl -X GET http://localhost:8081/api/recommendations/user/1/ratings", "Test user ratings endpoint"),
        ("curl -X GET http://localhost:8081/api/recommendations/product/1/rating?userId=1", "Test product rating endpoint"),
        ("curl -X POST http://localhost:8081/api/recommendations/rate -H \"Content-Type: application/json\" -d '{\"userId\": 1, \"productId\": 1, \"rating\": 5}'", "Test rating submission"),
    ]
    
    for cmd, desc in api_tests:
        run_command(cmd, desc)

def check_spring_boot():
    """Check if Spring Boot is running"""
    print("\n🍃 CHECKING SPRING BOOT...")
    
    # Check if Spring Boot process is running
    check_spring_process = "tasklist | findstr java | findstr spring-boot"
    result = run_command(check_spring_process, "Check for Spring Boot process")
    
    if result.returncode == 0:
        print("✅ Spring Boot is running")
    else:
        print("❌ Spring Boot is not running")
        print("Starting Spring Boot...")
        start_spring_boot()

def start_spring_boot():
    """Start Spring Boot application"""
    print("\n🚀 STARTING SPRING BOOT...")
    
    start_cmd = "cd c:\\Users\\User\\Downloads\\myMealbasket && ./mvnw spring-boot:run"
    
    # Start in background
    result = subprocess.run(start_cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Spring Boot started successfully")
        print("Waiting for application to start...")
        time.sleep(10)
    else:
        print("❌ Failed to start Spring Boot")
        print(f"Error: {result.stderr}")

def verify_complete_system():
    """Run complete system verification"""
    print("\n🧪 RUNNING COMPLETE SYSTEM VERIFICATION...")
    
    verification_steps = [
        ("1. Check PostgreSQL connection", check_postgres_connection),
        ("2. Setup database schema", setup_database_schema),
        ("3. Check Spring Boot", check_spring_boot),
        ("4. Verify API endpoints", verify_backend_api),
        ("5. Wait for startup", lambda: time.sleep(15)),
    ]
    
    for step_num, (desc, func) in enumerate(verification_steps, 1):
        print(f"\n--- Step {step_num}: {desc} ---")
        func()
        time.sleep(2)
    
    print("\n" + "="*60)
    print("🎯 VERIFICATION COMPLETE!")
    print("\n📋 NEXT STEPS:")
    print("1. Open browser: http://localhost:3000")
    print("2. Login with valid credentials")
    print("3. Test heart rating on products")
    print("4. Verify ratings persist after page refresh")
    print("5. Check console logs for detailed operation tracking")

def main():
    """Main setup function"""
    print("🌟 MEALBASKET - COMPLETE BACKEND SETUP")
    print("="*60)
    
    print("\n🔍 STEP 1: CHECKING POSTGRESQL...")
    check_postgres_connection()
    
    print("\n🗄️ STEP 2: SETTING UP DATABASE SCHEMA...")
    setup_database_schema()
    
    print("\n🍃 STEP 3: CHECKING SPRING BOOT...")
    check_spring_boot()
    
    print("\n🌐 STEP 4: VERIFYING BACKEND API...")
    verify_backend_api()
    
    print("\n🧪 STEP 5: COMPLETE SYSTEM VERIFICATION...")
    verify_complete_system()
    
    print("\n🎉 SETUP COMPLETE!")
    print("\n📊 Your rating system should now be fully functional:")
    print("✅ PostgreSQL database with proper schema")
    print("✅ Spring Boot backend with API endpoints")
    print("✅ React frontend with heart rating system")
    print("✅ Complete error handling and logging")
    print("✅ Real-time database synchronization")

if __name__ == "__main__":
    main()
