// ===========================
// PDF GENERATOR MODULE
// Using html2pdf.js for elegant PDF generation with CSS styling
// ===========================

class PDFGenerator {
  constructor(financialData) {
    this.data = financialData;
    this.logoBase64 = null;
  }

  // Load logo as base64
  async loadLogo() {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        this.logoBase64 = canvas.toDataURL('image/png');
        resolve();
      };
      img.onerror = () => {
        console.warn('Could not load logo');
        resolve();
      };
      img.src = 'assets/images/logo.png';
    });
  }

  // Main method: Generate professional report with html2pdf
  async generateProfessionalReport(aiContent, chartImages = null) {
    try {
      console.log('📄 Generating professional report with html2pdf...');
      await this.loadLogo();

      const sections = this.parseSections(aiContent);
      const htmlContent = this.buildReportHTML(sections, chartImages);

      // Create temporary container
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position: absolute; left: -9999px; top: 0;';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      const companyNameSlug = this.data.company.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const filename = 'report-' + companyNameSlug + '-' + this.getCurrentDate() + '.pdf';

      // Configure html2pdf
      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(tempDiv.firstChild).save();

      document.body.removeChild(tempDiv);

      console.log('✅ Professional report generated successfully');
    } catch (error) {
      console.error('❌ Error generating professional report:', error);
      throw error;
    }
  }

  // Parse AI content into sections
  parseSections(aiContent) {
    const sections = [];
    const lines = aiContent.split('\n');
    let currentSection = null;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('## ', '').trim(),
          content: []
        };
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line);
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  // Build complete HTML for report
  buildReportHTML(sections, chartImages) {
    const currentDate = this.getFormattedDate();

    return '<div class="report-container" style="' + this.getBaseStyles() + '">' +
      this.generateCoverPage(currentDate) +
      this.generateContentPages(sections, chartImages) +
      '</div>';
  }

  // Get base inline styles
  getBaseStyles() {
    return 'font-family: "Times New Roman", Times, serif; color: #1A1F36; font-size: 11pt; line-height: 1.6; background: white;';
  }

  // Generate elegant cover page
  generateCoverPage(currentDate) {
    const company = this.data.company.name;
    const rating = this.data.riskAssessment.rating;
    const categoryLabel = this.data.riskAssessment.categoryLabel;

    let html = '<div style="height: 297mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; padding: 3rem;">';

    if (this.logoBase64) {
      html += '<img src="' + this.logoBase64 + '" alt="Logo" style="width: 120px; height: auto; margin-bottom: 3rem;">';
    }

    html += '<h1 style="font-size: 36pt; font-weight: 700; color: #1A1F36; margin: 0 0 1rem 0; line-height: 1.2;">' +
      'REPORT FINANZIARIO<br>COMPLETO' +
      '</h1>';

    html += '<div style="font-size: 20pt; font-weight: 600; color: #4F566B; margin-bottom: 0.5rem;">' +
      company +
      '</div>';

    html += '<div style="font-size: 14pt; color: #697386; margin-bottom: 3rem;">' +
      currentDate +
      '</div>';

    html += '<div style="border: 3px solid #635BFF; border-radius: 16px; padding: 2.5rem 3rem; margin: 2rem auto; background: white; box-shadow: 0 4px 12px rgba(99, 91, 255, 0.15);">' +
      '<div style="font-size: 10pt; color: #697386; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">' +
      'Rating Aziendale' +
      '</div>' +
      '<div style="font-size: 48pt; font-weight: 700; color: #635BFF; margin: 0.5rem 0; line-height: 1;">' +
      rating +
      '</div>' +
      '<div style="font-size: 12pt; color: #4F566B; font-weight: 500;">' +
      categoryLabel +
      '</div>' +
      '</div>';

    html += '</div>';
    return html;
  }

  // Generate content pages
  generateContentPages(sections, chartImages) {
    let html = '';

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionTitle = section.title;
      const sectionLower = sectionTitle.toLowerCase();

      html += '<div style="' + (i > 0 ? 'page-break-before: always; ' : '') + 'padding: 2rem;">';
      html += '<h2 style="font-size: 18pt; font-weight: 700; color: #635BFF; margin: 0 0 1.5rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid #E3E8EE;">' + sectionTitle + '</h2>';

      // Add special content based on section
      if (sectionLower.includes('executive summary')) {
        html += this.generateKeyMetricsBoxes();
        html += this.generateSummaryCards();
      }

      if (sectionLower.includes('analisi economica') || sectionLower.includes('conto economico')) {
        html += this.generateContoEconomicoTable();
        if (chartImages && chartImages.economicTrend) {
          html += '<div style="margin: 2rem 0; text-align: center; page-break-inside: avoid;">' +
            '<img src="' + chartImages.economicTrend + '" style="max-width: 100%; height: auto;">' +
            '</div>';
        }
      }

      if (sectionLower.includes('stato patrimoniale')) {
        html += this.generateStatoPatrimonialeTable();
      }

      if (sectionLower.includes('risk assessment') || sectionLower.includes('rischio')) {
        html += this.generateRiskBox();
        if (chartImages && chartImages.benchmarkRadar) {
          html += '<div style="margin: 2rem 0; text-align: center; page-break-inside: avoid;">' +
            '<img src="' + chartImages.benchmarkRadar + '" style="max-width: 80%; height: auto;">' +
            '</div>';
        }
      }

      if (sectionLower.includes('codice della crisi')) {
        html += this.generateCodiceCrisiIndicators();
      }

      // Add AI-generated content
      const content = section.content.join('\n');
      html += this.markdownToHTML(content);

      // Add relevant charts
      if (sectionLower.includes('sostenibilità') || sectionLower.includes('debt')) {
        if (chartImages && chartImages.debtSustainability) {
          html += '<div style="margin: 2rem 0; text-align: center; page-break-inside: avoid;">' +
            '<img src="' + chartImages.debtSustainability + '" style="max-width: 100%; height: auto;">' +
            '</div>';
        }
      }

      if (sectionLower.includes('capitale') || sectionLower.includes('working capital')) {
        if (chartImages && chartImages.workingCapital) {
          html += '<div style="margin: 2rem 0; text-align: center; page-break-inside: avoid;">' +
            '<img src="' + chartImages.workingCapital + '" style="max-width: 100%; height: auto;">' +
            '</div>';
        }
      }

      if (sectionLower.includes('stress')) {
        if (chartImages && chartImages.stressTest) {
          html += '<div style="margin: 2rem 0; text-align: center; page-break-inside: avoid;">' +
            '<img src="' + chartImages.stressTest + '" style="max-width: 100%; height: auto;">' +
            '</div>';
        }
      }

      html += '</div>';
    }

    return html;
  }

  // Generate key metrics boxes (4-column grid)
  generateKeyMetricsBoxes() {
    if (!this.data.keyMetrics) return '';

    const metrics = this.data.keyMetrics.slice(0, 4);
    let html = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 2rem 0; page-break-inside: avoid;">';

    metrics.forEach(m => {
      const trendColor = m.trend > 0 ? '#00D924' : m.trend < 0 ? '#DF1B41' : '#697386';
      const trendSymbol = m.trend > 0 ? '↑' : m.trend < 0 ? '↓' : '→';

      html += '<div style="background: white; border: 1px solid #E3E8EE; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(50, 50, 93, 0.05), 0 1px 2px rgba(0, 0, 0, 0.08);">' +
        '<div style="font-size: 9pt; color: #697386; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">' +
        m.label +
        '</div>' +
        '<div style="font-size: 18pt; font-weight: 700; color: #1A1F36; margin-bottom: 0.5rem;">' +
        m.value +
        '</div>';

      if (m.trend !== undefined) {
        html += '<div style="font-size: 10pt; font-weight: 600; color: ' + trendColor + ';">' +
          trendSymbol + ' ' + Math.abs(m.trend).toFixed(1) + '%' +
          '</div>';
      }

      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  // Generate summary cards (strengths/weaknesses)
  generateSummaryCards() {
    if (!this.data.executiveSummary) return '';

    const strengths = this.data.executiveSummary.strengths || [];
    const weaknesses = this.data.executiveSummary.weaknesses || [];

    let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0; page-break-inside: avoid;">';

    // Strengths card
    html += '<div style="background: linear-gradient(135deg, rgba(0, 217, 36, 0.05) 0%, rgba(0, 217, 36, 0.02) 100%); border: 1px solid rgba(0, 217, 36, 0.2); border-radius: 12px; padding: 1.5rem;">' +
      '<h3 style="font-size: 12pt; font-weight: 700; color: #00D924; margin: 0 0 1rem 0; display: flex; align-items: center;">' +
      '<span style="margin-right: 0.5rem;">✓</span> Punti di Forza' +
      '</h3>' +
      '<ul style="margin: 0; padding-left: 1.5rem; list-style: disc; color: #1A1F36;">';

    strengths.forEach(s => {
      html += '<li style="margin-bottom: 0.5rem;">' + s + '</li>';
    });

    html += '</ul></div>';

    // Weaknesses card
    html += '<div style="background: linear-gradient(135deg, rgba(255, 176, 32, 0.05) 0%, rgba(255, 176, 32, 0.02) 100%); border: 1px solid rgba(255, 176, 32, 0.2); border-radius: 12px; padding: 1.5rem;">' +
      '<h3 style="font-size: 12pt; font-weight: 700; color: #FFB020; margin: 0 0 1rem 0; display: flex; align-items: center;">' +
      '<span style="margin-right: 0.5rem;">⚠</span> Aree di Attenzione' +
      '</h3>' +
      '<ul style="margin: 0; padding-left: 1.5rem; list-style: disc; color: #1A1F36;">';

    weaknesses.forEach(w => {
      html += '<li style="margin-bottom: 0.5rem;">' + w + '</li>';
    });

    html += '</ul></div>';

    html += '</div>';
    return html;
  }

  // Generate Conto Economico table
  generateContoEconomicoTable() {
    const ce = this.data.noteTecniche && this.data.noteTecniche.find(n => n.contoEconomico);
    if (!ce || !ce.contoEconomico) return '';

    const contoEconomico = ce.contoEconomico;
    const formatEuro = (val) => {
      if (val === null || val === undefined) return '-';
      return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);
    };

    const calcVariation = (val2024, val2023) => {
      if (!val2023 || val2023 === 0) return '-';
      const variation = ((val2024 - val2023) / Math.abs(val2023)) * 100;
      return variation.toFixed(1) + '%';
    };

    const getVariationColor = (val2024, val2023) => {
      if (!val2023) return '#697386';
      return val2024 > val2023 ? '#00D924' : '#DF1B41';
    };

    const rows = [
      { label: 'Ricavi', val2023: contoEconomico.ricavi ? contoEconomico.ricavi['2023'] : null, val2024: contoEconomico.ricavi ? contoEconomico.ricavi['2024'] : null },
      { label: 'Costi Operativi', val2023: contoEconomico.costi && contoEconomico.costi.operativi ? contoEconomico.costi.operativi['2023'] : null, val2024: contoEconomico.costi && contoEconomico.costi.operativi ? contoEconomico.costi.operativi['2024'] : null },
      { label: 'EBITDA', val2023: contoEconomico.risultati && contoEconomico.risultati.ebitda ? contoEconomico.risultati.ebitda['2023'] : null, val2024: contoEconomico.risultati && contoEconomico.risultati.ebitda ? contoEconomico.risultati.ebitda['2024'] : null, highlight: true },
      { label: 'Ammortamenti', val2023: contoEconomico.costi && contoEconomico.costi.ammortamenti ? contoEconomico.costi.ammortamenti['2023'] : null, val2024: contoEconomico.costi && contoEconomico.costi.ammortamenti ? contoEconomico.costi.ammortamenti['2024'] : null },
      { label: 'EBIT', val2023: contoEconomico.risultati && contoEconomico.risultati.ebit ? contoEconomico.risultati.ebit['2023'] : null, val2024: contoEconomico.risultati && contoEconomico.risultati.ebit ? contoEconomico.risultati.ebit['2024'] : null },
      { label: 'Oneri Finanziari', val2023: contoEconomico.costi && contoEconomico.costi.finanziari ? contoEconomico.costi.finanziari['2023'] : null, val2024: contoEconomico.costi && contoEconomico.costi.finanziari ? contoEconomico.costi.finanziari['2024'] : null },
      { label: 'Utile Netto', val2023: contoEconomico.risultati && contoEconomico.risultati.utileNetto ? contoEconomico.risultati.utileNetto['2023'] : null, val2024: contoEconomico.risultati && contoEconomico.risultati.utileNetto ? contoEconomico.risultati.utileNetto['2024'] : null, highlight: true }
    ];

    let html = '<div style="margin: 2rem 0; page-break-inside: avoid;">' +
      '<h3 style="font-size: 13pt; font-weight: 700; color: #4F566B; margin: 0 0 1rem 0;">Conto Economico</h3>' +
      '<table style="width: 100%; border-collapse: collapse; font-size: 10pt; background: white; box-shadow: 0 1px 3px rgba(50, 50, 93, 0.05);">' +
      '<thead>' +
      '<tr style="background: #635BFF; color: white;">' +
      '<th style="padding: 1rem; text-align: left; font-weight: 600;">Voce</th>' +
      '<th style="padding: 1rem; text-align: right; font-weight: 600;">2023</th>' +
      '<th style="padding: 1rem; text-align: right; font-weight: 600;">2024</th>' +
      '<th style="padding: 1rem; text-align: right; font-weight: 600;">Δ%</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';

    rows.forEach((row, idx) => {
      const bgColor = row.highlight ? 'rgba(99, 91, 255, 0.05)' : (idx % 2 === 0 ? '#FAFBFC' : 'white');
      const fontWeight = row.highlight ? '700' : '400';
      const variation = calcVariation(row.val2024, row.val2023);
      const varColor = getVariationColor(row.val2024, row.val2023);

      html += '<tr style="background: ' + bgColor + '; border-bottom: 1px solid #E3E8EE;">' +
        '<td style="padding: 0.75rem 1rem; font-weight: ' + fontWeight + ';">' + row.label + '</td>' +
        '<td style="padding: 0.75rem 1rem; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.val2023) + '</td>' +
        '<td style="padding: 0.75rem 1rem; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.val2024) + '</td>' +
        '<td style="padding: 0.75rem 1rem; text-align: right; font-weight: 600; color: ' + varColor + ';">' + variation + '</td>' +
        '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  }

  // Generate Stato Patrimoniale table
  generateStatoPatrimonialeTable() {
    const sp = this.data.noteTecniche && this.data.noteTecniche.find(n => n.statoPatrimoniale);
    if (!sp || !sp.statoPatrimoniale) return '';

    const statoPatrimoniale = sp.statoPatrimoniale;
    const formatEuro = (val) => {
      if (val === null || val === undefined) return '-';
      return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);
    };

    const attivo = statoPatrimoniale.attivo || {};
    const passivo = statoPatrimoniale.passivo || {};

    const attivoRows = [
      { label: 'Immobilizzazioni', val2023: attivo.immobilizzazioni ? attivo.immobilizzazioni['2023'] : null, val2024: attivo.immobilizzazioni ? attivo.immobilizzazioni['2024'] : null },
      { label: 'Attivo Corrente', val2023: attivo.corrente ? attivo.corrente['2023'] : null, val2024: attivo.corrente ? attivo.corrente['2024'] : null },
      { label: 'Liquidità', val2023: attivo.liquidita ? attivo.liquidita['2023'] : null, val2024: attivo.liquidita ? attivo.liquidita['2024'] : null },
      { label: 'TOTALE ATTIVO', val2023: attivo.totale ? attivo.totale['2023'] : null, val2024: attivo.totale ? attivo.totale['2024'] : null, total: true }
    ];

    const passivoRows = [
      { label: 'Patrimonio Netto', val2023: passivo.patrimonioNetto ? passivo.patrimonioNetto['2023'] : null, val2024: passivo.patrimonioNetto ? passivo.patrimonioNetto['2024'] : null },
      { label: 'Debiti Finanziari', val2023: passivo.debitiFinanziari ? passivo.debitiFinanziari['2023'] : null, val2024: passivo.debitiFinanziari ? passivo.debitiFinanziari['2024'] : null },
      { label: 'Debiti Commerciali', val2023: passivo.debitiCommerciali ? passivo.debitiCommerciali['2023'] : null, val2024: passivo.debitiCommerciali ? passivo.debitiCommerciali['2024'] : null },
      { label: 'TOTALE PASSIVO', val2023: passivo.totale ? passivo.totale['2023'] : null, val2024: passivo.totale ? passivo.totale['2024'] : null, total: true }
    ];

    let html = '<div style="margin: 2rem 0; page-break-inside: avoid;">' +
      '<h3 style="font-size: 13pt; font-weight: 700; color: #4F566B; margin: 0 0 1rem 0;">Stato Patrimoniale</h3>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">';

    // ATTIVO table
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 9pt; background: white; box-shadow: 0 1px 3px rgba(50, 50, 93, 0.05);">' +
      '<thead>' +
      '<tr style="background: #00D924; color: white;">' +
      '<th colspan="3" style="padding: 0.75rem; text-align: left; font-weight: 600; font-size: 10pt;">ATTIVO</th>' +
      '</tr>' +
      '<tr style="background: rgba(0, 217, 36, 0.1); color: #1A1F36;">' +
      '<th style="padding: 0.5rem; text-align: left; font-weight: 600;">Voce</th>' +
      '<th style="padding: 0.5rem; text-align: right; font-weight: 600;">2023</th>' +
      '<th style="padding: 0.5rem; text-align: right; font-weight: 600;">2024</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';

    attivoRows.forEach((row, idx) => {
      const bgColor = row.total ? 'rgba(0, 217, 36, 0.1)' : (idx % 2 === 0 ? '#FAFBFC' : 'white');
      const fontWeight = row.total ? '700' : '400';

      html += '<tr style="background: ' + bgColor + '; border-bottom: 1px solid #E3E8EE;">' +
        '<td style="padding: 0.5rem; font-weight: ' + fontWeight + ';">' + row.label + '</td>' +
        '<td style="padding: 0.5rem; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.val2023) + '</td>' +
        '<td style="padding: 0.5rem; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.val2024) + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';

    // PASSIVO table
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 9pt; background: white; box-shadow: 0 1px 3px rgba(50, 50, 93, 0.05);">' +
      '<thead>' +
      '<tr style="background: #DF1B41; color: white;">' +
      '<th colspan="3" style="padding: 0.75rem; text-align: left; font-weight: 600; font-size: 10pt;">PASSIVO</th>' +
      '</tr>' +
      '<tr style="background: rgba(223, 27, 65, 0.1); color: #1A1F36;">' +
      '<th style="padding: 0.5rem; text-align: left; font-weight: 600;">Voce</th>' +
      '<th style="padding: 0.5rem; text-align: right; font-weight: 600;">2023</th>' +
      '<th style="padding: 0.5rem; text-align: right; font-weight: 600;">2024</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';

    passivoRows.forEach((row, idx) => {
      const bgColor = row.total ? 'rgba(223, 27, 65, 0.1)' : (idx % 2 === 0 ? '#FAFBFC' : 'white');
      const fontWeight = row.total ? '700' : '400';

      html += '<tr style="background: ' + bgColor + '; border-bottom: 1px solid #E3E8EE;">' +
        '<td style="padding: 0.5rem; font-weight: ' + fontWeight + ';">' + row.label + '</td>' +
        '<td style="padding: 0.5rem; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.val2023) + '</td>' +
        '<td style="padding: 0.5rem; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.val2024) + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';

    html += '</div></div>';
    return html;
  }

  // Generate risk assessment box
  generateRiskBox() {
    const risk = this.data.riskAssessment;
    if (!risk) return '';

    let html = '<div style="background: linear-gradient(135deg, #635BFF 0%, #7C73E6 100%); color: white; border-radius: 12px; padding: 2rem; margin: 2rem 0; box-shadow: 0 4px 12px rgba(99, 91, 255, 0.3); page-break-inside: avoid;">' +
      '<h3 style="font-size: 14pt; font-weight: 700; margin: 0 0 1.5rem 0;">Valutazione del Rischio</h3>' +
      '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">' +
      '<div style="text-align: center;">' +
      '<div style="font-size: 10pt; opacity: 0.9; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Rating</div>' +
      '<div style="font-size: 32pt; font-weight: 700; line-height: 1;">' + risk.rating + '</div>' +
      '</div>' +
      '<div style="text-align: center;">' +
      '<div style="font-size: 10pt; opacity: 0.9; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Score</div>' +
      '<div style="font-size: 32pt; font-weight: 700; line-height: 1;">' + risk.score.toFixed(1) + '</div>' +
      '</div>' +
      '<div style="text-align: center;">' +
      '<div style="font-size: 10pt; opacity: 0.9; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Categoria</div>' +
      '<div style="font-size: 16pt; font-weight: 700; line-height: 1.2; margin-top: 0.5rem;">' + risk.categoryLabel + '</div>' +
      '</div>' +
      '</div>';

    if (risk.description) {
      html += '<div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.2); font-size: 10pt; line-height: 1.6; opacity: 0.95;">' +
        risk.description +
        '</div>';
    }

    html += '</div>';
    return html;
  }

  // Generate Codice della Crisi indicators
  generateCodiceCrisiIndicators() {
    const crisi = this.data.codiceCrisi;
    if (!crisi || !crisi.indices) return '';

    let html = '<div style="margin: 2rem 0; page-break-inside: avoid;">';

    html += '<div style="background: ' + (crisi.status === 'OK' ? 'rgba(0, 217, 36, 0.05)' : 'rgba(255, 176, 32, 0.05)') + '; border: 2px solid ' + (crisi.status === 'OK' ? '#00D924' : '#FFB020') + '; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">' +
      '<div style="display: flex; align-items: center; justify-content: space-between;">' +
      '<div>' +
      '<div style="font-size: 11pt; font-weight: 700; color: #1A1F36; margin-bottom: 0.25rem;">Status Codice della Crisi</div>' +
      '<div style="font-size: 9pt; color: #697386;">Valutazione degli indicatori di allerta</div>' +
      '</div>' +
      '<div style="font-size: 24pt; font-weight: 700; color: ' + (crisi.status === 'OK' ? '#00D924' : '#FFB020') + ';">' +
      (crisi.status === 'OK' ? '✓' : '⚠') +
      '</div>' +
      '</div>' +
      '</div>';

    html += '<div style="background: white; border: 1px solid #E3E8EE; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(50, 50, 93, 0.05);">';

    crisi.indices.forEach((idx, i) => {
      const statusColor = idx.status === 'OK' ? '#00D924' : idx.status === 'WARNING' ? '#FFB020' : '#DF1B41';
      const statusBg = idx.status === 'OK' ? 'rgba(0, 217, 36, 0.1)' : idx.status === 'WARNING' ? 'rgba(255, 176, 32, 0.1)' : 'rgba(223, 27, 65, 0.1)';
      const statusSymbol = idx.status === 'OK' ? '✓' : '⚠';

      html += '<div style="display: flex; align-items: center; padding: 1rem; ' + (i > 0 ? 'border-top: 1px solid #E3E8EE;' : '') + '">' +
        '<div style="width: 36px; height: 36px; border-radius: 50%; background: ' + statusBg + '; color: ' + statusColor + '; display: flex; align-items: center; justify-content: center; font-size: 16pt; font-weight: 700; flex-shrink: 0; margin-right: 1rem;">' +
        statusSymbol +
        '</div>' +
        '<div style="flex: 1;">' +
        '<div style="font-weight: 600; font-size: 10pt; color: #1A1F36; margin-bottom: 0.25rem;">' + idx.name + '</div>' +
        '<div style="font-size: 9pt; color: #4F566B;">Valore: <strong>' + idx.value + '</strong> | Soglia: <strong>' + idx.soglia + '</strong></div>' +
        '</div>' +
        '<div style="padding: 0.5rem 1rem; background: ' + statusBg + '; color: ' + statusColor + '; border-radius: 6px; font-size: 9pt; font-weight: 600;">' +
        idx.status +
        '</div>' +
        '</div>';
    });

    html += '</div></div>';
    return html;
  }

  // Convert markdown to HTML (simple implementation)
  markdownToHTML(markdown) {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 12pt; font-weight: 700; color: #4F566B; margin: 1.5rem 0 0.75rem 0;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 14pt; font-weight: 700; color: #635BFF; margin: 2rem 0 1rem 0;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 16pt; font-weight: 700; color: #1A1F36; margin: 2rem 0 1rem 0;">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Lists - simple implementation
    const lines = html.split('\n');
    let inList = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^[\-\*]\s+(.+)/)) {
        if (!inList) {
          result.push('<ul style="margin: 1rem 0; padding-left: 2rem; list-style: disc; color: #1A1F36;">');
          inList = true;
        }
        result.push('<li>' + line.replace(/^[\-\*]\s+/, '') + '</li>');
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (line.trim() && !line.startsWith('<')) {
          result.push('<p style="margin: 1rem 0; line-height: 1.6; color: #1A1F36;">' + line + '</p>');
        } else {
          result.push(line);
        }
      }
    }

    if (inList) {
      result.push('</ul>');
    }

    return result.join('\n');
  }

  // Get formatted date (Month Year)
  getFormattedDate() {
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const date = new Date();
    return months[date.getMonth()] + ' ' + date.getFullYear();
  }

  // Get current date for filename
  getCurrentDate() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
  }

  // ===========================
  // BACKWARD COMPATIBILITY
  // Legacy method for custom note generation
  // ===========================

  async generateCustomNote(noteContent, title) {
    const noteTitle = title || 'Nota Tecnica';

    try {
      await this.loadLogo();

      let htmlContent = '<div style="font-family: \'Times New Roman\', Times, serif; color: #1A1F36; font-size: 11pt; line-height: 1.6; padding: 2rem;">';

      htmlContent += '<div style="text-align: center; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 2px solid #635BFF;">';

      if (this.logoBase64) {
        htmlContent += '<img src="' + this.logoBase64 + '" alt="Logo" style="width: 100px; height: auto; margin-bottom: 1rem;">';
      }

      htmlContent += '<h1 style="font-size: 20pt; font-weight: 700; color: #635BFF; margin: 0;">' + noteTitle + '</h1>';
      htmlContent += '<div style="font-size: 10pt; color: #697386; margin-top: 0.5rem;">' + this.getFormattedDate() + '</div>';
      htmlContent += '</div>';

      htmlContent += this.markdownToHTML(noteContent);
      htmlContent += '</div>';

      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position: absolute; left: -9999px; top: 0;';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      const filename = 'nota-tecnica-' + this.getCurrentDate() + '.pdf';

      const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(tempDiv.firstChild).save();

      document.body.removeChild(tempDiv);

      console.log('✅ Custom note generated successfully');
    } catch (error) {
      console.error('❌ Error generating custom note:', error);
      throw error;
    }
  }
}

// Expose globally
window.PDFGenerator = PDFGenerator;
