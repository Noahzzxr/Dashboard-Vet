const express = require('express');
const router = express.Router();

const veterinariosController = require('../controllers/veterinariosController');

router.get('/', veterinariosController.listarVeterinarios);
router.post('/', veterinariosController.criarVeterinario);
router.put('/:id', veterinariosController.atualizarVeterinario);
router.delete('/:id', veterinariosController.excluirVeterinario);

module.exports = router;