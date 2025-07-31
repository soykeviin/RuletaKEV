const premios = [
  'Taza',
  'Gorra',
  'Mouse',
  'Café',
  'Dulces',
  'Llavero',
  'Camiseta',
  'Audífonos',
  'Botella',
  'Cuaderno',
  'Powerbank',
  'Agenda',
  'Bolígrafo',
  'Sticker'
];
const colores = [
  '#b3c6ff', '#5cacee', '#1976d2', '#64b5f6', '#2196f3', '#1565c0', '#90caf9', '#42a5f5', '#82b1ff', '#0d47a1', '#4fc3f7', '#1e88e5', '#80d8ff', '#2962ff'
];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const premioDiv = document.getElementById('premio');
const girarBtn = document.getElementById('girarBtn');
let anguloActual = 0;
let girando = false;
const audio = new Audio('sonido.mp3');
audio.preload = 'auto';
let audioPlaying = false;

function dibujarRuleta() {
  const radio = canvas.width / 2;
  const botonRadio = Math.min(canvas.width, canvas.height) * 0.11; // Radio aproximado del botón de girar
  for (let i = 0; i < premios.length; i++) {
    const angInicio = (2 * Math.PI / premios.length) * i;
    const angFin = angInicio + 2 * Math.PI / premios.length;
    ctx.beginPath();
    ctx.moveTo(radio, radio);
    ctx.arc(radio, radio, radio, angInicio, angFin);
    ctx.closePath();
    ctx.fillStyle = colores[i % colores.length];
    ctx.fill();
    ctx.save();
    ctx.translate(radio, radio);
    ctx.rotate(angInicio + Math.PI / premios.length);
    ctx.rotate(Math.PI); // Girar el texto para que esté "al revés" y se lea desde la flecha
    ctx.textAlign = 'left';
    // Ajustar tamaño de fuente según el largo del texto y la posición
    let fontSize = 22;
    ctx.font = `bold ${fontSize}px Segoe UI, Arial`;
    // Si el texto está cerca del centro (ángulo cerca de 0 o PI), reducir aún más el ancho permitido
    let sectorAngle = angInicio + Math.PI / premios.length;
    let centralZone = (Math.abs(Math.cos(sectorAngle)) > 0.97); // cerca de la horizontal (donde está el botón)
    let maxWidth = radio - 48;
    if (centralZone) {
      maxWidth = radio - botonRadio - 32; // reducir más para evitar el botón
    }
    while (ctx.measureText(premios[i]).width > maxWidth && fontSize > 10) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px Segoe UI, Arial`;
    }
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a237e';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#0008';
    ctx.shadowBlur = 8;
    ctx.strokeText(premios[i], 24 - radio, 12);
    ctx.fillText(premios[i], 24 - radio, 12);
    ctx.restore();
  }
}

dibujarRuleta();

function girarRuleta() {
  if (girando) return;
  girando = true;
  premioDiv.textContent = '';
  // Reproducir sonido SIEMPRE en el click, reiniciando el audio
  audio.pause();
  audio.currentTime = 0;
  audio.play().catch(() => {}); // Ignora errores de autoplay
  const vueltas = Math.floor(Math.random() * 3) + 5; // 5-7 vueltas
  // Elegimos un ángulo final aleatorio
  const anguloPorPremio = 2 * Math.PI / premios.length;
  const anguloOffsetFlecha = Math.PI; // 180° (izquierda)
  const anguloRandom = Math.random() * 2 * Math.PI;
  const anguloFinal = (2 * Math.PI * vueltas) + anguloRandom;
  const duracion = 10500; // 10.5 segundos
  const inicio = performance.now();
  function animar(now) {
    const t = Math.min((now - inicio) / duracion, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);
    anguloActual = ease * anguloFinal;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(anguloActual);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    dibujarRuleta();
    ctx.restore();
    if (t < 1) {
      requestAnimationFrame(animar);
    } else {
      girando = false;
      // Calcular el índice del premio alineado con la flecha izquierda
      let anguloTotal = anguloFinal % (2 * Math.PI);
      let anguloFlecha = (anguloOffsetFlecha - anguloTotal + 2 * Math.PI) % (2 * Math.PI);
      let premioIndex = Math.floor(anguloFlecha / anguloPorPremio) % premios.length;
      mostrarPremio(premioIndex);
    }
  }
  requestAnimationFrame(animar);
}

girarBtn.addEventListener('click', girarRuleta);

function mostrarPremio(idx) {
  premioDiv.textContent = `¡Ganaste: ${premios[idx]}! 🎉`;
}

// Redibuja la ruleta si cambia el tamaño (responsive)
window.addEventListener('resize', () => {
  // Ajusta el tamaño del canvas según el tamaño del contenedor
  const ruleta = document.getElementById('ruleta');
  let size = ruleta.offsetWidth;
  canvas.width = size;
  canvas.height = size;
  dibujarRuleta();
});
