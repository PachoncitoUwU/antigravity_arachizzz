const prisma = require('../lib/prisma');

// GET /api/respuestas-rapidas - Obtener respuestas rápidas del instructor
const getRespuestasRapidas = async (req, res) => {
  const instructorId = req.user.id;

  try {
    const respuestas = await prisma.respuestaRapida.findMany({
      where: { instructorId },
      orderBy: { orden: 'asc' }
    });

    res.json({ respuestas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener respuestas rápidas: ' + err.message });
  }
};

// POST /api/respuestas-rapidas - Crear respuesta rápida
const createRespuestaRapida = async (req, res) => {
  const instructorId = req.user.id;
  const { texto } = req.body;

  if (!texto || !texto.trim()) {
    return res.status(400).json({ error: 'El texto es requerido' });
  }

  try {
    // Obtener el orden máximo actual
    const maxOrden = await prisma.respuestaRapida.findFirst({
      where: { instructorId },
      orderBy: { orden: 'desc' },
      select: { orden: true }
    });

    const nuevoOrden = maxOrden ? maxOrden.orden + 1 : 0;

    const respuesta = await prisma.respuestaRapida.create({
      data: {
        instructorId,
        texto: texto.trim(),
        orden: nuevoOrden
      }
    });

    res.json({ respuesta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear respuesta rápida: ' + err.message });
  }
};

// PUT /api/respuestas-rapidas/:id - Actualizar respuesta rápida
const updateRespuestaRapida = async (req, res) => {
  const instructorId = req.user.id;
  const { id } = req.params;
  const { texto } = req.body;

  if (!texto || !texto.trim()) {
    return res.status(400).json({ error: 'El texto es requerido' });
  }

  try {
    // Verificar que la respuesta pertenece al instructor
    const respuesta = await prisma.respuestaRapida.findUnique({
      where: { id }
    });

    if (!respuesta) {
      return res.status(404).json({ error: 'Respuesta rápida no encontrada' });
    }

    if (respuesta.instructorId !== instructorId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta respuesta' });
    }

    const respuestaActualizada = await prisma.respuestaRapida.update({
      where: { id },
      data: { texto: texto.trim() }
    });

    res.json({ respuesta: respuestaActualizada });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar respuesta rápida: ' + err.message });
  }
};

// DELETE /api/respuestas-rapidas/:id - Eliminar respuesta rápida
const deleteRespuestaRapida = async (req, res) => {
  const instructorId = req.user.id;
  const { id } = req.params;

  try {
    // Verificar que la respuesta pertenece al instructor
    const respuesta = await prisma.respuestaRapida.findUnique({
      where: { id }
    });

    if (!respuesta) {
      return res.status(404).json({ error: 'Respuesta rápida no encontrada' });
    }

    if (respuesta.instructorId !== instructorId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta respuesta' });
    }

    await prisma.respuestaRapida.delete({
      where: { id }
    });

    // Reordenar las respuestas restantes
    const respuestasRestantes = await prisma.respuestaRapida.findMany({
      where: { instructorId },
      orderBy: { orden: 'asc' }
    });

    // Actualizar el orden
    for (let i = 0; i < respuestasRestantes.length; i++) {
      await prisma.respuestaRapida.update({
        where: { id: respuestasRestantes[i].id },
        data: { orden: i }
      });
    }

    res.json({ message: 'Respuesta rápida eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar respuesta rápida: ' + err.message });
  }
};

// PUT /api/respuestas-rapidas/reordenar - Reordenar respuestas rápidas
const reordenarRespuestas = async (req, res) => {
  const instructorId = req.user.id;
  const { respuestas } = req.body; // Array de { id, orden }

  if (!Array.isArray(respuestas)) {
    return res.status(400).json({ error: 'Se requiere un array de respuestas' });
  }

  try {
    // Verificar que todas las respuestas pertenecen al instructor
    const ids = respuestas.map(r => r.id);
    const respuestasDB = await prisma.respuestaRapida.findMany({
      where: { id: { in: ids } }
    });

    if (respuestasDB.some(r => r.instructorId !== instructorId)) {
      return res.status(403).json({ error: 'No tienes permiso para reordenar estas respuestas' });
    }

    // Actualizar el orden
    for (const respuesta of respuestas) {
      await prisma.respuestaRapida.update({
        where: { id: respuesta.id },
        data: { orden: respuesta.orden }
      });
    }

    const respuestasActualizadas = await prisma.respuestaRapida.findMany({
      where: { instructorId },
      orderBy: { orden: 'asc' }
    });

    res.json({ respuestas: respuestasActualizadas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reordenar respuestas rápidas: ' + err.message });
  }
};

// POST /api/respuestas-rapidas/restaurar - Restaurar respuestas por defecto
const restaurarDefecto = async (req, res) => {
  const instructorId = req.user.id;

  const DEFAULT_RESPUESTAS = [
    'Excusa aprobada. Por favor, ponte al día con las actividades pendientes.',
    'Excusa aprobada. Recuerda solicitar las guías a tus compañeros.',
    'Excusa rechazada. El motivo no constituye una justificación válida.',
    'Excusa rechazada. Se requiere documentación de respaldo.',
    'Excusa aprobada. Lamento lo sucedido. Ponte al día con las clases.',
  ];

  try {
    // Eliminar todas las respuestas actuales del instructor
    await prisma.respuestaRapida.deleteMany({
      where: { instructorId }
    });

    // Crear las respuestas por defecto
    const respuestas = await Promise.all(
      DEFAULT_RESPUESTAS.map((texto, index) =>
        prisma.respuestaRapida.create({
          data: {
            instructorId,
            texto,
            orden: index
          }
        })
      )
    );

    res.json({ respuestas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al restaurar respuestas por defecto: ' + err.message });
  }
};

module.exports = {
  getRespuestasRapidas,
  createRespuestaRapida,
  updateRespuestaRapida,
  deleteRespuestaRapida,
  reordenarRespuestas,
  restaurarDefecto
};
