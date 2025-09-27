import React from 'react'

export default function ThemeToggle({ theme, onChange }) {
  return (
    <div className="d-flex justify-content-end mb-2">
      <div className="btn-group" role="group" aria-label="Tema">
        <button
          type="button"
          className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onChange('light')}
        >
          <i className="bi bi-sun me-1"></i> Claro
        </button>
        <button
          type="button"
          className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onChange('dark')}
        >
          <i className="bi bi-moon me-1"></i> Oscuro
        </button>
      </div>
    </div>
  )
}
