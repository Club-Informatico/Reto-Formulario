import React from 'react'

export default function Toasts({ items }) {
  return (
    <div className="toast-wrap">
      {items.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type} toast-enter`} role="status">
          <i
            className={`bi me-1 ${toast.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`}
          ></i>
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  )
}
