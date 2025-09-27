const $ = (s) => document.querySelector(s);

const tbody    = $("#tbody");
const statusEl = $("#status");
const btn      = $("#refresh");

function showCount(n) {
  statusEl.className = "small text-body-secondary mb-3";
  statusEl.textContent = `Total: ${n}`;
}

function renderTable(rows) {
  if (!rows.length) {
    tbody.innerHTML = `<tr><td class="text-center text-muted" colspan="7">No hay registros.</td></tr>`;
    return;
  }
  const html = rows.map(r => `
    <tr>
      <td>${r.id ?? ''}</td>
      <td>${escapeHtml(r.full_name)}</td>
      <td>${prettyRut(r.rut)}</td>
      <td>${fmtDate(r.birthdate)}</td>
      <td>${escapeHtml(r.phone || '')}</td>
      <td>${escapeHtml(r.email || '')}</td>
      <td>${fmtDateTime(r.created_at)}</td>
    </tr>
  `).join('');
  tbody.innerHTML = html;
}

async function loadData() {
  try {
    const res = await fetch('/api/v1/register');
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail || 'Error al cargar');
    const rows = Array.isArray(data) ? data : [];
    renderTable(rows);
    showCount(rows.length);
  } catch (err) {
    console.log("error:", err)
  }
}

btn?.addEventListener('click', loadData);

document.addEventListener('DOMContentLoaded', loadData);

function fmtThousands(digits) {
  return (digits || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function prettyRut(dbRut) {
  if (!dbRut || !dbRut.includes('-')) return dbRut || '';
  const [body, dv] = dbRut.toUpperCase().split('-');
  return `${fmtThousands(body)}-${dv}`;
}

function fmtDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('es-CL');
  } catch { return d; }
}

function fmtDateTime(dtStr) {
  if (!dtStr) return '';
  try {
    const dt = new Date(dtStr);
    return dt.toLocaleString('es-CL');
  } catch { return dtStr; }
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}