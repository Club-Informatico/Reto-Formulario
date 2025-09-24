// static/js/matrix.js

const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// Hacemos que el canvas ocupe toda la pantalla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Los caracteres que van a caer. 1s y 0s como pediste.
const characters = '01';
const charArray = characters.split('');

const fontSize = 16;
const columns = canvas.width / fontSize;

// Creamos un array para guardar la posición Y de cada columna de "lluvia"
const drops = [];
for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function draw() {
    // Rellenamos el canvas con un negro semi-transparente para crear el efecto de "estela"
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ponemos el color verde a las letras
    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px Fira Code'; // Usamos la misma fuente

    // Recorremos cada columna
    for (let i = 0; i < drops.length; i++) {
        // Elegimos un 0 o un 1 al azar
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        // Dibujamos el caracter en la posición (x, y)
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Si la gota llega al final de la pantalla, la reseteamos al principio
        // con una probabilidad, para que no caigan todas a la vez
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Movemos la gota hacia abajo
        drops[i]++;
    }
}

// Ejecutamos la función 'draw' cada 33 milisegundos para crear la animación
setInterval(draw, 33);