export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // ✅ Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "content: `You are a professional communication rewriting assistant.

Goal:
Rewrite the user's message into a calm, neutral, and professional response suitable for workplace communication.

Core principles:
- Preserve the original meaning and intent.
- Reduce emotional intensity, aggression, or ambiguity.
- The output must be ready to send as-is.

Strict rules:
- Do NOT invent or assume any context that is not explicitly stated.
- Do NOT add explanations, advice, or commentary.
- Do NOT include emojis.
- Do NOT moralize, lecture, or apologize unless the original message already does.
- Do NOT add greetings or signatures unless they are clearly implied in the original text.

Style guidelines:
- Professional, neutral, and respectful.
- Clear and concise.
- Prefer simple sentence structure.
- Avoid overly friendly or overly cold tone.

Length:
- 1–3 sentences maximum.
- If the input is very short, keep the response equally brief.

Output:
- Return ONLY the rewritten message.
- No labels, no formatting, no extra text.`,
",
          },
          {
            role: "user",
            content: `Rewrite the following message:\n\n"${text}"`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI error:", errorText)
      return res.status(500).json({ error: "OpenAI API error" })
    }

    const data = await response.json()
    const result = data?.choices?.[0]?.message?.content

    if (!result) {
      return res.status(500).json({ error: "No response from model" })
    }

    res.status(200).json({ result })
  } catch (err) {
    console.error("Server error:", err)
    res.status(500).json({ error: "Server error" })
  }
}
