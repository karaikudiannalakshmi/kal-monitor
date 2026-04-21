# KAL Kitchen Monitor — Setup & Deployment Guide

## Project: `kal-kitchen-monitor`
**Stack:** React + Vite · Firebase Auth · Firestore · Firebase Storage · Vercel

---

## STEP 1 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `kal-kitchen-monitor`
3. Disable Google Analytics (not needed) → **Create project**

---

## STEP 2 — Enable Firebase Services

### Authentication
1. Firebase Console → **Authentication** → **Get started**
2. Enable **Phone** provider
3. Enable **Google** provider (your admin Gmail)
4. Add your domain to Authorized domains:
   - `localhost`
   - `your-app.vercel.app` (add after Vercel deploy)

### Firestore Database
1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select region: `asia-south1` (Mumbai — closest to Tamil Nadu)
4. After creation, go to **Rules** tab → paste contents of `firestore.rules`
5. **Publish**

### Storage
1. Firebase Console → **Storage** → **Get started**
2. Choose `asia-south1`
3. Go to **Rules** tab → paste contents of `storage.rules`
4. **Publish**

---

## STEP 3 — Get Firebase Config

1. Firebase Console → **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** → **Add app** → Web (`</>`)
3. Register app name: `kal-monitor-web`
4. Copy the `firebaseConfig` values

---

## STEP 4 — Add Yourself as Admin

After first login with Google, you need to add your UID to the `admins` collection:

1. Firebase Console → **Authentication** → find your Google account → copy the **UID**
2. Firebase Console → **Firestore** → **+ Start collection** → id: `admins`
3. Add document with **Document ID = your UID**, field: `email` = `your@gmail.com`

That's it. Next time you log in with Google, you'll see the admin panel.

---

## STEP 5 — Local Development

```bash
# Clone your repo after pushing
git clone https://github.com/karaikudiannalakshmi/kal-kitchen-monitor
cd kal-kitchen-monitor

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and fill in your Firebase values

# Run locally
npm run dev
```

Your `.env.local` should look like:
```
VITE_FB_API_KEY=AIzaSy...
VITE_FB_AUTH_DOMAIN=kal-kitchen-monitor.firebaseapp.com
VITE_FB_PROJECT_ID=kal-kitchen-monitor
VITE_FB_STORAGE_BUCKET=kal-kitchen-monitor.appspot.com
VITE_FB_MESSAGING_SENDER_ID=123456789
VITE_FB_APP_ID=1:123456789:web:abc123
```

---

## STEP 6 — Deploy to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/karaikudiannalakshmi/kal-kitchen-monitor
git push -u origin main
```

Then in Vercel:
1. https://vercel.com → **New Project** → Import `kal-kitchen-monitor`
2. Framework: **Vite**
3. **Environment Variables** → add all 6 `VITE_FB_*` keys from your `.env.local`
4. **Deploy**

After deploy:
- Copy your `.vercel.app` URL
- Add it to Firebase Console → Authentication → **Authorized domains**

---

## STEP 7 — Phone OTP (for Staff Login)

Firebase Phone Auth requires:
- **Billing enabled** on the Firebase project (Blaze plan — pay as you go)
- For India: country code `+91` is auto-handled
- reCAPTCHA is invisible — no action needed

> OTP is free for the first 10,000 verifications/month.

---

## STEP 8 — Add Staff

**Option A — Via Admin Panel:**
1. Login with your Google account → Admin app opens
2. Go to **👥 Staff** tab
3. Enter name, phone number (+91...), role → **Add Staff**
4. The staff member documents are created with their phone as identifier

**Option B — Staff self-register:**
- Staff open the app URL on their phone
- Enter their mobile number → receive OTP → verify
- A staff profile is auto-created with their phone number
- You can edit their name/role from the Admin panel

---

## STEP 9 — Daily Task Upload (Excel)

1. Admin logs in → **📤 Upload Tasks** tab
2. Click **⬇ Download Template** → opens Excel with Tamil column headers:

| பணியாளர் பெயர் | பணி விவரம் | தொடக்க நேரம் | முடிவு நேரம் | வகை | பதிலாள் பணி |
|---|---|---|---|---|---|
| Viji | Online parcel | 08:30 | 09:00 | normal | |
| Anandhi | Taste rasam | 09:00 | 09:30 | critical | |
| Viji | Cover Ravi – cutting | 11:00 | 12:00 | normal | Ravi absent |

3. Fill tasks → Save → Upload in admin panel
4. Select the date → Upload → Preview shown → Confirm

**Staff names in Excel must match exactly what's in the Staff list** (case-insensitive).

---

## STAFF EXPERIENCE (Tamil UI)

Staff open the app on their phone:
1. Enter mobile number → OTP → Login
2. **📋 என் பணிகள்** tab — today's tasks in Tamil
3. Tap checkbox to mark done
4. Tap ⏱ to enter actual start/end times
5. 🎙 Voice note appears for critical tasks or when late — tap to record reason in Tamil/English
6. **📊 என் பதிவு** tab — view compliance for any date

---

## Firestore Data Structure

```
/admins/{uid}           — admin UIDs
/staff/{uid}            — staff profiles
/tasks/{taskId}         — daily tasks (date + staffId indexed)
/logs/{staffId_date_taskId}  — actual time + status logs
/voiceNotes/{staffId_date_taskId}  — voice note download URLs
```

Storage path for audio: `voice/{staffId}/{date}/{taskId}`

---

## Firestore Indexes Needed

Create composite indexes in Firebase Console → Firestore → Indexes:

1. Collection: `tasks` — Fields: `date ASC`, `staffId ASC`
2. Collection: `logs`  — Fields: `date ASC`, `staffId ASC`
3. Collection: `logs`  — Fields: `date ASC` (for admin all-staff view)

Firebase will prompt you with a direct link to create these when the app first runs.

---

## Cost Estimate (Blaze Plan)

| Service | Free Tier | Typical daily use |
|---|---|---|
| Firestore reads | 50,000/day free | ~500/day → free |
| Firestore writes | 20,000/day free | ~100/day → free |
| Storage | 5 GB free | Voice notes ~1MB each → free for months |
| Phone OTP | 10,000/month free | 10 staff/day → free |

**Expected monthly cost: ₹0 for this scale.**

---

## Support

Project files are in: `karaikudiannalakshmi/kal-kitchen-monitor` on GitHub
