function validarRut(rut) {
    return /^(\d{7,8}-[\dkK])$|^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/.test(rut);
}

function validarEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function validarTelefono(telefono) {
    return /^\+56\s?9\s?\d{4}\s?\d{4}$/.test(telefono);
}

function validarNombre(nombre) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre.trim());
}

function validarFechaNacimiento(fecha) {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaIngresada = new Date(fecha);
    hoy.setHours(0,0,0,0);
    fechaIngresada.setHours(0,0,0,0);
    return fechaIngresada < hoy;
}

function mostrarIcono(input, esValido) {
    let icono = input.nextElementSibling;
    if (!icono || !icono.classList.contains('icono-validacion')) {
        icono = document.createElement('span');
        icono.classList.add('icono-validacion');
        icono.style.marginLeft = '8px';
        input.parentNode.appendChild(icono);
    }
    icono.textContent = esValido ? 'Formato correcto ✅' : 'Formato incorrecto❌';
}


window.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const rutInput = document.getElementById('rut');
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    const nombreInput = document.getElementById('nombre');
    const fechaInput = document.getElementById('fecha');

    rutInput.addEventListener('input', function () {
        mostrarIcono(rutInput, validarRut(rutInput.value));
    });

    emailInput.addEventListener('input', function () {
        mostrarIcono(emailInput, validarEmail(emailInput.value));
    });

    telefonoInput.addEventListener('input', function () {
        mostrarIcono(telefonoInput, validarTelefono(telefonoInput.value));
    });

    nombreInput.addEventListener('input', function () {
        mostrarIcono(nombreInput, validarNombre(nombreInput.value));
    });

    fechaInput.addEventListener('input', function () {
        mostrarIcono(fechaInput, validarFechaNacimiento(fechaInput.value));
    });

    form.addEventListener('submit', function (e) {
        const rutValido = validarRut(rutInput.value);
        const emailValido = validarEmail(emailInput.value);
        const telefonoValido = validarTelefono(telefonoInput.value);
        const nombreValido = validarNombre(nombreInput.value);
        const fechaValida = validarFechaNacimiento(fechaInput.value);

        mostrarIcono(rutInput, rutValido);
        mostrarIcono(emailInput, emailValido);
        mostrarIcono(telefonoInput, telefonoValido);
        mostrarIcono(nombreInput, nombreValido);
        mostrarIcono(fechaInput, fechaValida);

        if (!rutValido || !emailValido || !telefonoValido || !nombreValido || !fechaValida) {
            alert('Corregir campos');
            e.preventDefault();
        }
    });
});

