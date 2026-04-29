# SOS Mulher — Design de Interface

## Identidade Visual

- **Nome do App:** SOS Mulher
- **Paleta de Cores:**
  - Primária: `#D72660` (rosa/vermelho forte — urgência e feminino)
  - Fundo: `#FFFFFF` / `#0F0F0F` (dark)
  - Superfície: `#FFF0F5` / `#1A1A1A` (dark)
  - Texto: `#1A1A1A` / `#F5F5F5` (dark)
  - Muted: `#8A8A8A`
  - Borda: `#F0D0DC` / `#2E2E2E` (dark)
  - Sucesso: `#22C55E`
  - Erro: `#EF4444`
  - Botão SOS: `#D72660` com gradiente para `#A01040`

## Telas

### 1. Home (Tela Principal)
- **Conteúdo:**
  - Cabeçalho com nome do app e ícone de escudo
  - Mensagem de boas-vindas curta e encorajadora
  - Botão SOS central — grande, circular, vermelho/rosa, com ícone de alerta
  - Texto abaixo do botão: "Pressione para acionar seus contatos"
  - Indicador de quantos contatos estão cadastrados
- **Funcionalidade:**
  - Pressionar botão SOS → vibração forte + feedback visual (pulsar) + abre diálogo de confirmação
  - Confirmar → dispara SMS/ligação para todos os contatos cadastrados
  - Se nenhum contato cadastrado → redireciona para tela de Contatos com aviso

### 2. Contatos de Confiança
- **Conteúdo:**
  - Título "Meus Contatos de Confiança"
  - Lista de até 3 slots de contato (card para cada)
  - Cada card: nome, telefone, botão de editar/remover
  - Botão "Adicionar Contato" (desabilitado quando 3 já cadastrados)
  - Modal/Sheet para cadastrar/editar contato: campo Nome + campo Telefone
- **Funcionalidade:**
  - Persistência local com AsyncStorage
  - Validação de telefone (mínimo 8 dígitos)
  - Feedback de sucesso ao salvar

## Fluxo Principal

```
Abrir App → Home
  └─ Botão SOS pressionado
       ├─ Sem contatos → Aviso + ir para Contatos
       └─ Com contatos → Modal de confirmação
            └─ Confirmar → Acionar SMS para cada contato
                           Feedback visual de sucesso

Home → Tab "Contatos"
  └─ Ver/Adicionar/Editar/Remover contatos
```

## Navegação

- **Tab Bar inferior** com 2 abas:
  - `Home` — ícone de escudo/SOS
  - `Contatos` — ícone de pessoas/contatos

## Princípios de Design

- **Clareza acima de tudo:** Em situação de perigo, a mulher deve acionar o SOS com 1-2 toques
- **Botão SOS dominante:** Ocupa o centro da tela, impossível de ignorar
- **Cores de urgência:** Rosa/vermelho transmitem urgência sem ser agressivo
- **Feedback imediato:** Vibração + animação de pulsar ao pressionar SOS
- **Sem distrações:** Interface limpa, sem elementos desnecessários
