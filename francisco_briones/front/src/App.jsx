// UI entrypoint: state + orchestration
import React, { useEffect, useMemo, useState } from 'react'
import { RE, isValidRut, formatRut, toDateInput } from './utils/validation'
import ThemeToggle from './components/ThemeToggle'
import Toasts from './components/Toasts'
import Form from './components/Form'
import SubmissionsTable from './components/SubmissionsTable'

export default function App() {
  const [name, setName] = useState('')
  const [rut, setRut] = useState('')
  const [dob, setDob] = useState(null)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(null)
  const [rows, setRows] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    rut: false,
    dob: false,
    phone: false,
    email: false,
  })
  const [theme, setTheme] = useState('light')
  const [toasts, setToasts] = useState([])

  const valid = useMemo(
    () => ({
      name: RE.name.test(name.trim()),
      rut: isValidRut(rut),
      dob: !!dob && dob <= new Date() && dob >= new Date('1900-01-01'),
      phone: RE.phone.test(phone.trim()),
      email: RE.email.test(email.trim()),
    }),
    [name, rut, dob, phone, email]
  )

  const canSubmit = Object.values(valid).every(Boolean)

  async function loadSubmissions() {
    const response = await fetch('http://127.0.0.1:5000/submissions')
    const data = await response.json()
    setRows(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) {
      setOk(false)
      setMsg('Corrige los campos en rojo')
      return
    }
    try {
      setIsSubmitting(true)
      const response = await fetch('http://127.0.0.1:5000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rut: rut.trim(),
          dob: toDateInput(dob),
          phone: phone.trim(),
          email: email.trim(),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.errors ? Object.values(data.errors).join(' | ') : 'Error')
      }
      setOk(true)
      setMsg(data.message || 'Guardado')
      enqueueToast({ type: 'success', text: data.message || 'Datos guardados' })
      setName('')
      setRut('')
      setDob(null)
      setPhone('')
      setEmail('')
      setTouched({ name: false, rut: false, dob: false, phone: false, email: false })
      await loadSubmissions()
    } catch (error) {
      setOk(false)
      setMsg(String(error.message || error))
      enqueueToast({ type: 'error', text: String(error.message || error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  function enqueueToast(toast) {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, ...toast }])
    setTimeout(() => setToasts((prev) => prev.filter((existingToast) => existingToast.id !== id)), 3000)
  }

  const getValidationClass = (isOk, wasTouched) => {
    if (!wasTouched) return 'form-control'
    return 'form-control ' + (isOk ? 'is-valid' : 'is-invalid')
  }

  const fieldErrors = {
    name: 'Al menos dos palabras, solo letras y espacios.',
    rut: 'RUT inválido (revise el dígito verificador).',
    dob: 'Usa el formato YYYY-MM-DD y una fecha válida.',
    phone: 'Ejemplo: +56 9 12345678 o 912345678',
    email: 'Ingresa un correo válido: nombre@dominio.com',
  }

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
  }, [theme])

  return (
    <div className="container py-4">
      <ThemeToggle theme={theme} onChange={setTheme} />
      <Toasts items={toasts} />
      <h1 className="mb-3 section-title">
        <i className="bi bi-card-checklist"></i> Formulario
      </h1>
      {msg && (
        <div
          className={`alert ${ok ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}
          role="alert"
          aria-live="polite"
        >
          <i
            className={`bi ${ok ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}
          ></i>
          <div>{msg}</div>
        </div>
      )}

      <Form
        values={{ name, rut, dob, phone, email }}
        setFormValues={{ setName, setRut: (v) => setRut(formatRut(v)), setDob, setPhone, setEmail }}
        valid={valid}
        touched={touched}
        setTouched={setTouched}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
        getValidationClass={getValidationClass}
      />

      <SubmissionsTable rows={rows} />
    </div>
  )
}
