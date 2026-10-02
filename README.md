# Blackline Performance — Website

**Site publicado:** https://henriquest-dev.github.io/blackline-performance-/

Landing page one-page para a **Blackline Performance** (`@blp_autocare` · +258 86 042 4242).
Identidade branco / preto / vermelho, hero em painel dividido com a BMW M5 recortada,
e animações de scroll inspiradas no blueprint de referência (GSAP ScrollTrigger + Lenis).

## Estrutura

```
index.html                 página única (PT)
css/styles.css             estilos + responsivo
js/main.js                 smooth scroll, animações, filtros, contadores, menu mobile
js/booking.js              sistema de agendamento (5 passos + confirmação)
assets/logo/               logótipo vetorizado (SVG): vermelho, branco e escuro
assets/favicon.svg
assets/img/bmw-m5.png      BMW M5 recortada (fundo transparente, matrícula "BLACKLINE")
assets/img/gallery/        fotos de exemplo dos serviços (Unsplash)
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

Ao enviar, gera uma referência `BLP-…` e permite enviar o pedido pelo WhatsApp (mensagem preenchida) ou
adicioná-lo ao calendário (.ics). Os preços estão em `js/booking.js` (`GROUPS`) e são de exemplo.

Ver também [`docs/sinais-de-ia.md`](docs/sinais-de-ia.md) — o que foi retirado para o site não parecer gerado por IA.

## Correr localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

> Estatísticas, avaliações, textos dos trabalhos e fotos da galeria são **dados de exemplo** — substituir pelos reais.
