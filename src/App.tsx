import { useState } from 'react'
import './App.css'

type Message = {
  id: number
  text: string
  from: 'bot' | 'user'
  time: string
}

const quickQuestions = [
  '¿Qué carreras puedo estudiar?',
  '¿Cuánto cuesta la matrícula?',
  '¿Qué documentos necesito?',
]

const geminiConfigured = Boolean((import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim())

function getFallbackReply(question: string) {
  const normalizedQuestion = question.toLowerCase()

  if (normalizedQuestion.includes('carrera') || normalizedQuestion.includes('estudiar') || normalizedQuestion.includes('especialidad') || normalizedQuestion.includes('programa')) {
    return 'En SENATI puedes elegir entre Desarrollo de Software, Mecánica Automotriz, Administración Industrial, Electricidad Industrial y Diseño Gráfico Digital. ¿Cuál te interesa conocer?'
  }

  if (normalizedQuestion.includes('costo') || normalizedQuestion.includes('precio') || normalizedQuestion.includes('matrícula') || normalizedQuestion.includes('matricula')) {
    return 'La matrícula referencial es de S/ 180. El costo puede variar según la carrera y sede. Te recomiendo confirmar el monto final con Admisión antes de realizar el pago.'
  }

  if (normalizedQuestion.includes('document') || normalizedQuestion.includes('requisito')) {
    return 'Para iniciar tu matrícula necesitas DNI, certificado de estudios secundarios y una foto tamaño carné. Si eres menor de edad, también se solicita el documento de tu apoderado.'
  }

  if (normalizedQuestion.includes('fecha') || normalizedQuestion.includes('cuándo') || normalizedQuestion.includes('cuando')) {
    return 'Las matrículas para el siguiente periodo están abiertas. Puedes registrar tus datos ahora y un asesor te contactará para confirmar la fecha exacta.'
  }

  return 'Puedo orientarte sobre carreras, costos, requisitos y fechas de matrícula. Prueba con una de las preguntas rápidas o escribe tu consulta con tus propias palabras.'
}

async function getAIReply(conversation: Message[], latestQuestion: string) {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim()

  if (!apiKey) {
    return getFallbackReply(latestQuestion)
  }

  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined)?.trim() || 'gemini-3.8-flash'

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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
        parts: [{
          text: 'Eres un asistente virtual de SENATI. Responde en español, claro y amable. Ayudas a estudiantes sobre carreras, matrícula, requisitos, costos y fechas. No inventes información; cuando no sepas algo, sugiere contactar a un asesor.',
        }],
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'La IA no respondió correctamente.')
  }

  const data = await response.json()
  const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

  return aiText || getFallbackReply(latestQuestion)
}

function currentTime() {
  return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'bot',
      text: '¡Hola! Soy SENATI Asiste. Estoy aquí para ayudarte a encontrar tu carrera y comenzar tu proceso de matrícula.',
      time: '09:41',
    },
    {
      id: 2,
      from: 'bot',
      text: '¿Qué te gustaría saber hoy?',
      time: '09:41',
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const sendMessage = async (text = input) => {
    const cleanText = text.trim()
    if (!cleanText || isThinking) return

    const userMessage: Message = {
      id: Date.now(),
      from: 'user',
      text: cleanText,
      time: currentTime(),
    }

    const updatedConversation = [...messages, userMessage]
    setMessages(updatedConversation)
    setInput('')
    setIsThinking(true)

    try {
      const botReply = await getAIReply(updatedConversation, cleanText)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: botReply,
          time: currentTime(),
        },
      ])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No pude contactar la IA.'
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: `No pude conectar con la IA en este momento. ${getFallbackReply(cleanText)} Detalle: ${errorMessage}`,
          time: currentTime(),
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">S</div>
          <div>
            <p className="eyebrow">SENATI</p>
            <p className="brand-name">Asistente de Admisión</p>
          </div>
        </div>
        <div className={`status-pill ${geminiConfigured ? 'online' : 'offline'}`}>
          <span className="status-dot" />
          {geminiConfigured ? 'Gemini activa' : 'Modo local'}
        </div>
      </header>

      <section className="content-grid">
        <aside className="intro-panel">
          <p className="section-kicker">MATRÍCULA 2025-II</p>
          <h1>Tu próximo paso empieza aquí.</h1>
          <p className="intro-copy">Resuelve tus dudas y descubre la carrera técnica que puede transformar tu futuro.</p>
          <div className="trust-note"><span aria-hidden="true">✦</span><span>Orientación rápida con inteligencia artificial</span></div>
          <div className="mini-stats">
            <div><strong>65+</strong><span>años formando talento</span></div>
            <div><strong>5</strong><span>áreas para elegir</span></div>
          </div>
        </aside>

        <section className="chat-card" aria-label="Chat de orientación para matrícula">
          <div className="chat-heading">
            <div className="assistant-avatar" aria-hidden="true">SA</div>
            <div><h2>SENATI Asiste</h2><p>Orientación para nuevos estudiantes</p></div>
            <button className="more-button" type="button" aria-label="Más opciones">•••</button>
          </div>

          <div className="message-list" aria-live="polite">
            <div className="date-label">HOY</div>
            {messages.map((message) => (
              <div className={`message-row ${message.from}`} key={message.id}>
                {message.from === 'bot' && <div className="tiny-avatar" aria-hidden="true">SA</div>}
                <div className="message-bubble"><p>{message.text}</p><time>{message.time}</time></div>
              </div>
            ))}
            {isThinking && <div className="message-row bot"><div className="tiny-avatar" aria-hidden="true">SA</div><div className="message-bubble typing"><span /><span /><span /></div></div>}
          </div>

          <div className="quick-replies">
            <p>Preguntas frecuentes</p>
            <div>{quickQuestions.map((question) => <button type="button" key={question} onClick={() => sendMessage(question)}>{question}</button>)}</div>
          </div>

          <form className="composer" onSubmit={(event) => { event.preventDefault(); void sendMessage() }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribe tu pregunta..." aria-label="Escribe tu pregunta" />
            <button type="submit" aria-label="Enviar pregunta">↑</button>
          </form>
          <p className="disclaimer">La información es referencial. Un asesor confirmará los datos de tu matrícula.</p>
        </section>
      </section>
      <footer>© 2025 SENATI <span>•</span> Educación para el trabajo y el desarrollo</footer>
    </main>
  )
}

export default App
