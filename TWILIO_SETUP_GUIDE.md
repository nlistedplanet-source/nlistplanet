# Twilio SMS OTP Setup Guide

## Current Issue
Mobile OTP is not being received because Twilio trial account has limitations.

## Twilio Trial Account Limitations
1. **Can only send SMS to verified phone numbers**
2. SMS will have a trial message prefix
3. Limited to pre-verified numbers in Twilio console

## Solution Steps

### Step 1: Verify Your Phone Number in Twilio Console
1. Go to: https://console.twilio.com/
2. Login with your Twilio account
3. Navigate to: **Phone Numbers** → **Verified Caller IDs**
4. Click **Add a new Caller ID**
5. Enter your mobile number in format: **+919580118412**
6. Twilio will send you a verification code
7. Enter the code to verify

### Step 2: Test After Verification
After verification, SMS OTP will work but with trial message:
```
Sent from your Twilio trial account - Your OTP is: 123456
```

### Step 3: Upgrade Twilio Account (Recommended)
To remove limitations and trial message:
1. Go to Twilio Console → **Billing**
2. Add credit (minimum $20)
3. Upgrade from Trial to Paid account
4. After upgrade:
   - Can send to ANY number (no verification needed)
   - No trial message prefix
   - Professional SMS delivery

## Current Twilio Configuration
- **Account**: Check backend .env file for credentials
- **Phone Number**: US-based Twilio number
- **Status**: Trial Account (needs verification)

## Alternative: Use Email OTP Only
If you don't want to upgrade Twilio:
- Email OTP is working perfectly (uses Gmail)
- Hide mobile verification temporarily
- Use only email verification for profile completion

## Technical Details
**Frontend**: Automatically adds +91 prefix to Indian mobile numbers
**Backend**: Uses Twilio SDK to send SMS
**Format Required**: +91XXXXXXXXXX (international format)

## Testing
1. First verify your number in Twilio console
2. Then try "Send OTP" in profile
3. You should receive SMS within 5-10 seconds
4. OTP expires in 10 minutes
