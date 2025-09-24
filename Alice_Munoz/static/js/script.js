document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('reto-formulario');
    const nombre = document.getElementById('nombre');
    const rut = document.getElementById('rut');
    const fechaNacimiento = document.getElementById('fecha_nacimiento');
    const telefono = document.getElementById('telefono');
    const email = document.getElementById('email');

    const regex = {
        nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/,
        rutFormato: /^\d{7,8}-[\dkK]$/, // Solo para el formato
        telefono: /^\+?569\d{8}$/,
        email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    };

    // --- FUNCIÓN PARA CALCULAR EL DÍGITO VERIFICADOR (DV) ---
    // Adaptada de la función que proporcionaste.
    function calcularDV(rutSinDV) {
        let M = 0, S = 1;
        for (; rutSinDV; rutSinDV = Math.floor(rutSinDV / 10)) {
            S = (S + rutSinDV % 10 * (9 - M++ % 6)) % 11;
        }
        return S ? S - 1 : 'k';
    }

    function validarCampo(input, expresion) {
        // ... (esta función se mantiene igual)
        const errorMessage = input.nextElementSibling;
        if (expresion.test(input.value.trim())) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            errorMessage.textContent = '';
            return true;
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            errorMessage.textContent = 'Formato incorrecto';
            return false;
        }
    }

    // --- NUEVA FUNCIÓN MEJORADA PARA VALIDAR EL RUT COMPLETO ---
    function validarRut() {
        const errorMessage = rut.nextElementSibling;
        const valorRut = rut.value.trim();

        if (!valorRut) { // Si el campo está vacío, limpiamos los estilos
            rut.classList.remove('valid', 'invalid');
            errorMessage.textContent = '';
            return false;
        }

        if (!regex.rutFormato.test(valorRut)) { // 1. Validamos el formato
            rut.classList.remove('valid');
            rut.classList.add('invalid');
            errorMessage.textContent = 'Formato incorrecto (ej: 12345678-9)';
            return false;
        }

        const [numero, dv] = valorRut.split('-');
        const dvCalculado = calcularDV(numero);

        if (dv.toLowerCase() == dvCalculado) { // 2. Validamos el dígito verificador
            rut.classList.remove('invalid');
            rut.classList.add('valid');
            errorMessage.textContent = '';
            return true;
        } else {
            rut.classList.remove('valid');
            rut.classList.add('invalid');
            errorMessage.textContent = 'Dígito verificador incorrecto.';
            return false;
        }
    }

    function validarFechaNacimiento() {
        // ... (esta función se mantiene igual)
        const errorMessage = fechaNacimiento.nextElementSibling;
        const fechaSeleccionada = new Date(fechaNacimiento.value + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (!fechaNacimiento.value) {
            fechaNacimiento.classList.remove('valid');
            fechaNacimiento.classList.add('invalid');
            errorMessage.textContent = 'Debes seleccionar una fecha.';
            return false;
        } else if (fechaSeleccionada > hoy) {
            fechaNacimiento.classList.remove('valid');
            fechaNacimiento.classList.add('invalid');
            errorMessage.textContent = 'La fecha no puede ser futura.';
            return false;
        } else {
            fechaNacimiento.classList.remove('invalid');
            fechaNacimiento.classList.add('valid');
            errorMessage.textContent = '';
            return true;
        }
    }

    // AÑADIMOS LOS EVENT LISTENERS
    nombre.addEventListener('input', () => validarCampo(nombre, regex.nombre));
    rut.addEventListener('input', validarRut); // Usamos la para el RUT que sacamos de Github
    telefono.addEventListener('input', () => validarCampo(telefono, regex.telefono));
    email.addEventListener('input', () => validarCampo(email, regex.email));
    fechaNacimiento.addEventListener('change', validarFechaNacimiento);

    // VALIDACIÓN ANTES DE ENVIAR EL FORMULARIO
    form.addEventListener('submit', function (event) {
        const esNombreValido = validarCampo(nombre, regex.nombre);
        const esRutValido = validarRut(); // Usamos la nueva función aquí también
        const esTelefonoValido = validarCampo(telefono, regex.telefono);
        const esEmailValido = validarCampo(email, regex.email);
        const esFechaValida = validarFechaNacimiento();

        if (!esNombreValido || !esRutValido || !esTelefonoValido || !esEmailValido || !esFechaValida) {
            event.preventDefault();
            alert('Por favor, corrige los campos en rojo antes de enviar.');
        }
    });
});