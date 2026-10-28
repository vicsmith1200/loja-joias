const $ = id => document.getElementById(id);
const brl = n => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const FOTO_VAZIA = 'uploads/sem-foto.svg';

let config = {}, produtos = [], filtro = 'Todas';

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
  const nome = config.nome_loja || 'Loja de Joias';
  document.title = nome;
  $('logo').textContent = nome;
  $('slogan').textContent = config.slogan || '';
  $('zapTopo').href = linkZap('Olá! Vim pelo site e gostaria de mais informações.');
  if (config.tiktok) { $('tiktok').href = config.tiktok; $('tiktok').hidden = false; }
  if (config.sobre) { $('sobre').textContent = config.sobre; $('sobreSec').hidden = false; }
  $('rodape').textContent = `© ${new Date().getFullYear()} ${nome}`;
  montarFiltros();
  montarGrade();
}

function montarFiltros() {
  const cats = ['Todas', ...new Set(produtos.map(p => p.categoria).filter(Boolean))];
  $('filtros').innerHTML = '';
  cats.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c;
    b.className = c === filtro ? 'ativo' : '';
    b.onclick = () => { filtro = c; montarFiltros(); montarGrade(); };
    $('filtros').appendChild(b);
  });
}

function montarGrade() {
  const lista = produtos
    .filter(p => filtro === 'Todas' || p.categoria === filtro)
    .sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
  $('grade').innerHTML = '';
  $('vazio').hidden = lista.length > 0;
  lista.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card' + (p.esgotado ? ' esgotado' : '');
    const foto = (p.fotos && p.fotos[0]) || FOTO_VAZIA;
    el.innerHTML = `
      ${p.esgotado ? '<span class="selo">Esgotado</span>' : p.destaque ? '<span class="selo dest">Destaque</span>' : ''}
      <div class="img"><img loading="lazy" alt=""></div>
      <div class="txt"><h3></h3><p class="preco"></p></div>`;
    el.querySelector('img').src = foto;
    el.querySelector('img').alt = p.nome;
    el.querySelector('h3').textContent = p.nome;
    el.querySelector('.preco').textContent = p.preco ? brl(p.preco) : 'Consulte';
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
document.addEventListener('click', e => { if (e.target.hasAttribute('data-fechar')) fechar(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });

carregar().catch(() => { $('vazio').hidden = false; $('vazio').textContent = 'Não foi possível carregar o catálogo.'; });
