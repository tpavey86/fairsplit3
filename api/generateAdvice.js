export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userMessage } = req.body;

  if (!userMessage || userMessage.trim() === '') {
    return res.status(400).json({ error: 'Missing input' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an English family law solicitor. You provide neutral, reliable guidance to people who are separating or divorcing and cannot afford full legal representation. Based only on the information provided, give a realistic summary of what a court would likely decide in terms of:

- Dividing property, savings, pensions and debts  
- Living arrangements for any children  
- Child maintenance or spousal support

Assume both parties are acting in good faith. Make clear that:
- This advice cannot resolve factual disputes
- It is based solely on the information provided
- If any information is inaccurate or incomplete, the advice may not be reliable

Where there is not enough detail to be certain, say so. Explain things clearly and avoid legal jargon.

At the end, include practical recommendations for next steps, such as:
- Attending mediation  
- Seeking solicitor review  
- Gathering further financial disclosure if needed

Please keep the entire response under 1000 words.`
          },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Request failed', details: error.message });
  }
}
