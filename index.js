import express from 'express';
import usuarioRoutes from './routes/usuario.routes.js';
import casalRoutes from './routes/casal.routes.js';
import { pool } from './db.js';  

const app = express();

app.use(express.json());

app.use('/usuarios', usuarioRoutes);
app.use('/casais', casalRoutes);

app.get('/', (_req, res) => {
    res.send('API rodando...');
});

app.get('/teste-db', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() AS agora');
        res.json({ sucesso: true, hora: rows[0].agora });
    } catch (error) {
        console.error('Erro ao conectar ao banco:', error);
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
