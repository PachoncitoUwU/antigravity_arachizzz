const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdministrador } = require('../middlewares/roleMiddleware');
const { isAdminDeFicha } = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(isAdministrador);

// =====================================================
// RUTAS DE FICHAS
// =====================================================

// Obtener todas las fichas del administrador
router.get('/fichas', adminController.getFichasAdmin);

// Crear una nueva ficha
router.post('/fichas', adminController.crearFicha);

// Unirse a una ficha con código
router.post('/join/:code', adminController.unirseAFicha);

// Obtener detalle de una ficha específica
router.get('/fichas/:fichaId', isAdminDeFicha, adminController.getFichaDetalle);

// Actualizar información de una ficha
router.put('/fichas/:fichaId', isAdminDeFicha, adminController.actualizarFicha);

// Regenerar código de invitación
router.post('/fichas/:fichaId/regenerate-code', isAdminDeFicha, adminController.regenerarCodigoFicha);

// Eliminar aprendiz de una ficha
router.delete('/fichas/:fichaId/aprendices/:aprendizId', isAdminDeFicha, adminController.eliminarAprendizDeFicha);

// Cambiar el líder de una ficha
router.put('/fichas/:fichaId/cambiar-lider', isAdminDeFicha, adminController.cambiarLiderFicha);

// =====================================================
// RUTAS DE MATERIAS
// =====================================================

// Cambiar el instructor de una materia
router.put('/materias/:materiaId/cambiar-instructor', adminController.cambiarInstructorMateria);

// =====================================================
// RUTAS DE USUARIOS
// =====================================================

// Obtener instructores (opcionalmente filtrado por fichaId)
router.get('/instructores', adminController.getInstructores);

// Obtener aprendices (opcionalmente filtrado por fichaId)
router.get('/aprendices', adminController.getAprendices);

// Obtener todas las fichas de un aprendiz
router.get('/aprendices/:aprendizId/fichas', adminController.getFichasDeAprendiz);

// Obtener todas las fichas de un instructor
router.get('/instructores/:instructorId/fichas', adminController.getFichasDeInstructor);

// Obtener conflictos de un instructor
router.get('/instructores/:instructorId/conflictos', adminController.getConflictosDeInstructor);

module.exports = router;
