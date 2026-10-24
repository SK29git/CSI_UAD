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
 * Resolves the genuine, unmasked full mobile number that belongs to the current customer:
 * 1. First priority: Direct unmasked full mobile on the customer object
 *    (e.g., customer.mobilePhone, customer.mobile, customer.mobileRaw, customer.phone, customer.telephone)
 * 2. If customer has a masked mobile (e.g. "+*********147"):
 *    Only accept candidate numbers (contextMobile, URL, cache) IF their digits END WITH
 *    the unmasked suffix digits of the customer's phone (e.g. ending in "147")!
 *    Any candidate that does not match this customer's suffix is from a different customer
 *    (e.g. stale URL from a previous search) and is strictly rejected.
 * 3. If customer is null / undefined:
 *    Fallback to valid contextMobile or URL params (e.g., during initial telephony load).
 */
export function getFullMobileNumber(customer, contextMobile) {
  try {
    // 1. Direct check on customer object for unmasked phone numbers
    if (customer) {
      const directCandidates = [
        customer.mobilePhone,
        customer.mobile,
        customer.mobileRaw,
        customer.phone,
        customer.telephone
      ];
      for (const d of directCandidates) {
        if (isFullMobileNumber(d)) {
          return String(d).replace(/[^0-9]/g, '');
        }
      }
    }

    // 2. Determine unmasked suffix for customer if phone is masked
    const maskedStr = customer 
      ? [customer.mobile, customer.mobileRaw, customer.phone, customer.telephone].filter(Boolean).join(' ') 
      : '';
    const suffixMatch = maskedStr.match(/(\d{2,6})(?:\D*)$/);
    const suffix = suffixMatch ? suffixMatch[1] : '';

    // 3. Check external candidate sources (context, URL, cache)
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

    const externalCandidates = [
      contextMobile,
      complaintVal,
      salesVal,
      generalVal,
      typeof window !== 'undefined' ? localStorage.getItem('complaint_cached_mobile') : null,
      typeof window !== 'undefined' ? localStorage.getItem('sales_cached_mobile') : null
    ];

    for (const c of externalCandidates) {
      if (isFullMobileNumber(c)) {
        const cleanDigits = String(c).replace(/[^0-9]/g, '');
        // If customer has a masked phone suffix, candidate MUST end with that suffix to be valid for this customer!
        if (suffix) {
          if (cleanDigits.endsWith(suffix)) {
            return cleanDigits;
          }
        } else if (!customer) {
          // If no customer is loaded yet (initial cold load), candidate is acceptable
          return cleanDigits;
        }
      }
    }
  } catch (e) {
    console.warn("Could not resolve full mobile number:", e);
  }

  return '';
}

/**
 * Resolves the phone number string to display in the customer profile UI:
 * - If full unmasked mobile is known for this customer, display that.
 * - Otherwise display the exact mobile data returned by the search / profile API
 *   (e.g., "+*********147" or "******147").
 * - Returns "" or "N/A" if no phone data exists.
 */
export function getDisplayMobileNumber(customer, contextMobile) {
  if (customer) {
    const full = getFullMobileNumber(customer, contextMobile);
    if (full) return full;
    if (customer.mobile) return customer.mobile;
    if (customer.mobileRaw) return customer.mobileRaw;
    if (customer.mobilePhone) return customer.mobilePhone;
    if (customer.phone) return customer.phone;
    if (customer.telephone) return customer.telephone;
  }
  if (contextMobile) {
    return contextMobile;
  }
  return '';
}
