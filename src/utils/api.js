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
