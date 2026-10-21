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

/**
 * Keyloop RPA Intake Integration
 * Handles asynchronous RPA case submission and task status polling
 * Compatible with all brand groups (BMW, GEELY, MINI, etc.)
 */
export const RPA_API_KEY = "d2c00eecad3637ef2ae729208ab12236103fe0afe399f6a84d3ec55b51644187";

export const DEFAULT_RPA_CALLBACK_URL = "http://localhost:9999/hook";

/**
 * Submits an RPA case to POST /api/intake/cases
 * @param {string} caseType - e.g. 'CREATE_CUSTOMER', 'RESCHEDULE_DEMO_VEHICLE', 'CANCEL_DEMO_VEHICLE', 'CONVERT_PROSPECT_TO_ENQUIRY', 'BOOK_DEMO_VEHICLE'
 * @param {object} details - Case payload details (group, branch, customerId, etc.)
 * @param {object} options - Optional parameters (callbackUrl, createdBy)
 */
export async function submitRpaCase(caseType, details, options = {}) {
  const endpoint = '/api/intake/cases';
  const directUrl = `${API_BASE_URL}${endpoint}`;
  const payload = {
    caseType,
    callbackUrl: options.callbackUrl !== undefined ? options.callbackUrl : DEFAULT_RPA_CALLBACK_URL,
    createdBy: options.createdBy || "genesys",
    details: details || {}
  };

  const send = async (url) => {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': RPA_API_KEY
      },
      body: JSON.stringify(payload)
    });
  };

  let res;
  try {
    res = await send(endpoint);
  } catch (err) {
    res = await send(directUrl);
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    try { data = JSON.parse(text); } catch { data = { message: text }; }
  }

  if (!res.ok) {
    const errMsg = data?.errorMessage || data?.message || data?.error || `RPA submission refused (${res.status})`;
    const err = new Error(errMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data; // { taskId, status }
}

/**
 * Fetches the current status of an RPA case at GET /api/intake/cases/:taskId (Single status check)
 * @param {string} taskId - RPA task ID returned by submitRpaCase
 */
export async function getRpaCaseStatus(taskId) {
  if (!taskId) return null;
  const endpoint = `/api/intake/cases/${taskId}`;
  const directUrl = `${API_BASE_URL}${endpoint}`;

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'X-Api-Key': RPA_API_KEY }
    });
  } catch {
    try {
      res = await fetch(directUrl, {
        method: 'GET',
        headers: { 'X-Api-Key': RPA_API_KEY }
      });
    } catch {
      return null;
    }
  }

  if (!res || !res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Polls the status of an RPA case at GET /api/intake/cases/:taskId until COMPLETED or FAILED
 * @param {string} taskId - RPA task ID returned by submitRpaCase
 * @param {number} maxWaitMs - Maximum time to wait before timing out (default 10s)
 * @param {number} intervalMs - Poll interval (default 3s)
 * @param {function} onProgress - Callback receiving (status, taskData)
 */
export async function pollRpaCaseStatus(taskId, maxWaitMs = 10000, intervalMs = 3000, onProgress = null) {
  if (!taskId) {
    throw new Error("No taskId provided for RPA status check");
  }

  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const data = await getRpaCaseStatus(taskId);
    if (data) {
      const status = (data?.status || '').toUpperCase();

      if (onProgress) {
        try { onProgress(status, data); } catch (e) { console.warn("onProgress error:", e); }
      }

      if (status === 'COMPLETED' || status === 'SUCCESS') {
        return { 
          ok: true, 
          status: 'COMPLETED', 
          result: data.result || data, 
          taskId 
        };
      }

      if (status === 'FAILED' || status === 'ERROR') {
        const errMsg = data.errorMessage || data.errorCode || 'RPA task execution failed in Keyloop';
        const err = new Error(errMsg);
        err.errorCode = data.errorCode;
        err.data = data;
        throw err;
      }
    }

    // Task is still QUEUED or CLAIMED (running)
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return { ok: true, status: 'QUEUED', taskId };
}

/**
 * Executes an RPA case: submits case to Keyloop broker and checks status once
 * Avoids continuous polling loop that spams the server with dozens of requests
 * @param {string} caseType - Case type identifier
 * @param {object} details - Case payload details
 * @param {object} options - Options (createdBy, onProgress, checkOnce)
 */
export async function executeRpaCase(caseType, details, options = {}) {
  // 1. Submit case to Keyloop intake queue
  const submission = await submitRpaCase(caseType, details, options);
  if (!submission?.taskId) {
    return { ok: true, data: submission, taskId: null };
  }

  if (options.onProgress) {
    options.onProgress(submission.status || 'QUEUED', submission);
  }

  // 2. Perform at most ONE single check after 1.5s in case the bot completed immediately
  if (options.checkOnce !== false) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const check = await getRpaCaseStatus(submission.taskId);
      if (check) {
        const status = (check.status || '').toUpperCase();
        if (options.onProgress) {
          options.onProgress(status, check);
        }

        if (status === 'COMPLETED' || status === 'SUCCESS') {
          return {
            ok: true,
            status: 'COMPLETED',
            result: check.result || check,
            taskId: submission.taskId
          };
        }

        if (status === 'FAILED' || status === 'ERROR') {
          const errMsg = check.errorMessage || check.errorCode || 'RPA task execution failed in Keyloop';
          const err = new Error(errMsg);
          err.errorCode = check.errorCode;
          err.data = check;
          throw err;
        }

        return {
          ok: true,
          status,
          result: check.result || null,
          taskId: submission.taskId
        };
      }
    } catch (err) {
      if (err.errorCode || err.message?.includes('failed in Keyloop')) {
        throw err;
      }
    }
  }

  // 3. Return accepted / queued task immediately without spamming the backend
  return {
    ok: true,
    status: submission.status || 'QUEUED',
    result: null,
    taskId: submission.taskId
  };
}


