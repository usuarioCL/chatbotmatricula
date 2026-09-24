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

const careerKeywords = ['carrera', 'carreras', 'estudiar', 'especialidad', 'programa']

function getBotReply(question: string) {
  const normalizedQuestion = question.toLowerCase()

  if (careerKeywords.some((keyword) => normalizedQuestion.includes(keyword))) {
    return 'En SENATI puedes elegir entre Desarrollo de Software, Mecánica Automotriz, Administración Industrial, Electricidad Industrial y Diseño Gráfico Digital. ¿Cuál te interesa conocer?'
  }

  if (normalizedQuestion.includes('costo') || normalizedQuestion.includes('precio') || normalizedQuestion.includes('matrícula')) {
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

  const sendMessage = (text = input) => {
    const cleanText = text.trim()
    if (!cleanText || isThinking) return

    const now = currentTime()
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now(), from: 'user', text: cleanText, time: now },
    ])
    setInput('')
    setIsThinking(true)

    window.setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 1, from: 'bot', text: getBotReply(cleanText), time: currentTime() },
      ])
      setIsThinking(false)
    }, 650)
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
        <div className="status-pill"><span className="status-dot" /> En línea</div>
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

          <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
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
