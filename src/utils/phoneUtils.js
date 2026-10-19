/**
 * Mobile Number Utilities for Keyloop PII Masking
 *
 * Keyloop customer profile and search APIs return masked phone numbers:
 * e.g., mobile: "+*********574", mobileRaw: "*******574".
 * Stripping asterisks leaves only a 3-digit fragment like "574", which is NOT a valid phone number.
 */

/**
 * Checks whether a phone number string is a real, unmasked, full mobile number.
 * Returns false if the string contains asterisks '*' or has fewer than 7 digits.
 */
export function isFullMobileNumber(val) {
  if (!val) return false;
  const str = String(val).trim();
  if (str.includes('*')) return false; // Masked with asterisks
  const digits = str.replace(/[^0-9]/g, '');
  return digits.length >= 7; // Valid phone numbers have 7 to 14 digits
}

/**
 * Resolves the genuine, unmasked full mobile number from available sources:
 * 1. URL search params (?Complaint=..., ?Sales=..., ?mobile=..., ?phone=...)
 * 2. Current mobile state in CustomerContext
 * 3. Cached mobile in localStorage
 * 4. Customer object only if unmasked
 *
 * Returns clean digits string if valid (e.g., "0501234567"), or "" if only masked fragments exist.
 */
export function getFullMobileNumber(customer, contextMobile) {
  try {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const complaintVal = searchParams.get('Complaint') || searchParams.get('complaint');
    const salesVal = searchParams.get('Sales') || searchParams.get('sales');
    const generalVal = searchParams.get('mobile') || 
                       searchParams.get('Mobile') || 
                       searchParams.get('phone') || 
                       searchParams.get('Phone') || 
                       searchParams.get('ani') || 
                       searchParams.get('ANI') || 
                       searchParams.get('callerId') || 
                       searchParams.get('callerid') || 
                       searchParams.get('caller_id') || 
                       searchParams.get('msisdn') || 
                       searchParams.get('MSISDN');

    const candidates = [
      complaintVal,
      salesVal,
      generalVal,
      contextMobile,
      typeof window !== 'undefined' ? localStorage.getItem('complaint_cached_mobile') : null,
      typeof window !== 'undefined' ? localStorage.getItem('sales_cached_mobile') : null,
      customer?.mobileRaw,
      customer?.mobile
    ];

    for (const c of candidates) {
      if (isFullMobileNumber(c)) {
        return String(c).replace(/[^0-9]/g, '');
      }
    }
  } catch (e) {
    console.warn("Could not resolve full mobile number:", e);
  }

  return '';
}
