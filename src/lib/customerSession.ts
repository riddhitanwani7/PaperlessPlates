const CUSTOMER_SESSION_KEY = "pp_customer_session";

/**
 * Get or create customer session ID
 * Generates a UUID on first visit and stores in localStorage
 * Never regenerates unless missing
 */
export function getCustomerSessionId(): string {
  if (typeof window === "undefined") return "";
  
  try {
    let sessionId = localStorage.getItem(CUSTOMER_SESSION_KEY);
    
    if (!sessionId) {
      // Generate UUID v4
      sessionId = crypto.randomUUID();
      localStorage.setItem(CUSTOMER_SESSION_KEY, sessionId);
    }
    
    return sessionId;
  } catch {
    return "";
  }
}

/**
 * Clear customer session (for testing purposes)
 */
export function clearCustomerSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
}
