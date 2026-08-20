// Единая точка входа для всех вызовов ИИ с фронтенда.
// Каждый модуль передаёт `task` (какой промпт использовать на сервере)
// и `payload` (данные для промпта). Сервер (api/claude.js) знает, как
// собрать system-prompt под конкретную задачу — фронт не должен ничего
// знать про сами промпты, только про формат ответа.

/**
 * @param {'upgradeSentence'|'grammarAnalysis'|'dialogueTurn'|'vocabEnrich'|'dailyBriefing'} task
 * @param {object} payload
 * @param {{ signal?: AbortSignal }} [opts]
 */
export async function askClaude(task, payload, opts = {}) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, payload }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ClaudeApiError(body.error || `Request failed: ${res.status}`, res.status);
  }

  return res.json();
}

export class ClaudeApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ClaudeApiError';
    this.status = status;
  }
}
