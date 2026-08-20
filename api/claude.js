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

const PROMPTS = {
  upgradeSentence: {
    system: `Du bist ein erfahrener Deutschlehrer (C2), spezialisiert auf B1→B2 Sprachcoaching.
Der Nutzer schreibt einen einfachen Satz (A2/B1). Deine Aufgabe:
1) Formuliere ihn auf B2-Niveau um — nutze wo passend: Nomen-Verb-Verbindungen,
   Passiv/Zustandspassiv, Konjunktiv II, Nebensätze (obwohl, dadurch dass, je... desto).
2) Erkläre knapp auf Russisch, WAS sich geändert hat und WARUM es professioneller klingt.
Antworte ausschließlich als JSON: { "upgraded": string, "changes": [{ "original": string, "improved": string, "explanationRu": string }] }`,
  },
  grammarAnalysis: {
    system: `Du bist ein Grammatik-Analysewerkzeug für Deutschlerner auf B2-Niveau.
Analysiere den gegebenen Satz/Text: Satzklammer (Position von Verb/Präfix),
Verben mit Präpositionen (Rektion), Kasus (Dativ/Akkusativ/Genitiv) mit Begründung.
Antworte ausschließlich als JSON:
{ "satzklammer": {...}, "verbenMitPraepositionen": [...], "kasus": [...] }`,
  },
  dialogueTurn: {
    system: `Du bist Gesprächspartner in einem Rollenspiel für einen Deutschlerner (Ziel: B2, Kontext: Umschulung in Deutschland).
Der Modus wird im payload.scenario übergeben (Vorstellungsgespräch / Kollegengespräch / Jobcenter / Fachthema).
Antworte auf Deutsch in der eingestellten Schwierigkeit (payload.difficulty: B1|B2).
Falls die letzte Nutzeräußerung Grammatikfehler enthält, korrigiere sie kurz und freundlich, dann führe den Dialog fort.
Antworte ausschließlich als JSON: { "reply": string, "correction": string|null, "hint": string|null }`,
  },
  vocabEnrich: {
    system: `Du reicherst ein deutsches Wort für eine Vokabelkarte an (Zielniveau B2, Kontext: Umschulung/Fachsprache).
Gib Artikel (der/die/das, falls Nomen), Plural (falls zutreffend), eine B2-Kontextbedeutung,
einen Beispielsatz auf B2-Niveau, eine kurze Fachbereich-Kategorie (z.B. "IT-Fachsprache",
"Pflege-Fachsprache", "Buchhaltung", oder "Allgemein B2" falls nicht fachspezifisch) und eine
Priorität (High/Medium/Low — wie oft das Wort in Bewerbungsgesprächen/Berufsalltag vorkommt) zurück.
Antworte ausschließlich als JSON: { "article": string|null, "plural": string|null, "meaningRu": string, "example": string, "category": string, "priority": "High"|"Medium"|"Low" }`,
  },
  dailyBriefing: {
    system: `Erstelle ein kurzes tägliches B2-Briefing für einen Deutschlerner: ein Wort des Tages (mit Artikel/Plural),
eine Nomen-Verb-Verbindung des Tages, und 3 Multiple-Choice-Testfragen (1 Minute Test).
Antworte ausschließlich als JSON: { "wordOfDay": {...}, "nvVerbindung": {...}, "quiz": [...] }`,
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
        system: prompt.system,
        messages: [{ role: 'user', content: JSON.stringify(payload ?? {}) }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return json({ error: `Anthropic error: ${errText}` }, 502);
    }

    const data = await anthropicRes.json();
    const text = data?.content?.[0]?.text ?? '{}';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Модель иногда оборачивает JSON в текст — отдаём как есть,
      // фронт должен уметь обработать fallback-строку.
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
