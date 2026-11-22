// Carrega automaticamente os repositórios públicos ativos do GitHub.
// Se a API falhar (sem internet, limite de requisições), a lista estática do HTML permanece.

const USUARIO = 'Leddro';

// Repositórios que não devem aparecer na lista (o próprio portfólio e o projeto em destaque)
const IGNORAR = ['leddro.github.io', 'controlfin_app'];

// Descrições personalizadas (opcional). Se o repositório não estiver aqui, usa a descrição do GitHub.
const DESCRICOES = {
    'FutePlay': 'Projeto em Python para ajudar a definir as playlists em dia de jogo.',
    'Trybe': 'Exercícios e projetos desenvolvidos durante os estudos na Trybe.',
    'CampeonatoInterclasse': 'Projeto criado para ajudar na organização do interclasse 2025.',
    'avaliacao-de-filmes': 'Catálogo de filmes com avaliação e favoritamento.',
};

const CORES_LINGUAGEM = {
    Python: '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Dart: '#00B4AB',
    Java: '#b07219',
    'C#': '#178600',
    C: '#555555',
    'C++': '#f34b7d',
    Shell: '#89e051',
    Kotlin: '#A97BFF',
};

function criarElemento(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto) el.textContent = texto;
    return el;
}

function formatarData(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function criarCard(repo) {
    const card = criarElemento('article', 'card');

    const titulo = criarElemento('h3');
    const link = criarElemento('a', null, repo.name);
    link.href = repo.html_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    titulo.appendChild(link);
    card.appendChild(titulo);

    const descricao = DESCRICOES[repo.name] || repo.description || 'Sem descrição.';
    card.appendChild(criarElemento('p', null, descricao));

    const rodape = criarElemento('div', 'card-rodape');

    if (repo.language) {
        const lang = criarElemento('span', 'lang');
        const cor = criarElemento('span', 'lang-cor');
        cor.style.background = CORES_LINGUAGEM[repo.language] || '#8b949e';
        lang.appendChild(cor);
        lang.appendChild(document.createTextNode(repo.language));
        rodape.appendChild(lang);
    }

    rodape.appendChild(criarElemento('span', 'atualizado', 'Atualizado em ' + formatarData(repo.pushed_at)));

    if (repo.homepage) {
        const demo = criarElemento('a', 'demo', 'Demo ↗');
        demo.href = repo.homepage;
        demo.target = '_blank';
        demo.rel = 'noopener noreferrer';
        rodape.appendChild(demo);
    }

    card.appendChild(rodape);
    return card;
}

async function carregarProjetos() {
    const lista = document.getElementById('lista-projetos');
    try {
        const resposta = await fetch(`https://api.github.com/users/${USUARIO}/repos?per_page=100&sort=pushed`);
        if (!resposta.ok) throw new Error('Falha na API: ' + resposta.status);
        const repos = await resposta.json();

        const ativos = repos.filter(r =>
            !r.fork && !r.archived && !r.private && !IGNORAR.includes(r.name.toLowerCase())
        );
        if (ativos.length === 0) return;

        lista.replaceChildren(...ativos.map(criarCard));
        lista.scrollLeft = 0;
    } catch (erro) {
        console.warn('Mantendo a lista estática de projetos.', erro);
    } finally {
        atualizarCarrossel();
    }
}

// ----- Carrossel de projetos -----
const trilha = document.getElementById('lista-projetos');
const setaAnterior = document.querySelector('.carrossel-seta.anterior');
const setaProxima = document.querySelector('.carrossel-seta.proxima');
const pontos = document.querySelector('.carrossel-pontos');

function passoCarrossel() {
    const card = trilha.querySelector('.card');
    if (!card) return trilha.clientWidth;
    const gap = parseFloat(getComputedStyle(trilha).columnGap) || 0;
    return card.offsetWidth + gap;
}

function paginasCarrossel() {
    const visiveis = Math.max(1, Math.round(trilha.clientWidth / passoCarrossel()));
    const total = trilha.querySelectorAll('.card').length;
    return Math.max(1, total - visiveis + 1);
}

function atualizarCarrossel() {
    const max = trilha.scrollWidth - trilha.clientWidth;
    setaAnterior.disabled = trilha.scrollLeft <= 2;
    setaProxima.disabled = trilha.scrollLeft >= max - 2;

    const total = max > 2 ? paginasCarrossel() : 1;
    const atual = Math.min(total - 1, Math.round(trilha.scrollLeft / passoCarrossel()));
    if (pontos.children.length !== total) {
        pontos.replaceChildren(...Array.from({ length: total }, () => criarElemento('span')));
    }
    [...pontos.children].forEach((ponto, i) => ponto.classList.toggle('ativo', i === atual));
    pontos.hidden = total <= 1;
}

document.querySelectorAll('.carrossel-seta').forEach(seta => {
    seta.addEventListener('click', () => {
        trilha.scrollBy({ left: Number(seta.dataset.direcao) * passoCarrossel(), behavior: 'smooth' });
    });
});

trilha.addEventListener('keydown', evento => {
    if (evento.key === 'ArrowRight') setaProxima.click();
    if (evento.key === 'ArrowLeft') setaAnterior.click();
});

trilha.addEventListener('scroll', atualizarCarrossel, { passive: true });
window.addEventListener('resize', atualizarCarrossel);

// ----- Janela de detalhes do projeto em destaque -----
document.querySelectorAll('[data-abrir]').forEach(botao => {
    const modal = document.getElementById(botao.dataset.abrir);
    botao.addEventListener('click', () => {
        modal.showModal();
        document.body.classList.add('sem-rolagem');
    });
});

document.querySelectorAll('dialog.modal').forEach(modal => {
    modal.querySelector('[data-fechar]').addEventListener('click', () => modal.close());
    // Fecha ao clicar fora do conteúdo
    modal.addEventListener('click', evento => {
        if (evento.target === modal) modal.close();
    });
    modal.addEventListener('close', () => document.body.classList.remove('sem-rolagem'));
});

document.getElementById('ano').textContent = new Date().getFullYear();
atualizarCarrossel();
carregarProjetos();
