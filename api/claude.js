// Vercel Serverless Function — единственное место, где используется
// ANTHROPIC_API_KEY. Фронтенд никогда не обращается к Anthropic напрямую.
//
// Архитектура: один endpoint `/api/claude`, диспетчеризация по `task`.
// Так проще держать rate-limit / логирование / кэш в одном месте,
// чем плодить 5 отдельных функций под каждый модуль.
//
// TODO(следующий шаг): вынести PROMPTS в отдельные файлы api/prompts/*.js,
// когда тексты промптов устаканятся — сейчас это заглушки-каркасы.

export const config = { runtime: 'edge' }; // быстрый холодный старт для мобильного UX

const MODEL = 'claude-haiku-4-5';

// Профиль обучения (Settings → "Как тебя учить") и язык интерфейса влияют на
// то, КАК ИИ ведёт себя в каждом промпте — собираем это в один блок инструкций,
// который каждая задача ниже подставляет в свой system-prompt.
function teachingNote(payload) {
  const tp = payload?.teachingProfile || {};
  const lang = payload?.uiLanguage === 'de' ? 'Deutsch' : 'Russisch';

  const focus =
    {
      grammar: 'Lege besonderen Fokus auf Grammatik-Feinheiten.',
      vocab: 'Lege besonderen Fokus auf Wortschatzerweiterung und Fachbegriffe.',
      speaking: 'Lege besonderen Fokus auf natürliche, mündliche Ausdrucksweise.',
    }[tp.focus] || '';

  const strictness =
    {
      gentle: 'Korrigiere nur grobe Fehler, sei nachsichtig bei Kleinigkeiten.',
      strict: 'Korrigiere auch kleine Fehler konsequent und genau.',
    }[tp.strictness] || '';

  const tone =
    tp.tone === 'professional'
      ? 'Antworte in einem sachlichen, professionellen Ton.'
      : 'Antworte in einem freundlichen, ermutigenden Ton.';

  return `Lernprofil: ${[focus, strictness, tone].filter(Boolean).join(' ')} Erklärungen auf ${lang}.`;
}

const PROMPTS = {
  upgradeSentence: {
    system: (payload) => `Du bist ein erfahrener Deutschlehrer (C2), spezialisiert auf B1→B2 Sprachcoaching.
Der Nutzer schreibt einen einfachen Satz (A2/B1). Deine Aufgabe:
1) Formuliere ihn auf B2-Niveau um — nutze wo passend: Nomen-Verb-Verbindungen,
   Passiv/Zustandspassiv, Konjunktiv II, Nebensätze (obwohl, dadurch dass, je... desto).
2) Erkläre knapp, WAS sich geändert hat und WARUM es professioneller klingt.
3) Gib für jede Änderung ein kurzes Grammatik-/Wortschatz-Tag (z.B. "Konjunktiv II",
   "Passiv", "Nomen-Verb-Verbindung", "Nebensatz", "Wortschatz") — wird genutzt,
   um wiederkehrende Schwachstellen des Lerners zu tracken.
${teachingNote(payload)}
Antworte ausschließlich als JSON: { "upgraded": string, "changes": [{ "original": string, "improved": string, "explanationRu": string, "topic": string }] }`,
  },
  grammarAnalysis: {
    system: (payload) => `Du bist ein Grammatik-Analysewerkzeug für Deutschlerner auf B2-Niveau.
Analysiere den gegebenen Satz/Text: Satzklammer (Position von Verb/Präfix),
Verben mit Präpositionen (Rektion), Kasus (Dativ/Akkusativ/Genitiv) mit Begründung.
${teachingNote(payload)}
Antworte ausschließlich als JSON:
{ "satzklammer": {...}, "verbenMitPraepositionen": [...], "kasus": [...] }`,
  },
  dialogueTurn: {
    system: (payload) => `Du bist Gesprächspartner in einem Rollenspiel für einen Deutschlerner (Ziel: B2, Kontext: Umschulung in Deutschland).
Der Modus wird im payload.scenario übergeben (Vorstellungsgespräch / Kollegengespräch / Jobcenter / Fachthema).
Antworte auf Deutsch in der eingestellten Schwierigkeit (payload.difficulty: B1|B2).
Falls die letzte Nutzeräußerung Grammatikfehler enthält, korrigiere sie kurz, dann führe den Dialog fort.
Falls korrigiert wurde, gib zusätzlich ein kurzes Grammatik-Tag für den Fehlertyp
(z.B. "Wortstellung", "Präpositionen", "Kasus", "Konjunktiv II") — wird genutzt,
um wiederkehrende Schwachstellen des Lerners zu tracken.
${teachingNote(payload)}
Antworte ausschließlich als JSON: { "reply": string, "correction": string|null, "correctionTopic": string|null, "hint": string|null }`,
  },
  vocabEnrich: {
    system: () => `Du reicherst ein deutsches Wort für eine Vokabelkarte an (Zielniveau B2, Kontext: Umschulung/Fachsprache).
Gib Artikel (der/die/das, falls Nomen), Plural (falls zutreffend), eine B2-Kontextbedeutung,
einen Beispielsatz auf B2-Niveau, eine kurze Fachbereich-Kategorie (z.B. "IT-Fachsprache",
"Pflege-Fachsprache", "Buchhaltung", oder "Allgemein B2" falls nicht fachspezifisch) und eine
Priorität (High/Medium/Low — wie oft das Wort in Bewerbungsgesprächen/Berufsalltag vorkommt) zurück.
Antworte ausschließlich als JSON: { "article": string|null, "plural": string|null, "meaningRu": string, "example": string, "category": string, "priority": "High"|"Medium"|"Low" }`,
  },
  dailyBriefing: {
    system: (payload) => `Erstelle ein kurzes tägliches B2-Briefing für einen Deutschlerner: ein Wort des Tages (mit Artikel/Plural),
eine Nomen-Verb-Verbindung des Tages, und 3 Multiple-Choice-Testfragen (1 Minute Test).
${teachingNote(payload)}
Antworte ausschließlich als JSON: { "wordOfDay": {...}, "nvVerbindung": {...}, "quiz": [...] }`,
  },
  interviewFeedback: {
    system: (payload) => `Du bist Karrierecoach für einen Deutschlerner, der sich auf ein echtes Vorstellungsgespräch
im Rahmen seiner Umschulung vorbereitet. payload.history enthält den vollständigen Verlauf eines
simulierten Vorstellungsgesprächs ({ role: 'user'|'ai', text }[]). Bewerte die Antworten des Nutzers:
sprachliche Qualität (B2-Niveau, Grammatik) UND inhaltliche Überzeugungskraft für ein echtes Gespräch.
${teachingNote(payload)}
Antworte ausschließlich als JSON: { "summary": string, "strengths": string[], "improvements": string[] }`,
  },
  weeklyDigest: {
    system: (payload) => `Du bist Lerncoach für einen Deutschlerner (B1→B2, Kontext: Umschulung). payload.stats enthält
Kennzahlen der letzten 7 Tage (xpThisWeek, daysActiveThisWeek, totalWords), payload.weakSpots die
häufigsten wiederkehrenden Fehlerthemen ({ topic, count }[], kann leer sein). Schreibe eine kurze,
motivierende Zusammenfassung der Woche (2-3 Sätze) und einen konkreten, umsetzbaren Fokus für die
nächste Woche (1 Satz) — falls weakSpots vorhanden, sollte sich der Fokus darauf beziehen.
${teachingNote(payload)}
Antworte ausschließlich als JSON: { "summary": string, "nextFocus": string }`,
  },
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { task, payload } = body || {};
  const prompt = PROMPTS[task];
  if (!prompt) {
    return json({ error: `Unknown task: ${task}` }, 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'Server misconfigured: ANTHROPIC_API_KEY missing' }, 500);
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: prompt.system(payload),
        messages: [{ role: 'user', content: JSON.stringify(payload ?? {}) }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return json({ error: `Anthropic error: ${errText}` }, 502);
    }

    const data = await anthropicRes.json();
    const text = data?.content?.[0]?.text ?? '{}';

    // Модель иногда оборачивает JSON в markdown code-fence (```json ... ```),
    // несмотря на "Antworte ausschließlich als JSON" в промпте — снимаем его
    // перед парсингом, иначе JSON.parse падает и фронт получает {raw} вместо
    // ожидаемых полей.
    const fenceMatch = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    const jsonText = fenceMatch ? fenceMatch[1] : text;

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = { raw: text };
    }

    return json(parsed, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
