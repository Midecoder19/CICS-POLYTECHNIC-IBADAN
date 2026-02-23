# Member Portal Implementation TODO

## Backend
- [ ] Create Loan model (backend/models/Loan.js)
- [ ] Create Ledger model (backend/models/Ledger.js)
- [ ] Create memberController.js with login, profile, loans, ledger endpoints
- [ ] Create routes/member.js for /api/member/* endpoints
- [ ] Edit authController.js to add member login endpoint
- [ ] Edit server.js to include member routes

## Frontend
- [ ] Create MemberLogin.jsx for /member/login
- [ ] Edit MemberDashboard.jsx with summary cards
- [ ] Create LoansPage.jsx with loans table
- [ ] Create LedgerPage.jsx with transactions table
- [ ] Create ProfilePage.jsx with read-only details
- [ ] Create MemberRoute.jsx guard component
- [ ] Create MemberService.js for API calls
- [ ] Edit App.jsx with member sub-routes and guards

## Other
- [ ] Create seed script for demo loans/ledger data
- [ ] Update main TODO.md to mark member portal completed
- [ ] Create README_MEMBER_PORTAL.md with usage instructions
- [ ] Test member login, navigation, data display
- [ ] Ensure mobile responsiveness and no broken links
