// ── הגדרות מערכת ───────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXy1DDOccFkBc49QxayR1H-wHBELNf_mYq54mOdbs-yrakjm3xa1wQkBMtYJJgNukmwg/exec';

// ── אדמינים ─────────────────────────────────────────────────────────────────
// role: 'master' = גישה מלאה (הוספה/עריכה/מחיקה של לקוחות ולידים).
//       'admin'  = רואה הכל, לא יכול לערוך/למחוק כלום.
// להוסיף אדמין: הוסף שורה { u:'username', p:'password', role:'master'|'admin' }
const ADMIN_USERS = [
  { u: 'admin', p: 'Matan2504', role: 'master' },
  { u: 'Omer',  p: 'Omer1!',    role: 'admin' }  // צפייה בלבד, ללא עריכה
];

// סיסמת אדמין ראשית (backwards compat)
const ADMIN_PASSWORD = ADMIN_USERS[0].p;
