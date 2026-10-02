# Blackline Performance — Website

Landing page one-page para a **Blackline Performance** (`@blp_autocare` · +258 86 042 4242).
Identidade branco / preto / vermelho, hero em painel dividido com a BMW M5 recortada,
e animações de scroll inspiradas no blueprint de referência (GSAP ScrollTrigger + Lenis).

## Estrutura

```
index.html                 página única (PT)
css/styles.css             estilos + responsivo
js/main.js                 smooth scroll, animações, filtros, contadores, menu mobile
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
6. **CTA "Agende já uma revisão!"** — cartão escuro que cresce, botões WhatsApp/telefone.
7. **Rodapé** — navegação, serviços, newsletter.

Sem GSAP (CDN bloqueado) ou com `prefers-reduced-motion`, todo o conteúdo fica visível sem animações.

## Correr localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

> Estatísticas, avaliações, textos dos trabalhos e fotos da galeria são **dados de exemplo** — substituir pelos reais.
