window.addEventListener("DOMContentLoaded", () => {
    // ------------------------------
    // Utilidades RUT
    // ------------------------------
    function rutClean(s) { return (s || "").replace(/[^0-9kK]/g, "").toLowerCase(); }
  
    function rutDV(numberStr) {
      let mul = 2, sum = 0;
      for (const d of numberStr.split("").reverse()) {
        sum += parseInt(d, 10) * mul;
        mul = (mul === 7) ? 2 : mul + 1;
      }
      const r = 11 - (sum % 11);
      return r === 11 ? "0" : r === 10 ? "k" : String(r);
    }
  
    function rutIsValid(rut) {
      const c = rutClean(rut);
      if (c.length < 2) return false;
      const body = c.slice(0, -1);
      const dv = c.slice(-1);
      if (!/^\d+$/.test(body)) return false;
      return rutDV(body) === dv;
    }
  
    function rutFormat(rut) {
      const c = rutClean(rut);
      if (c.length < 2) return c;
      const body = c.slice(0, -1);
      const dv = c.slice(-1);
      const rev = body.split("").reverse().join("");
      const chunks = rev.match(/\d{1,3}/g) || [];
      const withDots = chunks.join(".").split("").reverse().join("");
      return `${withDots}-${dv}`;
    }
  
    // ------------------------------
    // Otras validaciones
    // ------------------------------
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^(?:\+?56[\s-]?)?(?:\d[\s-]?){9}$/;
  
    // Fecha: solo validar que sea una fecha ISO válida (YYYY-MM-DD)
    function isValidISODate(dateStr) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
      const [Y, M, D] = dateStr.split("-").map(Number);
      const d = new Date(dateStr + "T00:00:00");
      return !Number.isNaN(d.getTime()) &&
             d.getUTCFullYear() === Y &&
             (d.getUTCMonth() + 1) === M &&
             d.getUTCDate() === D;
    }
  
    function setInvalid(input) {
      input?.classList.add("invalid");
      input?.classList.remove("valid");
    }
    function setValid(input) {
      input?.classList.remove("invalid");
      input?.classList.add("valid");
    }
  
    function escapeHtml(s) {
      return String(s ?? "").replace(/[&<>"']/g, m => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[m]));
    }
  
    // ------------------------------
    // Referencias DOM (form principal)
    // ------------------------------
    const form = document.getElementById("form");
    const msg = document.getElementById("formMsg");
    const nombre = document.getElementById("nombre");
    const rut = document.getElementById("rut");
    const fecha = document.getElementById("fecha");
    const telefono = document.getElementById("telefono");
    const email = document.getElementById("email");
  
    // Panel eliminación
    const deleteToggleBtn = document.getElementById("deleteToggleBtn");
    const deletePanel = document.getElementById("deletePanel");
    const usersList = document.getElementById("usersList");
    const usersEmpty = document.getElementById("usersEmpty");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  
    // Panel edición
    const editToggleBtn = document.getElementById("editToggleBtn");
    const editPanel = document.getElementById("editPanel");
    const editForm = document.getElementById("editForm");
    const rutEdit = document.getElementById("rutEdit");
    const loadByRutBtn = document.getElementById("loadByRutBtn");
    const editFields = document.getElementById("editFields");
    const nombreEdit = document.getElementById("nombreEdit");
    const fechaEdit = document.getElementById("fechaEdit");
    const telefonoEdit = document.getElementById("telefonoEdit");
    const emailEdit = document.getElementById("emailEdit");
    const saveEditBtn = document.getElementById("saveEditBtn");
    const editMsg = document.getElementById("editMsg");
  
    // Si algo clave falta, salimos y avisamos en consola.
    if (!form || !rut) {
      console.error("[app] Elementos base no encontrados. Revisa IDs en el HTML.");
      return;
    }
  
    // ------------------------------
    // Feedback live: formateo de RUT (creación y edición)
    // ------------------------------
    [rut, rutEdit].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => {
        const f = rutFormat(input.value);
        const atEnd = input.selectionStart === input.value.length;
        input.value = f;
        if (atEnd) input.selectionStart = input.selectionEnd = input.value.length;
      });
    });
  
    // ------------------------------
    // Crear (submit del formulario principal)
    // ------------------------------
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!msg) return;
      msg.textContent = "";
      msg.removeAttribute("class");
  
      [nombre, rut, fecha, telefono, email].forEach(i => i?.classList.remove("invalid","valid"));
  
      const errors = {};
  
      // Nombre (al menos 2 palabras)
      {
        const v = (nombre.value || "").trim();
        const ok = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/.test(v);
        if (!ok) { setInvalid(nombre); errors.nombre = "Nombre y apellido(s) requeridos."; }
        else setValid(nombre);
      }
  
      // RUT
      {
        const v = (rut.value || "").trim();
        const formato = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(v);
        const dvok = rutIsValid(v);
        if (!formato || !dvok) { setInvalid(rut); errors.rut = "RUT inválido o DV incorrecto."; }
        else setValid(rut);
      }
  
      // Fecha (solo válida)
      {
        const v = fecha.value;
        if (!isValidISODate(v)) { setInvalid(fecha); errors.birthdate = "Fecha inválida. Usa YYYY-MM-DD."; }
        else setValid(fecha);
      }
  
      // Teléfono
      {
        const v = (telefono.value || "").trim();
        const ok = PHONE_RE.test(v);
        if (!ok) { setInvalid(telefono); errors.phone = "Teléfono inválido. Usa +56 opcional y 9 dígitos."; }
        else setValid(telefono);
      }
  
      // Email
      {
        const v = (email.value || "").trim();
        const ok = EMAIL_RE.test(v);
        if (!ok) { setInvalid(email); errors.email = "Email inválido."; }
        else setValid(email);
      }
  
      if (Object.keys(errors).length) {
        msg.textContent = "Corrige: " + Object.values(errors).join(" • ");
        msg.style.color = "#ef4444";
        return;
      }
  
      try {
        const res = await fetch("/submit", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            nombre: nombre.value.trim(),
            rut: rut.value.trim(),
            birthdate: fecha.value,
            phone: telefono.value.trim(),
            email: email.value.trim()
          })
        });
        const data = await res.json();
  
        if (!res.ok) {
          if (data && data.errors && data.errors.rut) { setInvalid(rut); }
          msg.textContent = (data && data.errors && Object.values(data.errors).join(" • ")) || "Error en el envío.";
          msg.style.color = "#ef4444";
          return;
        }
  
        msg.textContent = data.message || "Guardado con éxito.";
        msg.style.color = "#10b981";
        form.reset();
        [nombre, rut, fecha, telefono, email].forEach(i => i?.classList.remove("valid","invalid"));
  
        if (deletePanel && !deletePanel.classList.contains("hidden")) await loadUsersForDeletion();
      } catch (err) {
        console.error(err);
        msg.textContent = "Error de red. Intenta nuevamente.";
        msg.style.color = "#ef4444";
      }
    });
  
    // ------------------------------
    // Panel de eliminación
    // ------------------------------
    async function loadUsersForDeletion() {
      if (!usersList || !usersEmpty || !confirmDeleteBtn) return;
      usersList.innerHTML = "";
      usersEmpty.classList.add("hidden");
      confirmDeleteBtn.disabled = true;
  
      try {
        const res = await fetch("/api/records");
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error("No se pudo cargar usuarios");
  
        const rows = data.data || [];
        if (!rows.length) {
          usersEmpty.textContent = "No existen usuarios";
          usersEmpty.classList.remove("hidden");
          return;
        }
  
        // Render
        const frag = document.createDocumentFragment();
        rows.forEach(r => {
          const li = document.createElement("li");
          li.innerHTML = `
            <div>
              <strong>${escapeHtml(r.nombre)}</strong>
              <div class="meta">#${r.id} • ${escapeHtml(r.rut)} • ${escapeHtml(r.email)}</div>
            </div>
            <div>
              <input type="checkbox" class="user-check" value="${r.id}">
            </div>
          `;
          frag.appendChild(li);
        });
        usersList.appendChild(frag);
        updateConfirmBtnState();
      } catch (e) {
        console.error(e);
        usersEmpty.textContent = "Error al cargar usuarios";
        usersEmpty.classList.remove("hidden");
      }
    }
  
    function updateConfirmBtnState() {
      if (!usersList || !confirmDeleteBtn) return;
      const checked = usersList.querySelectorAll(".user-check:checked").length;
      confirmDeleteBtn.disabled = checked === 0;
    }
  
    // Delegación para no duplicar listeners cada carga
    usersList?.addEventListener("change", (e) => {
      if (e.target && e.target.classList.contains("user-check")) {
        updateConfirmBtnState();
      }
    });
  
    deleteToggleBtn?.addEventListener("click", async () => {
      if (!deletePanel) return;
      const willShow = deletePanel.classList.contains("hidden");
      if (willShow) {
        deletePanel.classList.remove("hidden");
        await loadUsersForDeletion();
      } else {
        deletePanel.classList.add("hidden");
      }
    });
  
    confirmDeleteBtn?.addEventListener("click", async () => {
      if (!usersList || !msg) return;
      const checks = Array.from(usersList.querySelectorAll(".user-check:checked"));
      if (!checks.length) return;
  
      const ids = checks.map(c => parseInt(c.value, 10)).filter(Number.isInteger);
  
      confirmDeleteBtn.disabled = true;
      try {
        const res = await fetch("/api/delete", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ ids })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          msg.textContent = (data && data.error) || "No se pudo eliminar.";
          msg.style.color = "#ef4444";
          return;
        }
        msg.textContent = `Eliminados: ${data.deleted}`;
        msg.style.color = "#10b981";
        await loadUsersForDeletion(); // recargar lista
      } catch (e) {
        console.error(e);
        msg.textContent = "Error de red al eliminar.";
        msg.style.color = "#ef4444";
      } finally {
        updateConfirmBtnState();
      }
    });
  
    // ------------------------------
    // Panel de edición
    // ------------------------------
    editToggleBtn?.addEventListener("click", () => {
      if (!editPanel || !editMsg || !editFields) return;
      const willShow = editPanel.classList.contains("hidden");
      if (willShow) {
        editPanel.classList.remove("hidden");
        editMsg.textContent = "";
        editMsg.removeAttribute("class");
        editFields.classList.add("hidden");
        [rutEdit, nombreEdit, fechaEdit, telefonoEdit, emailEdit].forEach(i => i?.classList.remove("invalid", "valid"));
      } else {
        editPanel.classList.add("hidden");
      }
    });
  
    loadByRutBtn?.addEventListener("click", async () => {
      if (!rutEdit || !editMsg || !editFields) return;
      editMsg.textContent = "";
      [rutEdit, nombreEdit, fechaEdit, telefonoEdit, emailEdit].forEach(i => i?.classList.remove("invalid", "valid"));
      editFields.classList.add("hidden");
  
      const rv = (rutEdit.value || "").trim();
      if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(rv) || !rutIsValid(rv)) {
        setInvalid(rutEdit);
        editMsg.textContent = "RUT inválido o DV incorrecto.";
        editMsg.style.color = "#ef4444";
        return;
      } else setValid(rutEdit);
  
      try {
        const res = await fetch("/api/user?rut=" + encodeURIComponent(rv));
        const data = await res.json();
        if (!res.ok || !data.ok) {
          editMsg.textContent = (data && data.error) || "No se pudo buscar.";
          editMsg.style.color = "#ef4444";
          return;
        }
        if (!data.user) {
          editMsg.textContent = "No existe un usuario con ese RUT.";
          editMsg.style.color = "#ef4444";
          return;
        }
  
        nombreEdit && (nombreEdit.value = data.user.nombre || "");
        fechaEdit && (fechaEdit.value = data.user.birthdate || "");
        telefonoEdit && (telefonoEdit.value = data.user.phone || "");
        emailEdit && (emailEdit.value = data.user.email || "");
        editFields.classList.remove("hidden");
        editMsg.textContent = "Usuario cargado. Puedes editar y guardar.";
        editMsg.style.color = "#10b981";
      } catch (e) {
        console.error(e);
        editMsg.textContent = "Error de red al buscar.";
        editMsg.style.color = "#ef4444";
      }
    });
  
    saveEditBtn?.addEventListener("click", async () => {
      if (!editMsg) return;
      editMsg.textContent = "";
      [nombreEdit, fechaEdit, telefonoEdit, emailEdit].forEach(i => i?.classList.remove("invalid","valid"));
  
      const errors = {};
  
      // Validaciones edición
      {
        const v = (nombreEdit?.value || "").trim();
        const ok = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/.test(v);
        if (!ok) { setInvalid(nombreEdit); errors.nombre = "Nombre y apellido(s) requeridos."; }
        else setValid(nombreEdit);
      }
  
      {
        const v = fechaEdit?.value || "";
        if (!isValidISODate(v)) { setInvalid(fechaEdit); errors.birthdate = "Fecha inválida. Usa YYYY-MM-DD."; }
        else setValid(fechaEdit);
      }
  
      {
        const v = (telefonoEdit?.value || "").trim();
        const ok = PHONE_RE.test(v);
        if (!ok) { setInvalid(telefonoEdit); errors.phone = "Teléfono inválido. Usa +56 opcional y 9 dígitos."; }
        else setValid(telefonoEdit);
      }
  
      {
        const v = (emailEdit?.value || "").trim();
        const ok = EMAIL_RE.test(v);
        if (!ok) { setInvalid(emailEdit); errors.email = "Email inválido."; }
        else setValid(emailEdit);
      }
  
      if (Object.keys(errors).length) {
        editMsg.textContent = "Corrige: " + Object.values(errors).join(" • ");
        editMsg.style.color = "#ef4444";
        return;
      }
  
      try {
        const res = await fetch("/api/update", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            rut: rutEdit?.value.trim(),
            nombre: nombreEdit?.value.trim(),
            birthdate: fechaEdit?.value,
            phone: telefonoEdit?.value.trim(),
            email: emailEdit?.value.trim()
          })
        });
        const data = await res.json();
  
        if (!res.ok || !data.ok) {
          editMsg.textContent = (data && data.error) || "No se pudo actualizar.";
          editMsg.style.color = "#ef4444";
          return;
        }
  
        editMsg.textContent = "Usuario actualizado correctamente.";
        editMsg.style.color = "#10b981";
  
        if (deletePanel && !deletePanel.classList.contains("hidden")) await loadUsersForDeletion();
      } catch (e) {
        console.error(e);
        editMsg.textContent = "Error de red al actualizar.";
        editMsg.style.color = "#ef4444";
      }
    });
  });
  