# How to Review Claims - Doctor's Guide

## Overview
This guide explains how to review insurance claims as a doctor in the system.

## Accessing the Review Page

1. **Login** to the system with your doctor/admin credentials
2. Navigate to **Doctor Dashboard** (`/dashboard/doctor`)
3. Click on **"Review Claims"** or **"Claim Submission"** in the sidebar
4. You will see all pending claims that need review

## Step-by-Step Review Process

### 1. View Pending Claims
- The review page displays all pending claims
- Each claim card shows:
  - **Claim ID**: Unique identifier for the claim
  - **Patient Name**: Name of the patient
  - **Doctor Name**: Name of the attending doctor
  - **Amount**: Claim amount
  - **Submission Date**: When the claim was submitted
  - **Status**: Current status (usually "pending")
  - **Description**: Description of the claim
  - **Documents**: Attached documents (if any)
  - **Transaction Hash**: Blockchain transaction hash (if available)

### 2. Review Claim Documents
- Click on **"View Document"** to open attached documents
- Documents are stored on IPFS and can be accessed via the provided URLs
- You can also enter a **Manual File URL** to check additional documents
- Review all documents carefully before making a decision

### 3. Approve a Claim

**To approve a claim:**
1. Review all claim details and documents
2. Verify the information is correct
3. Click the **"Approve"** button (green button with checkmark icon)
4. The claim will be approved immediately
5. A success message will be displayed
6. The claim will be removed from the pending list

**Note:** Approving a claim does not require any additional input.

### 4. Reject a Claim

**To reject a claim:**
1. Review all claim details and documents
2. Click the **"Reject"** button (red button with X icon)
3. A rejection reason text area will appear
4. **Enter a detailed rejection reason** (required)
5. Click **"Submit Rejection"** button
6. The claim will be rejected with your reason
7. A success message will be displayed
8. The claim will be removed from the pending list

**Important:** 
- You **must** provide a rejection reason
- The rejection reason should be clear and detailed
- This reason will be visible to the patient

### 5. Refresh Claims List
- Click the **"Refresh"** button to reload the claims list
- This will fetch the latest pending claims from the server

## Features

### Loading States
- While reviewing a claim, the buttons will show a loading state
- This prevents multiple submissions
- Wait for the operation to complete

### Error Handling
- If an error occurs, an error message will be displayed
- Check your internet connection and try again
- If the error persists, contact the administrator

### Fraud Detection
- The system may automatically detect fraudulent claims
- If fraud is detected, the claim will be automatically rejected
- You will see a message indicating fraud was detected

## Best Practices

1. **Review Thoroughly**: Always review all claim details and documents before making a decision
2. **Document Everything**: If rejecting, provide a clear and detailed reason
3. **Be Timely**: Review claims as soon as possible to avoid delays
4. **Verify Information**: Check patient information, amounts, and documents carefully
5. **Follow Guidelines**: Follow your organization's guidelines for claim approval/rejection

## Troubleshooting

### No Claims Appearing
- Check if there are any pending claims in the system
- Try refreshing the page
- Check your internet connection
- Verify you have the correct permissions

### Cannot Approve/Reject
- Check if you're logged in
- Verify your account has doctor/admin permissions
- Check if the claim has already been reviewed
- Try refreshing the page

### Documents Not Loading
- Check your internet connection
- Verify the IPFS gateway is accessible
- Try using the manual file URL option
- Contact technical support if issues persist

## Additional Notes

- **Status Updates**: Claim status is updated immediately after review
- **Notifications**: Patients will be notified of claim approval/rejection
- **History**: All reviews are logged in the system
- **Audit Trail**: All actions are tracked for audit purposes

## Support

If you encounter any issues or have questions:
1. Check this guide first
2. Contact your system administrator
3. Check the system logs for error messages
4. Report bugs to the development team

---

**Last Updated**: 2024
**Version**: 1.0




