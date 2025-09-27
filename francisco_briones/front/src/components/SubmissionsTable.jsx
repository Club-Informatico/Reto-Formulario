import React from 'react'

export default function SubmissionsTable({ rows }) {
  return (
    <>
      <h2 className="mb-2">Envíos recientes</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Nacimiento</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center empty-state py-4">
                  <i className="bi bi-inbox me-2"></i> No hay registros aún.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.rut}</td>
                <td>{row.dob}</td>
                <td>{row.phone}</td>
                <td>{row.email}</td>
                <td>{row.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
