const express = require('express');
const router = express.Router();

const petsController = require('../controllers/petsController');

router.get('/', petsController.listarPets);
router.post('/', petsController.criarPet);
router.put('/:id', petsController.atualizarPet);
router.delete('/:id', petsController.excluirPet);

module.exports = router;