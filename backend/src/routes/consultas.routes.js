const express = require('express');
const router = express.Router();

const consultasController = require('../controllers/consultasController');

router.get('/', consultasController.listarConsultas);
router.post('/', consultasController.criarConsulta);
router.put('/:id', consultasController.atualizarConsulta);
router.delete('/:id', consultasController.excluirConsulta);

module.exports = router;