import React,{ forwardRef } from 'react'

export const DateTextInput = forwardRef(
  ({ value, onClick, onChange, placeholder, className, ariaInvalid }, ref) => (
    <div className="date-input">
      <input
        ref={ref}
        value={value || ''}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        aria-invalid={ariaInvalid}
      />
      <i className="bi bi-calendar3"></i>
    </div>
  )
)

DateTextInput.displayName = 'DateTextInput'

export function renderDateHeader({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) {
  const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i)
  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ]
  return (
    <div className="dp-header">
      <div className="dp-nav">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="dp-btn"
          aria-label="Mes anterior"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="dp-btn"
          aria-label="Mes siguiente"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
      <div className="d-inline-flex gap-2 align-items-center">
        <select
          className="dp-select"
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(Number(value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="dp-select"
          value={date.getMonth()}
          onChange={({ target: { value } }) => changeMonth(Number(value))}
        >
          {months.map((m, idx) => (
            <option key={m} value={idx}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
