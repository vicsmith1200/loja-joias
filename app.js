const $ = id => document.getElementById(id);
const brl = n => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const FOTO_VAZIA = 'uploads/sem-foto.svg';

let config = {}, produtos = [], filtro = 'Todas', termo = '';

async function carregar() {
  const [c, p] = await Promise.all([
    fetch('data/config.json').then(r => r.json()),
    fetch('data/produtos.json').then(r => r.json())
  ]);
  config = c;
  produtos = (p.produtos || []).filter(x => x.nome);
  montarPagina();
}

function linkZap(texto) {
  const num = String(config.whatsapp || '').replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}

function montarPagina() {
  const nome = config.nome_loja || 'Couple Joias';
  const [n1, ...resto] = nome.split(' ');
  document.title = nome;
  $('logo').innerHTML = '';
  $('logo').append(n1);
  const sm = document.createElement('small');
  sm.textContent = resto.join(' ') ? `${resto.join(' ')} · Prata 925` : 'Prata 925';
  $('logo').appendChild(sm);

  if (config.aviso) { $('aviso').textContent = config.aviso; $('aviso').hidden = false; }
  $('slogan').textContent = config.slogan || '';
  $('heroTitulo').textContent = config.hero_titulo || 'Brilho que conta a sua história';
  $('heroTexto').textContent = config.hero_texto || '';
  if (config.hero_imagem) { $('heroImg').style.backgroundImage = `url("${config.hero_imagem}")`; $('heroImg').classList.add('foto'); }

  const oi = linkZap('Olá! Vim pelo site e gostaria de mais informações.');
  ['zapTopo', 'zapBanner', 'zapFix', 'fZap'].forEach(id => $(id).href = oi);
  if (config.instagram) { $('insta').href = config.instagram; $('insta').hidden = false; }
  if (config.sobre) { $('sobre').textContent = config.sobre; $('sobreSec').hidden = false; }
  $('fNome').textContent = nome;
  $('fTexto').textContent = config.slogan || '';
  $('rodape').textContent = `© ${new Date().getFullYear()} ${nome} · Todos os direitos reservados`;

  const cats = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
  montarMenu(cats);
  montarCategorias(cats);
  montarGrade();
}

function irParaColecao(c) {
  filtro = c; termo = ''; $('busca').value = '';
  montarMenu();
  montarGrade();
  $('colecao').scrollIntoView({ behavior: 'smooth' });
}

function montarMenu(cats) {
  cats = cats || [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
  $('menu').innerHTML = '';
  ['Todas', ...cats].forEach(c => {
    const b = document.createElement('button');
    b.textContent = c === 'Todas' ? 'Novidades' : c;
    if (c === filtro) b.className = 'ativo';
    b.onclick = () => irParaColecao(c);
    $('menu').appendChild(b);
  });
  $('fCats').innerHTML = '';
  cats.forEach(c => {
    const b = document.createElement('a');
    b.textContent = c; b.tabIndex = 0; b.role = 'button';
    b.onclick = () => irParaColecao(c);
    $('fCats').appendChild(b);
  });
}

function montarCategorias(cats) {
  $('cats').innerHTML = '';
  $('catsSec').hidden = cats.length === 0;
  cats.forEach(c => {
    const el = document.createElement('button');
    el.className = 'cat';
    const p = produtos.find(x => x.categoria === c && x.fotos && x.fotos[0] && !x.fotos[0].endsWith('sem-foto.svg'));
    if (p) el.style.backgroundImage = `url("${p.fotos[0]}")`;
    const b = document.createElement('b');
    b.textContent = c;
    el.appendChild(b);
    el.onclick = () => irParaColecao(c);
    $('cats').appendChild(el);
  });
}

function montarGrade() {
  const q = termo.trim().toLowerCase();
  $('tituloCol').textContent = filtro === 'Todas' ? 'Mais desejados' : filtro;
  const lista = produtos
    .filter(p => filtro === 'Todas' || p.categoria === filtro)
    .filter(p => !q || `${p.nome} ${p.categoria || ''} ${p.descricao || ''}`.toLowerCase().includes(q))
    .sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
  $('grade').innerHTML = '';
  $('vazio').hidden = lista.length > 0;
  lista.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card' + (p.esgotado ? ' esg' : '');
    const selo = p.esgotado ? 'Esgotado' : (p.selo || (p.destaque ? 'Destaque' : ''));
    el.innerHTML = `
      <div class="im">${selo ? '<span class="selo"></span>' : ''}<img loading="lazy" alt=""><div class="ver">Ver detalhes</div></div>
      <h3></h3><div class="p"></div>`;
    if (selo) el.querySelector('.selo').textContent = selo;
    const img = el.querySelector('img');
    img.src = (p.fotos && p.fotos[0]) || FOTO_VAZIA;
    img.alt = p.nome;
    el.querySelector('h3').textContent = p.nome;
    const pr = el.querySelector('.p');
    if (p.preco) {
      if (p.preco_antigo && p.preco_antigo > p.preco) {
        const s = document.createElement('s');
        s.textContent = brl(p.preco_antigo);
        pr.appendChild(s);
      }
      pr.append(brl(p.preco));
    } else pr.textContent = 'Consulte';
    el.onclick = () => abrir(p);
    $('grade').appendChild(el);
  });
}

function abrir(p) {
  const fotos = (p.fotos && p.fotos.length) ? p.fotos : [FOTO_VAZIA];
  const mostrar = i => {
    $('mFoto').src = fotos[i];
    $('mFoto').alt = p.nome;
    [...$('mMini').children].forEach((m, j) => m.classList.toggle('ativa', i === j));
  };
  $('mMini').innerHTML = '';
  if (fotos.length > 1) fotos.forEach((f, i) => {
    const m = document.createElement('img');
    m.src = f; m.alt = '';
    m.onclick = () => mostrar(i);
    $('mMini').appendChild(m);
  });
  mostrar(0);
  $('mCat').textContent = p.categoria || '';
  $('mNome').textContent = p.nome;
  $('mPreco').textContent = p.preco ? brl(p.preco) : 'Consulte o valor';
  $('mDesc').textContent = p.descricao || '';
  const z = $('mZap');
  if (p.esgotado) { z.textContent = 'Esgotado'; z.classList.add('off'); z.removeAttribute('href'); }
  else {
    z.textContent = 'Pedir pelo WhatsApp'; z.classList.remove('off');
    z.href = linkZap(`Olá! Tenho interesse em: ${p.nome}${p.preco ? ' (' + brl(p.preco) + ')' : ''}.`);
  }
  $('modal').hidden = false;
  document.body.style.overflow = 'hidden';
}

function fechar() { $('modal').hidden = true; document.body.style.overflow = ''; }
document.addEventListener('click', e => { if (e.target.hasAttribute && e.target.hasAttribute('data-fechar')) fechar(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
$('busca').addEventListener('input', e => { termo = e.target.value; montarGrade(); });

carregar().catch(() => { $('vazio').hidden = false; $('vazio').textContent = 'Não foi possível carregar o catálogo.'; });
