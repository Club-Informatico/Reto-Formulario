function validarRut (rut) {
    return /^(\d{7,8}-[\dkK])$|^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/.test(rut);
}

function validarEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

console.log(validarEmail("usuario@correo.cl"));      
console.log(validarEmail("usuario.correo@dominio.com")); 
console.log(validarEmail("usuario@correo"));         
console.log(validarEmail("usuario@.com"));           
console.log(validarEmail("usuario@correo.c"));       

console.log(validarRut("12333555-7"))
console.log(validarRut("123335557"))
console.log(validarRut("1233355a7"))
console.log(validarRut("12.333.355-7"))
console.log(validarRut("12.333355-7"))