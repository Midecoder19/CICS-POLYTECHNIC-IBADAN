# Member Signup and Verification Implementation

## Current Status
- Member signup form exists with memberId, email, password, confirmPassword
- Backend register checks if memberId exists, updates member with email/password, sends verification email
- Verification page exists for inputting code
- Login finds user by username or email, but needs to find by memberNumber for members
- After login, members redirect to member dashboard

## Issues
- Login fails with "an error occurred please try again"
- Possible duplicate routes in server.js causing conflicts
- Login doesn't find members by memberNumber

## Plan
1. Fix server routes - remove duplicate memberAuth route
2. Update login in authController to find by memberNumber for members
3. Update RegisterForm to redirect to verification page after successful member signup
4. Test the complete flow: signup -> verification -> login -> member dashboard
5. Ensure email verification works for members

## Files to Edit
- backend/server.js: Remove duplicate member route
- backend/controllers/authController.js: Update login query
- frontend/src/components/Auth/RegisterForm.jsx: Add redirect to verification

## Followup Steps
- Start server and test login
- Test member signup flow
- Test verification flow
- Test member login and dashboard access
