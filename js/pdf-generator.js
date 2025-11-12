// ===========================
// PDF GENERATOR MODULE
// Using html2pdf.js - SIMPLIFIED VERSION FOR DEBUGGING
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

      // Create simple HTML content
      let htmlContent = '<div style="padding: 20px; font-family: Arial, sans-serif; font-size: 12px; color: #000;">';

      // Cover page - SIMPLE
      htmlContent += '<div style="text-align: center; padding: 100px 20px; page-break-after: always;">';
      if (this.logoBase64) {
        htmlContent += '<img src="' + this.logoBase64 + '" style="width: 80px; margin-bottom: 30px;">';
      }
      htmlContent += '<h1 style="font-size: 28px; margin: 20px 0;">REPORT FINANZIARIO COMPLETO</h1>';
      htmlContent += '<p style="font-size: 18px; margin: 10px 0;">' + this.data.company.name + '</p>';
      htmlContent += '<p style="font-size: 14px; color: #666;">' + this.getFormattedDate() + '</p>';
      htmlContent += '<div style="border: 3px solid #635BFF; padding: 30px; margin: 40px auto; max-width: 300px;">';
      htmlContent += '<p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">RATING</p>';
      htmlContent += '<p style="font-size: 48px; font-weight: bold; color: #635BFF; margin: 10px 0;">' + this.data.riskAssessment.rating + '</p>';
      htmlContent += '<p style="font-size: 14px; margin: 0;">' + this.data.riskAssessment.categoryLabel + '</p>';
      htmlContent += '</div>';
      htmlContent += '</div>';

      // Content sections
      let sectionNum = 1;
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTitle = section.title;
        const sectionLower = sectionTitle.toLowerCase();

        if (i > 0) {
          htmlContent += '<div style="page-break-before: always;"></div>';
        }

        htmlContent += '<div style="padding: 20px;">';
        htmlContent += '<h2 style="font-size: 20px; color: #635BFF; border-bottom: 2px solid #635BFF; padding-bottom: 10px; margin: 0 0 20px 0;">';
        htmlContent += sectionNum + '. ' + sectionTitle;
        htmlContent += '</h2>';

        // Add special content based on section
        if (sectionLower.includes('executive summary')) {
          htmlContent += this.generateKeyMetricsBoxesSimple();
        }

        if (sectionLower.includes('analisi economica') || sectionLower.includes('conto economico')) {
          htmlContent += this.generateContoEconomicoTableSimple();
          if (chartImages && chartImages.economicTrend) {
            htmlContent += '<div style="margin: 20px 0; text-align: center;">';
            htmlContent += '<p style="font-weight: bold; margin-bottom: 10px;">Trend Economico 2022-2024</p>';
            htmlContent += '<img src="' + chartImages.economicTrend + '" style="max-width: 100%; height: auto;">';
            htmlContent += '</div>';
          }
        }

        if (sectionLower.includes('stato patrimoniale')) {
          htmlContent += this.generateStatoPatrimonialeTableSimple();
        }

        if (sectionLower.includes('risk assessment') || sectionLower.includes('rischio')) {
          htmlContent += this.generateRiskProfilesSimple();
          if (chartImages && chartImages.benchmarkRadar) {
            htmlContent += '<div style="margin: 20px 0; text-align: center;">';
            htmlContent += '<p style="font-weight: bold; margin-bottom: 10px;">Benchmark Settoriale</p>';
            htmlContent += '<img src="' + chartImages.benchmarkRadar + '" style="max-width: 80%; height: auto;">';
            htmlContent += '</div>';
          }
        }

        if (sectionLower.includes('codice della crisi')) {
          htmlContent += this.generateCodiceCrisiSimple();
        }

        // AI content
        const content = section.content.join('\n\n');
        htmlContent += '<div style="line-height: 1.6; margin-top: 20px;">' + this.simpleMarkdown(content) + '</div>';

        htmlContent += '</div>';
        sectionNum++;
      }

      htmlContent += '</div>';

      console.log('📝 HTML content created, length:', htmlContent.length);

      // Create temporary container with proper visibility for height calculation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '0';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';  // A4 width
      tempDiv.style.visibility = 'hidden';  // Hidden but still takes up space for height calculation
      tempDiv.style.overflow = 'hidden';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      // Wait for browser to calculate dimensions
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('📐 Temp div dimensions:', tempDiv.offsetWidth, 'x', tempDiv.offsetHeight);

      const companyNameSlug = this.data.company.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const filename = 'report-' + companyNameSlug + '-' + this.getCurrentDate() + '.pdf';

      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          logging: true,
          useCORS: true,
          allowTaint: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      console.log('🔄 Starting PDF generation...');
      const worker = html2pdf().set(opt).from(tempDiv);
      await worker.save();

      document.body.removeChild(tempDiv);
      console.log('✅ Professional report generated successfully');

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Errore nella generazione del PDF: ' + error.message);
      throw error;
    }
  }

  // Generate simple metrics boxes
  generateKeyMetricsBoxesSimple() {
    if (!this.data.keyMetrics) return '';

    const metrics = this.data.keyMetrics.slice(0, 4);
    let html = '<div style="margin: 20px 0;">';
    html += '<h3 style="font-size: 16px; margin-bottom: 15px;">Principali Indicatori</h3>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr>';

    metrics.forEach(m => {
      html += '<td style="border: 1px solid #ddd; padding: 15px; text-align: center; width: 25%;">';
      html += '<div style="font-size: 10px; color: #666; margin-bottom: 5px;">' + m.label + '</div>';
      html += '<div style="font-size: 18px; font-weight: bold;">' + m.value + '</div>';
      if (m.trend !== undefined) {
        const color = m.trend > 0 ? '#00D924' : '#DF1B41';
        const symbol = m.trend > 0 ? '↑' : '↓';
        html += '<div style="font-size: 11px; color: ' + color + '; margin-top: 5px;">' + symbol + ' ' + Math.abs(m.trend).toFixed(1) + '%</div>';
      }
      html += '</td>';
    });

    html += '</tr></table></div>';
    return html;
  }

  // Generate simple Conto Economico
  generateContoEconomicoTableSimple() {
    const ce = this.data.noteTecniche && this.data.noteTecniche.find(n => n.contoEconomico);
    if (!ce || !ce.contoEconomico) return '';

    const contoEconomico = ce.contoEconomico;
    const formatEuro = (val) => {
      if (val === null || val === undefined) return '-';
      return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);
    };

    let html = '<div style="margin: 20px 0;">';
    html += '<h3 style="font-size: 16px; margin-bottom: 15px;">Conto Economico</h3>';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 11px;">';
    html += '<thead>';
    html += '<tr style="background: #635BFF; color: white;">';
    html += '<th style="padding: 10px; text-align: left;">Voce</th>';
    html += '<th style="padding: 10px; text-align: right;">2023</th>';
    html += '<th style="padding: 10px; text-align: right;">2024</th>';
    html += '<th style="padding: 10px; text-align: right;">Var %</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    const rows = [
      { label: 'Ricavi', v23: contoEconomico.ricavi ? contoEconomico.ricavi['2023'] : null, v24: contoEconomico.ricavi ? contoEconomico.ricavi['2024'] : null },
      { label: 'Costi Operativi', v23: contoEconomico.costi && contoEconomico.costi.operativi ? contoEconomico.costi.operativi['2023'] : null, v24: contoEconomico.costi && contoEconomico.costi.operativi ? contoEconomico.costi.operativi['2024'] : null },
      { label: 'EBITDA', v23: contoEconomico.risultati && contoEconomico.risultati.ebitda ? contoEconomico.risultati.ebitda['2023'] : null, v24: contoEconomico.risultati && contoEconomico.risultati.ebitda ? contoEconomico.risultati.ebitda['2024'] : null, bold: true },
      { label: 'Utile Netto', v23: contoEconomico.risultati && contoEconomico.risultati.utileNetto ? contoEconomico.risultati.utileNetto['2023'] : null, v24: contoEconomico.risultati && contoEconomico.risultati.utileNetto ? contoEconomico.risultati.utileNetto['2024'] : null, bold: true }
    ];

    rows.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? '#f9f9f9' : 'white';
      const fontWeight = row.bold ? 'bold' : 'normal';
      const variation = (row.v23 && row.v24 && row.v23 !== 0) ? (((row.v24 - row.v23) / Math.abs(row.v23)) * 100).toFixed(1) + '%' : '-';
      const varColor = (row.v24 > row.v23) ? '#00D924' : '#DF1B41';

      html += '<tr style="background: ' + bgColor + ';">';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: ' + fontWeight + ';">' + row.label + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.v23) + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(row.v24) + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: ' + varColor + '; font-weight: bold;">' + variation + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  }

  // Generate simple Stato Patrimoniale
  generateStatoPatrimonialeTableSimple() {
    const sp = this.data.noteTecniche && this.data.noteTecniche.find(n => n.statoPatrimoniale);
    if (!sp || !sp.statoPatrimoniale) return '';

    const statoPatrimoniale = sp.statoPatrimoniale;
    const formatEuro = (val) => {
      if (val === null || val === undefined) return '-';
      return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);
    };

    const attivo = statoPatrimoniale.attivo || {};
    const passivo = statoPatrimoniale.passivo || {};

    let html = '<div style="margin: 20px 0;">';
    html += '<h3 style="font-size: 16px; margin-bottom: 15px;">Stato Patrimoniale</h3>';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 11px;">';
    html += '<thead>';
    html += '<tr style="background: #635BFF; color: white;">';
    html += '<th style="padding: 10px; text-align: left;">ATTIVO</th>';
    html += '<th style="padding: 10px; text-align: right;">2024</th>';
    html += '<th style="padding: 10px; text-align: left;">PASSIVO</th>';
    html += '<th style="padding: 10px; text-align: right;">2024</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    const attivoRows = [
      { label: 'Immobilizzazioni', val: attivo.immobilizzazioni ? attivo.immobilizzazioni['2024'] : null },
      { label: 'Attivo Corrente', val: attivo.corrente ? attivo.corrente['2024'] : null },
      { label: 'Liquidità', val: attivo.liquidita ? attivo.liquidita['2024'] : null },
      { label: 'TOTALE', val: attivo.totale ? attivo.totale['2024'] : null, bold: true }
    ];

    const passivoRows = [
      { label: 'Patrimonio Netto', val: passivo.patrimonioNetto ? passivo.patrimonioNetto['2024'] : null },
      { label: 'Debiti Finanziari', val: passivo.debitiFinanziari ? passivo.debitiFinanziari['2024'] : null },
      { label: 'Debiti Commerciali', val: passivo.debitiCommerciali ? passivo.debitiCommerciali['2024'] : null },
      { label: 'TOTALE', val: passivo.totale ? passivo.totale['2024'] : null, bold: true }
    ];

    for (let i = 0; i < Math.max(attivoRows.length, passivoRows.length); i++) {
      const bgColor = i % 2 === 0 ? '#f9f9f9' : 'white';
      const aRow = attivoRows[i] || { label: '', val: null };
      const pRow = passivoRows[i] || { label: '', val: null };
      const fontWeight = (aRow.bold || pRow.bold) ? 'bold' : 'normal';

      html += '<tr style="background: ' + bgColor + ';">';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: ' + fontWeight + ';">' + aRow.label + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(aRow.val) + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: ' + fontWeight + ';">' + pRow.label + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: ' + fontWeight + ';">' + formatEuro(pRow.val) + '</td>';
      html += '</tr>';
    }

    html += '</tbody></table></div>';
    return html;
  }

  // Generate simple risk profiles
  generateRiskProfilesSimple() {
    if (!this.data.profiles || this.data.profiles.length === 0) return '';

    let html = '<div style="margin: 20px 0;">';
    html += '<h3 style="font-size: 16px; margin-bottom: 15px;">Profili di Rischio</h3>';

    this.data.profiles.forEach(profile => {
      const percentage = (profile.score / 5) * 100;
      let barColor = '#00D924';
      if (profile.color === 'yellow') barColor = '#FFB020';
      else if (profile.color === 'orange') barColor = '#FF8C42';
      else if (profile.color === 'red') barColor = '#DF1B41';

      html += '<div style="margin-bottom: 15px;">';
      html += '<div style="margin-bottom: 5px;">';
      html += '<strong>' + profile.name + '</strong>: ' + profile.score + ' / 5';
      html += '</div>';
      html += '<div style="width: 100%; height: 20px; background: #f0f0f0; border: 1px solid #ddd;">';
      html += '<div style="width: ' + percentage + '%; height: 100%; background: ' + barColor + ';"></div>';
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  // Generate simple Codice Crisi
  generateCodiceCrisiSimple() {
    const crisi = this.data.codiceCrisi;
    if (!crisi || !crisi.indices) return '';

    let html = '<div style="margin: 20px 0;">';
    html += '<h3 style="font-size: 16px; margin-bottom: 15px;">Codice della Crisi</h3>';
    html += '<p><strong>Status:</strong> ' + (crisi.status === 'OK' ? '✓ OK' : '⚠ ATTENZIONE') + '</p>';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px;">';
    html += '<thead>';
    html += '<tr style="background: #635BFF; color: white;">';
    html += '<th style="padding: 8px; text-align: left;">Indicatore</th>';
    html += '<th style="padding: 8px; text-align: center;">Valore</th>';
    html += '<th style="padding: 8px; text-align: center;">Soglia</th>';
    html += '<th style="padding: 8px; text-align: center;">Status</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    crisi.indices.forEach((idx, i) => {
      const bgColor = i % 2 === 0 ? '#f9f9f9' : 'white';
      const statusColor = idx.status === 'OK' ? '#00D924' : '#FFB020';

      html += '<tr style="background: ' + bgColor + ';">';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd;">' + idx.name + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">' + idx.value + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">' + idx.soglia + '</td>';
      html += '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; color: ' + statusColor + '; font-weight: bold;">' + idx.status + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  }

  // Simple markdown parser
  simpleMarkdown(text) {
    let html = text;

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Paragraphs
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
      if (p.trim()) {
        return '<p style="margin: 10px 0;">' + p.trim() + '</p>';
      }
      return '';
    }).join('');

    return html;
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

  // Get formatted date
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

  // Legacy method for custom notes
  async generateCustomNote(noteContent, title) {
    const noteTitle = title || 'Nota Tecnica';

    try {
      await this.loadLogo();

      let html = '<div style="padding: 30px; font-family: Arial, sans-serif;">';
      html += '<div style="text-align: center; border-bottom: 2px solid #635BFF; padding-bottom: 20px; margin-bottom: 30px;">';

      if (this.logoBase64) {
        html += '<img src="' + this.logoBase64 + '" style="width: 80px; margin-bottom: 15px;">';
      }

      html += '<h1 style="font-size: 24px; color: #635BFF; margin: 10px 0;">' + noteTitle + '</h1>';
      html += '<p style="color: #666; font-size: 12px;">' + this.getFormattedDate() + '</p>';
      html += '</div>';
      html += '<div style="line-height: 1.6;">' + this.simpleMarkdown(noteContent) + '</div>';
      html += '</div>';

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      document.body.appendChild(tempDiv);

      const filename = 'nota-tecnica-' + this.getCurrentDate() + '.pdf';

      const opt = {
        margin: 15,
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(tempDiv).save();
      document.body.removeChild(tempDiv);

      console.log('✅ Note generated');
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  }
}

// Expose globally
window.PDFGenerator = PDFGenerator;
