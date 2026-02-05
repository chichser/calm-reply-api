export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { text } = req.body

  if (!text || text.trim().length < 5) {
    return res.status(400).json({ error: "Text too short" })
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.25,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content: `You are a professional communication assistant.

Your task is to rewrite messages into a calm, neutral, and professional tone suitable for workplace communication.

Rules:
- Do NOT invent or assume any additional context.
- Do NOT add information that is not present in the original message.
- Keep the response concise and clear.
- Remove emotional language, aggression, or passive aggression.
- Do NOT add greetings or signatures unless they are clearly implied in the original message.
- Do NOT include emojis.
- The output must be ready to send as-is.`,
          },
          {
            role: "user",
            content: `Rewrite the following message:\n\n"${text}"`,
          },
        ],
      }),
    })

    const data = await response.json()

    const result = data.choices?.[0]?.message?.content

    if (!result) {
      return res.status(500).json({ error: "No response from model" })
    }

    res.status(200).json({ result })
  } catch (error) {
    res.status(500).json({ error: "Failed to generate response" })
  }
}
