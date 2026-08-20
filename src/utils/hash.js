// SHA-256 через Web Crypto — доступен в secure context (localhost и HTTPS-прод).
// Не настоящая защита (PIN хранится в LocalStorage на клиенте), но не даёт
// PIN/ответу лежать в чистом виде, если кто-то откроет DevTools.
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function normalizeAnswer(text) {
  return text.trim().toLowerCase();
}
