# Blackline Performance — Website

**Site publicado:** https://henriquest-dev.github.io/blackline-performance-/

Landing page one-page para a **Blackline Performance** (`@blp_autocare` · +258 86 042 4242).
Identidade branco / preto / vermelho, hero em painel dividido com a BMW M5 recortada,
e animações de scroll inspiradas no blueprint de referência (GSAP ScrollTrigger + Lenis).

## Estrutura

```
index.html                 página única (PT)
css/styles.css             estilos + responsivo
admin.html                 painel de administração (link no "2026" do rodapé)
js/config.js               valores por defeito: serviços, preços, promoções, contactos, empresa
js/env.js                  ligação ao Supabase (gerado de .env por scripts/build-env.mjs)
js/store.js                camada de dados (Supabase; modo demonstração sem configuração)
js/quote.js                editor de cotação + PDF
js/vendor/                 supabase-js e jsPDF (locais, sem depender de CDN)
supabase/schema.sql        tabelas, segurança, funções do painel — executar no SQL Editor do Supabase
cotacao.html               página onde o cliente abre o PDF da cotação (link enviado por WhatsApp)
.env.example               modelo do ficheiro .env
js/i18n.js                 traduções PT / EN
js/main.js                 smooth scroll, animações, carrossel, filtros, menu mobile
js/booking.js              marcação de serviço (5 passos + registo do pedido)
js/admin.js, css/admin.css painel
assets/logo/               logótipo vetorizado (SVG): vermelho, branco e escuro
assets/favicon.svg
assets/img/bmw-m5.png      BMW M5 recortada (fundo transparente, matrícula "BLACKLINE")
assets/img/servicos/       imagens dos cartões de serviços (substituir pelas geradas — ver docs/prompts-imagens.md)
assets/img/cars/           carrossel: Toyota Vitz, Mazda Demio, Mazda Verisa, Toyota Ractis (recortados)
```

## Secções e animações

1. **Hero** — painel preto (título, texto "fantasma", redes sociais) | painel claro, carro a cruzar a divisão,
   barra vermelha com CTA. Ao rolar fica fixa: o texto sai, o carro arranca para a direita e o preto cobre o ecrã.
2. **Marcas** assistidas.
3. **Acompanhe a sua viatura** — dois telemóveis (agendamento + estado da reparação) entram de baixo e rodam para a posição.
4. **Os Nossos Serviços** — filtros (Mecânica, Eletricidade, Bate-Chapa & Pintura, Detailing, Tuning, Lavagem) e galeria em cascata.
5. **Porquê a Blackline** — contadores e cartões que sobem em escada com o scroll.
6. **Como funciona** — linha vermelha que avança com o scroll e acende cada etapa.
7. **CTA "Agende já uma revisão!"** — cartão escuro que cresce, botões WhatsApp/telefone.
8. **Rodapé** — navegação, serviços, newsletter.

Sem GSAP (CDN bloqueado) ou com `prefers-reduced-motion`, todo o conteúdo fica visível sem animações.

## Marcação de serviço

Qualquer botão "Marcar" (ou o link `#agendar`) abre a página de marcação, em 5 etapas com resumo do pedido sempre visível:

1. **Serviços** — agrupados por categoria, com duração e preço indicativo
2. **Viatura** — marca, modelo, ano, quilometragem, combustível e matrícula
3. **Data e hora** — calendário mensal (domingo fechado, sábado só manhã) e horários de manhã/tarde
4. **Contacto** — nome, apelido, telemóvel (+258, validado), email, preferência de contacto e descrição do problema
5. **Confirmação** — revisão de tudo, com "Alterar" em cada secção

Inclui o **número de chassis (VIN)**. Ao enviar, o pedido é **gravado** e aparece no painel de administração;
o cliente recebe uma referência `BLP-…` e pode adicionar a marcação ao calendário. Serviços e preços editam-se no painel.

## Painel de administração

Clicar no ano do rodapé → `admin.html` (credenciais definidas no Supabase; não estão no repositório).
Marcações (pesquisa, estados, notas, WhatsApp, exportar CSV), serviços e preços, contactos e horário, conta.
Dados no **Supabase** (marcações, definições, cotações e PDFs). Guia completo e ligação: [`docs/painel-admin.md`](docs/painel-admin.md).

## Idiomas

Botão PT / EN no topo (e no menu do telemóvel). A escolha fica guardada; também funciona com `?lang=en`.

Ver também [`docs/sinais-de-ia.md`](docs/sinais-de-ia.md) — o que foi retirado para o site não parecer gerado por IA.

## Correr localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

> Estatísticas, avaliações, textos dos trabalhos e fotos da galeria são **dados de exemplo** — substituir pelos reais.

## Créditos das imagens

- Imagens temporárias dos serviços: [Unsplash](https://unsplash.com) (Licença Unsplash), a substituir pelas imagens próprias.
- Toyota Ractis: foto de Wikimedia Commons (licença CC BY-SA) — manter a atribuição ou substituir por foto própria.
- Restantes viaturas: fotos fornecidas pela Blackline. A matrícula do Mazda Demio foi substituída por uma placa "BLACKLINE".
