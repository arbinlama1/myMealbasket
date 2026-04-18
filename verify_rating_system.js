/**
 * Complete Rating System Verification Script
 * Run this in browser console to verify all requirements
 */

const API_BASE = 'http://localhost:8081/api';

class RatingSystemVerifier {
    constructor() {
        this.testResults = [];
        this.userId = 1;
        this.productId = 1;
    }

    log(test, result, details = '') {
        const status = result ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${test}${details ? ': ' + details : ''}`);
        this.testResults.push({ test, result, details });
    }

    async testDatabaseConnection() {
        console.log('\n🔍 Testing Database Connection...');
        try {
            const response = await fetch(`${API_BASE}/recommendations/user/${this.userId}/ratings`);
            this.log('Database Connection', response.status === 200, `Status: ${response.status}`);
            return response.status === 200;
        } catch (error) {
            this.log('Database Connection', false, error.message);
            return false;
        }
    }

    async testPersistentStorage() {
        console.log('\n💾 Testing Persistent Storage...');
        try {
            // Submit rating
            const submitResponse = await fetch(`${API_BASE}/recommendations/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    productId: this.productId,
                    rating: 5
                })
            });
            
            if (submitResponse.status !== 200) {
                this.log('Rating Submission', false, `Status: ${submitResponse.status}`);
                return false;
            }

            // Clear any local storage
            localStorage.clear();
            sessionStorage.clear();

            // Retrieve rating after clearing storage
            const getResponse = await fetch(`${API_BASE}/recommendations/user/${this.userId}/ratings`);
            const ratings = await getResponse.json();
            
            const hasRating = ratings.some(r => r.product.id === this.productId && r.rating === 5);
            this.log('Persistent Storage', hasRating, 'Rating persists after storage clear');
            return hasRating;
        } catch (error) {
            this.log('Persistent Storage', false, error.message);
            return false;
        }
    }

    async testUserSpecificRatings() {
        console.log('\n👤 Testing User-Specific Ratings...');
        try {
            // Submit rating for user 1
            await fetch(`${API_BASE}/recommendations/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    productId: this.productId,
                    rating: 4
                })
            });

            // Submit rating for user 2
            await fetch(`${API_BASE}/recommendations/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 2,
                    productId: this.productId,
                    rating: 5
                })
            });

            // Get ratings for both users
            const user1Response = await fetch(`${API_BASE}/recommendations/user/${this.userId}/ratings`);
            const user2Response = await fetch(`${API_BASE}/recommendations/user/2/ratings`);
            
            const user1Ratings = await user1Response.json();
            const user2Ratings = await user2Response.json();

            const user1HasRating = user1Ratings.some(r => r.product.id === this.productId);
            const user2HasRating = user2Ratings.some(r => r.product.id === this.productId);

            this.log('User 1 Rating', user1HasRating, `Rating: ${user1HasRating ? user1Ratings.find(r => r.product.id === this.productId).rating : 'None'}`);
            this.log('User 2 Rating', user2HasRating, `Rating: ${user2HasRating ? user2Ratings.find(r => r.product.id === this.productId).rating : 'None'}`);
            
            return user1HasRating && user2HasRating;
        } catch (error) {
            this.log('User-Specific Ratings', false, error.message);
            return false;
        }
    }

    async testUpdateExistingRatings() {
        console.log('\n🔄 Testing Update Existing Ratings...');
        try {
            // Submit initial rating
            await fetch(`${API_BASE}/recommendations/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    productId: this.productId + 1,
                    rating: 3
                })
            });

            // Update the same rating
            const updateResponse = await fetch(`${API_BASE}/recommendations/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    productId: this.productId + 1,
                    rating: 5
                })
            });

            const updateData = await updateResponse.json();
            const isUpdated = updateData.action === 'updated';
            
            this.log('Update Existing Rating', isUpdated, `Action: ${updateData.action || 'Unknown'}`);
            
            // Verify only one rating exists
            const ratingsResponse = await fetch(`${API_BASE}/recommendations/user/${this.userId}/ratings`);
            const ratings = await ratingsResponse.json();
            const productRatings = ratings.filter(r => r.product.id === this.productId + 1);
            
            const singleRating = productRatings.length === 1;
            this.log('Single Rating Record', singleRating, `Count: ${productRatings.length}`);
            
            return isUpdated && singleRating;
        } catch (error) {
            this.log('Update Existing Ratings', false, error.message);
            return false;
        }
    }

    async testAutomaticRetrieval() {
        console.log('\n🔄 Testing Automatic Retrieval...');
        try {
            // Submit a rating
            await fetch(`${API_BASE}/recommendations/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    productId: this.productId + 2,
                    rating: 4
                })
            });

            // Get product rating with user context
            const response = await fetch(`${API_BASE}/recommendations/product/${this.productId + 2}/rating?userId=${this.userId}`);
            const data = await response.json();

            const hasUserRating = data.userRating === 4;
            const hasAverageRating = data.averageRating !== undefined;
            const hasRatingCount = data.ratingCount !== undefined;

            this.log('User Rating Retrieved', hasUserRating, `User Rating: ${data.userRating}`);
            this.log('Average Rating Displayed', hasAverageRating, `Average: ${data.averageRating}`);
            this.log('Rating Count Displayed', hasRatingCount, `Count: ${data.ratingCount}`);
            
            return hasUserRating && hasAverageRating && hasRatingCount;
        } catch (error) {
            this.log('Automatic Retrieval', false, error.message);
            return false;
        }
    }

    async testDuplicatePrevention() {
        console.log('\n🚫 Testing Duplicate Prevention...');
        try {
            // Submit multiple ratings rapidly
            const promises = [];
            for (let i = 0; i < 3; i++) {
                promises.push(
                    fetch(`${API_BASE}/recommendations/rate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: this.userId,
                            productId: this.productId + 3,
                            rating: i + 1
                        })
                    })
                );
            }

            await Promise.all(promises);

            // Check final state
            const response = await fetch(`${API_BASE}/recommendations/user/${this.userId}/ratings`);
            const ratings = await response.json();
            const productRatings = ratings.filter(r => r.product.id === this.productId + 3);

            const singleRating = productRatings.length === 1;
            this.log('Duplicate Prevention', singleRating, `Ratings found: ${productRatings.length}`);
            
            return singleRating;
        } catch (error) {
            this.log('Duplicate Prevention', false, error.message);
            return false;
        }
    }

    async testSessionIndependence() {
        console.log('\n🔐 Testing Session Independence...');
        try {
            // Submit rating
            await fetch(`${API_BASE}/recommendations/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    productId: this.productId + 4,
                    rating: 5
                })
            });

            // Simulate session change by clearing all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Try to retrieve rating (should come from database)
            const response = await fetch(`${API_BASE}/recommendations/user/${this.userId}/ratings`);
            const ratings = await response.json();
            
            const hasRating = ratings.some(r => r.product.id === this.productId + 4 && r.rating === 5);
            this.log('Session Independence', hasRating, 'Rating retrieved without session data');
            
            return hasRating;
        } catch (error) {
            this.log('Session Independence', false, error.message);
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 STARTING COMPLETE RATING SYSTEM VERIFICATION');
        console.log('=' * 60);

        const tests = [
            () => this.testDatabaseConnection(),
            () => this.testPersistentStorage(),
            () => this.testUserSpecificRatings(),
            () => this.testUpdateExistingRatings(),
            () => this.testAutomaticRetrieval(),
            () => this.testDuplicatePrevention(),
            () => this.testSessionIndependence()
        ];

        let passed = 0;
        for (const test of tests) {
            try {
                if (await test()) {
                    passed++;
                }
            } catch (error) {
                console.error('Test error:', error);
            }
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
        }

        console.log('\n' + '=' * 60);
        console.log(`📊 TEST RESULTS: ${passed}/${tests.length} PASSED`);
        
        if (passed === tests.length) {
            console.log('🎉 ALL TESTS PASSED! RATING SYSTEM IS FULLY FUNCTIONAL!');
            console.log('\n✅ Persistent Rating Storage: WORKING');
            console.log('✅ User-Specific Ratings: WORKING');
            console.log('✅ Update Existing Ratings: WORKING');
            console.log('✅ Automatic Retrieval: WORKING');
            console.log('✅ Duplicate Prevention: WORKING');
            console.log('✅ Session Independence: WORKING');
        } else {
            console.log('❌ SOME TESTS FAILED. PLEASE CHECK THE ISSUES ABOVE.');
        }

        return passed === tests.length;
    }
}

// Auto-run verification
const verifier = new RatingSystemVerifier();
console.log('🔧 Rating System Verifier loaded. Run verifier.runAllTests() to start verification.');

// Export for manual use
window.RatingSystemVerifier = RatingSystemVerifier;
