const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getRespuestasRapidas,
  createRespuestaRapida,
  updateRespuestaRapida,
  deleteRespuestaRapida,
  reordenarRespuestas,
  restaurarDefecto
} = require('../controllers/respuestaRapidaController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', getRespuestasRapidas);
router.post('/', createRespuestaRapida);
router.put('/reordenar', reordenarRespuestas);
router.post('/restaurar', restaurarDefecto);
router.put('/:id', updateRespuestaRapida);
router.delete('/:id', deleteRespuestaRapida);

module.exports = router;
