# Sinais de "site feito por IA" — revisão e correções

Revisão do site da Blackline Performance à procura de padrões visuais e de texto que fazem um site parecer
gerado por IA / template genérico. Para cada um: onde estava, porque soa a IA e o que foi feito.

Regra geral adotada: **cada elemento tem de ter uma função para o cliente da oficina**. Decoração que
existe "porque fica bonito" num template sai.

## 1. Ícones

| Onde estava | Problema | Correção |
|---|---|---|
| Agendamento: ícone ✨ "brilhos" no Detailing | É literalmente o ícone que os produtos de IA usam para "gerar com IA". Lê-se como IA no primeiro segundo. | Removido. |
| Agendamento: ícone em quadrado arredondado em cada serviço (chave, engrenagem, raio, escudo, gota…) | Grelha de "ícone + título + descrição" é o layout padrão dos geradores. Os ícones não acrescentavam informação. | Lista de serviços em linhas, como num orçamento: caixa de seleção, nome, descrição, duração e preço alinhado à direita, agrupada por categoria. |
| "Porquê a Blackline": ícone dentro de círculo colorido por cima de cada cartão (relógio, pulso, raio, escudo com visto) | O cartão "ícone em círculo pastel + título + 2 linhas" é a assinatura mais reconhecível de landing pages geradas. | Colunas editoriais numeradas (01–04) com régua preta no topo, sem ícones. |
| Lista com vistos vermelhos em círculo ("✓ Orçamento aprovado…") | Lista de benefícios com check em círculo = template. | Tabela de factos (`Orçamento / Registo / Manutenção`) com linhas finas. |
| Ícone de calendário e seta → em quase todos os botões | Um ícone em cada botão é ruído; os geradores colocam-no por defeito. | Botões só com texto. Mantêm-se apenas ícones com função real e reconhecível: WhatsApp, telefone, Instagram. |
| Visto animado num círculo + confetti no fim do agendamento | Celebração exagerada típica de demos/IA; não combina com uma oficina. | Ecrã de confirmação sóbrio: referência do pedido, texto claro e "o que acontece a seguir". |

## 2. Decoração gratuita

| Onde estava | Problema | Correção |
|---|---|---|
| Bola vermelha com halo antes de "BLP · Driven by Excellence" | O ponto pulsante "live" é um tique de sites de produtos de IA. | Removido (versão anterior). |
| Bolinhas a flutuar e um cursor de seta na hero | Partículas decorativas sem significado. | Removidas. |
| Cartão "4.9 ★★★★★ Avaliação dos clientes" | Avaliação inventada e sem fonte — os clientes notam e perde credibilidade. | Removido. Quando houver avaliações reais (Google), mostrar com link para a fonte. |
| Ícone de rato com animação "scroll" | Clichê de template. | Removido. |
| Brilhos/gradientes radiais vermelhos (processo, CTA, lateral do agendamento) e sombras coloridas nos botões | "Glow" difuso é estética típica de IA/SaaS. | Fundos pretos lisos; sombras coloridas removidas. |
| Rótulos pequenos em maiúsculas espaçadas por cima de cada título ("O QUE FAZEMOS", "TRANSPARÊNCIA TOTAL", "NÃO DEIXE PARA AMANHÃ") | O "eyebrow" em todas as secções é um padrão repetido dos geradores. | Removidos. Fica apenas o slogan real da marca na hero ("BLP · Driven by Excellence", do Instagram). |
| Botões magnéticos que seguem o rato | Efeito "wow" sem função. | Removido. |

## 3. Forma e tipografia

| Onde estava | Problema | Correção |
|---|---|---|
| Tudo em pílula (botões, filtros, chips, inputs, cartões de 18–22 px de raio) | Cantos muito arredondados em tudo = aspeto genérico/"app de IA". | Cantos de 2–6 px. Botões principais em **paralelogramo** inclinado, a mesma diagonal do logótipo "B". |
| Chips de seleção para tudo (marca, serviço, horas) | Chips são rápidos de gerar mas não são o controlo certo. | Controlos certos para cada dado: lista com caixas de seleção, `select` para marca e ano, controlo segmentado para combustível, campo de matrícula com formato de chapa, calendário mensal real. |

## 4. Texto e números

| Onde estava | Problema | Correção |
|---|---|---|
| "1200+ viaturas", "98% satisfeitos" com contador animado | Estatísticas inventadas e animadas são o maior sinal de site gerado. | Removidas. Substituídas por informação útil: horário, marcas, contacto, meios de pagamento. |
| "Resposta em menos de 15 minutos", "em segundos", "o melhor serviço que pode imaginar" | Promessas vagas/hiperbólicas. | Texto factual e verificável. |
| "Experimentar agendamento", "Começar agora", "Tudo pronto!" | Linguagem de produto SaaS, não de oficina. | "Marcar serviço", "Enviar pedido", "Pedido de marcação enviado". |

## 5. Sistema de marcação — antes e depois

**Antes:** janela tipo app com cartões e ícones, chips de dias, interruptor estilo iOS, confetti.

**Agora:** página de marcação de ecrã inteiro, como a de um concessionário:
- barra preta com as 5 etapas numeradas (clicáveis para voltar atrás) e barra de progresso;
- **resumo do pedido** fixo à direita (no telemóvel, barra inferior com total e botões);
- **Serviços** agrupados (Manutenção · Mecânica e eletricidade · Carroçaria e estética · Performance) com duração e preço;
- **Viatura**: marca, modelo, ano, quilometragem, combustível e matrícula em formato de chapa;
- **Data e hora**: calendário mensal (domingos fechados, sábado só manhã, dias sem vagas desativados) e horários de manhã/tarde;
- **Contacto**: nome e apelido, telemóvel moçambicano validado (82–87 + 7 dígitos), email opcional, preferência de contacto, descrição do problema e consentimento;
- **Validação com mensagens nos campos** em vez de botão desativado sem explicação;
- **Confirmação** com cada secção revisível e link "Alterar";
- **Enviado**: referência `BLP-…`, próximos passos, envio por WhatsApp e ficheiro de calendário.

## Checklist para alterações futuras

- [ ] Não adicionar ícones decorativos (só ícones de marca/ação: WhatsApp, telefone, Instagram).
- [ ] Nada de ✨, robôs, "magia", partículas ou brilhos.
- [ ] Sem números ou avaliações que não sejam reais e com fonte.
- [ ] Sem rótulo em maiúsculas por cima de cada título.
- [ ] Cantos até 6 px; botões principais em paralelogramo.
- [ ] Usar fotos reais da oficina e dos trabalhos (as atuais da galeria são de exemplo).
- [ ] Texto: concreto, curto, sem superlativos.
