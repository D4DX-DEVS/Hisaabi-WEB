# Hisaabi Web

Web version of the Hisaabi app (Next.js, React, TypeScript). Tracker, groups and Qibla are not included.

## Run

```bash
npm install
npm run dev -- -p 3100
```

## Configuration

All settings live in `.env` in the project root (git-ignored). The file is commented with where each kind of data is stored.

| Variable | Purpose |
|---|---|
| `BACKEND_URL` | Hisaabi API, reached through the `/api/proxy` route (avoids browser CORS) |
| `NEXT_PUBLIC_UPLOADS_URL` | Where the backend serves banner images and videos |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web sign-in, same project as the mobile app |
| `MUSHAF_FONT_PACK_URL`, `MUSHAF_FONT_CACHE_DIR` | Source and cache folder for Mushaf page fonts |
| `NEXT_PUBLIC_QURAN_API_URL`, `NEXT_PUBLIC_QURAN_RECITER_ID` | Quran recitation audio |
| `COMMON_EMAIL_BASE_URL`, `COMMON_EMAIL_API_KEY` | Feedback and feature-request email (secret) |

Sign-in needs the site's domain in Firebase, Authentication, Authorized domains. Apple sign-in also needs a Services ID.

## Data

- The Quran is read as Mushaf pages (Arabic only, as in the mobile app). Page data, surah and juz indexes, the 99 names and adhkar ship as static JSON in `public/data`.
- Prayer times are calculated in the browser with `adhan`.
- Duas, hadith, quotes, Ramadan duas, adhkar, guided tasbeehs, names with translations, the Library, Special duas, Importance and the AI assistant come from the backend and need sign-in.
- Content language (English, Malayalam, Urdu) is chosen in the sidebar or Settings and kept on this device. Library articles are admin-written HTML and are sanitised with DOMPurify before display.
- Saved items and tasbeeh counts are stored in the browser only.
