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
        model: "gpt-4o-mini", // ← безопасная модель
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "Rewrite messages into calm, neutral, professional workplace responses. Do not add context. Do not add greetings or signatures unless present. Keep it concise.",
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
