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
    } catch (erro) {
        console.warn('Mantendo a lista estática de projetos.', erro);
    }
}

document.getElementById('ano').textContent = new Date().getFullYear();
carregarProjetos();
