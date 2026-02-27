# Real Estate Backend (Auth APIs + MongoDB)

## Registration Flow (Postman)

1) Check email
- POST `/api/auth/register/check-email`
```json
{ "email": "deepika@example.com" }
```

2) Submit details and request OTP
- POST `/api/auth/register/request-otp`
```json
{
  "fullName": "Deepika Sharma",
  "email": "deepika@example.com",
  "phoneNumber": "9876543210",
  "agentType": "yes"
}
```
- OTP is stored in user document (`otpCode`, `otpExpiresAt`) and sent to email.
- If `OTP_DEBUG=true`, response also includes `otpCode`.

3) Verify OTP
- POST `/api/auth/register/verify-otp`
```json
{
  "registrationId": "from-step-2",
  "otp": "from-email-or-debug"
}
```
- Correct OTP: `200` + `Account created successfully`
- Wrong OTP: `400` + `OTP is not correct, please try again`

## Login Flow

- POST `/api/auth/login`
```json
{
  "identifier": "deepika@example.com",
  "password": "deepika123"
}
```

Behavior:
- First login after registration (no password set yet): entered password is saved, returns `Password set and login successful`.
- Later login with same password: `Login successful`.
- Wrong password for existing user: `Wrong password, please try again`.
- Login works with email or username.
- To set username on first login, send optional `newUsername`.

## Required Env

- `MONGODB_URI`
- `JWT_SECRET`

## SMTP Env (for OTP email)

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS` (Google app password)
- `SMTP_FROM`
