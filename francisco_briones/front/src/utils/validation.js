export const RE = {
  name: /^[A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]+)+$/,
  phone: /^(?:\+?56\s?)?(?:9\s?)?\d{8}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

export const cleanRut = (v = '') => v.replace(/[^0-9kK]/g, '')

export const computeRutDV = (body) => {
  let sum = 0,
    mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const rest = 11 - (sum % 11)
  if (rest === 11) return '0'
  if (rest === 10) return 'K'
  return String(rest)
}

export const isValidRut = (v) => {
  const cl = cleanRut(v)
  if (cl.length < 2 || !/^\d+$/.test(cl.slice(0, -1))) return false
  const body = cl.slice(0, -1)
  const dv = cl.slice(-1).toUpperCase()
  return computeRutDV(body) === dv
}

export const formatRut = (v) => {
  const cl = cleanRut(v)
  if (!cl) return ''
  const body = cl.slice(0, -1)
  const dv = cl.slice(-1).toUpperCase()
  let out = '',
    cnt = 0
  for (let i = body.length - 1; i >= 0; i--) {
    out = body[i] + out
    cnt++
    if (cnt === 3 && i !== 0) {
      out = '.' + out
      cnt = 0
    }
  }
  if (!out) return dv
  return `${out}-${dv}`
}

export const toDateInput = (d) => d?.toISOString?.().slice(0, 10)
