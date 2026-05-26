const express = require('express');
const router = express.Router();

const tutoresController = require('../controllers/tutoresController');

router.get('/', tutoresController.listarTutores);
router.post('/', tutoresController.criarTutor);
router.put('/:id', tutoresController.atualizarTutor);
router.delete('/:id', tutoresController.excluirTutor);

module.exports = router;