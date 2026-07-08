# 📊 ROX Dashboard — Relatório de Performance & ROI

Este é o **ROX Dashboard (v2)**, um painel interativo e moderno para visualização de performance, ROI e métricas de automação/IA dos clientes da **ROX — AI & Automation**. O sistema é dinâmico e permite a visualização personalizada por cliente, além de contar com um painel administrativo integrado para edição direta dos indicadores.

---

## ✨ Funcionalidades Principais

- **Carregamento Dinâmico de Clientes**: Suporta múltiplos clientes através de arquivos JSON individuais. O painel identifica o cliente automaticamente através de parâmetros na URL (ex: `index.html?cliente=nome_do_cliente`).
- **Métricas de Performance da Automação**: Monitoramento de economia de horas humanas, taxa de conversão assistida por IA, volume de leads qualificados por bots e taxa de retenção.
- **Gráficos Interativos (Chart.js)**: 
  - **Funil de Conversão**: Evolução visual das etapas de vendas (Impressões, Cliques, Leads, Vendas).
  - **Distribuição de Leads por Canal**: Gráfico de rosca detalhando a origem das conversões.
- **Cálculo de ROI em Tempo Real**: Demonstração clara do retorno financeiro comparando investimento em tráfego e automações com o faturamento gerado.
- **Painel do Administrador Integrado**:
  - Formulário interativo para editar qualquer dado do cliente diretamente na tela.
  - Pré-visualização instantânea das alterações.
  - Botão de exportação para baixar o novo arquivo `.json` atualizado.

---

## 📂 Estrutura de Arquivos

```text
RoxDashboard/
├── assets/
│   ├── logo.png          # Logo oficial da ROX
│   └── logo_bg.jpg       # Imagem de fundo estilizada
├── index.html            # Estrutura HTML do painel (com modal integrado)
├── styles.css            # Estilo premium (visual futurista, dark mode e responsivo)
├── app.js                # Lógica da aplicação, gráficos (Chart.js) e editor de dados
├── dados.json            # Modelo padrão de dados (JSON)
└── zip_dashboard.py      # Script utilitário para compactação do painel
