# Site da loja — como publicar e atualizar

## Para quem vai atualizar a loja (sem programar)
1. Abra `seusite.com/admin` e entre com e-mail e senha.
2. **Produtos (catálogo)** → "Lista de produtos": adicione, edite ou remova produtos, troque preços e envie fotos (quantas quiser por produto; a primeira é a principal).
3. **Dados da loja**: nome, frase, número do WhatsApp e texto "Sobre".
4. Clique em **Publicar**. Em ~1 minuto o site está atualizado.

## Publicação (feita uma única vez)
1. Crie uma conta gratuita no GitHub e envie esta pasta para um repositório (branch `main`).
2. Crie uma conta gratuita no Netlify → "Add new site" → "Import from Git" → escolha o repositório.
3. No Netlify: Site configuration → Identity → **Enable Identity**; em Registration deixe "Invite only"; em Services → **Enable Git Gateway**.
4. Em Identity → **Invite users**, convide o e-mail de quem vai atualizar a loja. A pessoa recebe um convite e cria a senha.
5. Troque o número de WhatsApp pelo real no painel (`/admin`) ou em `data/config.json`.

Custo: R$ 0 (planos gratuitos), mais o domínio próprio se quiser (ex.: registro.br).

## Estrutura
- `index.html`, `style.css`, `app.js` — a vitrine
- `data/produtos.json`, `data/config.json` — conteúdo (editado pelo painel)
- `uploads/` — fotos enviadas pelo painel
- `admin/` — painel de edição
