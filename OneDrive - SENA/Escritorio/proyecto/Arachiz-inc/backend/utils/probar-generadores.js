// Para ejecutar este archivo abre una terminal en la carpeta backend y escribe:
//   node utils/probar-generadores.js

const { contarHastaTres, generarCodigoFicha } = require('./generators');


// ─── PRUEBA 1: contarHastaTres ────────────────────────────────────────────────
console.log('=== GENERADOR 1: Contador ===');

const contador = contarHastaTres(); // crea el generador, aún no ejecuta nada

console.log(contador.next()); // { value: 1, done: false }
console.log(contador.next()); // { value: 2, done: false }
console.log(contador.next()); // { value: 3, done: false }
console.log(contador.next()); // { value: undefined, done: true } ← ya terminó


// ─── PRUEBA 2: recorrer con for...of ─────────────────────────────────────────
console.log('\n=== GENERADOR 1: Con for...of ===');

// for...of llama .next() automáticamente hasta que done sea true
for (const numero of contarHastaTres()) {
  console.log('Número:', numero);
}


// ─── PRUEBA 3: generadorCodigos ───────────────────────────────────────────────
console.log('\n=== GENERADOR 2: Códigos de ficha ===');

// Pedir 5 códigos uno por uno
for (let i = 1; i <= 5; i++) {
  console.log(`Código ${i}:`, generarCodigoFicha());
}
