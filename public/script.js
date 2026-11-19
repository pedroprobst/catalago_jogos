/**
 * =============================================================================
 * TRABALHO ACADÊMICO: PROGRAMAÇÃO WEB
 * SISTEMA: CATÁLOGO DE JOGOS & FÓRUM DE REVIEWS
 * CAMADA 1: FRONT-END (VANILLA JAVASCRIPT & FETCH API)
 * =============================================================================
 */

const API_BASE_URL = '/api/jogos';

// Imagem padrão caso a URL informada esteja quebrada ou indisponível
const PLACEHOLDER_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect fill='%231b2230' width='400' height='220'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🎮 Imagem Indisponível%3C/text%3E%3C/svg%3E";

// Cache local da lista de jogos carregados
let listaJogosLocal = [];

// =============================================================================
// ELEMENTOS DO DOM
// =============================================================================
const gridJogos = document.getElementById('grid-jogos');
const emptyState = document.getElementById('empty-state');
const contadorResultados = document.getElementById('contador-resultados');
const totalJogosBadge = document.getElementById('total-jogos-badge');
const totalGenerosBadge = document.getElementById('total-generos-badge');

// Elementos de Busca e Filtro
const campoBusca = document.getElementById('campo-busca');
const btnLimparBusca = document.getElementById('btn-limpar-busca');
const filtroGenero = document.getElementById('filtro-genero');
const btnRecarregar = document.getElementById('btn-recarregar');

// Formulário de Cadastro
const formCadastro = document.getElementById('form-cadastro-jogo');
const btnSubmitCad = document.getElementById('btn-submit-cad');

// Modal de Detalhes
const modalDetalhes = document.getElementById('modal-detalhes');
const btnFecharDetalhes = document.getElementById('btn-fechar-detalhes');
const btnFecharDetalhesFooter = document.getElementById('btn-fechar-detalhes-footer');

// Modal e Formulário de Edição
const modalEdicao = document.getElementById('modal-edicao');
const formEdicao = document.getElementById('form-editar-jogo');
const btnFecharModalEdicao = document.getElementById('btn-fechar-modal-edicao');
const btnCancelarModalEdicao = document.getElementById('btn-cancelar-modal-edicao');

// Container de Notificações
const toastContainer = document.getElementById('toast-container');

// =============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  carregarJogos();
  configurarEventos();
});

function configurarEventos() {
  // Submissão dos Formulários
  formCadastro.addEventListener('submit', cadastrarJogo);
  formEdicao.addEventListener('submit', atualizarJogo);

  // Fechamento do Modal de Detalhes
  btnFecharDetalhes.addEventListener('click', fecharModalDetalhes);
  btnFecharDetalhesFooter.addEventListener('click', fecharModalDetalhes);
  modalDetalhes.addEventListener('click', (e) => {
    if (e.target === modalDetalhes) fecharModalDetalhes();
  });

  // Fechamento do Modal de Edição
  btnFecharModalEdicao.addEventListener('click', fecharModalEdicao);
  btnCancelarModalEdicao.addEventListener('click', fecharModalEdicao);
  modalEdicao.addEventListener('click', (e) => {
    if (e.target === modalEdicao) fecharModalEdicao();
  });

  // Fechamento de Modais com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      fecharModalDetalhes();
      fecharModalEdicao();
    }
  });

  // Busca Dinâmica com Debounce
  let timeoutBusca = null;
  campoBusca.addEventListener('input', () => {
    const termo = campoBusca.value.trim();
    btnLimparBusca.style.display = termo !== '' ? 'block' : 'none';

    clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(() => {
      carregarJogos(termo);
    }, 300);
  });

  // Limpar Busca
  btnLimparBusca.addEventListener('click', () => {
    campoBusca.value = '';
    btnLimparBusca.style.display = 'none';
    carregarJogos();
  });

  // Filtro por Gênero
  filtroGenero.addEventListener('change', () => {
    filtrarJogosPorGenero(filtroGenero.value);
  });

  // Botão de Recarregar
  btnRecarregar.addEventListener('click', () => {
    campoBusca.value = '';
    btnLimparBusca.style.display = 'none';
    filtroGenero.value = '';
    carregarJogos();
  });
}

// =============================================================================
// FUNÇÕES DE COMUNICAÇÃO COM O SERVIDOR (FETCH API)
// =============================================================================

/**
 * 1. GET /api/jogos
 * Busca a lista de jogos do banco, com suporte a busca textual
 */
async function carregarJogos(termoBusca = '') {
  try {
    contadorResultados.textContent = 'Carregando jogos...';

    let url = API_BASE_URL;
    if (termoBusca) {
      url += `?busca=${encodeURIComponent(termoBusca)}`;
    }

    const resposta = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!resposta.ok) {
      const erroJson = await resposta.json().catch(() => ({}));
      throw new Error(erroJson.erro || `Falha na requisição: Status ${resposta.status}`);
    }

    const jogos = await resposta.json();
    listaJogosLocal = jogos;

    atualizarOpcoesGeneros(jogos);
    atualizarEstatisticas(jogos);
    renderizarCards(jogos);
  } catch (erro) {
    console.error('Erro ao carregar catálogo de jogos:', erro);
    mostrarNotificacao(`Não foi possível carregar os jogos: ${erro.message}`, 'error');
    contadorResultados.textContent = 'Erro ao carregar dados.';
    gridJogos.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">⚠️</div>
        <h4>Falha de Conexão com o Servidor</h4>
        <p>Certifique-se de que o backend Node.js e o PostgreSQL estão em execução na porta 3000.</p>
      </div>
    `;
  }
}

/**
 * 2. GET /api/jogos/:id (Nova Feature: Janela Modal de Detalhes ao Clicar no Jogo)
 * Busca os dados atualizados do jogo via fetch e exibe no modal
 */
async function abrirModalDetalhes(id) {
  try {
    const resposta = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!resposta.ok) {
      const erroJson = await resposta.json().catch(() => ({}));
      throw new Error(erroJson.erro || 'Não foi possível carregar os detalhes do jogo.');
    }

    const jogo = await resposta.json();

    // Preenche os dados no modal de detalhes
    document.getElementById('detalhes-titulo').textContent = jogo.titulo;
    document.getElementById('detalhes-genero').textContent = jogo.genero;
    document.getElementById('detalhes-id').textContent = `#${jogo.id}`;
    document.getElementById('detalhes-plataforma').textContent = jogo.plataforma || 'PC / Consoles';

    const precoFormatado = formatarPreco(jogo.preco);
    const precoEl = document.getElementById('detalhes-preco');
    precoEl.textContent = precoFormatado;
    if (parseFloat(jogo.preco) === 0) {
      precoEl.classList.add('free');
    } else {
      precoEl.classList.remove('free');
    }

    // Renderização visual de estrelas
    document.getElementById('detalhes-estrelas').innerHTML = gerarHTMLAvaliacao(jogo.avaliacao);

    const imgEl = document.getElementById('detalhes-imagem');
    imgEl.src = jogo.imagem || PLACEHOLDER_IMG;
    imgEl.alt = `Capa de ${jogo.titulo}`;
    imgEl.onerror = () => { imgEl.src = PLACEHOLDER_IMG; };

    document.getElementById('detalhes-sinopse').textContent = jogo.sinopse;

    const comentariosEl = document.getElementById('detalhes-comentarios');
    comentariosEl.textContent = jogo.comentarios
      ? `"${jogo.comentarios}"`
      : 'Sem comentários ou análises adicionadas pela comunidade até o momento.';

    modalDetalhes.style.display = 'flex';
  } catch (erro) {
    console.error('Erro ao abrir detalhes:', erro);
    mostrarNotificacao(erro.message, 'error');
  }
}

function fecharModalDetalhes() {
  modalDetalhes.style.display = 'none';
}

/**
 * 3. POST /api/jogos
 * Cadastra um novo jogo com todos os campos obrigatórios
 */
async function cadastrarJogo(event) {
  event.preventDefault();

  const tituloInput = document.getElementById('cad-titulo');
  const generoInput = document.getElementById('cad-genero');
  const plataformaInput = document.getElementById('cad-plataforma');
  const precoInput = document.getElementById('cad-preco');
  const avaliacaoInput = document.getElementById('cad-avaliacao');
  const imagemInput = document.getElementById('cad-imagem');
  const sinopseInput = document.getElementById('cad-sinopse');
  const comentariosInput = document.getElementById('cad-comentarios');

  limparErrosVisuais('cad');

  let temErro = false;
  if (!tituloInput.value.trim()) {
    mostrarErroCampo('cad-titulo', 'Por favor, informe o título do jogo.');
    temErro = true;
  }
  if (!generoInput.value.trim()) {
    mostrarErroCampo('cad-genero', 'Por favor, informe o gênero do jogo.');
    temErro = true;
  }
  if (!plataformaInput.value.trim()) {
    mostrarErroCampo('cad-plataforma', 'Por favor, informe as plataformas disponíveis.');
    temErro = true;
  }
  if (precoInput.value === '' || parseFloat(precoInput.value) < 0) {
    mostrarErroCampo('cad-preco', 'Informe um preço válido (0 ou superior).');
    temErro = true;
  }
  const avaliacaoVal = parseFloat(avaliacaoInput.value);
  if (isNaN(avaliacaoVal) || avaliacaoVal < 0 || avaliacaoVal > 5) {
    mostrarErroCampo('cad-avaliacao', 'A avaliação deve ser entre 0.0 e 5.0.');
    temErro = true;
  }
  if (!imagemInput.value.trim()) {
    mostrarErroCampo('cad-imagem', 'Por favor, forneça uma URL válida para a imagem.');
    temErro = true;
  }
  if (!sinopseInput.value.trim()) {
    mostrarErroCampo('cad-sinopse', 'Por favor, escreva a sinopse do jogo.');
    temErro = true;
  }

  if (temErro) return;

  const payload = {
    titulo: tituloInput.value.trim(),
    genero: generoInput.value.trim(),
    plataforma: plataformaInput.value.trim(),
    preco: parseFloat(precoInput.value),
    avaliacao: avaliacaoVal,
    imagem: imagemInput.value.trim(),
    sinopse: sinopseInput.value.trim(),
    comentarios: comentariosInput.value.trim() || null
  };

  btnSubmitCad.disabled = true;
  btnSubmitCad.querySelector('.btn-text').textContent = 'Cadastrando...';

  try {
    const resposta = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Falha ao cadastrar o jogo.');
    }

    mostrarNotificacao('Jogo cadastrado com sucesso!', 'success');
    formCadastro.reset();

    // Insere o jogo novo no topo da lista local e renderiza imediatamente sem recarregar a página
    if (dados.jogo) {
      listaJogosLocal.unshift(dados.jogo);
      atualizarOpcoesGeneros(listaJogosLocal);
      atualizarEstatisticas(listaJogosLocal);
      renderizarCards(listaJogosLocal);
    } else {
      carregarJogos();
    }

    document.querySelector('.catalog-section').scrollIntoView({ behavior: 'smooth' });

  } catch (erro) {
    console.error('Erro ao salvar novo jogo:', erro);
    mostrarNotificacao(erro.message, 'error');
  } finally {
    btnSubmitCad.disabled = false;
    btnSubmitCad.querySelector('.btn-text').textContent = 'Publicar Jogo no Catálogo';
  }
}

/**
 * 4. GET /api/jogos/:id (para Edição)
 * Abre o modal de edição preenchido com os dados atuais
 */
async function abrirModalEdicao(id) {
  try {
    const resposta = await fetch(`${API_BASE_URL}/${id}`);
    if (!resposta.ok) {
      const erroJson = await resposta.json().catch(() => ({}));
      throw new Error(erroJson.erro || 'Não foi possível carregar os dados para edição.');
    }

    const jogo = await resposta.json();

    document.getElementById('edit-id').value = jogo.id;
    document.getElementById('edit-titulo').value = jogo.titulo;
    document.getElementById('edit-genero').value = jogo.genero;
    document.getElementById('edit-plataforma').value = jogo.plataforma || '';
    document.getElementById('edit-preco').value = parseFloat(jogo.preco) || 0;
    document.getElementById('edit-avaliacao').value = parseFloat(jogo.avaliacao) || 5;
    document.getElementById('edit-imagem').value = jogo.imagem;
    document.getElementById('edit-sinopse').value = jogo.sinopse;
    document.getElementById('edit-comentarios').value = jogo.comentarios || '';

    limparErrosVisuais('edit');
    modalEdicao.style.display = 'flex';
  } catch (erro) {
    console.error('Erro ao abrir edição:', erro);
    mostrarNotificacao(erro.message, 'error');
  }
}

function fecharModalEdicao() {
  modalEdicao.style.display = 'none';
  formEdicao.reset();
}

/**
 * 5. PUT /api/jogos/:id
 * Atualiza o jogo com os novos valores
 */
async function atualizarJogo(event) {
  event.preventDefault();

  const id = document.getElementById('edit-id').value;
  const titulo = document.getElementById('edit-titulo').value.trim();
  const genero = document.getElementById('edit-genero').value.trim();
  const plataforma = document.getElementById('edit-plataforma').value.trim();
  const preco = parseFloat(document.getElementById('edit-preco').value);
  const avaliacao = parseFloat(document.getElementById('edit-avaliacao').value);
  const imagem = document.getElementById('edit-imagem').value.trim();
  const sinopse = document.getElementById('edit-sinopse').value.trim();
  const comentarios = document.getElementById('edit-comentarios').value.trim();

  limparErrosVisuais('edit');

  let temErro = false;
  if (!titulo) { mostrarErroCampo('edit-titulo', 'O título é obrigatório.'); temErro = true; }
  if (!genero) { mostrarErroCampo('edit-genero', 'O gênero é obrigatório.'); temErro = true; }
  if (!plataforma) { mostrarErroCampo('edit-plataforma', 'A plataforma é obrigatória.'); temErro = true; }
  if (isNaN(preco) || preco < 0) { mostrarErroCampo('edit-preco', 'Preço inválido.'); temErro = true; }
  if (isNaN(avaliacao) || avaliacao < 0 || avaliacao > 5) { mostrarErroCampo('edit-avaliacao', 'Avaliação de 0 a 5.'); temErro = true; }
  if (!imagem) { mostrarErroCampo('edit-imagem', 'A URL da imagem é obrigatória.'); temErro = true; }
  if (!sinopse) { mostrarErroCampo('edit-sinopse', 'A sinopse é obrigatória.'); temErro = true; }

  if (temErro) return;

  const payload = {
    titulo,
    genero,
    plataforma,
    preco,
    avaliacao,
    imagem,
    sinopse,
    comentarios: comentarios || null
  };

  const btnSalvar = document.getElementById('btn-salvar-edicao');
  btnSalvar.disabled = true;
  btnSalvar.textContent = 'Salvando...';

  try {
    const resposta = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Falha ao atualizar o jogo.');
    }

    mostrarNotificacao('Jogo atualizado com sucesso!', 'success');
    fecharModalEdicao();

    // Atualiza o jogo na lista local e reflete imediatamente no DOM
    const index = listaJogosLocal.findIndex(j => j.id == id);
    if (index !== -1 && dados.jogo) {
      listaJogosLocal[index] = dados.jogo;
      atualizarOpcoesGeneros(listaJogosLocal);
      renderizarCards(listaJogosLocal);
    } else {
      carregarJogos();
    }

  } catch (erro) {
    console.error('Erro ao atualizar jogo:', erro);
    mostrarNotificacao(erro.message, 'error');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = 'Salvar Alterações';
  }
}

/**
 * 6. DELETE /api/jogos/:id
 * Remove o jogo do banco e atualiza a interface instantaneamente
 */
async function excluirJogo(id, titulo) {
  const confirmacao = window.confirm(`Tem certeza que deseja excluir o jogo "${titulo}" do catálogo?`);
  if (!confirmacao) return;

  try {
    const resposta = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Falha ao excluir o jogo.');
    }

    mostrarNotificacao(`"${titulo}" foi removido do catálogo com sucesso!`, 'info');

    // Remoção instantânea da lista local sem recarregar a tela
    listaJogosLocal = listaJogosLocal.filter(j => j.id != id);
    atualizarOpcoesGeneros(listaJogosLocal);
    atualizarEstatisticas(listaJogosLocal);
    renderizarCards(listaJogosLocal);

  } catch (erro) {
    console.error(`Erro ao excluir jogo com ID ${id}:`, erro);
    mostrarNotificacao(erro.message, 'error');
  }
}

// =============================================================================
// RENDERIZAÇÃO DE INTERFACE & MANIPULAÇÃO DO DOM
// =============================================================================

/**
 * Injeta os cards de jogos no Grid dinamicamente
 */
function renderizarCards(jogos) {
  gridJogos.innerHTML = '';

  if (!jogos || jogos.length === 0) {
    emptyState.style.display = 'block';
    contadorResultados.textContent = '0 jogos encontrados';
    return;
  }

  emptyState.style.display = 'none';
  contadorResultados.textContent = `${jogos.length} ${jogos.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;

  jogos.forEach(jogo => {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.setAttribute('data-id', jogo.id);
    card.setAttribute('title', `Clique para ver os detalhes completos de ${escaparHTML(jogo.titulo)}`);

    const tituloSanitizado = escaparHTML(jogo.titulo);
    const generoSanitizado = escaparHTML(jogo.genero);
    const sinopseSanitizada = escaparHTML(jogo.sinopse);
    const plataformaSanitizada = escaparHTML(jogo.plataforma || 'PC');
    const comentariosSanitizados = jogo.comentarios ? escaparHTML(jogo.comentarios) : null;
    const imagemValida = jogo.imagem || PLACEHOLDER_IMG;
    const precoFormatado = formatarPreco(jogo.preco);
    const isFree = parseFloat(jogo.preco) === 0;

    card.innerHTML = `
      <div class="card-media">
        <img 
          src="${imagemValida}" 
          alt="Capa de ${tituloSanitizado}" 
          class="card-img" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}'"
        >
        <span class="genre-tag">${generoSanitizado}</span>
        <span class="card-id-badge">#${jogo.id}</span>
      </div>

      <div class="card-body">
        <div class="card-quick-meta">
          <span class="price-tag ${isFree ? 'free' : ''}">${precoFormatado}</span>
          <div class="stars-wrapper">
            ${gerarHTMLAvaliacao(jogo.avaliacao)}
          </div>
        </div>

        <h4 class="card-title">${tituloSanitizado}</h4>
        
        <span class="platform-pill" title="Plataformas: ${plataformaSanitizada}">
          🕹️ ${plataformaSanitizada}
        </span>

        <p class="card-synopsis">${sinopseSanitizada}</p>

        ${comentariosSanitizados
        ? `
            <div class="card-forum-box">
              <div class="forum-box-header">
                <span>💬</span> Review / Fórum
              </div>
              <p class="forum-comment-text">"${comentariosSanitizados}"</p>
            </div>
          `
        : `
            <div class="card-forum-box" style="opacity: 0.6;">
              <p class="forum-comment-text" style="font-style: normal; font-size: 0.75rem;">
                Sem reviews registradas ainda.
              </p>
            </div>
          `
      }

        <div class="card-actions">
          <button class="btn btn-edit-outline btn-editar" data-id="${jogo.id}">
            ✏️ Editar
          </button>
          <button class="btn btn-danger-outline btn-excluir" data-id="${jogo.id}">
            🗑️ Excluir
          </button>
        </div>
      </div>
    `;

    // Evento de clique no Card para abrir Modal de Detalhes
    // Importante: Não dispara ao clicar nos botões Editar ou Excluir
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-editar') || e.target.closest('.btn-excluir')) {
        return;
      }
      abrirModalDetalhes(jogo.id);
    });

    // Evento do botão Editar
    const btnEditar = card.querySelector('.btn-editar');
    btnEditar.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModalEdicao(jogo.id);
    });

    // Evento do botão Excluir
    const btnExcluir = card.querySelector('.btn-excluir');
    btnExcluir.addEventListener('click', (e) => {
      e.stopPropagation();
      excluirJogo(jogo.id, jogo.titulo);
    });

    gridJogos.appendChild(card);
  });
}

/**
 * Renderiza visualmente as estrelas de avaliação (0 a 5)
 */
function gerarHTMLAvaliacao(avaliacao) {
  const nota = Math.max(0, Math.min(5, parseFloat(avaliacao) || 0));
  const cheias = Math.round(nota);
  const vazias = 5 - cheias;
  const estrelas = '★'.repeat(cheias) + '☆'.repeat(vazias);
  return `
    <span class="stars-icons" title="${nota.toFixed(1)} de 5 estrelas">${estrelas}</span>
    <span class="stars-score">(${nota.toFixed(1)})</span>
  `;
}

/**
 * Formata valores numéricos para a moeda brasileira Real (R$) ou Gratuito
 */
function formatarPreco(valor) {
  const preco = parseFloat(valor) || 0;
  if (preco <= 0) return 'Gratuito';
  return `R$ ${preco.toFixed(2).replace('.', ',')}`;
}

/**
 * Filtra a lista já carregada por gênero
 */
function filtrarJogosPorGenero(generoSelecionado) {
  if (!generoSelecionado) {
    renderizarCards(listaJogosLocal);
    return;
  }
  const filtrados = listaJogosLocal.filter(j =>
    j.genero.toLowerCase().trim() === generoSelecionado.toLowerCase().trim()
  );
  renderizarCards(filtrados);
}

/**
 * Atualiza o dropdown de gêneros dinamicamente
 */
function atualizarOpcoesGeneros(jogos) {
  const valorAtual = filtroGenero.value;
  const generosUnicos = [...new Set(jogos.map(j => j.genero.trim()))].sort();

  filtroGenero.innerHTML = '<option value="">Todos os Gêneros</option>';

  generosUnicos.forEach(gen => {
    const option = document.createElement('option');
    option.value = gen;
    option.textContent = gen;
    if (gen === valorAtual) {
      option.selected = true;
    }
    filtroGenero.appendChild(option);
  });
}

/**
 * Atualiza os badges de contagem no topo
 */
function atualizarEstatisticas(jogos) {
  totalJogosBadge.textContent = jogos.length;
  const generosUnicos = new Set(jogos.map(j => j.genero.trim()));
  totalGenerosBadge.textContent = generosUnicos.size;
}

// =============================================================================
// UTILITÁRIOS: VALIDAÇÃO, NOTIFICAÇÕES & SANITIZAÇÃO
// =============================================================================

function mostrarErroCampo(campoId, mensagem) {
  const input = document.getElementById(campoId);
  const spanErro = document.getElementById(`erro-${campoId}`);
  if (input) input.classList.add('invalid');
  if (spanErro) spanErro.textContent = mensagem;
}

function limparErrosVisuais(prefixo) {
  const inputs = document.querySelectorAll(`[id^="${prefixo}-"]`);
  inputs.forEach(input => input.classList.remove('invalid'));

  const spansErro = document.querySelectorAll(`[id^="erro-${prefixo}-"]`);
  spansErro.forEach(span => span.textContent = '');
}

/**
 * Exibe notificações flutuantes (Toast)
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  const icones = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icones[tipo] || '📢'}</span>
    <span class="toast-message">${mensagem}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Previne XSS escapando caracteres HTML
 */
function escaparHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
