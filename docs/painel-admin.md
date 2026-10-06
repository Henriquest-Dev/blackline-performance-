# Painel de administração — guia

## Como entrar

No rodapé do site, clique no ano **"2026"** (em "© 2026 Blackline Performance"). Abre a página
`admin.html` com o ecrã de login.

Entra-se com o **email e palavra-passe** de um utilizador do Supabase que esteja na lista de administradores
(ver "Ligar ao Supabase" abaixo). A palavra-passe muda-se no painel → Conta.

> Sem Supabase configurado, o painel funciona em modo demonstração com `admin` / `Blackline@2026`.

## O que tem o painel

### Marcações
Cada pedido feito no site aparece aqui com: nome, telemóvel, email, contacto preferido, serviços, total estimado,
marca/modelo/ano, quilometragem, combustível, matrícula, **número de chassis**, data e hora, entrega e descrição do problema.

- Pesquisa por nome, telemóvel, matrícula, chassis ou referência; filtros por estado e por data.
- Clicar numa marcação abre o detalhe com botões **WhatsApp** (mensagem de confirmação já escrita),
  **Ligar** e **Email**.
- Estados: Novo → Contactado → Confirmado → Concluído / Cancelado.
- Nota interna por marcação (só visível no painel).
- **Exportar CSV** para Excel / Google Sheets (para prospeção e campanhas).

O cliente **já não é enviado para o WhatsApp**: o pedido fica gravado e a Blackline contacta-o.

### Serviços e preços
Formulário próprio **Adicionar novo serviço** (nome, descrição, categoria — ou nova categoria —, duração, preço, "desde", ativo).
Na lista: editar tudo (PT e EN), mudar de categoria, reordenar, ativar/desativar sem apagar, apagar, procurar. Preço vazio = "Sob orçamento". Também a taxa de recolha e
o último horário de sábado. **Grava automaticamente** e o site passa a mostrar os novos valores.

### Promoções
Criar promoções com título e descrição (PT/EN), tipo de desconto (**percentagem**, **valor fixo em MT** ou **preço promocional**),
serviços abrangidos (nenhum = todos os serviços com preço), data de início e fim, ativa/desativada e "mostrar no site".
As promoções ativas aparecem na secção **Promoções** do site e o desconto é aplicado automaticamente na marcação
(preço antigo riscado). Se um serviço tiver várias promoções, aplica-se a mais vantajosa. Estados: Ativa, Agendada, Terminada, Desativada.

### Cotação em PDF
No detalhe de uma marcação → **Preparar cotação PDF**. A cotação vem preenchida com os serviços pedidos (já com promoções);
pode ajustar preços e quantidades, acrescentar **peças/material**, **mão de obra** ou outros serviços, desconto, IVA
(incluído, acrescentado ou isento), validade e observações, em português ou inglês.

- **Enviar PDF por WhatsApp**: no telemóvel (e em computadores com partilha de ficheiros) abre a lista de partilha — escolha
  o WhatsApp e a conversa do cliente; o PDF segue anexado com a mensagem.
  Nos outros computadores o PDF é descarregado e abre-se a conversa do cliente no WhatsApp com a mensagem escrita — basta arrastar o ficheiro.
  (O WhatsApp não permite anexar ficheiros automaticamente a partir de um link.)
- A cotação fica guardada na marcação e o estado passa a **Contactado**.
- Os dados da empresa no PDF (NUIT, morada, IVA, validade, condições, dados bancários) editam-se em **Contactos e horário**.

### Contactos e horário
Telefone, WhatsApp, Instagram, TikTok, email, horário, morada e meios de pagamento — aparecem em todo o site.

### Conta
Mudar palavra-passe, cópia de segurança (descarregar / repor) e estado do armazenamento.

---

## Onde ficam os dados — Supabase

Tudo passa pela base de dados Supabase do projeto `qgaechfinlpsoygqvzll`:

| Tabela | Conteúdo | Quem lê | Quem escreve |
|---|---|---|---|
| `settings` | serviços, preços, promoções, contactos, dados das cotações | todos (o site precisa) | só administradores |
| `bookings` | marcações feitas no site | só administradores | visitantes criam; administradores editam/apagam |
| `quotes` | cotações (linhas, totais, IVA, nº, data de envio) | só administradores | só administradores |
| `admins` | utilizadores com acesso ao painel | o próprio | só no SQL Editor |
| Storage `quotes` | PDFs das cotações (privado) | administradores; o cliente recebe um link temporário | só administradores |

A segurança é feita por **Row Level Security** no próprio Supabase (`supabase/schema.sql`):
um visitante só consegue ler as definições públicas e criar uma marcação — não consegue ver marcações de ninguém,
alterar preços ou mudar o estado de uma marcação. A base de dados também valida o telemóvel, o chassis, a data
(não aceita datas passadas) e bloqueia pedidos repetidos do mesmo número durante 60 segundos.

### Ligar ao Supabase (uma vez)

1. **Tabelas** — no Supabase: **SQL Editor → New query**, cole todo o ficheiro
   [`supabase/schema.sql`](../supabase/schema.sql) e carregue em **Run**. (Pode repetir sem perder dados.)
2. **Utilizador do painel** — **Authentication → Users → Add user → Create new user**: email + palavra-passe,
   com **Auto Confirm User** ligado.
3. **Torná-lo administrador** — no SQL Editor, execute (com o email do passo 2):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'o-email@exemplo.co.mz'
   on conflict do nothing;
   ```
4. **Fechar registos** (recomendado) — **Authentication → Sign In / Providers → Email** →
   desligar *Allow new users to sign up*. (Mesmo ligado, quem se registar não entra no painel — só quem está em `admins`.)
5. Abra o site → clique no "2026" do rodapé → entre com o email e a palavra-passe.

Para dar acesso a outra pessoa: repita os passos 2 e 3 com o email dela.

### Chaves e ficheiro `.env`

- `.env` (não vai para o GitHub) guarda `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`.
- O site é estático, por isso o navegador não lê `.env`: depois de o alterar execute
  `node scripts/build-env.mjs`, que gera `js/env.js` (este sim publicado).
- A chave **publishable** (`sb_publishable_…`) é pública por natureza — foi feita para ir no navegador e é
  protegida pelas regras RLS. **Nunca** use no site a chave **secret** (`sb_secret_…`) nem a `service_role`;
  o script recusa-as.

### Envio da cotação por WhatsApp
O PDF é guardado no Storage e a mensagem de WhatsApp leva um **link seguro** para o PDF (válido durante o prazo da
cotação + 7 dias). No telemóvel abre-se a partilha com o PDF anexado; no computador abre-se a conversa do cliente
já com a mensagem e o link — basta carregar em enviar.
