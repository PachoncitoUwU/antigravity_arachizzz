const prisma = require('../lib/prisma');

// =====================================================
// GESTIÓN DE FICHAS
// =====================================================

/**
 * Obtener todas las fichas del administrador
 */
const getFichasAdmin = async (req, res) => {
  try {
    const fichas = await prisma.ficha.findMany({
      where: { administradorId: req.user.id },
      include: {
        instructorAdmin: {
          select: { id: true, fullName: true, email: true }
        },
        administrador: {
          select: { id: true, fullName: true, email: true }
        },
        _count: {
          select: {
            aprendices: true,
            instructores: true,
            materias: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ fichas });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo fichas: ' + err.message });
  }
};

/**
 * Obtener detalle de una ficha específica
 */
const getFichaDetalle = async (req, res) => {
  try {
    const { fichaId } = req.params;

    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: {
        instructorAdmin: {
          select: { id: true, fullName: true, email: true, avatarUrl: true }
        },
        administrador: {
          select: { id: true, fullName: true, email: true, avatarUrl: true }
        },
        aprendices: {
          select: {
            id: true,
            fullName: true,
            email: true,
            document: true,
            avatarUrl: true,
            createdAt: true,
            nfcUid: true,
            huellas: true,
            faceDescriptor: true
          }
        },
        instructores: {
          include: {
            instructor: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        materias: {
          include: {
            instructor: {
              select: { id: true, fullName: true }
            },
            _count: {
              select: { asistencias: true }
            }
          }
        },
        horarios: {
          include: {
            materia: {
              select: { id: true, nombre: true }
            }
          }
        }
      }
    });

    if (!ficha) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    // Cargar materias evitadas para cada aprendiz
    const aprendicesConMateriasEvitadas = await Promise.all(
      ficha.aprendices.map(async (aprendiz) => {
        const materiasEvitadas = await prisma.materiaEvitada.findMany({
          where: { 
            aprendizId: aprendiz.id,
            materia: {
              fichaId: fichaId
            }
          },
          include: {
            materia: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          }
        });
        
        return {
          ...aprendiz,
          materiasEvitadas
        };
      })
    );

    // Reemplazar aprendices con los que tienen materias evitadas
    ficha.aprendices = aprendicesConMateriasEvitadas;

    res.json({ ficha });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo detalle: ' + err.message });
  }
};

/**
 * Cambiar el líder (instructorAdmin) de una ficha
 */
const cambiarLiderFicha = async (req, res) => {
  try {
    const { fichaId } = req.params;
    const { nuevoLiderId } = req.body;

    if (!nuevoLiderId) {
      return res.status(400).json({ error: 'ID del nuevo líder es requerido' });
    }

    // Verificar que el nuevo líder existe y es instructor
    const nuevoLider = await prisma.user.findUnique({
      where: { id: nuevoLiderId }
    });

    if (!nuevoLider) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (nuevoLider.userType !== 'instructor') {
      return res.status(400).json({ error: 'El nuevo líder debe ser un instructor' });
    }

    // Verificar que el instructor está en la ficha
    const fichaInstructor = await prisma.fichaInstructor.findUnique({
      where: {
        fichaId_instructorId: {
          fichaId,
          instructorId: nuevoLiderId
        }
      }
    });

    if (!fichaInstructor) {
      return res.status(400).json({ error: 'El instructor no pertenece a esta ficha' });
    }

    // Obtener datos anteriores para historial
    const fichaAnterior = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: {
        instructorAdmin: { select: { fullName: true } }
      }
    });

    // Cambiar el líder
    const fichaActualizada = await prisma.ficha.update({
      where: { id: fichaId },
      data: { instructorAdminId: nuevoLiderId },
      include: {
        instructorAdmin: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    // Registrar en historial
    await prisma.historialCambios.create({
      data: {
        fichaId,
        usuarioId: req.user.id,
        tipoEvento: 'cambio_lider',
        entidad: 'ficha',
        entidadId: fichaId,
        descripcion: `Cambió el líder de la ficha de "${fichaAnterior.instructorAdmin.fullName}" a "${nuevoLider.fullName}"`,
        datosAnteriores: { instructorAdminId: fichaAnterior.instructorAdminId },
        datosNuevos: { instructorAdminId: nuevoLiderId }
      }
    });

    res.json({ 
      message: 'Líder de ficha actualizado correctamente',
      ficha: fichaActualizada 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error cambiando líder: ' + err.message });
  }
};

// =====================================================
// GESTIÓN DE MATERIAS
// =====================================================

/**
 * Cambiar el instructor a cargo de una materia
 */
const cambiarInstructorMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const { nuevoInstructorId } = req.body;

    if (!nuevoInstructorId) {
      return res.status(400).json({ error: 'ID del nuevo instructor es requerido' });
    }

    // Obtener la materia y verificar que pertenece a una ficha del admin
    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      include: {
        ficha: true,
        instructor: { select: { fullName: true } }
      }
    });

    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    if (materia.ficha.administradorId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos sobre esta materia' });
    }

    // Verificar que el nuevo instructor existe y es instructor
    const nuevoInstructor = await prisma.user.findUnique({
      where: { id: nuevoInstructorId }
    });

    if (!nuevoInstructor || nuevoInstructor.userType !== 'instructor') {
      return res.status(400).json({ error: 'El nuevo instructor debe ser un usuario de tipo instructor' });
    }

    // Verificar que el instructor está en la ficha
    const fichaInstructor = await prisma.fichaInstructor.findUnique({
      where: {
        fichaId_instructorId: {
          fichaId: materia.fichaId,
          instructorId: nuevoInstructorId
        }
      }
    });

    if (!fichaInstructor) {
      return res.status(400).json({ error: 'El instructor no pertenece a esta ficha' });
    }

    // Cambiar el instructor
    const materiaActualizada = await prisma.materia.update({
      where: { id: materiaId },
      data: { instructorId: nuevoInstructorId },
      include: {
        instructor: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    // Registrar en historial
    await prisma.historialCambios.create({
      data: {
        fichaId: materia.fichaId,
        usuarioId: req.user.id,
        tipoEvento: 'cambio_instructor',
        entidad: 'materia',
        entidadId: materiaId,
        descripcion: `Cambió el instructor de la materia "${materia.nombre}" de "${materia.instructor.fullName}" a "${nuevoInstructor.fullName}"`,
        datosAnteriores: { instructorId: materia.instructorId },
        datosNuevos: { instructorId: nuevoInstructorId }
      }
    });

    res.json({ 
      message: 'Instructor de materia actualizado correctamente',
      materia: materiaActualizada 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error cambiando instructor: ' + err.message });
  }
};

// =====================================================
// GESTIÓN DE USUARIOS
// =====================================================

/**
 * Obtener todos los instructores de las fichas del administrador
 */
const getInstructores = async (req, res) => {
  try {
    const { fichaId } = req.query;

    let whereClause = {};

    if (fichaId) {
      // Verificar que la ficha pertenece al admin
      const ficha = await prisma.ficha.findUnique({
        where: { id: fichaId }
      });

      if (!ficha || ficha.administradorId !== req.user.id) {
        return res.status(403).json({ error: 'No tienes acceso a esta ficha' });
      }

      whereClause = { fichaId };
    } else {
      // Obtener instructores de todas las fichas del admin
      const fichasAdmin = await prisma.ficha.findMany({
        where: { administradorId: req.user.id },
        select: { id: true }
      });

      whereClause = {
        fichaId: { in: fichasAdmin.map(f => f.id) }
      };
    }

    const instructores = await prisma.fichaInstructor.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            document: true,
            avatarUrl: true,
            createdAt: true
          }
        },
        ficha: {
          select: {
            id: true,
            numero: true,
            nombre: true
          }
        }
      }
    });

    res.json({ instructores });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo instructores: ' + err.message });
  }
};

/**
 * Obtener todos los aprendices de las fichas del administrador
 */
const getAprendices = async (req, res) => {
  try {
    const { fichaId } = req.query;

    if (fichaId) {
      // Verificar que la ficha pertenece al admin
      const ficha = await prisma.ficha.findUnique({
        where: { id: fichaId },
        include: {
          aprendices: {
            select: {
              id: true,
              fullName: true,
              email: true,
              document: true,
              avatarUrl: true,
              createdAt: true
            }
          }
        }
      });

      if (!ficha || ficha.administradorId !== req.user.id) {
        return res.status(403).json({ error: 'No tienes acceso a esta ficha' });
      }

      return res.json({ aprendices: ficha.aprendices });
    }

    // Obtener aprendices de todas las fichas del admin
    const fichas = await prisma.ficha.findMany({
      where: { administradorId: req.user.id },
      include: {
        aprendices: {
          select: {
            id: true,
            fullName: true,
            email: true,
            document: true,
            avatarUrl: true,
            createdAt: true
          }
        }
      }
    });

    // Aplanar y eliminar duplicados
    const aprendicesMap = new Map();
    fichas.forEach(ficha => {
      ficha.aprendices.forEach(aprendiz => {
        if (!aprendicesMap.has(aprendiz.id)) {
          aprendicesMap.set(aprendiz.id, aprendiz);
        }
      });
    });

    const aprendices = Array.from(aprendicesMap.values());

    res.json({ aprendices });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo aprendices: ' + err.message });
  }
};

/**
 * Obtener todas las fichas en las que está inscrito un aprendiz
 */
const getFichasDeAprendiz = async (req, res) => {
  try {
    const { aprendizId } = req.params;

    // Obtener todas las fichas del aprendiz que pertenecen al admin
    const fichas = await prisma.ficha.findMany({
      where: {
        administradorId: req.user.id,
        aprendices: {
          some: { id: aprendizId }
        }
      },
      select: {
        id: true,
        numero: true,
        nombre: true,
        nivel: true,
        centro: true,
        jornada: true,
        createdAt: true
      }
    });

    res.json({ fichas });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo fichas del aprendiz: ' + err.message });
  }
};

/**
 * Obtener todas las fichas en las que está un instructor
 */
const getFichasDeInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // Obtener todas las fichas del instructor que pertenecen al admin
    const fichasInstructor = await prisma.fichaInstructor.findMany({
      where: {
        instructorId,
        ficha: {
          administradorId: req.user.id
        }
      },
      include: {
        ficha: {
          select: {
            id: true,
            numero: true,
            nombre: true,
            nivel: true,
            centro: true,
            jornada: true,
            createdAt: true
          }
        }
      }
    });

    const fichas = fichasInstructor.map(fi => fi.ficha);

    res.json({ fichas });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo fichas del instructor: ' + err.message });
  }
};

/**
 * Obtener conflictos de un instructor (para admin)
 */
const getConflictosDeInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // Verificar que el instructor pertenece a alguna ficha del admin
    const fichasInstructor = await prisma.fichaInstructor.findFirst({
      where: {
        instructorId,
        ficha: {
          administradorId: req.user.id
        }
      }
    });

    if (!fichasInstructor) {
      return res.status(403).json({ error: 'No tienes acceso a este instructor' });
    }

    const conflictos = await prisma.conflictoHorario.findMany({
      where: {
        instructorId,
        resuelto: false
      },
      include: {
        admin: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ conflictos });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo conflictos: ' + err.message });
  }
};

/**
 * Crear una nueva ficha (solo administrador)
 */
const crearFicha = async (req, res) => {
  try {
    const { numero, nivel, centro, jornada, region, duracion, nombre } = req.body;

    if (!numero || !nivel || !centro || !jornada) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar que no exista una ficha con ese número
    const fichaExistente = await prisma.ficha.findUnique({
      where: { numero }
    });

    if (fichaExistente) {
      return res.status(400).json({ error: 'Ya existe una ficha con ese número' });
    }

    // Generar código único
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Crear la ficha SIN líder (el admin no puede ser líder)
    const nuevaFicha = await prisma.ficha.create({
      data: {
        numero,
        nivel,
        centro,
        jornada,
        region: region || '',
        duracion: duracion || 0,
        nombre: nombre || 'Programa sin nombre',
        code,
        administradorId: req.user.id // El admin es el administrador
        // instructorAdminId se deja null hasta que se asigne un líder
      },
      include: {
        instructorAdmin: {
          select: { id: true, fullName: true, email: true }
        },
        administrador: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    // Registrar en historial
    await prisma.historialCambios.create({
      data: {
        fichaId: nuevaFicha.id,
        usuarioId: req.user.id,
        tipoEvento: 'crear',
        entidad: 'ficha',
        entidadId: nuevaFicha.id,
        descripcion: `Creó la ficha ${numero} - ${nombre}`
      }
    });

    res.status(201).json({ 
      message: 'Ficha creada exitosamente',
      ficha: nuevaFicha 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creando ficha: ' + err.message });
  }
};

/**
 * Unirse a una ficha existente usando código
 */
const unirseAFicha = async (req, res) => {
  try {
    const { code } = req.params;

    // Buscar la ficha por código
    const ficha = await prisma.ficha.findUnique({
      where: { code }
    });

    if (!ficha) {
      return res.status(404).json({ error: 'Código de ficha inválido' });
    }

    // Verificar si ya está asignado como administrador
    if (ficha.administradorId === req.user.id) {
      return res.status(400).json({ error: 'Ya eres administrador de esta ficha' });
    }

    // Asignar al administrador a la ficha
    const fichaActualizada = await prisma.ficha.update({
      where: { id: ficha.id },
      data: { administradorId: req.user.id }
    });

    // Registrar en historial
    await prisma.historialCambios.create({
      data: {
        fichaId: ficha.id,
        usuarioId: req.user.id,
        tipoEvento: 'unirse',
        entidad: 'ficha',
        entidadId: ficha.id,
        descripcion: `Se unió como administrador a la ficha ${ficha.numero}`
      }
    });

    res.json({ 
      message: 'Te has unido a la ficha exitosamente',
      ficha: fichaActualizada 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error uniéndose a la ficha: ' + err.message });
  }
};

/**
 * Regenerar código de invitación de una ficha
 */
const regenerarCodigoFicha = async (req, res) => {
  try {
    const { fichaId } = req.params;

    // Verificar que la ficha existe y pertenece al admin
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId }
    });

    if (!ficha) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    if (ficha.administradorId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos sobre esta ficha' });
    }

    // Generar nuevo código
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Actualizar ficha
    const fichaActualizada = await prisma.ficha.update({
      where: { id: fichaId },
      data: { code: newCode }
    });

    // Registrar en historial
    await prisma.historialCambios.create({
      data: {
        fichaId,
        usuarioId: req.user.id,
        tipoEvento: 'regenerar_codigo',
        entidad: 'ficha',
        entidadId: fichaId,
        descripcion: `Regeneró el código de invitación de la ficha ${ficha.numero}`,
        datosAnteriores: { code: ficha.code },
        datosNuevos: { code: newCode }
      }
    });

    res.json({ 
      message: 'Código regenerado exitosamente',
      ficha: fichaActualizada 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error regenerando código: ' + err.message });
  }
};

/**
 * Actualizar información de una ficha
 */
const actualizarFicha = async (req, res) => {
  try {
    const { fichaId } = req.params;
    const { numero, nombre, nivel, centro, jornada, region, duracion } = req.body;

    // Verificar que la ficha existe y pertenece al admin
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId }
    });

    if (!ficha) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    if (ficha.administradorId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos sobre esta ficha' });
    }

    // Si se está cambiando el número, verificar que no exista otra ficha con ese número
    if (numero && numero !== ficha.numero) {
      const fichaExistente = await prisma.ficha.findUnique({
        where: { numero }
      });

      if (fichaExistente) {
        return res.status(400).json({ error: 'Ya existe una ficha con ese número' });
      }
    }

    // Actualizar ficha
    const fichaActualizada = await prisma.ficha.update({
      where: { id: fichaId },
      data: {
        numero: numero || ficha.numero,
        nombre: nombre || ficha.nombre,
        nivel: nivel || ficha.nivel,
        centro: centro || ficha.centro,
        jornada: jornada || ficha.jornada,
        region: region !== undefined ? region : ficha.region,
        duracion: duracion !== undefined ? duracion : ficha.duracion
      }
    });

    // Registrar en historial
    await prisma.historialCambios.create({
      data: {
        fichaId,
        usuarioId: req.user.id,
        tipoEvento: 'actualizar',
        entidad: 'ficha',
        entidadId: fichaId,
        descripcion: `Actualizó la información de la ficha ${ficha.numero}`,
        datosAnteriores: { numero: ficha.numero, nombre: ficha.nombre, nivel: ficha.nivel, centro: ficha.centro, jornada: ficha.jornada, region: ficha.region, duracion: ficha.duracion },
        datosNuevos: { numero, nombre, nivel, centro, jornada, region, duracion }
      }
    });

    res.json({ 
      message: 'Ficha actualizada exitosamente',
      ficha: fichaActualizada 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando ficha: ' + err.message });
  }
};

/**
 * Eliminar un aprendiz de una ficha
 */
const eliminarAprendizDeFicha = async (req, res) => {
  try {
    const { fichaId, aprendizId } = req.params;

    // Verificar que la ficha existe y pertenece al admin
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: {
        aprendices: {
          where: { id: aprendizId },
          select: { id: true, fullName: true }
        }
      }
    });

    if (!ficha) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    if (ficha.administradorId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos sobre esta ficha' });
    }

    if (ficha.aprendices.length === 0) {
      return res.status(404).json({ error: 'El aprendiz no pertenece a esta ficha' });
    }

    const aprendiz = ficha.aprendices[0];

    // Eliminar aprendiz de la ficha
    await prisma.ficha.update({
      where: { id: fichaId },
      data: {
        aprendices: {
          disconnect: { id: aprendizId }
        }
      }
    });

    // Registrar en historial
    await prisma.historialCambios.create({
      data: {
        fichaId,
        usuarioId: req.user.id,
        tipoEvento: 'eliminar_aprendiz',
        entidad: 'aprendiz',
        entidadId: aprendizId,
        descripcion: `Eliminó al aprendiz ${aprendiz.fullName} de la ficha ${ficha.numero}`
      }
    });

    res.json({ message: 'Aprendiz eliminado de la ficha exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando aprendiz: ' + err.message });
  }
};

module.exports = {
  getFichasAdmin,
  getFichaDetalle,
  crearFicha,
  unirseAFicha,
  regenerarCodigoFicha,
  actualizarFicha,
  eliminarAprendizDeFicha,
  cambiarLiderFicha,
  cambiarInstructorMateria,
  getInstructores,
  getAprendices,
  getFichasDeAprendiz,
  getFichasDeInstructor,
  getConflictosDeInstructor
};
