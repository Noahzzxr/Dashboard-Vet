const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tutoresRoutes = require('./routes/tutores.routes');
const petsRoutes = require('./routes/pets.routes');
const veterinariosRoutes = require('./routes/veterinarios.routes');
const consultasRoutes = require('./routes/consultas.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API da Clínica Veterinária funcionando!');
});

app.use('/tutores', tutoresRoutes);
app.use('/pets', petsRoutes);
app.use('/veterinarios', veterinariosRoutes);
app.use('/consultas', consultasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});