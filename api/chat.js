export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const rawBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const latestQuestion = rawBody.latestQuestion || ''
    const conversation = Array.isArray(rawBody.conversation) ? rawBody.conversation : []

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        error: 'La clave de Gemini no está configurada en Vercel.',
      })
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    const contents = [
      ...conversation.slice(-8).map((message) => ({
        role: message.from === 'user' ? 'user' : 'model',
        parts: [{ text: message.text }],
      })),
      {
        role: 'user',
        parts: [{ text: latestQuestion }],
      },
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 220,
          },
          systemInstruction: {
            parts: [
              {
                text: 'Eres un asistente virtual de SENATI. Responde en español, claro y amable. Ayudas a estudiantes sobre carreras, matrícula, requisitos, costos y fechas. No inventes información; cuando no sepas algo, sugiere contactar a un asesor.',
              },
            ],
          },
        }),
      },
    )

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.error?.message || 'La IA no respondió correctamente.'
      return res.status(response.status).json({ error: message })
    }

    const answer = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    return res.status(200).json({
      answer: answer || 'Puedo orientarte sobre carreras, costos, requisitos y fechas de matrícula.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo contactar a Gemini.'
    return res.status(500).json({ error: message })
  }
}
