/**
 * Horizon Financial Monitor - Print Management
 * Gestisce la stampa e l'export dei report finanziari
 */

const PrintManager = {
  /**
   * Prepara la pagina per la stampa e avvia il dialogo di stampa
   */
  printReport() {
    // Aggiungi classe per la stampa
    document.body.classList.add('printing');

    // Imposta il titolo del documento per il nome del file di stampa
    const companyName = document.getElementById('company-name')?.textContent || 'Report';
    const reportDate = document.getElementById('report-date')?.textContent || '';
    const pageTitle = document.querySelector('.page-title')?.textContent || 'Report';

    const originalTitle = document.title;
    document.title = `${companyName} - ${pageTitle} - ${reportDate}`;

    // Attendi che eventuali grafici si carichino
    setTimeout(() => {
      window.print();

      // Ripristina il titolo originale dopo la stampa
      setTimeout(() => {
        document.body.classList.remove('printing');
        document.title = originalTitle;
      }, 500);
    }, 300);
  },

  /**
   * Inizializza i pulsanti di stampa nella pagina
   */
  init() {
    // Ascolta eventi di stampa per ottimizzare i grafici
    window.addEventListener('beforeprint', () => {
      this.beforePrint();
    });

    window.addEventListener('afterprint', () => {
      this.afterPrint();
    });
  },

  /**
   * Operazioni da eseguire prima della stampa
   */
  beforePrint() {
    // Forza il rendering dei grafici Chart.js in alta qualità
    if (window.Chart && window.Chart.instances) {
      Object.values(window.Chart.instances).forEach(chart => {
        if (chart && chart.resize) {
          chart.resize();
        }
      });
    }
  },

  /**
   * Operazioni da eseguire dopo la stampa
   */
  afterPrint() {
    // Ripristina lo stato normale
    if (window.Chart && window.Chart.instances) {
      Object.values(window.Chart.instances).forEach(chart => {
        if (chart && chart.resize) {
          chart.resize();
        }
      });
    }
  },

  /**
   * Crea il pulsante di stampa e lo aggiunge all'header della pagina
   */
  createPrintButton() {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader) return;

    // Crea il container per le azioni se non esiste
    let actionsContainer = pageHeader.querySelector('.page-actions');
    if (!actionsContainer) {
      actionsContainer = document.createElement('div');
      actionsContainer.className = 'page-actions';
      pageHeader.appendChild(actionsContainer);
    }

    // Crea il pulsante di stampa
    const printButton = document.createElement('button');
    printButton.className = 'btn-print';
    printButton.innerHTML = '<i class="ri-printer-line"></i><span>Stampa Report</span>';
    printButton.title = 'Stampa questo report';
    printButton.setAttribute('aria-label', 'Stampa report');

    printButton.addEventListener('click', () => {
      this.printReport();
    });

    actionsContainer.appendChild(printButton);
  }
};

// Inizializza il PrintManager quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  PrintManager.init();
  PrintManager.createPrintButton();
});

// Aggiungi supporto per la scorciatoia da tastiera Ctrl+P / Cmd+P
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault();
    PrintManager.printReport();
  }
});
