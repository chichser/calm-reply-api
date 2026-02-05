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
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content: `You are a senior professional communication editor.

Your task is to rewrite messages so they sound calm, clear, and professional in workplace communication.

Rules:
- Do NOT invent context, intent, or emotions.
- Do NOT add explanations, comments, or meta text.
- Do NOT include greetings or sign-offs unless they are explicitly present in the original message.
- Do NOT apologize unless the original message implies responsibility.
- Keep the tone firm, calm, and professional.
- Remove emotional, aggressive, or passive-aggressive language.
- Keep the response concise.

Output only the rewritten message.`,
          },
          {
            role: "user",
            content: `Original message:\n"${text}"\n\nRewrite it according to the rules above.`,
          },
        ],
      }),
    })

    const data = await response.json()

    // 👇 ВАЖНО: если OpenAI вернул ошибку — покажем её
    if (!response.ok) {
      console.error("OpenAI error:", data)
      return res.status(500).json({
        error: data.error?.message || "OpenAI request failed",
      })
    }

    const result = data.choices?.[0]?.message?.content

    if (!result) {
      return res.status(500).json({ error: "No response from model" })
    }

    res.status(200).json({ result })
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({ error: "Server error" })
  }
}
