// Anki принимает обычный табличный текст через "Import File" (Notes in
// plain text, поле-разделитель — таб). Front = слово с артиклем, Back —
// значение + пример, чтобы карточка была самодостаточной без контекста
// приложения.
export function buildAnkiExport(cards) {
  return cards
    .map((card) => {
      const front = [card.article, card.word].filter(Boolean).join(' ');
      const back = [card.meaningRu, card.example].filter(Boolean).join(' — ');
      return `${escapeField(front)}\t${escapeField(back)}`;
    })
    .join('\n');
}

function escapeField(text) {
  return String(text ?? '').replace(/\t/g, ' ').replace(/\n/g, ' ');
}

export function downloadAnkiExport(cards) {
  const text = buildAnkiExport(cards);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deutsch-b2-wortschatz-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
