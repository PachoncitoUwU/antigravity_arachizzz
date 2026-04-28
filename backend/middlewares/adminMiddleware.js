const prisma = require('../lib/prisma');

/**
 * Middleware para verificar que el usuario es administrador de una ficha específica
 * Uso: adminMiddleware.isAdminDeFicha
 * Requiere que el parámetro fichaId esté en req.params o req.body
 */
const isAdminDeFicha = async (req, res, next) => {
  try {
    // Verificar que el usuario es administrador
    if (!req.user || req.user.userType !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener fichaId de params o body
    const fichaId = req.params.fichaId || req.body.fichaId;
    
    if (!fichaId) {
      return res.status(400).json({ error: 'ID de ficha no proporcionado' });
    }

    // Verificar que la ficha existe y que el usuario es administrador de esa ficha
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      select: { administradorId: true }
    });

    if (!ficha) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    if (ficha.administradorId !== req.user.id) {
      return res.status(403).json({ error: 'No eres administrador de esta ficha' });
    }

    // Usuario es administrador de la ficha, continuar
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error verificando permisos: ' + err.message });
  }
};

/**
 * Middleware para verificar que el usuario es administrador de alguna de las fichas del sistema
 * Útil para rutas que muestran lista de fichas del administrador
 */
const tieneAlgunaFicha = async (req, res, next) => {
  try {
    if (!req.user || req.user.userType !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const fichasCount = await prisma.ficha.count({
      where: { administradorId: req.user.id }
    });

    if (fichasCount === 0) {
      return res.status(403).json({ error: 'No tienes fichas asignadas' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Error verificando fichas: ' + err.message });
  }
};

/**
 * Middleware para verificar que el usuario es administrador O líder de una ficha
 * Útil para funcionalidades que pueden hacer tanto admins como líderes
 */
const isAdminOLiderDeFicha = async (req, res, next) => {
  try {
    const fichaId = req.params.fichaId || req.body.fichaId;
    
    if (!fichaId) {
      return res.status(400).json({ error: 'ID de ficha no proporcionado' });
    }

    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      select: { 
        administradorId: true,
        instructorAdminId: true 
      }
    });

    if (!ficha) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    // Verificar si es administrador de la ficha
    const esAdmin = req.user.userType === 'administrador' && ficha.administradorId === req.user.id;
    
    // Verificar si es líder (instructor admin) de la ficha
    const esLider = req.user.userType === 'instructor' && ficha.instructorAdminId === req.user.id;

    if (!esAdmin && !esLider) {
      return res.status(403).json({ error: 'No tienes permisos sobre esta ficha' });
    }

    // Agregar información útil al request
    req.esAdministrador = esAdmin;
    req.esLider = esLider;

    next();
  } catch (err) {
    res.status(500).json({ error: 'Error verificando permisos: ' + err.message });
  }
};

module.exports = {
  isAdminDeFicha,
  tieneAlgunaFicha,
  isAdminOLiderDeFicha
};
