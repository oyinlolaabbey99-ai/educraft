export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { messages, max_tokens } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: messages,
        max_tokens: max_tokens || 8000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ error: { message: data.error.message } });
    }

    let text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(200).json({ error: { message: 'Empty response from Groq' } });
    }

    // Strip markdown code blocks if present
    text = text.replace(/```json|```/g, '').trim();

    // Find the outermost JSON structure — array or object
    const firstChar = text[text.indexOf('[') < text.indexOf('{') || text.indexOf('[') === -1 ? text.indexOf('{') : text.indexOf('[')];
    const arrStart = text.indexOf('[');
    const objStart = text.indexOf('{');
    let clean = text;

    if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
      // Response is an array
      const end = text.lastIndexOf(']');
      if (end !== -1) clean = text.substring(arrStart, end + 1);
    } else if (objStart !== -1) {
      // Response is an object — wrap in array if needed
      const end = text.lastIndexOf('}');
      if (end !== -1) clean = text.substring(objStart, end + 1);
    }

    res.status(200).json({
      content: [{ type: 'text', text: clean }]
    });

  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
}
