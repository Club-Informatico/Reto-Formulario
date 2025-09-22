document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');

    // Regular Expressions (Regex)
    const regexNombre = /^[^\d]+$/;
    const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const regexTelefono = /^(\+56|0)?(\s)?(9)?(\s)?\d{4}(\s)?\d{4}$/;
    const regexRut = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
    const regexFecha = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;


    function validarRut(rutCompleto) {

        rutCompleto = rutCompleto.replace(/\./g, "").replace(/-/g, "");
        if (rutCompleto.length === 0) return false;
        let cuerpo = rutCompleto.slice(0, -1);
        let dv = rutCompleto.slice(-1).toUpperCase();
        if (cuerpo.length < 7) return false;

        // Calculo digito verificador
        let suma = 0;
        let factor = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i), 10) * factor;
            factor = (factor === 7) ? 2 : factor + 1;
        }
        let dvCalculado = 11 - (suma % 11);
        let dvFinal = (dvCalculado === 11) ? '0' : ((dvCalculado === 10) ? 'K' : dvCalculado.toString());
        return dvFinal === dv;
    }

    function validarFecha(fechaStr) {

        if (!regexFecha.test(fechaStr)) {
            return false;
        }

        const partes = fechaStr.split('-');
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const anio = parseInt(partes[2], 10);

        const fechaIngresada = new Date(anio, mes, dia);
        const fechaActual = new Date();

        return fechaIngresada <= fechaActual;
    }

    const btn = document.getElementById('btn-enviar')
    btn.addEventListener('htmx:beforeRequest', (e) => {

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const rut = document.getElementById('rut').value;
        const fechaNacimiento = document.getElementById('fecha_nacimiento').value;


        document.getElementById('nombreError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('telefonoError').textContent = '';
        document.getElementById('rutError').textContent = '';
        document.getElementById('fechaError').textContent = '';

        let formularioValido = true;

        if (!regexNombre.test(nombre)) {
            document.getElementById('nombreError').textContent = 'El nombre no debe contener números.';
            formularioValido = false;
        }

        if (!regexEmail.test(email)) {
            document.getElementById('emailError').textContent = 'El correo no tiene un formato válido.';
            formularioValido = false;
        }

        if (!regexTelefono.test(telefono)) {
            document.getElementById('telefonoError').textContent = 'El teléfono no es un formato chileno válido (+56 9 1234 5678).';
            formularioValido = false;
        }

        if (!regexRut.test(rut) || !validarRut(rut)) {
            document.getElementById('rutError').textContent = 'El RUT no es válido (ej: 12.345.678-9).';
            formularioValido = false;
        }

        if (!validarFecha(fechaNacimiento)) {
            document.getElementById('fechaError').textContent = 'La fecha debe tener el formato dd-mm-yyyy y no puede ser superior a la fecha actual.';
            formularioValido = false;
        }

        if (!formularioValido) {
            e.preventDefault();
        }
    });
});