# Painel de administração — guia

## Como entrar

No rodapé do site, clique no ano **"2026"** (em "© 2026 Blackline Performance"). Abre a página
`admin.html` com o ecrã de login.

Entra-se com o utilizador e a palavra-passe do painel (definidos no Supabase — **não estão escritos no
repositório**, que é público). A palavra-passe é verificada no Supabase (guardada encriptada, nunca no site). Mude-a no painel → **Conta**:
a partir daí só quem souber a nova palavra-passe entra. Ao mudar, as outras sessões abertas terminam.
Após 8 tentativas erradas em 15 minutos, o login fica bloqueado durante 15 minutos.

## O que tem o painel

### Marcações
Cada pedido feito no site aparece aqui com: nome, telemóvel, email, contacto preferido, serviços, total estimado,
marca/modelo/ano, quilometragem, combustível, matrícula, **número de chassis**, data e hora, entrega e o **pedido do cliente**:
objetivo, sinais que notou, desde quando, se a viatura anda, urgência, peças, detalhe de cada serviço e outros detalhes.

- Pesquisa por nome, telemóvel, matrícula, chassis ou referência; filtros por estado e por data.
- Clicar numa marcação abre o detalhe com botões **WhatsApp** (mensagem de confirmação já escrita),
  **Ligar** e **Email**.
- Estados: Novo → Contactado → Confirmado → Concluído / Cancelado.
- Nota interna por marcação (só visível no painel).
- **Exportar CSV** para Excel / Google Sheets (para prospeção e campanhas).

O cliente **já não é enviado para o WhatsApp**: o pedido fica gravado e a Blackline contacta-o.

### Serviços e preços
Formulário próprio **Adicionar novo serviço** (nome, descrição, categoria — ou nova categoria —, duração, preço, "desde", ativo).
Na lista: editar tudo (PT e EN), mudar de categoria, reordenar, ativar/desativar sem apagar, apagar, procurar. Preço vazio = "Sob orçamento". Também a taxa de recolha, a hora de fecho de segunda a sexta e se
sábados, domingos e feriados ficam "por marcação" ou fechados. **Grava automaticamente** e o site passa a mostrar os novos valores.

**Subopções e subpreços** (em cada serviço → "Subopções e subpreços"): partes do serviço com nome, descrição e preço próprios
(ex.: Smash & Grab — Frente 2 500, Trás 2 500, cada lateral 1 500). O cliente escolhe as que quer; o preço do serviço passa a ser
a soma das escolhidas. "Várias opções" (frente + trás + laterais) ou "Só uma opção" (ex.: tamanho do motor). Preço vazio = a orçamentar.
As subopções escolhidas aparecem na marcação e entram na cotação como linhas separadas.

### Promoções
Criar promoções com título e descrição (PT/EN), tipo de desconto (**percentagem**, **valor fixo em MT** ou **preço promocional**),
serviços abrangidos (nenhum = todos os serviços com preço), data de início e fim, ativa/desativada e "mostrar no site".
As promoções ativas aparecem na secção **Promoções** do site e o desconto é aplicado automaticamente na marcação
(preço antigo riscado). Se um serviço tiver várias promoções, aplica-se a mais vantajosa. Estados: Ativa, Agendada, Terminada, Desativada.

### Cotação em PDF
No detalhe de uma marcação → **Preparar cotação PDF**. A cotação vem preenchida com os serviços pedidos (já com promoções);
pode ajustar preços e quantidades, acrescentar **peças/material**, **mão de obra** ou outros serviços, desconto, validade e observações, em português ou inglês.

**IVA por cotação:** *Incluído no total — automático* (o total fica igual, ex.: 12 000 MT, e o IVA é calculado dentro dele com a taxa
que escrever nesta cotação), *Incluído no total — valor manual* (escreve o valor do IVA; o total não muda), *Acrescentar ao total* ou *Isento*.
Pode esconder a linha do IVA no PDF — o cliente vê só o total.

- **Enviar PDF por WhatsApp**: o PDF é guardado e abre-se a conversa do cliente com a mensagem e o link para o PDF
  (no telemóvel aparece também a partilha com o PDF anexado).
- A cotação fica guardada na marcação e o estado passa a **Contactado**.
- Os dados da empresa no PDF (NUIT, morada, IVA, validade, condições, dados bancários) editam-se em **Contactos e horário**.

### Contactos e horário
Telefone, WhatsApp, Instagram, TikTok, email, horário, morada e meios de pagamento — aparecem em todo o site.

### Conta
Mudar palavra-passe, cópia de segurança (descarregar / repor) e estado do armazenamento.

---

## Onde ficam os dados — Supabase

Tudo o que se edita no painel e tudo o que os clientes enviam fica na base de dados Supabase:

| Tabela | Conteúdo |
|---|---|
| `settings` | serviços, preços, promoções, contactos, dados das cotações |
| `bookings` | marcações do site (incluindo chassis, estado e notas internas) |
| `quotes` | cotações: linhas, totais, IVA, número, data de envio **e o PDF** |
| `private.admin_account` / `admin_sessions` | palavra-passe do painel (encriptada) e sessões |

Segurança: um visitante só consegue **ler os preços** e **criar marcações**. Não consegue ver marcações,
cotações ou alterar nada. As operações do painel são funções da base de dados que exigem uma sessão válida
(obtida com a palavra-passe). A base de dados também valida telemóvel, chassis e data, e bloqueia pedidos
repetidos do mesmo número durante 60 segundos.

### Ligar ao Supabase (uma vez)
Supabase → **SQL Editor → New query** → colar todo o ficheiro [`supabase/schema.sql`](../supabase/schema.sql) → **Run**.
No fim aparece uma linha com `estado = OK`, `tabelas_criadas = 3` e `funcoes_criadas = 10`. Se o Supabase mostrar um aviso
sobre a consulta, escolha **Run this query** — se o aviso for fechado, nada é gravado.
Depois execute, também no SQL Editor, o bloco **credenciais** (fim do ficheiro) com o utilizador e a palavra-passe
escolhidos. Pode voltar a executar o SQL principal sem perder dados nem repor a palavra-passe.
Para trocar as credenciais mais tarde: painel → Conta (palavra-passe) ou o mesmo bloco no SQL Editor (utilizador e palavra-passe).

### Chaves e ficheiro `.env`

- `.env` (não vai para o GitHub) guarda `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`.
- O site é estático, por isso o navegador não lê `.env`: depois de o alterar execute
  `node scripts/build-env.mjs`, que gera `js/env.js` (este sim publicado).
- A chave **publishable** (`sb_publishable_…`) é pública por natureza — foi feita para ir no navegador e é
  protegida pelas regras RLS. **Nunca** use no site a chave **secret** (`sb_secret_…`) nem a `service_role`;
  o script recusa-as.

### Envio da cotação por WhatsApp
O PDF é guardado na base de dados e a mensagem de WhatsApp leva um link (`cotacao.html?q=…`) onde o cliente
abre ou descarrega o PDF. O link só funciona com a chave única de cada cotação e expira 180 dias após o envio.
No telemóvel abre-se também a partilha com o PDF anexado.
