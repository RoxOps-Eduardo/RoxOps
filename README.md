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
🛠️ Como Utilizar
1. Visualizar o Dashboard Padrão
Basta abrir o arquivo 

index.html
 no navegador. Por padrão, ele carregará os dados contidos em dados.json.

2. Carregar Dados de um Cliente Específico
Para carregar dados de outro cliente (ex: cliente_x), crie um arquivo chamado cliente_x.json na raiz da pasta e acesse a URL passando o parâmetro:

text
index.html?cliente=cliente_x
3. Editar as Métricas na Tela
Clique no botão ⚙️ Editar JSON no canto superior direito.
Altere os valores no formulário interativo de acordo com a performance do mês.
Clique em 💾 Baixar arquivo .json para salvar as modificações no seu computador.
Substitua o arquivo JSON original na pasta pelo novo arquivo baixado para manter os dados atualizados de forma permanente.
📊 Estrutura Recomendada do JSON
O arquivo JSON (dados.json) deve seguir esta estrutura base para que os gráficos e cartões renderizem corretamente:

json
{
  "cliente_nome": "Nome do Cliente",
  "periodo": "Julho 2026",
  "meta_faturamento": 100000,
  "faturamento_atual": 85000,
  "diagnostico": "Seu diagnóstico mensal detalhado...",
  "indicadores": {
    "leads_gerados": 1500,
    "custo_por_lead": 4.5,
    "taxa_conversao": 3.2,
    "investimento_trafego": 6750
  },
  "automacao": {
    "horas_salvas": 120,
    "economia_financeira": 3600,
    "leads_qualificados_bot": 950,
    "taxa_retencao_bot": 88
  },
  "grafico_funil": {
    "impressoes": 50000,
    "cliques": 5000,
    "leads": 1500,
    "vendas": 48
  },
  "grafico_canais": {
    "instagram": 45,
    "whatsapp": 30,
    "site": 15,
    "outros": 10
  }
}
---
### Resumo do que foi feito:
- Criei a documentação com os principais recursos do **ROX Dashboard** em português.
- Expliquei detalhadamente a mecânica de parametrização dinâmica por URL (`?cliente=`), a lógica de edição/exportação de JSON e a estrutura de diretórios para facilitar o seu uso e de terceiros que acessarem o seu repositório no GitHub.
