const path = require('path');
const mysql = require('mysql2');
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
    quiet: true
});

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter((envName) => {
    return !Object.prototype.hasOwnProperty.call(process.env, envName);
});

if (missingEnvVars.length > 0) {
    throw new Error(`Variáveis de ambiente ausentes: ${missingEnvVars.join(', ')}`);
}

console.log('Tentando conectar ao MySQL...');
console.log(`Banco configurado: ${process.env.DB_NAME} em ${process.env.DB_HOST}:${process.env.DB_PORT}`);

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

connection.getConnection((error, dbConnection) => {
    if (error) {
        console.error('Erro ao conectar ao MySQL:', error.message);
        return;
    }

    console.log('Conectado ao banco MySQL!');
    dbConnection.release();
});

module.exports = connection;
