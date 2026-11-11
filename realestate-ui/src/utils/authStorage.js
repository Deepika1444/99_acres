const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

const LEGACY_TOKEN_KEYS = ["token", "jwtToken"];
const LEGACY_USER_KEYS = ["user", "userData"];

function readFirstString(keys) {
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function readFirstObject(keys) {
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (!value) continue;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Ignore invalid legacy payloads.
    }
  }
  return null;
}

export function getAuthToken() {
  const primary = readFirstString([AUTH_TOKEN_KEY]);
  if (primary) return primary;    //authtoken

  const legacy = readFirstString(LEGACY_TOKEN_KEYS);     //token,jwtoken
  if (legacy) {
    localStorage.setItem(AUTH_TOKEN_KEY, legacy);
    for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
  }
  return legacy;
}

export function getAuthUser() {
  const primary = readFirstObject([AUTH_USER_KEY]);     //authuser
  if (primary) return primary;

  const legacy = readFirstObject(LEGACY_USER_KEYS);      //user,userdata
  if (legacy) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(legacy));
    for (const key of LEGACY_USER_KEYS) localStorage.removeItem(key);
  }
  return legacy;
}

export function getUserInitials(user, fallback = "") {
  const displayName = String(user?.fullName || user?.name || user?.username || user?.email || "").trim();
  if (!displayName) return fallback;

  const normalized = displayName.includes("@") ? displayName.split("@")[0] : displayName;
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase() || fallback;
  }

  return normalized.slice(0, 2).toUpperCase() || fallback;
}

export function setAuthSession({ token, user }) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, String(token));
  if (user && typeof user === "object") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
  for (const key of LEGACY_USER_KEYS) localStorage.removeItem(key);
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
  for (const key of LEGACY_USER_KEYS) localStorage.removeItem(key);
}
