/**
 * ¿Qué es un generador?
 *
 * Es una función especial que NO ejecuta todo de una vez.
 * En cambio, entrega un valor, se PAUSA, y espera a que le pidas el siguiente.
 *
 * Se escribe con function* (asterisco) y usa yield para entregar valores.
 *
 * Piénsalo como una máquina expendedora:
 *   - Cada vez que presionas el botón (.next()) te da UN producto.
 *   - No te da todos a la vez.
 *   - Recuerda en qué punto quedó.
 */


// ─── GENERADOR 1: Contador simple ────────────────────────────────────────────
// El más básico posible. Cuenta del 1 al 3 y para.

function* contarHastaTres() {
  yield 1; // entrega 1 y se pausa
  yield 2; // cuando le piden más, entrega 2 y se pausa
  yield 3; // entrega 3 y se pausa
  // aquí termina → done: true
}

// Cómo se usa:
// const contador = contarHastaTres();
// contador.next() → { value: 1, done: false }
// contador.next() → { value: 2, done: false }
// contador.next() → { value: 3, done: false }
// contador.next() → { value: undefined, done: true }  ← ya terminó


// ─── GENERADOR 2: Códigos de invitación para las fichas ──────────────────────
// Este SÍ se usa en el proyecto. Genera códigos como "X7B9K2", "A3MNP1", etc.
// Es infinito: nunca termina, siempre tiene un código nuevo listo.

function* generadorCodigos() {
  // Caracteres permitidos (sin O, 0, I, 1 para evitar confusión al leerlos)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  while (true) { // bucle infinito — el generador nunca llega a done: true
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += chars[Math.floor(Math.random() * chars.length)];
    }
    yield codigo; // entrega el código y se pausa hasta que pidan el siguiente
  }
}

// Creamos UNA sola instancia que se reutiliza en toda la app
const _generador = generadorCodigos();

// Función simple para pedir el siguiente código
const generarCodigoFicha = () => _generador.next().value;


// ─── Exportar ─────────────────────────────────────────────────────────────────
module.exports = {
  contarHastaTres,     // para entender / explicar cómo funciona un generador
  generarCodigoFicha,  // usado en fichaController.js para crear fichas
};
