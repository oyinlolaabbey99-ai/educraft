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
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: max_tokens || 4000,
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ error: { message: data.error.message } });
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(200).json({ error: { message: 'Empty response from Groq' } });
    }

    res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
}