# Painel de administração — guia

## Como entrar

No rodapé do site, clique no ano **"2026"** (em "© 2026 Blackline Performance"). Abre a página
`admin.html` com o ecrã de login.

| Utilizador | Palavra-passe inicial |
|---|---|
| `admin` | `Blackline@2026` |

**Mude a palavra-passe logo no primeiro acesso** (painel → Conta).

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
Editar nome, descrição, duração e preço (PT e EN) de cada serviço, criar/apagar serviços e categorias,
ativar/desativar sem apagar, marcar "desde". Preço vazio = "Sob orçamento". Também a taxa de recolha e
o último horário de sábado. **Grava automaticamente** e o site passa a mostrar os novos valores.

### Contactos e horário
Telefone, WhatsApp, Instagram, TikTok, email, horário, morada e meios de pagamento — aparecem em todo o site.

### Conta
Mudar palavra-passe, cópia de segurança (descarregar / repor) e estado do armazenamento.

---

## Onde ficam os dados

O site está no GitHub Pages, que **só serve ficheiros** — não consegue guardar nada sozinho. Por isso há dois modos:

| | Modo demonstração (atual) | Modo online |
|---|---|---|
| Configuração | nenhuma | ~10 minutos, uma vez |
| Onde ficam os dados | só no navegador onde foram criados | numa Folha Google da Blackline |
| Marcações dos clientes chegam ao painel? | **Não** (só as feitas no mesmo navegador) | **Sim**, de qualquer telemóvel/computador |
| Preços editados valem para todos? | **Não** | **Sim** |
| Custo | 0 | 0 (conta Google gratuita) |

O modo demonstração serve para mostrar o painel ao cliente. **Para usar a sério é preciso o modo online.**
Não é uma base de dados a instalar: é uma Folha Google normal, que a Blackline pode abrir, filtrar e partilhar.

### Ativar o modo online (passo a passo)

1. Entre na conta Google da Blackline e crie uma **Folha Google** nova (ex.: "Blackline — Marcações").
2. Menu **Extensões → Apps Script**. Apague o código que aparece e cole todo o conteúdo do ficheiro
   [`backend/apps-script.gs`](../backend/apps-script.gs). Guarde (ícone da disquete).
3. Botão **Implementar → Nova implementação**. Em "Tipo", escolha **Aplicação Web**.
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
   Clique **Implementar** e autorize o acesso (o Google mostra um aviso "app não verificada": *Avançadas → Aceder*).
4. Copie o **URL da aplicação Web** (termina em `/exec`).
5. Abra [`js/config.js`](../js/config.js) e cole o URL em `backendUrl: '...'` — ou envie o URL ao programador.
6. Publique o site. Entre no painel com `admin` / `Blackline@2026` e **mude a palavra-passe** em Conta.

A partir daí a folha ganha duas abas automaticamente: **Marcações** (uma linha por pedido) e **Config** (preços e contactos — não editar à mão).

### Segurança
- No modo online a palavra-passe é verificada no servidor (Google), guardada só como *hash*,
  com bloqueio de 15 minutos após 5 tentativas erradas. A sessão expira ao fim de 8 horas.
- O formulário tem proteção contra robôs (campo invisível) e limita pedidos repetidos do mesmo número.
- No modo demonstração a verificação é feita no navegador — serve apenas para demonstrar.
- A página do painel não é indexada pelos motores de pesquisa (`noindex`).
