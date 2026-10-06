# Imagens dos serviços — prompts para gerar (ChatGPT / DALL·E)

Cada cartão da secção **Serviços** usa uma imagem em `assets/img/servicos/`. Gere cada imagem com o prompt
correspondente e guarde-a **com o nome indicado** (substituindo o ficheiro temporário). Não é preciso mexer em código.

**Formato:** horizontal **1536 × 1024** (3:2), JPG. No ChatGPT peça "formato horizontal / landscape".
Depois de gerar, se o ficheiro for PNG, converta para JPG (qualidade ~80%) para o site ficar leve.

## Estilo comum (já incluído em cada prompt)

- Fotografia realista, comercial, câmara full-frame, lente 35 mm, f/2.8.
- Oficina moderna e limpa em Maputo, Moçambique: paredes cinza-escuro, chão epóxi preto, faixas vermelhas
  (#E11D2A) nas paredes e armários de ferramentas, iluminação LED branca.
- Técnicos moçambicanos negros, fardas pretas com detalhes vermelhos, luvas pretas.
- Viaturas comuns em Moçambique (Toyota Hilux, Land Cruiser, Corolla, Vitz, Ractis, Mazda Demio, Nissan, Honda Fit,
  Mitsubishi Pajero). Nada de superdesportivos.
- Sem texto legível, sem logótipos de marcas, matrículas em branco.
- Assunto principal no centro/terço superior; terço inferior mais escuro e simples (o título do cartão fica por cima).
- Cor: pretos profundos, brancos neutros, vermelho só como acento.

---

## Um só prompt: todas as imagens num quadro 4×3

```
Create ONE single horizontal image (1536x1024) that is a clean contact sheet: a grid of 12 separate photographs arranged in 4 columns and 3 rows, all panels the same size, separated by thin straight white lines, no outer border, no numbers, no captions, no text anywhere.
Shared style for ALL 12 panels: photorealistic commercial automotive photography, full-frame camera, 35mm lens, shallow depth of field, consistent lighting and colour grade. A clean modern auto workshop in Maputo, Mozambique: dark charcoal walls, glossy black epoxy floor, red accent stripes (#E11D2A) on walls and tool cabinets, white LED strip lights. Black Mozambican technicians in black uniforms with red details and black gloves. Everyday cars common in Mozambique, no supercars. No legible text, no brand logos, blank licence plates. In every panel the main subject is centred with some space around it. Deep blacks, neutral whites, red only as an accent.
Row 1, left to right:
1) a technician by the open door of a dark grey Toyota Hilux with a laptop plugged into the OBD port, polished sport exhaust tip visible (ECU remap);
2) close-up of gloved hands applying ceramic coating to the mirror-like black bonnet of a Toyota Corolla;
3) a technician machine-polishing the door of a white Mazda Demio under an inspection light (paint correction);
4) a Toyota Land Cruiser on a two-post lift, a mechanic inspecting the front brake disc with a torch, red tool trolley (full service).
Row 2, left to right:
5) a dark blue Toyota Ractis covered in white snow foam, a worker rinsing it with a pressure washer (premium wash);
6) close-up under the bonnet of a silver Toyota Vitz, gloved hands testing the fuse box with a multimeter (electronic diagnostics);
7) a lowered dark grey Honda Fit with black alloy wheels on an alignment ramp, technician kneeling at the front wheel (suspension and wheels);
8) under a Toyota Corolla on a lift, a mechanic removing the oil filter, golden oil draining into a red pan (oil change).
Row 3, left to right:
9) a panel beater with safety glasses pulling a dent on the rear panel of a white Toyota Hilux, bare metal and grey primer (panel repair);
10) an installer applying clear security film to the rear side window of a dark grey Toyota Corolla with a squeegee (smash and grab film);
11) a freshly polished black Mitsubishi Pajero, a detailer wiping the windscreen with a microfibre cloth, water beading (polish and glass);
12) wide shot of the whole workshop at dusk from the entrance, three bays with a Hilux, a Demio and a Land Cruiser, technicians at work (workshop overview).
```

Recortar:
```bash
python3 scripts/crop-grid.py quadro.png --grid 4x3 tuning-remap ceramic-coating correcao-pintura revisao-completa lavagem-premium diagnostico-eletronico suspensao-jantes mudanca-oleo bate-chapa smash-grab polimento-vidros oficina
```

---

## Alternativa: 3 quadros 2×2 (mais resolução) (4 imagens por geração)

Gera 4 imagens de uma vez com o mesmo estilo. Cada quadro sai em **1536 × 1024** e cada painel fica com
768 × 512 (já no formato 3:2 dos cartões). Depois recorte com:

```bash
python3 scripts/crop-grid.py quadro1.png tuning-remap ceramic-coating correcao-pintura revisao-completa
python3 scripts/crop-grid.py quadro2.png lavagem-premium diagnostico-eletronico suspensao-jantes mudanca-oleo
python3 scripts/crop-grid.py quadro3.png bate-chapa smash-grab polimento-vidros hero-oficina
```
(ordem dos nomes: cima-esquerda, cima-direita, baixo-esquerda, baixo-direita). O script deteta as divisórias,
recorta, redimensiona para 1200 × 800 e grava em `assets/img/servicos/`.

Os três prompts estão na conversa e abaixo.

---

## Prompts individuais (uma imagem de cada vez)

### 1. `tuning-remap.jpg` — Tuning · Remap e escape desportivo
```
Photorealistic commercial photo, horizontal 3:2. Inside a clean modern auto workshop in Maputo, Mozambique, with dark charcoal walls, glossy black epoxy floor, red accent stripes (#E11D2A) and white LED strip lights. A Black Mozambican technician in a black uniform with red details sits by the open driver's door of a dark grey Toyota Hilux double cab, holding a laptop connected to the car's OBD port by a cable, showing abstract engine graphs (no readable text). In the background, the rear of the Hilux with a polished stainless sport exhaust tip catches the light. Moody, premium lighting, shallow depth of field, 35mm lens f/2.8. No legible text, no brand logos, blank licence plate. Main subject in the centre and upper two thirds, darker and simpler lower third. Deep blacks, neutral whites, red only as an accent.
```

### 2. `ceramic-coating.jpg` — Detailing · Ceramic coating 9H
```
Photorealistic commercial photo, horizontal 3:2. Close-up in a dark detailing studio in Maputo, Mozambique: the gloved hands of a Black Mozambican detailer (black nitrile gloves, black sleeves with a thin red stripe) applying ceramic coating with a small applicator block to the bonnet of a glossy black Toyota Corolla. Water-like reflections of white LED strip lights on the paint, mirror finish, a few beads of liquid. Red accent light on the far wall. Macro detail, shallow depth of field, 50mm lens f/2.8. No legible text, no logos. Subject in the centre/upper area, darker lower third. Deep blacks, crisp whites, subtle red accent.
```

### 3. `correcao-pintura.jpg` — Pintura · Correção de pintura
```
Photorealistic commercial photo, horizontal 3:2. A Black Mozambican technician in a black uniform with red details uses a dual-action machine polisher on the door of a white Mazda Demio inside a clean workshop in Maputo, Mozambique. A strong white inspection light reveals half of the panel swirl-free and half with fine swirls, showing the before/after of paint correction. Dark charcoal walls with red accent stripes (#E11D2A), black epoxy floor. 35mm lens f/2.8, shallow depth of field. No legible text, no brand logos, blank licence plate. Subject centred, lower third darker. Deep blacks, neutral whites, red accent.
```

### 4. `revisao-completa.jpg` — Mecânica · Revisão completa
```
Photorealistic commercial photo, horizontal 3:2. A Toyota Land Cruiser raised on a two-post lift in a clean modern workshop in Maputo, Mozambique. A Black Mozambican mechanic in a black uniform with red details and black gloves inspects the front brake disc and suspension with a torch, a tidy red tool trolley beside him. Dark charcoal walls, red accent stripes (#E11D2A), black epoxy floor, white LED strip lights. 35mm lens f/2.8, professional and calm atmosphere. No legible text, no brand logos, blank licence plate. Subject in the centre/upper two thirds, darker lower third. Deep blacks, neutral whites, red accent.
```

### 5. `lavagem-premium.jpg` — Lavagem · Lavagem premium
```
Photorealistic commercial photo, horizontal 3:2. A dark blue Toyota Ractis covered in thick white snow foam inside a clean wash bay in Maputo, Mozambique. A Black Mozambican worker in a black waterproof uniform with red details rinses it with a pressure washer, water droplets frozen in the light. Black tiled walls with a red accent stripe (#E11D2A), wet black floor reflecting white LED lights. 35mm lens, fast shutter, crisp droplets. No legible text, no logos, blank licence plate. Car and worker in the centre, darker lower third. Deep blacks, bright whites, red accent.
```

### 6. `diagnostico-eletronico.jpg` — Eletricidade · Diagnóstico eletrónico
```
Photorealistic commercial photo, horizontal 3:2. Close-up under the open bonnet of a silver Toyota Vitz in a modern workshop in Maputo, Mozambique. The hands of a Black Mozambican auto electrician (black gloves, black sleeve with red stripe) measure a fuse box with a digital multimeter, red and black probes, wiring neatly visible; a tablet with abstract diagnostic graphs (no readable text) rests on the wing cover. Dark background with a red accent light (#E11D2A) and white LED reflections. 50mm lens f/2.8, shallow depth of field. No legible text, no brand logos. Subject centred, darker lower third.
```

### 7. `suspensao-jantes.jpg` — Tuning · Suspensão e jantes
```
Photorealistic commercial photo, horizontal 3:2. A lowered dark grey Honda Fit on a wheel alignment ramp in a clean workshop in Maputo, Mozambique, fitted with new black alloy wheels. A Black Mozambican technician in a black uniform with red details kneels by the front wheel adjusting an alignment target clamp. Dark charcoal walls with red accent stripes (#E11D2A), black epoxy floor, white LED strip lights. Low camera angle, 35mm lens f/2.8. No legible text, no brand logos, blank licence plate. Subject centred, darker lower third. Deep blacks, neutral whites, red accent.
```

### 8. `mudanca-oleo.jpg` — Mecânica · Mudança de óleo
```
Photorealistic commercial photo, horizontal 3:2. Under a Toyota Corolla raised on a lift in a clean workshop in Maputo, Mozambique: a Black Mozambican mechanic in a black uniform with red details and black gloves removes the oil filter while fresh golden oil drains into a red drain pan. Clean, tidy and professional. Dark charcoal walls, red accents (#E11D2A), white LED lights reflecting on the car's underside. 35mm lens f/2.8. No legible text, no brand logos on oil bottles or parts. Subject in the upper two thirds, darker lower third.
```

### 9. `bate-chapa.jpg` — Bate-chapa · Reparação de chapa
```
Photorealistic commercial photo, horizontal 3:2. A Black Mozambican panel beater in a black uniform with red details and safety glasses repairs a dent on the rear quarter panel of a white Toyota Hilux using a dent-pulling tool, the panel partly sanded to bare metal and primer grey. Clean body shop in Maputo, Mozambique, dark walls with red accent stripes (#E11D2A), black floor, bright white LED lights. 35mm lens f/2.8, focused on the hands and panel. No legible text, no brand logos, blank licence plate. Subject centred, darker lower third.
```

### 10. `smash-grab.jpg` — Smash & Grab · Película de segurança
```
Photorealistic commercial photo, horizontal 3:2. A Black Mozambican installer in a black uniform with red details applies clear security window film (smash and grab film) to the rear side window of a dark grey Toyota Corolla, using a squeegee; water spray droplets and the edge of the film catching the light. Clean workshop in Maputo, Mozambique, dark charcoal walls with red accent stripes (#E11D2A), white LED strip lights. 50mm lens f/2.8, shallow depth of field on the window. No legible text, no logos, blank licence plate. Subject centred, darker lower third. Deep blacks, neutral whites, red accent.
```

### 11. `polimento-vidros.jpg` — Detailing · Polimento e vidros
```
Photorealistic commercial photo, horizontal 3:2. The front of a freshly polished black Mitsubishi Pajero in a dark detailing studio in Maputo, Mozambique, with a mirror-like bonnet reflecting long white LED strip lights; a Black Mozambican detailer in a black uniform with red details wipes the windscreen with a microfibre cloth, water beading on the glass. Red accent light (#E11D2A) on the back wall, black floor. 35mm lens f/2.8, premium automotive mood. No legible text, no brand logos, blank licence plate. Subject centred, darker lower third.
```

### Quadro 1 — `quadro1.png`
```
Create ONE horizontal image, 1536x1024, divided into a 2x2 grid of four equal photographs (each exactly one quarter of the image, 768x512), separated by thin straight white lines, no other borders, no captions, no text anywhere.
Shared style for all four panels: photorealistic commercial automotive photography, full-frame camera, 35mm lens, f/2.8, shallow depth of field. A clean modern auto workshop in Maputo, Mozambique: dark charcoal walls, glossy black epoxy floor, red accent stripes (#E11D2A) on walls and tool cabinets, white LED strip lights. Black Mozambican technicians in black uniforms with red details and black gloves. Everyday cars common in Mozambique, no supercars. No legible text, no brand logos, blank licence plates. In each panel the main subject sits in the centre/upper two thirds and the lower third is darker and simpler. Deep blacks, neutral whites, red only as an accent. Consistent lighting and colour grade across all panels.
Top-left: a technician sits by the open driver's door of a dark grey Toyota Hilux double cab with a laptop connected to the OBD port showing abstract engine graphs; the polished stainless sport exhaust tip of the Hilux shines in the background (ECU remap).
Top-right: close-up of gloved hands applying ceramic coating with a small applicator block to the mirror-like black bonnet of a Toyota Corolla, LED strip reflections on the paint.
Bottom-left: a technician uses a dual-action machine polisher on the door of a white Mazda Demio, an inspection light showing half the panel swirl-free and half with fine swirls (paint correction).
Bottom-right: a Toyota Land Cruiser raised on a two-post lift, a mechanic inspecting the front brake disc and suspension with a torch, a tidy red tool trolley beside him (full service).
```

### Quadro 2 — `quadro2.png`
```
Create ONE horizontal image, 1536x1024, divided into a 2x2 grid of four equal photographs (each exactly one quarter of the image, 768x512), separated by thin straight white lines, no other borders, no captions, no text anywhere.
Shared style for all four panels: photorealistic commercial automotive photography, full-frame camera, 35mm lens, f/2.8, shallow depth of field. A clean modern auto workshop in Maputo, Mozambique: dark charcoal walls, glossy black epoxy floor, red accent stripes (#E11D2A) on walls and tool cabinets, white LED strip lights. Black Mozambican technicians in black uniforms with red details and black gloves. Everyday cars common in Mozambique, no supercars. No legible text, no brand logos, blank licence plates. In each panel the main subject sits in the centre/upper two thirds and the lower third is darker and simpler. Deep blacks, neutral whites, red only as an accent. Consistent lighting and colour grade across all panels.
Top-left: a dark blue Toyota Ractis covered in thick white snow foam in a wash bay, a worker in a black waterproof uniform rinsing it with a pressure washer, water droplets frozen in the light, wet black floor (premium wash).
Top-right: close-up under the open bonnet of a silver Toyota Vitz, gloved hands measuring the fuse box with a digital multimeter (red and black probes), a tablet with abstract diagnostic graphs on the wing cover (electronic diagnostics).
Bottom-left: a lowered dark grey Honda Fit with new black alloy wheels on a wheel alignment ramp, a technician kneeling to adjust an alignment target clamp on the front wheel, low camera angle (suspension and wheels).
Bottom-right: under a Toyota Corolla on a lift, a mechanic removing the oil filter while fresh golden oil drains into a red drain pan (oil change).
```

### Quadro 3 — `quadro3.png`
```
Create ONE horizontal image, 1536x1024, divided into a 2x2 grid of four equal photographs (each exactly one quarter of the image, 768x512), separated by thin straight white lines, no other borders, no captions, no text anywhere.
Shared style for all four panels: photorealistic commercial automotive photography, full-frame camera, 35mm lens, f/2.8, shallow depth of field. A clean modern auto workshop in Maputo, Mozambique: dark charcoal walls, glossy black epoxy floor, red accent stripes (#E11D2A) on walls and tool cabinets, white LED strip lights. Black Mozambican technicians in black uniforms with red details and black gloves. Everyday cars common in Mozambique, no supercars. No legible text, no brand logos, blank licence plates. In each panel the main subject sits in the centre/upper two thirds and the lower third is darker and simpler. Deep blacks, neutral whites, red only as an accent. Consistent lighting and colour grade across all panels.
Top-left: a panel beater wearing safety glasses repairs a dent on the rear quarter panel of a white Toyota Hilux with a dent-pulling tool, the panel partly sanded to bare metal and grey primer (panel repair).
Top-right: an installer applies clear security window film to the rear side window of a dark grey Toyota Corolla with a squeegee, water spray droplets and the film edge catching the light (smash and grab film).
Bottom-left: the front of a freshly polished black Mitsubishi Pajero with a mirror-like bonnet reflecting long LED strips, a detailer wiping the windscreen with a microfibre cloth, water beading on the glass (polish and glass).
Bottom-right: wide shot of the whole workshop at dusk seen from the entrance: three bays with a Toyota Hilux, a Mazda Demio and a Toyota Land Cruiser, technicians at work, black walls with red stripes, warm evening sky outside (workshop overview).
```
