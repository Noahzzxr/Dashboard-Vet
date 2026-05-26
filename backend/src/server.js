const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
    quiet: true
});

const tutoresRoutes = require('./routes/tutores.routes');
const petsRoutes = require('./routes/pets.routes');
const veterinariosRoutes = require('./routes/veterinarios.routes');
const consultasRoutes = require('./routes/consultas.routes');

if (!Object.prototype.hasOwnProperty.call(process.env, 'PORT')) {
    console.warn('Variável PORT não encontrada no .env. Usando porta padrão 3000.');
}

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Recebendo requisição ${req.method} ${req.originalUrl}`);

    if (['POST', 'PUT'].includes(req.method)) {
        console.log('Dados recebidos:', req.body);
    }

    next();
});

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
