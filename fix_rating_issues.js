/**
 * Quick Fix Script for Rating Issues
 * Run this in browser console on the React app
 */

console.log('🔧 RATING SYSTEM QUICK FIX');

// 1. Check API Base URL
const API_BASE = 'http://localhost:8081/api';
console.log('📍 API Base URL:', API_BASE);

// 2. Check if backend is running
async function checkBackend() {
    try {
        const response = await fetch(`${API_BASE}/recommendations/user/1/ratings`);
        console.log('✅ Backend Status:', response.status);
        return response.ok;
    } catch (error) {
        console.error('❌ Backend Error:', error.message);
        return false;
    }
}

// 3. Fix common userId issues
function fixUserId() {
    const userId = localStorage.getItem('userId');
    console.log('🔍 Current userId:', userId);
    
    if (!userId) {
        console.log('⚠️ No userId found. Setting test userId...');
        localStorage.setItem('userId', '1'); // Set test user ID
        return '1';
    }
    return userId;
}

// 4. Test rating submission with detailed logging
async function testRatingSubmission() {
    const userId = fixUserId();
    const productId = 1;
    const rating = 5;
    
    console.log('🚀 Testing rating submission...');
    console.log('Request data:', { userId, productId, rating });
    
    try {
        const response = await fetch(`${API_BASE}/recommendations/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ userId, productId, rating })
        });
        
        console.log('📡 Response Status:', response.status);
        console.log('📡 Response Headers:', [...response.headers.entries()]);
        
        const responseText = await response.text();
        console.log('📡 Raw Response:', responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Failed to parse response JSON:', e);
            return;
        }
        
        console.log('📊 Parsed Response:', responseData);
        
        if (response.ok && responseData.success) {
            console.log('✅ Rating submission SUCCESSFUL!');
            console.log('Action:', responseData.action);
            console.log('Message:', responseData.message);
        } else {
            console.error('❌ Rating submission FAILED!');
            console.error('Error:', responseData.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// 5. Test rating retrieval with detailed logging
async function testRatingRetrieval() {
    const userId = fixUserId();
    
    console.log('🔍 Testing rating retrieval...');
    console.log('Request URL:', `${API_BASE}/recommendations/user/${userId}/ratings`);
    
    try {
        const response = await fetch(`${API_BASE}/recommendations/user/${userId}/ratings`);
        console.log('📡 Response Status:', response.status);
        
        if (!response.ok) {
            console.error('❌ Failed to retrieve ratings');
            return;
        }
        
        const responseText = await response.text();
        console.log('📡 Raw Response:', responseText);
        
        let ratings;
        try {
            ratings = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Failed to parse ratings response:', e);
            return;
        }
        
        console.log('📊 Parsed Ratings:', ratings);
        
        if (Array.isArray(ratings)) {
            console.log(`✅ Found ${ratings.length} ratings`);
            ratings.forEach((rating, index) => {
                console.log(`Rating ${index + 1}:`, {
                    id: rating.id,
                    productId: rating.product?.id,
                    productName: rating.product?.name,
                    rating: rating.rating,
                    createdAt: rating.createdAt
                });
            });
        } else {
            console.error('❌ Ratings response is not an array');
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// 6. Clear and reload test
async function testPersistence() {
    console.log('🔄 Testing persistence...');
    
    // Submit rating
    await testRatingSubmission();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear storage (simulate logout)
    console.log('🗑️ Clearing localStorage...');
    localStorage.clear();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set userId again (simulate login)
    console.log('🔑 Setting userId again...');
    localStorage.setItem('userId', '1');
    
    // Retrieve ratings
    await testRatingRetrieval();
}

// 7. Auto-fix common issues
function autoFixIssues() {
    console.log('🔧 AUTO-FIXING COMMON ISSUES...');
    
    // Fix 1: Ensure userId exists
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.log('🔧 Fixing missing userId...');
        localStorage.setItem('userId', '1');
    }
    
    // Fix 2: Clear any corrupted rating data
    const ratingData = localStorage.getItem('userRatings');
    if (ratingData) {
        try {
            JSON.parse(ratingData);
        } catch (e) {
            console.log('🔧 Clearing corrupted rating data...');
            localStorage.removeItem('userRatings');
        }
    }
    
    console.log('✅ Auto-fix completed');
}

// 8. Main diagnostic function
async function runDiagnostic() {
    console.log('🚀 STARTING COMPLETE DIAGNOSTIC...');
    console.log('=' .repeat(50));
    
    // Auto-fix issues first
    autoFixIssues();
    
    // Check backend
    const backendOk = await checkBackend();
    if (!backendOk) {
        console.error('❌ BACKEND IS NOT RUNNING!');
        console.error('Please start Spring Boot application on port 8081');
        return;
    }
    
    // Test submission
    await testRatingSubmission();
    
    // Test retrieval
    await testRatingRetrieval();
    
    // Test persistence
    await testPersistence();
    
    console.log('=' .repeat(50));
    console.log('🏁 DIAGNOSTIC COMPLETE');
    console.log('\nIf issues persist, check:');
    console.log('1. Spring Boot is running on port 8081');
    console.log('2. PostgreSQL database is running and accessible');
    console.log('3. Database schema is applied');
    console.log('4. No firewall blocking port 8081');
    console.log('5. User is logged in with valid userId');
}

// Export functions for manual testing
window.ratingFix = {
    checkBackend,
    testRatingSubmission,
    testRatingRetrieval,
    testPersistence,
    runDiagnostic
};

console.log('🔧 Rating fix functions loaded. Run ratingFix.runDiagnostic() to start diagnostic.');

// Auto-run diagnostic
setTimeout(() => {
    console.log('🚀 Auto-running diagnostic in 2 seconds...');
    setTimeout(ratingFix.runDiagnostic, 2000);
}, 1000);
