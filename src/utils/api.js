/**
 * Robust API Fetch Helper
 * Handles local proxy, Vercel edge proxy, and direct fallback to https://ccaas.agmcgroup.ae
 */
export const API_BASE_URL = "https://ccaas.agmcgroup.ae";

export async function apiFetch(path, options = {}) {
  const relativeUrl = path.startsWith("/") ? path : `/${path}`;
  const directUrl = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${relativeUrl}`;

  // 1. Try relative endpoint (uses Vite local proxy or Vercel rewrite)
  try {
    const res = await fetch(relativeUrl, options);
    const contentType = res.headers.get("content-type") || "";

    // If response is valid JSON (not an HTML fallback page)
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return { ok: true, data, status: res.status };
    }
  } catch (err) {
    console.warn(
      `Relative fetch to ${relativeUrl} failed, falling back to direct URL:`,
      err,
    );
  }

  // 2. Direct fetch fallback to https://ccaas.agmcgroup.ae
  try {
    const directRes = await fetch(directUrl, options);
    const contentType = directRes.headers.get("content-type") || "";

    if (directRes.ok) {
      if (contentType.includes("application/json")) {
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
  const CACHE_KEY = "ccaas_lead_intake_token";
  const EXPIRY_KEY = "ccaas_lead_intake_token_expiry";

  if (!forceRefresh) {
    try {
      const cachedToken = localStorage.getItem(CACHE_KEY);
      const cachedExpiry = localStorage.getItem(EXPIRY_KEY);
      if (
        cachedToken &&
        cachedExpiry &&
        Date.now() < parseInt(cachedExpiry, 10) - 60000
      ) {
        return cachedToken;
      }
    } catch {
      // localStorage may fail in some environments
    }
  }

  const endpoint = "/api/v1/lead-intake/token";
  const directUrl = `${API_BASE_URL}${endpoint}`;
  const credentials = {
    username: "Genesys",
    password: "okICXPfBMO9aoqxiCNaqe58GQeGPdpzK",
  };

  let tokenData = null;

  // Try relative proxy first
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (res.ok) {
      tokenData = await res.json();
    }
  } catch (err) {
    console.warn(
      "Relative lead-intake token fetch failed, falling back to direct URL:",
      err,
    );
  }

  // Fallback to direct URL if needed
  if (!tokenData || !tokenData.token) {
    const res = await fetch(directUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
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
  const endpoint = "/api/v1/lead-intake";
  const directUrl = `${API_BASE_URL}${endpoint}`;

  const sendRequest = async (authToken, url) => {
    return await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
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
      errMsg = Object.entries(data.errors)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");
    }
    const error = new Error(
      errMsg || `Submission failed with status ${res.status}`,
    );
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
export const RPA_API_KEY =
  "d2c00eecad3637ef2ae729208ab12236103fe0afe399f6a84d3ec55b51644187";

export const DEFAULT_RPA_CALLBACK_URL = "http://localhost:9999/hook";

/**
 * Submits an RPA case to POST /api/intake/cases
 * @param {string} caseType - e.g. 'CREATE_CUSTOMER', 'RESCHEDULE_DEMO_VEHICLE', 'CANCEL_DEMO_VEHICLE', 'CONVERT_PROSPECT_TO_ENQUIRY', 'BOOK_DEMO_VEHICLE'
 * @param {object} details - Case payload details (group, branch, customerId, etc.)
 * @param {object} options - Optional parameters (callbackUrl, createdBy)
 */
export async function submitRpaCase(caseType, details, options = {}) {
  const endpoint = "/api/intake/cases";
  const directUrl = `${API_BASE_URL}${endpoint}`;
  const payload = {
    caseType,
    callbackUrl:
      options.callbackUrl !== undefined
        ? options.callbackUrl
        : DEFAULT_RPA_CALLBACK_URL,
    createdBy: options.createdBy || "genesys",
    details: details || {},
  };

  const send = async (url) => {
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": RPA_API_KEY,
      },
      body: JSON.stringify(payload),
    });
  };

  let res;
  try {
    res = await send(endpoint);
  } catch (err) {
    res = await send(directUrl);
  }

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
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
    const errMsg =
      data?.errorMessage ||
      data?.message ||
      data?.error ||
      `RPA submission refused (${res.status})`;
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
      method: "GET",
      headers: { "X-Api-Key": RPA_API_KEY },
    });
  } catch {
    try {
      res = await fetch(directUrl, {
        method: "GET",
        headers: { "X-Api-Key": RPA_API_KEY },
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
export async function pollRpaCaseStatus(
  taskId,
  maxWaitMs = 10000,
  intervalMs = 3000,
  onProgress = null,
) {
  if (!taskId) {
    throw new Error("No taskId provided for RPA status check");
  }

  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const data = await getRpaCaseStatus(taskId);
    if (data) {
      const status = (data?.status || "").toUpperCase();

      if (onProgress) {
        try {
          onProgress(status, data);
        } catch (e) {
          console.warn("onProgress error:", e);
        }
      }

      if (status === "COMPLETED" || status === "SUCCESS") {
        return {
          ok: true,
          status: "COMPLETED",
          result: data.result || data,
          taskId,
        };
      }

      if (status === "FAILED" || status === "ERROR") {
        const errMsg =
          data.errorMessage ||
          data.errorCode ||
          "RPA task execution failed in Keyloop";
        const err = new Error(errMsg);
        err.errorCode = data.errorCode;
        err.data = data;
        throw err;
      }
    }

    // Task is still QUEUED or CLAIMED (running)
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { ok: true, status: "QUEUED", taskId };
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
    options.onProgress(submission.status || "QUEUED", submission);
  }

  // 2. Perform at most ONE single check after 1.5s in case the bot completed immediately
  if (options.checkOnce !== false) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const check = await getRpaCaseStatus(submission.taskId);
      if (check) {
        const status = (check.status || "").toUpperCase();
        if (options.onProgress) {
          options.onProgress(status, check);
        }

        if (status === "COMPLETED" || status === "SUCCESS") {
          return {
            ok: true,
            status: "COMPLETED",
            result: check.result || check,
            taskId: submission.taskId,
          };
        }

        if (status === "FAILED" || status === "ERROR") {
          const errMsg =
            check.errorMessage ||
            check.errorCode ||
            "RPA task execution failed in Keyloop";
          const err = new Error(errMsg);
          err.errorCode = check.errorCode;
          err.data = check;
          throw err;
        }

        return {
          ok: true,
          status,
          result: check.result || null,
          taskId: submission.taskId,
        };
      }
    } catch (err) {
      if (err.errorCode || err.message?.includes("failed in Keyloop")) {
        throw err;
      }
    }
  }

  // 3. Return accepted / queued task immediately without spamming the backend
  return {
    ok: true,
    status: submission.status || "QUEUED",
    result: null,
    taskId: submission.taskId,
  };
}

export const COMPLAINT_API_KEY =
  "appuaaf5f0f304ff2ec2r63e5055c484fd739325cfb0cd3c3456ce8b55357e5b";

/**
 * Fetches Customer Complaints from CCaaS API:
 * GET /api/v1/complaints/{group}/customers/{customerNumber}?status={status}
 * If status is not passed or blank -> all records returned
 * If status = 'open' -> open records returned
 * If status = 'closed' -> closed records returned
 * @param {string} group - e.g. "BMW"
 * @param {string} customerNumber - e.g. "178760"
 * @param {string} status - "" | "open" | "closed"
 */
export async function getCustomerComplaintsByStatus(group = "BMW", customerNumber, status = "") {
  if (!customerNumber) return { ok: true, data: [] };

  const cleanGroup = encodeURIComponent(group || "BMW");
  const cleanCust = encodeURIComponent(customerNumber);
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const endpoint = `/api/v1/complaints/${cleanGroup}/customers/${cleanCust}${query}`;
  const directUrl = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    "X-Api-Key": COMPLAINT_API_KEY,
  };

  let res;
  try {
    res = await fetch(endpoint, {
      method: "GET",
      headers,
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Proxy status ${res.status}`);
    }
  } catch (err) {
    console.warn(`Relative fetch to ${endpoint} failed, trying direct URL:`, err);
    try {
      res = await fetch(directUrl, {
        method: "GET",
        headers,
      });
    } catch (directErr) {
      console.error(`Direct fetch to ${directUrl} failed:`, directErr);
      return { ok: false, error: directErr.message, data: [] };
    }
  }

  try {
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return { ok: true, data: Array.isArray(data) ? data : [], status: res.status };
    }
    return { ok: false, data: [], status: res?.status };
  } catch (err) {
    return { ok: false, error: err.message, data: [] };
  }
}

/**
 * Creates a Customer Complaint ticket via CCaaS Complaints API (POST /api/v1/complaints)
 * Integrates simultaneously with CXPulse CRM and Keyloop DMS.
 * @param {object} details - { company, customerId, customerName, customerPhone, customerEmail, complaint, category, complaintPriority, department, source, complaintGroup, externalRef }
 */
export async function createComplaintCase(details, options = {}) {
  // Format phone number to international 971 standard if UAE local format
  let cleanPhone = String(details.customerPhone || details.mobile || "").replace(/[^\d]/g, "");
  if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
    cleanPhone = "971" + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith("5") && cleanPhone.length === 9) {
    cleanPhone = "971" + cleanPhone;
  }

  const uniqueRef =
    details.externalRef && String(details.externalRef).trim() !== ""
      ? String(details.externalRef).trim()
      : `GENESYS-${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;

  const payload = {
    company: details.company || details.group || "Geely",
    customerId: String(details.customerId || "").trim(),
    customerName: String(details.customerName || "").trim(),
    customerPhone: cleanPhone || "971501234567",
    customerEmail: String(details.customerEmail || details.email || "").trim(),
    complaint: String(details.complaint || details.description || "").trim(),
    category: details.category || "Service Delay",
    complaintPriority: details.complaintPriority || details.priority || "Normal",
    department: details.department || "Service",
    source: details.source || "Customer Call",
    complaintGroup: details.complaintGroup || "Customer",
    externalRef: uniqueRef,
    ...(details.branch ? { branch: details.branch } : {}),
  };

  const headers = {
    "Content-Type": "application/json",
    "X-Api-Key": COMPLAINT_API_KEY,
  };

  const endpoint = "/api/v1/complaints";
  const directUrl = `${API_BASE_URL}${endpoint}`;

  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("Relative fetch to /api/v1/complaints failed, trying direct URL:", err);
    res = await fetch(directUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  }

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      errorMessage: data?.message || data?.error || data?.detail || `HTTP ${res.status}`,
      data,
    };
  }

  // Parse CXPulse ticket details if present
  let cxpulseDetail = null;
  if (data?.cxpulse?.detail) {
    try {
      cxpulseDetail =
        typeof data.cxpulse.detail === "string"
          ? JSON.parse(data.cxpulse.detail)
          : data.cxpulse.detail;
    } catch {}
  }

  const ticketNumber =
    cxpulseDetail?.ticketNumber || data?.cxpulse?.reference || null;
  const keyloopRef = data?.keyloop?.reference || null;

  return {
    ok: true,
    status: res.status,
    data,
    referenceId: data?.referenceId || uniqueRef,
    company: data?.company || payload.company,
    ticketNumber,
    keyloopRef,
    keyloopStatus: data?.keyloop?.status || null,
    cxpulseStatus: data?.cxpulse?.status || null,
    cxpulseDetail,
  };
}

/**
 * Links / Transfers vehicle ownership to a customer (existing or new)
 * Case Type: 'LINK_VEHICLE_TO_CUSTOMER' via POST /api/intake/cases
 * @param {object} details - Case payload details matching CCaaS intake schema
 * @param {object} options - Optional parameters (createdBy, callbackUrl, onProgress)
 */
export async function linkVehicleToCustomer(details, options = {}) {
  return await executeRpaCase("LINK_VEHICLE_TO_CUSTOMER", details, {
    callbackUrl: options.callbackUrl || DEFAULT_RPA_CALLBACK_URL,
    createdBy: options.createdBy || "genesys",
    ...options,
  });
}

/**
 * Updates Customer & Data Verification via RPA Intake (caseType: 'UPDATE_CUSTOMER')
 * POST /api/intake/cases
 * @param {object} details - Case payload details matching CCaaS intake schema
 * @param {object} options - Optional parameters (createdBy, callbackUrl, onProgress)
 */
export async function updateCustomerCase(details, options = {}) {
  return await executeRpaCase("UPDATE_CUSTOMER", details, {
    callbackUrl: options.callbackUrl || DEFAULT_RPA_CALLBACK_URL,
    createdBy: options.createdBy || "genesys",
    ...options,
  });
}

/**
 * Creates a Sales / Advisor Follow-Up Case via Keyloop RPA Intake (caseType: 'CREATE_SALES_FOLLOW_UP')
 * POST /api/intake/cases
 * @param {object} details - { group, customerId, customerName, followupId, dueDate, dueTime, branchCode, notes }
 * @param {object} options - Optional parameters (createdBy, callbackUrl, onProgress)
 */
export async function createSalesFollowUpCase(details, options = {}) {
  return await executeRpaCase("CREATE_SALES_FOLLOW_UP", details, {
    callbackUrl: options.callbackUrl || DEFAULT_RPA_CALLBACK_URL,
    createdBy: options.createdBy || "genesys",
    ...options,
  });
}

/* ========================================================================== */
/* AGMC SMS GATEWAY SERVICE (POST https://agmcutil.agmcgroup.ae/api/v1/sms/send)*/
/* ========================================================================== */

export const SMS_API_BASE_URL = "https://agmcutil.agmcgroup.ae";
export const SMS_API_KEY = "sgw_xJp-uS1wWvLsyi_R0F8z4LCTY22lXlnhEEVkmMtIsxo";

/**
 * Sends an SMS text message to a customer via the AGMC SMS Gateway
 * @param {object} params - { senderId, recipient, message, reference }
 */
export async function sendCustomerSmsMessage({
  senderId = "AGMC",
  recipient,
  message,
  reference,
}) {
  if (!recipient || String(recipient).trim() === "") {
    return { ok: false, error: "Recipient mobile number is required" };
  }
  if (!message || String(message).trim() === "") {
    return { ok: false, error: "Message content cannot be empty" };
  }

  // Format recipient: clean non-digits. If starting with 05, format to 9715 standard
  let cleanRecipient = String(recipient).replace(/[^\d]/g, "");
  if (cleanRecipient.startsWith("05") && cleanRecipient.length === 10) {
    cleanRecipient = "971" + cleanRecipient.slice(1);
  } else if (cleanRecipient.startsWith("5") && cleanRecipient.length === 9) {
    cleanRecipient = "971" + cleanRecipient;
  }

  // Ensure unique reference so the gateway never returns duplicate: true
  const uniqueReference =
    reference && String(reference).trim() !== ""
      ? String(reference).trim()
      : `GEN-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

  const bodyPayload = {
    senderId: senderId || "AGMC",
    recipient: cleanRecipient,
    message: String(message).trim(),
    reference: uniqueReference,
  };

  const headers = {
    "Content-Type": "application/json",
    "X-API-Key": SMS_API_KEY,
  };

  // 1. Try local proxy first (/sms-gateway/api/v1/sms/send)
  try {
    const res = await fetch("/sms-gateway/api/v1/sms/send", {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload),
    });
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (res.ok) {
        return {
          ok: true,
          data,
          status: res.status,
          reference: uniqueReference,
          recipient: cleanRecipient,
        };
      } else {
        return {
          ok: false,
          error: data?.message || data?.error || `HTTP ${res.status}`,
          status: res.status,
          data,
        };
      }
    }
  } catch (err) {
    console.warn(
      "Relative fetch to /sms-gateway failed, attempting direct fetch:",
      err,
    );
  }

  // 2. Direct fetch fallback to https://agmcutil.agmcgroup.ae/api/v1/sms/send
  try {
    const directRes = await fetch(`${SMS_API_BASE_URL}/api/v1/sms/send`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload),
    });
    const data = await directRes.json();
    if (directRes.ok) {
      return {
        ok: true,
        data,
        status: directRes.status,
        reference: uniqueReference,
        recipient: cleanRecipient,
      };
    }
    return {
      ok: false,
      error: data?.message || data?.error || `HTTP ${directRes.status}`,
      status: directRes.status,
      data,
    };
  } catch (err) {
    console.error("Direct SMS send error:", err);
    return {
      ok: false,
      error: err.message || "Failed to connect to AGMC SMS Gateway",
    };
  }
}

/* ========================================================================== */
/* AGMC UNIVERSAL SERVICE BOOKING FLOW APIS (MULTI-BRAND: BMW, MINI, GEELY)  */
/* Source: AGMC Omnichannel DMS / Service Booking Gateway                     */
/* ========================================================================== */

export const SERVICE_ENGINE_TENANT_ID = "OTagmcgeel713061";
export const GEELY_TENANT_ID = SERVICE_ENGINE_TENANT_ID;

/**
 * 1. Generate Service Gateway Token (GET /api/leads/generate-token/{tenantId})
 * Caches token in localStorage for 1 hour
 */
export async function getServiceEngineToken(
  tenantId = SERVICE_ENGINE_TENANT_ID,
  forceRefresh = false,
) {
  const CACHE_KEY = `ccaas_service_token_${tenantId}`;
  const EXPIRY_KEY = `ccaas_service_token_expiry_${tenantId}`;

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(EXPIRY_KEY);
      if (cached && expiry && Date.now() < parseInt(expiry, 10) - 60000) {
        return cached;
      }
    } catch {}
  }

  const endpoint = `/api/leads/generate-token/${encodeURIComponent(tenantId)}`;
  const res = await apiFetch(endpoint);

  if (res && res.ok && res.data?.token) {
    try {
      localStorage.setItem(CACHE_KEY, res.data.token);
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + 3600000));
    } catch {}
    return res.data.token;
  }

  // Fallback direct url in case of local proxy edge case
  const directUrl = `${API_BASE_URL}${endpoint}`;
  try {
    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      const data = await directRes.json();
      if (data?.token) {
        try {
          localStorage.setItem(CACHE_KEY, data.token);
          localStorage.setItem(EXPIRY_KEY, String(Date.now() + 3600000));
        } catch {}
        return data.token;
      }
    }
  } catch (e) {
    console.warn("Direct Service token fetch fallback failed:", e);
  }

  throw new Error(
    `Failed to generate Service engine token: ${res?.statusText || "Server error"}`,
  );
}
export const getGeelyServiceToken = getServiceEngineToken;

/**
 * Service API Fetch Helper with automatic Bearer/token injection & 401 retry
 */
export async function serviceApiFetch(path, options = {}, useBearer = false) {
  let token = null;
  try {
    token = await getServiceEngineToken();
  } catch (err) {
    console.warn(
      "Could not retrieve Service engine token, proceeding with unauthenticated request:",
      err,
    );
  }

  const authHeaderValue = token ? (useBearer ? `Bearer ${token}` : token) : "";
  const headers = {
    "Content-Type": "application/json",
    "x-l10n-locale": "en",
    ...(authHeaderValue ? { Authorization: authHeaderValue } : {}),
    ...(options.headers || {}),
  };

  let res = await apiFetch(path, { ...options, headers });

  // If 401 Unauthorized, refresh token once and retry
  if (res && res.status === 401) {
    try {
      token = await getServiceEngineToken(SERVICE_ENGINE_TENANT_ID, true);
      const retryAuth = token ? (useBearer ? `Bearer ${token}` : token) : "";
      headers["Authorization"] = retryAuth;
      res = await apiFetch(path, { ...options, headers });
    } catch (refreshErr) {
      console.warn("Token refresh retry failed:", refreshErr);
    }
  }

  return res;
}
export const geelyApiFetch = serviceApiFetch;

/**
 * 2. Find Customer across brands (GET /api/service/find-customer?phone={phone})
 */
export async function findServiceCustomer(phone) {
  if (!phone) return { ok: false, error: "Phone number is required" };
  const cleanPhone = String(phone).replace(/[^\d+]/g, "");
  return await serviceApiFetch(
    `/api/service/find-customer?phone=${encodeURIComponent(cleanPhone)}`,
  );
}
export const findGeelyCustomer = findServiceCustomer;

/**
 * 3. Get Customer Details (GET /api/service/getCustomerDetail?customerId={customerId})
 * Requires Bearer token
 */
export async function getServiceCustomerDetail(customerId) {
  if (!customerId) return { ok: false, error: "Customer ID is required" };
  return await serviceApiFetch(
    `/api/service/getCustomerDetail?customerId=${encodeURIComponent(customerId)}`,
    {},
    true,
  );
}
export const getGeelyCustomerDetail = getServiceCustomerDetail;

/**
 * 4. Get Customer Vehicles (GET /api/service/customer-vehicle?customerId={customerId})
 */
export async function getServiceCustomerVehicles(customerId) {
  if (!customerId) return { ok: false, error: "Customer ID is required" };
  return await serviceApiFetch(
    `/api/service/customer-vehicle?customerId=${encodeURIComponent(customerId)}`,
  );
}
export const getGeelyCustomerVehicles = getServiceCustomerVehicles;

/**
 * 5. Get Vehicle Details (GET /api/service/vehicle-details?vehicleNumber={vehicleNumber})
 * Requires Bearer token
 */
export async function getServiceVehicleDetails(vehicleNumber) {
  if (!vehicleNumber)
    return { ok: false, error: "Vehicle plate/number is required" };
  return await serviceApiFetch(
    `/api/service/vehicle-details?vehicleNumber=${encodeURIComponent(vehicleNumber)}`,
    {},
    true,
  );
}
export const getGeelyVehicleDetails = getServiceVehicleDetails;

/**
 * 6. Get Service Locations (GET /api/service-locations?type=workshop)
 */
export async function getServiceLocations(type = "workshop") {
  return await serviceApiFetch(
    `/api/service-locations?type=${encodeURIComponent(type)}`,
  );
}
export const getGeelyServiceLocations = getServiceLocations;

/**
 * 7. Get Recommended Services Catalogue (GET /api/service/recommended-services?type=workshop)
 */
export async function getServiceRecommendedServices(type = "workshop") {
  return await serviceApiFetch(
    `/api/service/recommended-services?type=${encodeURIComponent(type)}`,
  );
}
export const getGeelyRecommendedServices = getServiceRecommendedServices;

/**
 * 8. Get Advisor List (GET /api/service/advisors?dealershipLocationId={id})
 */
export async function getServiceAdvisors(dealershipLocationId) {
  return await serviceApiFetch(
    `/api/service/advisors?dealershipLocationId=${encodeURIComponent(dealershipLocationId)}`,
  );
}
export const getGeelyAdvisors = getServiceAdvisors;

/**
 * 9. Get Available Appointment Dates (POST /api/service/appointment-dates)
 * Supports dynamic make: 'BMW', 'MINI', 'Geely', 'Rolls-Royce', etc.
 */
export async function getAppointmentDates({
  dealershipLocationId,
  make = "BMW",
  serviceProductIds = [],
}) {
  const pIds = Array.isArray(serviceProductIds)
    ? serviceProductIds
    : [serviceProductIds].filter(Boolean);
  return await serviceApiFetch("/api/service/appointment-dates", {
    method: "POST",
    body: JSON.stringify({
      dealershipLocationId: Number(dealershipLocationId),
      make: make || "BMW",
      serviceProductIds: pIds,
    }),
  });
}
export const getGeelyAppointmentDates = getAppointmentDates;

/**
 * 10. Get Available Appointment Timeslots (POST /api/service/appointment-time)
 */
export async function getAppointmentTimes({
  selectedDate,
  dealershipLocationId,
  serviceProductIds = [],
}) {
  const pIds = Array.isArray(serviceProductIds)
    ? serviceProductIds
    : [serviceProductIds].filter(Boolean);
  return await serviceApiFetch("/api/service/appointment-time", {
    method: "POST",
    body: JSON.stringify({
      selectedDate,
      dealershipLocationId: Number(dealershipLocationId),
      serviceProductIds: pIds,
    }),
  });
}
export const getGeelyAppointmentTimes = getAppointmentTimes;

/**
 * 11. Create Service Booking (POST /api/service)
 */
export async function createServiceBooking(payload) {
  const pIds = Array.isArray(payload.serviceProductIds)
    ? payload.serviceProductIds
    : [payload.serviceProductIds].filter(Boolean);

  const bodyPayload = {
    advisorId: String(payload.advisorId || ""),
    customerNotes: String(payload.customerNotes || ""),
    dealershipLocationId: Number(payload.dealershipLocationId) || 40,
    dropOffTime: payload.dropOffTime, // e.g. "10:15-10:30"
    licensePlateNo: String(payload.licensePlateNo || "").trim(),
    mileage: Number(payload.mileage) || 0,
    mileageUnit: payload.mileageUnit || "KM",
    serviceProductIds: pIds,
    startDate: payload.startDate, // e.g. "2026-11-17"
    vehicleId: Number(payload.vehicleId) || 0,
    ...(payload.startDateTime ? { startDateTime: payload.startDateTime } : {}),
  };

  return await serviceApiFetch("/api/service", {
    method: "POST",
    body: JSON.stringify(bodyPayload),
  });
}
export const createGeelyServiceBooking = createServiceBooking;

/**
 * 12. Get Active Appointment List (GET /api/service/appointments?regNumber={plate})
 */
export async function getServiceAppointments(regNumber) {
  if (!regNumber)
    return { ok: false, error: "Plate/Registration number is required" };
  return await serviceApiFetch(
    `/api/service/appointments?regNumber=${encodeURIComponent(regNumber)}`,
  );
}
export const getGeelyAppointments = getServiceAppointments;

/**
 * 13. Get Service History (GET /api/service/history?vinNumber={vin}&page=1&pageSize=50)
 */
export async function getServiceHistory(vinNumber, page = 1, pageSize = 50) {
  if (!vinNumber) return { ok: false, error: "VIN number is required" };
  return await serviceApiFetch(
    `/api/service/history?vinNumber=${encodeURIComponent(vinNumber)}&page=${page}&pageSize=${pageSize}`,
  );
}
export const getGeelyServiceHistory = getServiceHistory;

/**
 * 14. Get Service History Details (GET /api/service/history-by-Id/{serviceHistoryId})
 */
export async function getServiceHistoryDetail(serviceHistoryId) {
  if (!serviceHistoryId)
    return { ok: false, error: "Service history ID is required" };
  return await serviceApiFetch(
    `/api/service/history-by-Id/${encodeURIComponent(serviceHistoryId)}`,
  );
}
export const getGeelyServiceHistoryDetail = getServiceHistoryDetail;

/**
 * 15. Delete / Cancel Appointment (DELETE /api/service/appointments?appointmentId={appointmentId})
 */
export async function deleteServiceAppointment(appointmentId) {
  if (!appointmentId) return { ok: false, error: "Appointment ID is required" };
  return await serviceApiFetch(
    `/api/service/appointments?appointmentId=${encodeURIComponent(appointmentId)}`,
    {
      method: "DELETE",
    },
  );
}
export const deleteGeelyAppointment = deleteServiceAppointment;
