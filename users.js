// ── הגדרות מערכת ───────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXy1DDOccFkBc49QxayR1H-wHBELNf_mYq54mOdbs-yrakjm3xa1wQkBMtYJJgNukmwg/exec';

// ── אדמינים ─────────────────────────────────────────────────────────────────
// להוסיף אדמין: הוסף שורה { u:'username', p:'password' }
const ADMIN_USERS = [
  { u: 'admin',  p: 'Matan2504' },
  { u: 'partner', p: 'Partner2504' }  // ← שותף
];

// סיסמת אדמין ראשית (backwards compat)
const ADMIN_PASSWORD = ADMIN_USERS[0].p;
