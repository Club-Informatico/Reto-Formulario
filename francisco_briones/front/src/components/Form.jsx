import React from 'react'
import DatePicker from 'react-datepicker'
import { DateTextInput, renderDateHeader } from './DateInput'

export default function Form({
  values,
  valid,
  touched,
  setTouched,
  setFormValues,
  canSubmit,
  isSubmitting,
  onSubmit,
  fieldErrors,
  getValidationClass,
}) {
  const { name, rut, dob, phone, email } = values
  const { setName, setRut, setDob, setPhone, setEmail } = setFormValues
  return (
    <form onSubmit={onSubmit} className="card form-card p-4 mb-4">
      <h2 className="h5 mb-3">Datos personales</h2>
      <div className="row g-3">
        <div className="col-12 col-md-8">
          <label className="form-label" htmlFor="name">
            Nombre completo
          </label>
          <input
            id="name"
            className={getValidationClass(valid.name, touched.name)}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="Juan Pérez"
            aria-invalid={touched.name && !valid.name}
            aria-describedby="name-help name-error"
          />
          <div id="name-help" className="form-text">
            Al menos dos palabras, solo letras y espacios.
          </div>
          {touched.name && !valid.name && (
            <div id="name-error" className="text-danger small mt-1">
              <i className="bi bi-x-circle me-1"></i>
              {fieldErrors.name}
            </div>
          )}
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="rut">
            RUT
          </label>
          <input
            id="rut"
            className={getValidationClass(valid.rut, touched.rut)}
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, rut: true }))}
            placeholder="12.345.678-5"
            aria-invalid={touched.rut && !valid.rut}
            aria-describedby="rut-help rut-error"
          />
          <div id="rut-help" className="form-text">
            Se autocompleta con puntos y guion. Debe coincidir el dígito verificador.
          </div>
          {touched.rut && !valid.rut && (
            <div id="rut-error" className="text-danger small mt-1">
              <i className="bi bi-x-circle me-1"></i>
              {fieldErrors.rut}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="dob">
            Fecha de nacimiento
          </label>
          <DatePicker
            id="dob"
            selected={dob}
            onChange={(d) => setDob(d)}
            customInput={
              <DateTextInput
                className={getValidationClass(valid.dob, touched.dob)}
                ariaInvalid={touched.dob && !valid.dob}
                placeholder="YYYY-MM-DD"
              />
            }
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            minDate={new Date('1900-01-01')}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            renderCustomHeader={renderDateHeader}
            onBlur={() => setTouched((prev) => ({ ...prev, dob: true }))}
          />
          <div className="form-text">Usa el selector o escribe con formato YYYY-MM-DD.</div>
          {touched.dob && !valid.dob && (
            <div className="text-danger small mt-1">
              <i className="bi bi-x-circle me-1"></i>
              {fieldErrors.dob}
            </div>
          )}
        </div>
      </div>

      <h2 className="h5 mt-4 mb-3">Contacto</h2>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="phone">
            Teléfono
          </label>
          <input
            id="phone"
            className={getValidationClass(valid.phone, touched.phone)}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            placeholder="+56 9 12345678"
            aria-invalid={touched.phone && !valid.phone}
            aria-describedby="phone-help phone-error"
          />
          <div id="phone-help" className="form-text">
            Incluye prefijo nacional si corresponde.
          </div>
          {touched.phone && !valid.phone && (
            <div id="phone-error" className="text-danger small mt-1">
              <i className="bi bi-x-circle me-1"></i>
              {fieldErrors.phone}
            </div>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={getValidationClass(valid.email, touched.email)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="correo@dominio.com"
            aria-invalid={touched.email && !valid.email}
            aria-describedby="email-help email-error"
          />
          <div id="email-help" className="form-text">
            Usa tu correo principal.
          </div>
          {touched.email && !valid.email && (
            <div id="email-error" className="text-danger small mt-1">
              <i className="bi bi-x-circle me-1"></i>
              {fieldErrors.email}
            </div>
          )}
        </div>
      </div>

      <div className="form-actions mt-4 pt-3">
  <button className="btn btn-primary" type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting && (
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
          Enviar
        </button>
      </div>
    </form>
  )
}
