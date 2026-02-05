export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { text } = req.body || {}
  if (!text) {
    return res.status(400).json({ error: "No text provided" })
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Rewrite the message into a calm, professional work response." },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    }),
  })

  const data = await response.json()
  const result = data?.choices?.[0]?.message?.content || ""

  res.status(200).json({ result })
}
