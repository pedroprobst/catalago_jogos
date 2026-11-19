/**
 * =============================================================================
 * TRABALHO ACADÊMICO: PROGRAMAÇÃO WEB
 * SISTEMA: CATÁLOGO DE JOGOS & FÓRUM DE REVIEWS
 * CAMADA 2: BACK-END / SERVIDOR REST COM NODE.JS + EXPRESS + POSTGRESQL
 * =============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------------------------------------------
// 1. CONFIGURAÇÃO DA POOL DE CONEXÃO COM O POSTGRESQL
// -----------------------------------------------------------------------------
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'catalogo_jogos',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

pool.connect()
  .then((client) => {
    console.log('✅ [PostgreSQL] Conexão com o banco de dados realizada com sucesso!');
    client.release();
  })
  .catch((err) => {
    console.error('⚠️ [PostgreSQL] Atenção: Não foi possível conectar ao banco de dados.');
    console.error(`   Detalhe do erro: ${err.message}`);
    console.error('   -> Certifique-se de que o PostgreSQL está rodando e execute o script database.sql.');
  });

// -----------------------------------------------------------------------------
// 2. MIDDLEWARES GLOBAIS
// -----------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------------------------------
// 3. ROTAS DA API REST (RESPOSTAS ESTRITAMENTE EM JSON)
// -----------------------------------------------------------------------------

/**
 * GET /api/jogos
 * Descrição: Retorna a lista de jogos ordenados pelo ID decrescente.
 * Bônus: Suporta busca (?busca=termo) filtrando por título, gênero, sinopse ou plataforma.
 */
app.get('/api/jogos', async (req, res) => {
  try {
    const { busca } = req.query;

    let queryText = 'SELECT * FROM jogos ORDER BY id DESC';
    let queryParams = [];

    if (busca && busca.trim() !== '') {
      queryText = `
        SELECT * FROM jogos 
        WHERE titulo ILIKE $1 
           OR genero ILIKE $1 
           OR sinopse ILIKE $1 
           OR plataforma ILIKE $1
        ORDER BY id DESC
      `;
      queryParams = [`%${busca.trim()}%`];
    }

    const { rows } = await pool.query(queryText, queryParams);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar jogos:', error);
    return res.status(500).json({
      erro: 'Erro interno ao consultar o catálogo de jogos.',
      detalhes: error.message
    });
  }
});

/**
 * GET /api/jogos/:id
 * Descrição: Retorna os dados completos de um jogo pelo ID (para modal de detalhes ou edição).
 */
app.get('/api/jogos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumerico = parseInt(id, 10);

    if (isNaN(idNumerico) || idNumerico <= 0) {
      return res.status(400).json({ erro: 'ID inválido. Deve ser um número inteiro positivo.' });
    }

    const { rows } = await pool.query('SELECT * FROM jogos WHERE id = $1', [idNumerico]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: `Jogo com ID ${idNumerico} não foi encontrado.` });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar jogo com ID ${req.params.id}:`, error);
    return res.status(500).json({
      erro: 'Erro interno ao consultar os dados do jogo.',
      detalhes: error.message
    });
  }
});

/**
 * POST /api/jogos
 * Descrição: Cadastra um novo jogo no banco de dados.
 * Valida: titulo, genero, imagem, sinopse, plataforma, preco, avaliacao.
 */
app.post('/api/jogos', async (req, res) => {
  try {
    const { titulo, genero, imagem, sinopse, comentarios, plataforma, preco, avaliacao } = req.body;

    // Validação de campos de texto obrigatórios
    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O campo "titulo" é obrigatório e não pode ser vazio.' });
    }
    if (!genero || typeof genero !== 'string' || genero.trim() === '') {
      return res.status(400).json({ erro: 'O campo "genero" é obrigatório e não pode ser vazio.' });
    }
    if (!imagem || typeof imagem !== 'string' || imagem.trim() === '') {
      return res.status(400).json({ erro: 'O campo "imagem" (URL) é obrigatório e não pode ser vazio.' });
    }
    if (!sinopse || typeof sinopse !== 'string' || sinopse.trim() === '') {
      return res.status(400).json({ erro: 'O campo "sinopse" é obrigatório e não pode ser vazio.' });
    }
    if (!plataforma || typeof plataforma !== 'string' || plataforma.trim() === '') {
      return res.status(400).json({ erro: 'O campo "plataforma" é obrigatório e não pode ser vazio.' });
    }

    // Validação numérica de Preço
    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) {
      return res.status(400).json({ erro: 'O campo "preco" deve ser um número válido maior ou igual a zero.' });
    }

    // Validação numérica de Avaliação (de 0.0 a 5.0)
    const avaliacaoNum = parseFloat(avaliacao);
    if (isNaN(avaliacaoNum) || avaliacaoNum < 0 || avaliacaoNum > 5) {
      return res.status(400).json({ erro: 'O campo "avaliacao" deve ser um número entre 0.0 e 5.0.' });
    }

    const queryText = `
      INSERT INTO jogos (titulo, genero, imagem, sinopse, comentarios, plataforma, preco, avaliacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      titulo.trim(),
      genero.trim(),
      imagem.trim(),
      sinopse.trim(),
      comentarios ? comentarios.trim() : null,
      plataforma.trim(),
      precoNum,
      avaliacaoNum
    ];

    const { rows } = await pool.query(queryText, values);

    return res.status(201).json({
      mensagem: 'Jogo cadastrado com sucesso!',
      jogo: rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar jogo:', error);
    return res.status(500).json({
      erro: 'Erro interno ao tentar salvar o jogo no banco de dados.',
      detalhes: error.message
    });
  }
});

/**
 * PUT /api/jogos/:id
 * Descrição: Atualiza os dados de um jogo existente pelo ID.
 */
app.put('/api/jogos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumerico = parseInt(id, 10);

    if (isNaN(idNumerico) || idNumerico <= 0) {
      return res.status(400).json({ erro: 'ID inválido para atualização.' });
    }

    const { titulo, genero, imagem, sinopse, comentarios, plataforma, preco, avaliacao } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O campo "titulo" é obrigatório.' });
    }
    if (!genero || typeof genero !== 'string' || genero.trim() === '') {
      return res.status(400).json({ erro: 'O campo "genero" é obrigatório.' });
    }
    if (!imagem || typeof imagem !== 'string' || imagem.trim() === '') {
      return res.status(400).json({ erro: 'O campo "imagem" (URL) é obrigatório.' });
    }
    if (!sinopse || typeof sinopse !== 'string' || sinopse.trim() === '') {
      return res.status(400).json({ erro: 'O campo "sinopse" é obrigatório.' });
    }
    if (!plataforma || typeof plataforma !== 'string' || plataforma.trim() === '') {
      return res.status(400).json({ erro: 'O campo "plataforma" é obrigatório.' });
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) {
      return res.status(400).json({ erro: 'O campo "preco" deve ser um valor numérico válido maior ou igual a zero.' });
    }

    const avaliacaoNum = parseFloat(avaliacao);
    if (isNaN(avaliacaoNum) || avaliacaoNum < 0 || avaliacaoNum > 5) {
      return res.status(400).json({ erro: 'O campo "avaliacao" deve ser uma nota entre 0.0 e 5.0.' });
    }

    const queryText = `
      UPDATE jogos
      SET titulo = $1, genero = $2, imagem = $3, sinopse = $4, comentarios = $5,
          plataforma = $6, preco = $7, avaliacao = $8
      WHERE id = $9
      RETURNING *
    `;
    const values = [
      titulo.trim(),
      genero.trim(),
      imagem.trim(),
      sinopse.trim(),
      comentarios ? comentarios.trim() : null,
      plataforma.trim(),
      precoNum,
      avaliacaoNum,
      idNumerico
    ];

    const { rows, rowCount } = await pool.query(queryText, values);

    if (rowCount === 0) {
      return res.status(404).json({ erro: `Jogo com ID ${idNumerico} não encontrado para atualização.` });
    }

    return res.status(200).json({
      mensagem: 'Jogo atualizado com sucesso!',
      jogo: rows[0]
    });
  } catch (error) {
    console.error(`Erro ao atualizar jogo com ID ${req.params.id}:`, error);
    return res.status(500).json({
      erro: 'Erro interno ao atualizar os dados do jogo.',
      detalhes: error.message
    });
  }
});

/**
 * DELETE /api/jogos/:id
 * Descrição: Remove um jogo do banco de dados pelo ID.
 */
app.delete('/api/jogos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumerico = parseInt(id, 10);

    if (isNaN(idNumerico) || idNumerico <= 0) {
      return res.status(400).json({ erro: 'ID inválido para exclusão.' });
    }

    const { rows, rowCount } = await pool.query('DELETE FROM jogos WHERE id = $1 RETURNING *', [idNumerico]);

    if (rowCount === 0) {
      return res.status(404).json({ erro: `Jogo com ID ${idNumerico} não encontrado para exclusão.` });
    }

    return res.status(200).json({
      mensagem: 'Jogo excluído com sucesso!',
      jogoRemovido: rows[0]
    });
  } catch (error) {
    console.error(`Erro ao deletar jogo com ID ${req.params.id}:`, error);
    return res.status(500).json({
      erro: 'Erro interno ao excluir o jogo.',
      detalhes: error.message
    });
  }
});

// -----------------------------------------------------------------------------
// 4. TRATAMENTO DE ROTAS NÃO ENCONTRADAS & ERROS GLOBAIS
// -----------------------------------------------------------------------------
app.use('/api/*', (req, res) => {
  return res.status(404).json({
    erro: `A rota [${req.method}] ${req.originalUrl} não foi encontrada no servidor.`
  });
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado na aplicação:', err);
  return res.status(500).json({
    erro: 'Ocorreu um erro inesperado no servidor.',
    detalhes: err.message
  });
});

// -----------------------------------------------------------------------------
// 5. INICIALIZAÇÃO DO SERVIDOR LOCAL
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor backend rodando com sucesso!`);
  console.log(`📡 URL Principal: http://localhost:${PORT}`);
  console.log(`📄 API REST:     http://localhost:${PORT}/api/jogos`);
  console.log(`🌐 Aplicação Web: http://localhost:${PORT}/`);
  console.log(`=======================================================`);
});
