# Quickstart Guide: Studio System

## Prerequisites
- Running Supabase instance with studios table
- Authenticated user account
- Admin access to Supabase dashboard for approval process

## Quick Validation Steps

### 1. Public Studios Page
1. Navigate to `/studios` as a visitor (not logged in)
2. Verify that approved studios are displayed as cards
3. Verify that no "Apply to become a studio" button is visible

### 2. Studio Application Process
1. Log in as a user who hasn't applied to become a studio
2. Navigate to `/studios`
3. Verify that "Apply to become a studio" button is visible
4. Click the button and verify redirection to `/studios/apply`
5. Fill out the studio application form with valid data
6. Submit the form and verify success message
7. Check database to confirm studio record was created with "applied" status

### 3. Studio Dashboard Access - Limited
1. After applying, navigate to `/studio/dashboard`
2. Verify access to limited dashboard (basic information only)
3. Verify navigation links are available but limited in functionality

### 4. Studio Dashboard Access - Full
1. Log in as an admin in Supabase dashboard
2. Change the studio status from "applied" to "approved"
3. Log back in as the studio user
4. Navigate to `/studio/dashboard`
5. Verify full access to dashboard with all navigation options

### 5. Duplicate Application Prevention
1. Log in as a user who has already applied
2. Navigate to `/studios`
3. Verify that "Apply to become a studio" button is NOT visible
4. Try to directly access `/studios/apply` and verify appropriate handling

### 6. Security Checks
1. Try to access `/studio/dashboard` without logging in
2. Verify redirection to login page
3. Log in as a user who hasn't applied to become a studio
4. Try to access `/studio/dashboard`
5. Verify redirection to member dashboard

## Test Data
### Sample Studio Application
- Name: "Test Studio"
- Description: "A test studio for validation purposes"
- Contact Phone: 1234567890
- Salary Expectation: "$50,000 - $70,000"

## Expected Outcomes
1. Public visitors can see approved studios on `/studios`
2. Logged-in users can apply to become studios
3. Applied users get limited dashboard access
4. Approved users get full dashboard access
5. Duplicate applications are prevented
6. Security is properly enforced
7. All components follow existing design patterns