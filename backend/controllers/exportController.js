const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generarFilasCSV } = require('../utils/generators');

const toCSV = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const str = val === null || val === undefined ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(','))
  ].join('\r\n');
};

// GET /api/export/ficha/:fichaId/asistencia
const exportAsistenciaFicha = async (req, res) => {
  const { fichaId } = req.params;
  const instructorId = req.user.id;

  try {
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: {
        instructores: true,
        aprendices: {
          select: { id: true, fullName: true, document: true }
        },
        materias: {
          include: {
            asistencias: {
              where: { activa: false },
              orderBy: { timestamp: 'desc' },
              include: {
                registros: {
                  include: {
                    aprendiz: { select: { id: true, fullName: true, document: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!ficha) return res.status(404).json({ error: 'Ficha no encontrada' });
    if (!ficha.instructores.some(i => i.instructorId === instructorId)) {
      return res.status(403).json({ error: 'Sin permiso' });
    }

    // Usar el generador para construir las filas — produce una fila a la vez
    // en lugar de construir todo el array de golpe en memoria
    const rows = [...generarFilasCSV(ficha)];

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No hay sesiones finalizadas para exportar' });
    }

    const csv      = toCSV(rows);
    const filename = `Ficha${ficha.numero}_Asistencia_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM para Excel con tildes
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar: ' + err.message });
  }
};

module.exports = { exportAsistenciaFicha };
