/* ============================================
   ROX DASHBOARD — Application Logic v2
   Includes: Benchmarks, Diagnostics, Agent Performance
   ============================================ */

let globalData = null; // Store the fetched JSON for editing

document.addEventListener('DOMContentLoaded', () => {
  // Ler o parâmetro ?cliente= na URL (ex: ?cliente=mil_grau carrega mil_grau.json)
  const params = new URLSearchParams(window.location.search);
  const cliente = params.get('cliente') || 'dados';
  const arquivoJson = `${cliente}.json`;

  fetch(arquivoJson)
    .then(res => res.json())
    .then(data => {
      globalData = data;
      renderDashboard(data);
      initEditModal(cliente);
    })
    .catch(err => {
      console.error(`Erro ao carregar ${arquivoJson}:`, err);
      document.querySelector('.main').innerHTML =
        `<p style="text-align:center;color:#EF4444;padding:4rem;">Erro ao carregar o arquivo: ${arquivoJson}</p>`;
    });
});

/* ========== EDIT MODAL LOGIC ========== */
function initEditModal(clienteName) {
  const btnEdit = document.getElementById('btnEdit');
  const modal = document.getElementById('editModal');
  const btnClose = document.getElementById('btnCloseModal');
  const btnExport = document.getElementById('btnExportJson');
  const container = document.getElementById('modalFormContainer');

  if (!btnEdit || !modal) return;

  btnEdit.addEventListener('click', () => {
    buildForm(container, globalData);
    modal.showModal();
  });

  btnClose.addEventListener('click', () => modal.close());
  
  btnExport.addEventListener('click', () => {
    const updatedData = extractFormData(container, globalData);
    globalData = updatedData;
    
    // Download logic
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(updatedData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${clienteName}.json`);
    dlAnchorElem.click();
    
    // Re-render dashboard
    renderDashboard(updatedData);
    modal.close();
  });
}

function buildForm(container, data) {
  let html = '';
  
  // Recursively build inputs for object keys
  function recurseObj(obj, prefix = '') {
    for (const key in obj) {
      if (key === 'logo') continue; // skip logo for now
      
      const val = obj[key];
      const fieldId = prefix ? `${prefix}.${key}` : key;
      const label = key.replace(/_/g, ' ').toUpperCase();
      
      if (typeof val === 'object' && val !== null) {
        html += `<div class="form-section-title">${label}</div>`;
        recurseObj(val, fieldId);
      } else {
        html += `
          <div class="form-group">
            <label>${label}</label>
            <input type="${typeof val === 'number' ? 'number' : 'text'}" 
                   id="input_${fieldId}" 
                   value="${val}" 
                   step="any" />
          </div>
        `;
      }
    }
  }
  
  recurseObj(data);
  container.innerHTML = html;
}

function extractFormData(container, originalData) {
  // Deep clone to avoid mutating original structure before save
  const newData = JSON.parse(JSON.stringify(originalData));
  
  function updateVal(obj, path, value, type) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    current[lastKey] = type === 'number' ? Number(value) : value;
  }
  
  const inputs = container.querySelectorAll('input');
  inputs.forEach(input => {
    const fieldId = input.id.replace('input_', '');
    updateVal(newData, fieldId, input.value, input.type);
  });
  
  return newData;
}

/* ========== HELPERS ========== */

function currency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

function pct(value) {
  return (value * 100).toFixed(1) + '%';
}

function safeDivide(a, b) {
  return b === 0 ? 0 : a / b;
}

/* ========== MAIN RENDER ========== */

function renderDashboard(d) {
  /* --- Computed Metrics --- */
  const totalLeads = d.funil.leads_total;
  const vendas = d.funil.vendas;
  const faturamento = d.financeiro.faturamento_total;
  const investTotal = d.investimento.total;
  const ticketMedio = d.financeiro.ticket_medio;
  const mc = d.financeiro.margem_contribuicao;
  const ltMeses = d.financeiro.lifetime_meses;

  const cpl = safeDivide(d.investimento.ads, totalLeads);
  const cac = safeDivide(investTotal, vendas);
  const ltv = ticketMedio * ltMeses * mc;
  const ltvCac = safeDivide(ltv, cac);
  const roiDireto = safeDivide(faturamento - investTotal, investTotal);
  const roiLtv = safeDivide(ltv * vendas - investTotal, investTotal);
  const roas = safeDivide(faturamento, d.investimento.ads);
  const metaPct = safeDivide(faturamento, d.meta_proposta);

  // Conversion rates
  const taxaMql = safeDivide(d.funil.mql, totalLeads);
  const taxaSql = safeDivide(d.funil.sql, d.funil.mql);
  const taxaOpp = safeDivide(d.funil.oportunidades, d.funil.sql);
  const taxaVenda = safeDivide(vendas, d.funil.oportunidades);
  const taxaGeral = safeDivide(vendas, totalLeads);

  /* --- Header --- */
  document.getElementById('clientName').textContent =
    d.cliente.empresa ? `${d.cliente.nome} — ${d.cliente.empresa}` : d.cliente.nome;
  document.getElementById('periodLabel').textContent =
    `${d.periodo.inicio} a ${d.periodo.fim}`;

  /* --- Health Badge --- */
  const badgeMap = {
    'Estável':  { cls: 'badge--stable',   label: 'Saudável' },
    'Atenção':  { cls: 'badge--warning',  label: 'Atenção' },
    'Crítico':  { cls: 'badge--critical', label: 'Crítico' },
  };
  const badge = badgeMap[d.saude] || badgeMap['Estável'];
  document.getElementById('healthBadge').innerHTML =
    `<span class="badge ${badge.cls}"><span class="badge-dot"></span>${badge.label}</span>`;

  /* --- Meta Progress --- */
  const pctMeta = Math.min(metaPct * 100, 100);
  document.getElementById('metaValues').innerHTML =
    `${currency(faturamento)} <span>/ ${currency(d.meta_proposta)}</span>`;
  document.getElementById('metaPercentage').textContent = pct(metaPct);
  setTimeout(() => {
    document.getElementById('progressBar').style.width = pctMeta + '%';
  }, 300);

  /* ============================
     NEW: DIAGNOSTIC SECTION
     ============================ */
  const bm = d.benchmarks;
  let gargalo = 'Nenhum gargalo identificado este mês.';
  let recomendacao = 'Manter operação atual e monitorar métricas.';
  
  if (taxaMql < bm.taxa_mql_minima) {
    gargalo = 'Taxa MQL abaixo do ideal — pouco interesse no topo do funil';
    recomendacao = 'Revisar segmentação de anúncios ou oferta da Landing Page.';
  } else if (taxaSql < bm.taxa_sql_minima) {
    gargalo = 'Taxa SQL abaixo do ideal — qualificação fraca';
    recomendacao = 'Retreinar prompt do Agente Concierge para perguntas de qualificação mais incisivas.';
  } else if (taxaVenda < bm.taxa_conversao_minima) {
    gargalo = 'Taxa de Conversão (Vendas) abaixo do ideal';
    recomendacao = 'Melhorar o processo de fechamento comercial e follow-up (closer).';
  } else if (cac > bm.cac_maximo) {
    gargalo = 'CAC muito alto — custo de aquisição estourado';
    recomendacao = 'Otimizar campanhas de tráfego para reduzir custo por lead ou aumentar taxa de conversão.';
  }

  const diagSection = document.getElementById('diagnosticSection');
  diagSection.innerHTML = `
    <div class="diagnostic-grid">
      <div class="diagnostic-card diagnostic-card--gargalo">
        <div class="diagnostic-icon">&#9888;</div>
        <div class="diagnostic-header">Gargalo Principal</div>
        <div class="diagnostic-text">${gargalo}</div>
      </div>
      <div class="diagnostic-card diagnostic-card--recomendacao">
        <div class="diagnostic-icon">&#10024;</div>
        <div class="diagnostic-header">Recomendação de Ação</div>
        <div class="diagnostic-text">${recomendacao}</div>
      </div>
    </div>
  `;

  /* --- Trend Helper --- */
  function getTrend(current, previous, inverse = false) {
    if (!previous) return '';
    const diff = (current - previous) / previous;
    const isUp = diff > 0;
    const isGood = inverse ? !isUp : isUp;
    const color = isGood ? 'var(--green)' : 'var(--red)';
    const arrow = isUp ? '↑' : '↓';
    return `<span style="color:${color}; font-weight:600; font-size:0.85rem; margin-left:8px;">${arrow} ${Math.abs(diff * 100).toFixed(1)}% vs Mês Ant.</span>`;
  }

  /* --- Metric Cards --- */
  const metrics = [
    { icon: '💰', label: 'Investimento Total', value: currency(investTotal), sub: `Ads: ${currency(d.investimento.ads)} | Operacional: ${currency(d.investimento.operacional)}` },
    { icon: '👥', label: 'Leads Gerados', value: totalLeads.toLocaleString('pt-BR'), sub: `CPL: ${currency(cpl)}` },
    { icon: '🎯', label: 'Vendas Realizadas', value: vendas, sub: `Ticket Médio: ${currency(ticketMedio)}`, green: true },
    { icon: '📊', label: 'Faturamento', value: currency(faturamento), sub: `Meta: ${currency(d.meta_proposta)} ${d.mes_anterior ? getTrend(faturamento, d.mes_anterior.faturamento_total) : ''}`, green: true },
    { icon: '💵', label: 'CPV', value: currency(cac), sub: `Ideal: ${currency(d.benchmarks.cac_maximo)} ${d.mes_anterior ? getTrend(cac, d.mes_anterior.cac, true) : ''}`, warn: cac > d.benchmarks.cac_maximo },
    { icon: '⏳', label: 'LTV Estimado', value: currency(ltv), sub: `${ltMeses} meses × MC ${pct(mc)}`, cyan: true },
  ];

  const metricsGrid = document.getElementById('metricsGrid');
  metricsGrid.innerHTML = metrics.map(m => `
    <div class="metric-card animate-in">
      <div class="metric-icon">${m.icon}</div>
      <div class="metric-label">${m.label}</div>
      <div class="metric-value ${m.green ? 'metric-value--green' : ''} ${m.cyan ? 'metric-value--cyan' : ''} ${m.warn ? 'metric-value--warn' : ''}">${m.value}</div>
      <div class="metric-sub" style="display:flex; align-items:center;">${m.sub}</div>
    </div>
  `).join('');

  /* ============================
     NEW: AUTOMATION PERFORMANCE
     ============================ */
  if (d.performance_automacao) {
    const pa = d.performance_automacao;
    const automationMetrics = [
      { icon: '💬', label: 'Mensagens Processadas', value: pa.mensagens_processadas.toLocaleString('pt-BR'), sub: `Transbordo p/ Humano: ${pa.transbordo_humano}`, cyan: true },
      { icon: '⚡', label: 'Taxa de Resposta (IA)', value: pct(pa.taxa_resposta), sub: `Respostas geradas ativamente`, green: pa.taxa_resposta >= 0.75 },
      { icon: '⏱️', label: 'Tempo de Resposta', value: pa.tempo_medio_resposta_seg + 's', sub: 'Média de SLA da automação', cyan: true },
      { icon: '📅', label: 'Agendamentos', value: pa.agendamentos_realizados, sub: `Feitos diretamente pela IA`, green: true },
      { icon: '🔄', label: 'Follow-ups Ativos', value: pa.follow_ups_disparados, sub: `Disparos automáticos do robô` },
    ];

    document.getElementById('automationGrid').innerHTML = automationMetrics.map(m => `
      <div class="metric-card animate-in">
        <div class="metric-icon">${m.icon}</div>
        <div class="metric-label">${m.label}</div>
        <div class="metric-value ${m.green ? 'metric-value--green' : ''} ${m.cyan ? 'metric-value--cyan' : ''}">${m.value}</div>
        <div class="metric-sub">${m.sub}</div>
      </div>
    `).join('');
  }

  /* --- ROI Cards --- */
  const roiCards = [
    { label: 'ROAS', value: roas.toFixed(1) + 'x', sub: 'Retorno sobre Ads', highlight: false },
    { label: 'ROI Direto', value: (roiDireto * 100).toFixed(0) + '%', sub: `Lucro: ${currency(faturamento - investTotal)}`, highlight: true },
    { label: 'LTV:CAC', value: ltvCac.toFixed(1) + 'x', sub: ltvCac >= d.benchmarks.ltv_cac_minimo ? 'Sustentável' : 'Abaixo do ideal (3x)', highlight: true, isHealthy: ltvCac >= d.benchmarks.ltv_cac_minimo },
    { label: 'ROI com LTV', value: (roiLtv * 100).toFixed(0) + '%', sub: `LTV Total: ${currency(ltv * vendas)}`, highlight: true },
    { label: 'Payback', value: safeDivide(cac, ticketMedio * mc).toFixed(1) + ' meses', sub: 'Tempo para recuperar CAC', highlight: false },
  ];

  document.getElementById('roiGrid').innerHTML = roiCards.map(c => `
    <div class="roi-card ${c.highlight ? 'roi-card--highlight' : ''}">
      <div class="roi-label">${c.label}</div>
      <div class="roi-value ${c.highlight ? (c.isHealthy === false ? 'metric-value--warn' : 'metric-value--green') : 'metric-value--cyan'}">${c.value}</div>
      <div class="roi-sub">${c.sub}</div>
    </div>
  `).join('');

  /* ============================
     NEW: BENCHMARKS TABLE
     ============================ */
  const benchRows = [
    { metric: 'CPL (Custo por Lead)', atual: currency(cpl), ideal: `Até ${currency(bm.cpl_maximo)}`, ok: cpl <= bm.cpl_maximo },
    { metric: 'CPV (Custo por Venda)', atual: currency(cac), ideal: `Até ${currency(bm.cac_maximo)}`, ok: cac <= bm.cac_maximo },
    { metric: 'Taxa MQL', atual: pct(taxaMql), ideal: `Mín. ${pct(bm.taxa_mql_minima)}`, ok: taxaMql >= bm.taxa_mql_minima },
    { metric: 'Taxa SQL', atual: pct(taxaSql), ideal: `Mín. ${pct(bm.taxa_sql_minima)}`, ok: taxaSql >= bm.taxa_sql_minima },
    { metric: 'Taxa de Conversão (Fechamento)', atual: pct(taxaVenda), ideal: `Mín. ${pct(bm.taxa_conversao_minima)}`, ok: taxaVenda >= bm.taxa_conversao_minima },
    { metric: 'LTV:CAC', atual: ltvCac.toFixed(1) + 'x', ideal: `Mín. ${bm.ltv_cac_minimo}x`, ok: ltvCac >= bm.ltv_cac_minimo },
  ];

  document.getElementById('benchmarkTableBody').innerHTML = benchRows.map(r => `
    <tr>
      <td>${r.metric}</td>
      <td><strong>${r.atual}</strong></td>
      <td style="color: var(--text-muted)">${r.ideal}</td>
      <td>
        <span class="bench-status ${r.ok ? 'bench-status--ok' : 'bench-status--fail'}">
          ${r.ok ? 'Dentro do ideal' : 'Abaixo do ideal'}
        </span>
      </td>
    </tr>
  `).join('');

  /* --- Channel Table --- */
  const channels = [];
  if (d.canais_leads) {
    for (const [key, data] of Object.entries(d.canais_leads)) {
      channels.push({
        name: key,
        inv: data.investimento,
        leads: data.leads
      });
    }
  }

  const colorPalette = [
    '#4285F4', // Google Blue
    '#0668E1', // Meta Blue
    '#25D366', // WhatsApp Green
    '#00D2FF', // Rox Cyan
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899'  // Pink
  ];

  document.getElementById('channelTableBody').innerHTML = channels.map((ch, idx) => {
    const chCpl = safeDivide(ch.inv, ch.leads);
    const chPct = safeDivide(ch.leads, totalLeads);
    const color = colorPalette[idx % colorPalette.length];
    ch.color = color; // Store color for chart
    return `
      <tr>
        <td>
          <div class="channel-name">
            <span class="channel-dot" style="background-color: ${color};"></span>
            ${ch.name}
          </div>
        </td>
        <td>${currency(ch.inv)}</td>
        <td>${ch.leads}</td>
        <td>${currency(chCpl)}</td>
        <td>${pct(chPct)}</td>
      </tr>
    `;
  }).join('');

  /* --- Conversion Grid --- */
  const conversionMetrics = [
    { label: 'Lead → MQL', value: d.funil.mql > 0 ? pct(taxaMql) : '—', sub: `${totalLeads} → ${d.funil.mql}`, ok: d.funil.mql > 0 ? taxaMql >= bm.taxa_mql_minima : false },
    { label: 'MQL → SQL', value: d.funil.sql > 0 ? pct(taxaSql) : '—', sub: `${d.funil.mql} → ${d.funil.sql}`, ok: d.funil.sql > 0 ? taxaSql >= bm.taxa_sql_minima : false },
    { label: 'SQL → Oportunidade', value: d.funil.oportunidades > 0 ? pct(taxaOpp) : '—', sub: `${d.funil.sql} → ${d.funil.oportunidades}` },
    { label: 'Oportunidade → Venda', value: (d.funil.oportunidades > 0 && vendas > 0) ? pct(taxaVenda) : '—', sub: `${d.funil.oportunidades} → ${vendas}`, ok: (d.funil.oportunidades > 0) ? taxaVenda >= bm.taxa_conversao_minima : false },
    { label: 'Conversão Geral', value: pct(taxaGeral), sub: `${totalLeads} leads → ${vendas} vendas`, cyan: true },
  ];

  document.getElementById('conversionGrid').innerHTML = conversionMetrics.map(m => `
    <div class="metric-card animate-in">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value ${m.cyan ? 'metric-value--cyan' : ''} ${m.ok === false ? 'metric-value--warn' : ''} ${m.ok === true ? 'metric-value--green' : ''}">${m.value}</div>
      <div class="metric-sub">${m.sub}</div>
    </div>
  `).join('');

  /* --- Footer --- */
  const now = new Date();
  document.getElementById('footerDate').textContent =
    `Gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  /* ========== CHARTS ========== */
  renderFunnelChart(d);
  renderChannelChart(d, channels);
}

/* ========== FUNNEL CHART ========== */

function renderFunnelChart(d) {
  const ctx = document.getElementById('funnelChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Leads', 'MQL', 'SQL', 'Oportunidades', 'Vendas'],
      datasets: [{
        data: [d.funil.leads_total, d.funil.mql, d.funil.sql, d.funil.oportunidades, d.funil.vendas],
        backgroundColor: [
          'rgba(0, 210, 255, 0.7)',
          'rgba(0, 210, 255, 0.55)',
          'rgba(0, 210, 255, 0.4)',
          'rgba(0, 245, 160, 0.5)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgba(0, 210, 255, 1)',
          'rgba(0, 210, 255, 0.8)',
          'rgba(0, 210, 255, 0.6)',
          'rgba(0, 245, 160, 0.8)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(2, 8, 19, 0.95)',
          titleColor: '#00D2FF',
          bodyColor: '#FFFFFF',
          borderColor: 'rgba(0, 210, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.06)' },
          ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#FFFFFF', font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } },
        },
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart',
      },
    },
  });
}

/* ========== CHANNEL DOUGHNUT CHART ========== */

function renderChannelChart(d, channels) {
  const ctx = document.getElementById('channelChart').getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: channels.map(c => c.name),
      datasets: [{
        data: channels.map(c => c.leads),
        backgroundColor: channels.map(c => {
          // Convert hex to rgba for consistency, or just use hex + transparency
          return c.color + 'CC'; // Add some transparency
        }),
        borderColor: 'rgba(2, 8, 19, 1)',
        borderWidth: 3,
        hoverBorderColor: '#00D2FF',
        hoverBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94A3B8',
            padding: 20,
            font: { family: 'Plus Jakarta Sans', size: 12 },
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(2, 8, 19, 0.95)',
          titleColor: '#00D2FF',
          bodyColor: '#FFFFFF',
          borderColor: 'rgba(0, 210, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
        },
      },
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: 'easeOutQuart',
      },
    },
  });
}
