const TAB_KEY = 'gosloto_tab_key';
const BROWSER_KEY = 'gosloto_browser_key';
const SESSION_ID_KEY = 'gosloto_session_id';

export function getTabKey(): string {
  let k = sessionStorage.getItem(TAB_KEY);
  if (!k) {
    k = crypto.randomUUID();
    sessionStorage.setItem(TAB_KEY, k);
  }
  return k;
}

export function getBrowserKey(): string {
  let k = localStorage.getItem(BROWSER_KEY);
  if (!k) {
    k = crypto.randomUUID();
    localStorage.setItem(BROWSER_KEY, k);
  }
  return k;
}

export function getStoredSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

export function setStoredSessionId(id: string) {
  localStorage.setItem(SESSION_ID_KEY, id);
}

export function clearStoredSessionId() {
  localStorage.removeItem(SESSION_ID_KEY);
}

export function clearBrowserKey() {
  localStorage.removeItem(BROWSER_KEY);
}
