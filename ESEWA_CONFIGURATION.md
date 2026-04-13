# eSewa Configuration Guide

## Environment Setup

### Testing Environment (Currently Active)
- **Merchant Portal**: https://merchant.esewa.com.np
- **API URLs**: Test environment URLs configured
- **Credentials**:
  - Merchant Code: EPAYTEST
  - Secret Key: 8gBm/:&EnhH.1/q
- **Test eSewa Login**:
  - ID: 9806800001 (or 9806800002, 9806800003, 9806800004, 9806800005)
  - Password: Nepal@123
  - MPIN: 1122

### Production Environment
- **Merchant Portal**: https://merchant.esewa.com.np
- **API URLs**: Use the production URLs
- **Credentials**: Use production merchant code and secret key from eSewa

## Configuration Steps

### For Testing:
1. Test URLs and credentials are currently active
2. Use test eSewa login credentials to test payments
3. Keep localhost URLs for return/redirect

### For Production:
1. Uncomment the production URLs in application.properties
2. Replace with production merchant credentials
3. Update return URLs to your production domain
4. Update CORS origins to your production domain

## Merchant Wallet Access
- Login to https://merchant.esewa.com.np
- View payments received for your products/services
- Monitor transaction history
- Manage your merchant account

## Testing Instructions
1. Start the application (backend on port 8081, frontend on port 3001)
2. Login as a user and add items to cart
3. Select eSewa as payment method
4. Click "Pay Now" - you'll be redirected to eSewa test environment
5. Login with test credentials: ID: 9806800001, Password: Nepal@123
6. Complete the payment using MPIN: 1122
7. Verify payment appears in merchant wallet at https://merchant.esewa.com.np