# 🎮 GameVault — Catálogo de Jogos & Fórum de Reviews

> **Trabalho Acadêmico de Programação Web**  
> Sistema completo em arquitetura de três camadas para gerenciamento, visualização detalhada e discussão de jogos, com persistência relacional em PostgreSQL e consumo assíncrono via API REST em JSON.

---

## 👥 Identificação do Projeto
- **Instituição / Curso:** Bacharelado em Sistemas de Informação 
- **Disciplina:** Programação Web
- **Nome do Projeto:** Catálogo de Jogos
- **Integrantes do Grupo:**
  **PEDRO DANIEL GODINHO PROBST - MAT. 2023009207**
---

## 🏛️ Arquitetura em Três Camadas

O sistema foi rigorosamente desenvolvido sem dados fixos no HTML e sem depender de APIs externas de terceiros:

1. **Camada 1 — Apresentação (Front-end):**
   - Construída exclusivamente com **HTML5 semântico, CSS3 moderno (Flexbox e Grid)** e **JavaScript puro (Vanilla JS)**.
   - Comunicação 100% assíncrona com o servidor utilizando a **`fetch` API** nativa (`GET`, `POST`, `PUT`, `DELETE`).
   - **Janela Modal de Detalhes Interativa:** ao clicar no card de qualquer jogo, busca os dados em tempo real via `GET /api/jogos/:id` e exibe título, capa, gênero, plataforma, preço formatado em Real (`R$`), avaliação por estrelas (0 a 5), sinopse e reviews.
   - Suporte a fechamento de modais via botão `X`, clique fora da janela ou tecla `Esc`.
   - Atualizações reativas no DOM sem recarregar a página (*Single Page Experience*).
   - Validações visuais nos formulários e tratamento de erros de imagem em tempo de execução.

2. **Camada 2 — Aplicação / Negócio (Back-end):**
   - Servidor local desenvolvido em **Node.js** com o framework **Express**, operando na porta `3000` (`http://localhost:3000`).
   - Habilitação de **CORS** (`cors`) e parser nativo de JSON (`express.json()`).
   - Servidor de arquivos estáticos apontando para a pasta `public/`.
   - Tratamento preventivo com blocos `try/catch` em todas as rotas para garantir que o servidor nunca caia por requisições inválidas ou IDs inexistentes.

3. **Camada 3 — Dados / Persistência (Banco de Dados):**
   - **PostgreSQL** com o driver oficial `pg` (*node-postgres*), utilizando uma `Pool` de conexões para alto desempenho e reuso eficiente de conexões.
   - Persistência definitiva de dados no disco através da tabela relacional `jogos` com tipos específicos:
     - `id`: `SERIAL PRIMARY KEY`
     - `titulo`: `VARCHAR(100) NOT NULL`
     - `genero`: `VARCHAR(50) NOT NULL`
     - `imagem`: `TEXT NOT NULL`
     - `sinopse`: `TEXT NOT NULL`
     - `comentarios`: `TEXT`
     - `plataforma`: `VARCHAR(100) NOT NULL DEFAULT 'PC'`
     - `preco`: `NUMERIC(10, 2) NOT NULL DEFAULT 0.00`
     - `avaliacao`: `NUMERIC(3, 1) NOT NULL DEFAULT 5.0 CHECK (avaliacao >= 0 AND avaliacao <= 5)`

---

## 📁 Estrutura de Pastas e Arquivos

```text
catalogo_jogos/
├── .env.example          # Exemplo de configuração das variáveis de ambiente
├── .env                  # Arquivo com as credenciais locais do PostgreSQL
├── database.sql          # Script DDL (CREATE TABLE), migração e Seed com 12 jogos
├── package.json          # Manifesto do Node.js com dependências e scripts
├── server.js             # Código do servidor Express, rotas da API e pool PG
├── README.md             # Documentação acadêmica do projeto
└── public/               # Camada de Front-end (arquivos estáticos)
    ├── index.html        # Estrutura semântica, formulários e modais (detalhes e edição)
    ├── style.css         # Estilização completa (tema dark gaming responsivo)
    └── script.js         # Lógica Vanilla JS com fetch assíncrono e modal de detalhes
```

---

## 🚀 Passo a Passo para Configuração e Execução

### Pré-requisitos
- **Node.js** (versão 16.x ou superior recomendada): [nodejs.org](https://nodejs.org/)
- **PostgreSQL** (versão 12.x ou superior): [postgresql.org](https://www.postgresql.org/)

---

### Passo 1: Configuração do Banco de Dados PostgreSQL

1. Abra o **pgAdmin** ou o terminal **psql**.
2. Conecte-se ao seu servidor PostgreSQL local e crie a base de dados:
   ```sql
   CREATE DATABASE catalogo_jogos;
   ```
3. Conecte-se ao banco `catalogo_jogos`:
   ```sql
   \c catalogo_jogos;
   ```
4. Abra e execute o arquivo [`database.sql`] localizado na raiz do projeto.  
   *Dica no terminal:*
   ```bash
   psql -U postgres -d catalogo_jogos -f database.sql
   ```
   *Ou no pgAdmin:* Abra a ferramenta **Query Tool** selecionando o banco `catalogo_jogos`, cole o conteúdo de `database.sql` e execute (F5).

O script cria a tabela `jogos` (com suporte a migração automática via `ADD COLUMN IF NOT EXISTS`) e insere 12 jogos populares completos com preços, plataformas e avaliações.

---

### Passo 2: Configuração das Variáveis de Ambiente

Na raiz do projeto, verifique o arquivo `.env`:
```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=catalogo_jogos
```
> **Nota:** Ajuste `DB_PASSWORD` caso a sua senha local do PostgreSQL seja diferente de `postgres`.

---

### Passo 3: Instalação das Dependências

No terminal do seu computador (PowerShell ou Prompt de Comando), dentro da pasta do projeto, execute:
```bash
npm install
```

---

### Passo 4: Execução do Servidor

Inicie o servidor Node.js:
```bash
node server.js
```
*Ou:*
```bash
npm start
```

Mensagem esperada no terminal:
```text
=======================================================
🚀 Servidor backend rodando com sucesso!
📡 URL Principal: http://localhost:3000
📄 API REST:     http://localhost:3000/api/jogos
🌐 Aplicação Web: http://localhost:3000/
=======================================================
✅ [PostgreSQL] Conexão com o banco de dados realizada com sucesso!
```

---

### Passo 5: Acesso à Aplicação Web

Abra o seu navegador:
👉 **`http://localhost:3000`**

O catálogo carregará dinamicamente via `fetch` do PostgreSQL!

---

## 📡 Documentação das Rotas da API REST

Todas as respostas são emitidas estritamente no formato `application/json`.

| Método | Endpoint | Descrição | Status Sucesso | Status Erro |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/jogos` | Retorna todos os jogos cadastrados no banco | `200 OK` | `500 Internal Error` |
| **GET** | `/api/jogos?busca={termo}` | *(Bônus)* Filtra jogos por título, gênero, sinopse ou plataforma | `200 OK` | `500 Internal Error` |
| **GET** | `/api/jogos/:id` | Retorna os detalhes completos de um jogo pelo ID (usado no modal de detalhes) | `200 OK` | `400 Bad Request` / `404 Not Found` |
| **POST** | `/api/jogos` | Cadastra um novo jogo no catálogo | `201 Created` | `400 Bad Request` / `500 Internal Error` |
| **PUT** | `/api/jogos/:id` | Atualiza os dados de um jogo existente pelo ID | `200 OK` | `400 Bad Request` / `404 Not Found` |
| **DELETE**| `/api/jogos/:id` | Remove permanentemente um jogo do catálogo | `200 OK` | `400 Bad Request` / `404 Not Found` |

---

### Exemplos de Requisição e Resposta da API

#### 1. Cadastrar Jogo (`POST /api/jogos`)
**Corpo da Requisição (JSON):**
```json
{
  "titulo": "Baldur's Gate 3",
  "genero": "RPG / Estratégia",
  "plataforma": "PC, PS5, Xbox Series X|S",
  "preco": 199.99,
  "avaliacao": 4.9,
  "imagem": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
  "sinopse": "Reúna seu grupo e retorne aos Reinos Esquecidos em uma história de companheirismo e traição.",
  "comentarios": "Um dos RPGs mais profundos e premiados da história dos videogames. Nota máxima!"
}
```

**Resposta de Sucesso (`201 Created`):**
```json
{
  "mensagem": "Jogo cadastrado com sucesso!",
  "jogo": {
    "id": 13,
    "titulo": "Baldur's Gate 3",
    "genero": "RPG / Estratégia",
    "plataforma": "PC, PS5, Xbox Series X|S",
    "preco": "199.99",
    "avaliacao": "4.9",
    "imagem": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    "sinopse": "Reúna seu grupo e retorne aos Reinos Esquecidos em uma história de companheirismo e traição.",
    "comentarios": "Um dos RPGs mais profundos e premiados da história dos videogames. Nota máxima!"
  }
}
```

---

#### 2. Consultar Detalhes de um Jogo (`GET /api/jogos/:id`)
**Resposta de Sucesso (`200 OK`):**
```json
{
  "id": 1,
  "titulo": "The Witcher 3: Wild Hunt",
  "genero": "RPG de Ação",
  "imagem": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
  "sinopse": "Você é Geralt de Rívia, um mercenário caçador de monstros...",
  "comentarios": "Review da Comunidade: Uma obra-prima narrativa com missões secundárias riquíssimas.",
  "plataforma": "PC, PS5, Xbox Series X|S, Switch",
  "preco": "129.90",
  "avaliacao": "4.9"
}
```

---

#### 3. Excluir Jogo (`DELETE /api/jogos/:id`)
**Resposta de Sucesso (`200 OK`):**
```json
{
  "mensagem": "Jogo excluído com sucesso!",
  "jogoRemovido": {
    "id": 1,
    "titulo": "The Witcher 3: Wild Hunt"
  }
}
```

---

## 🛡️ Checklist dos Requisitos Atendidos

- [x] **Arquitetura 3 Camadas Estrita:** Front-end (Vanilla), Back-end (Express), Banco (PostgreSQL).
- [x] **Sem frameworks no Front-end:** Apenas HTML5, CSS3 e JavaScript puro com `fetch`.
- [x] **Sem dados fixos no HTML:** Todos os cards são criados dinamicamente no cliente a partir do JSON da API.
- [x] **Janela Modal de Detalhes:** Ao clicar no card, busca os dados via `GET /api/jogos/:id` e exibe título, capa, gênero, plataforma, preço em R$, avaliação por estrelas, sinopse e reviews.
- [x] **Fechamento de Modais Aprimorado:** Botão `X`, clique no fundo escuro e tecla `Esc`.
- [x] **Proteção de Eventos nos Botões:** Clicar em "Editar" ou "Excluir" executa suas respectivas funções sem disparar a abertura indevida do modal de detalhes.
- [x] **Campos `plataforma`, `preco` e `avaliacao`:** Totalmente integrados no banco, servidor, formulário de cadastro, formulário de edição e cards.
- [x] **Persistência Relacional em PostgreSQL:** Tabela criada com tipos ideais e script de migração segura.
- [x] **Seed Inicial:** Script SQL com 12 jogos famosos cadastrados com todos os dados preenchidos.
- [x] **CRUD Completo via REST:** `GET`, `GET :id`, `POST`, `PUT`, `DELETE` implementados com tratamento de exceções `try/catch`.
- [x] **Atualização Instantânea da Interface:** Adição, edição e exclusão refletidas em tempo real no DOM sem recarregar a página.
- [x] **Barra de Busca e Filtro por Gênero:** Filtro textual e por categorias em tempo real.
