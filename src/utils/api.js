/**
 * Robust API Fetch Helper
 * Handles local proxy, Vercel edge proxy, and direct fallback to https://ccaas.agmcgroup.ae
 */
export const API_BASE_URL = "https://ccaas.agmcgroup.ae";

export async function apiFetch(path, options = {}) {
  const relativeUrl = path.startsWith('/') ? path : `/${path}`;
  const directUrl = path.startsWith('http') ? path : `${API_BASE_URL}${relativeUrl}`;

  // 1. Try relative endpoint (uses Vite local proxy or Vercel rewrite)
  try {
    const res = await fetch(relativeUrl, options);
    const contentType = res.headers.get('content-type') || '';
    
    // If response is valid JSON (not an HTML fallback page)
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: true, data, status: res.status };
    }
  } catch (err) {
    console.warn(`Relative fetch to ${relativeUrl} failed, falling back to direct URL:`, err);
  }

  // 2. Direct fetch fallback to https://ccaas.agmcgroup.ae
  try {
    const directRes = await fetch(directUrl, options);
    const contentType = directRes.headers.get('content-type') || '';
    
    if (directRes.ok) {
      if (contentType.includes('application/json')) {
        const data = await directRes.json();
        return { ok: true, data, status: directRes.status };
      }
      try {
        const textData = await directRes.json();
        return { ok: true, data: textData, status: directRes.status };
      } catch {
        return { ok: true, data: null, status: directRes.status };
      }
    }
    return { ok: false, status: directRes.status };
  } catch (err) {
    console.error(`Direct fetch to ${directUrl} failed:`, err);
    return { ok: false, error: err.message };
  }
}

/**
 * Lead Intake Authentication Helper
 * Obtains and caches JWT Bearer token from /api/v1/lead-intake/token
 * (Default token expiry is 18000s / 5 hours)
 */
export async function getLeadIntakeToken(forceRefresh = false) {
  const CACHE_KEY = 'ccaas_lead_intake_token';
  const EXPIRY_KEY = 'ccaas_lead_intake_token_expiry';

  if (!forceRefresh) {
    try {
      const cachedToken = localStorage.getItem(CACHE_KEY);
      const cachedExpiry = localStorage.getItem(EXPIRY_KEY);
      if (cachedToken && cachedExpiry && Date.now() < parseInt(cachedExpiry, 10) - 60000) {
        return cachedToken;
      }
    } catch {
      // localStorage may fail in some environments
    }
  }

  const endpoint = '/api/v1/lead-intake/token';
  const directUrl = `${API_BASE_URL}${endpoint}`;
  const credentials = {
    username: "Genesys",
    password: "okICXPfBMO9aoqxiCNaqe58GQeGPdpzK"
  };

  let tokenData = null;

  // Try relative proxy first
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (res.ok) {
      tokenData = await res.json();
    }
  } catch (err) {
    console.warn("Relative lead-intake token fetch failed, falling back to direct URL:", err);
  }

  // Fallback to direct URL if needed
  if (!tokenData || !tokenData.token) {
    const res = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      throw new Error(`Failed to obtain lead intake token: ${res.statusText}`);
    }
    tokenData = await res.json();
  }

  if (tokenData && tokenData.token) {
    try {
      const expiresInMs = (tokenData.expiresInSeconds || 18000) * 1000;
      localStorage.setItem(CACHE_KEY, tokenData.token);
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresInMs));
    } catch {
      // ignore storage write errors
    }
    return tokenData.token;
  }

  throw new Error("Invalid token response from CCaaS server");
}

/**
 * Submits a new sales lead to CCaaS Lead Intake API (/api/v1/lead-intake)
 * Automatically attaches Bearer token and retries on 401 Unauthorized
 */
export async function submitLeadIntake(payload) {
  let token = await getLeadIntakeToken();
  const endpoint = '/api/v1/lead-intake';
  const directUrl = `${API_BASE_URL}${endpoint}`;

  const sendRequest = async (authToken, url) => {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  };

  let res;
  try {
    res = await sendRequest(token, endpoint);
  } catch {
    res = await sendRequest(token, directUrl);
  }

  // 401 Unauthorized token expired -> force refresh and retry once
  if (res.status === 401) {
    token = await getLeadIntakeToken(true);
    try {
      res = await sendRequest(token, endpoint);
    } catch {
      res = await sendRequest(token, directUrl);
    }
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    let errMsg = data?.message;
    if (data?.errors) {
      errMsg = Object.entries(data.errors).map(([k, v]) => `${k}: ${v}`).join(' | ');
    }
    const error = new Error(errMsg || `Submission failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return { ok: true, data, status: res.status };
}

