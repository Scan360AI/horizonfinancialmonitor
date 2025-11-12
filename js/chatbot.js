/**
 * Financial Chatbot con Gemini 2.5 Flash
 * Analizza i dati finanziari da kitzanos-data.json e risponde a domande
 */

class FinancialChatbot {
  constructor() {
    this.apiKey = null;
    this.financialData = null;
    this.conversationHistory = [];
    this.isOpen = false;
    this.isLoading = false;

    // Elementi UI
    this.chatWidget = null;
    this.chatWindow = null;
    this.messagesContainer = null;
    this.inputField = null;

    this.init();
  }

  async init() {
    // Carica i dati finanziari
    await this.loadFinancialData();

    // Crea l'interfaccia UI
    this.createUI();

    // Bind degli eventi
    this.bindEvents();

    // Mostra messaggio di benvenuto
    this.addMessage(
      'bot',
      'Ciao! 👋 Sono l\'assistente AI per l\'analisi finanziaria di BFLOWS S.R.L. Posso rispondere a domande sull\'andamento dell\'azienda, analizzare i dati di bilancio ed esplorare scenari futuri. Come posso aiutarti?'
    );
  }

  async loadFinancialData() {
    try {
      const response = await fetch('/data/kitzanos-data.json');
      this.financialData = await response.json();
      console.log('✅ Dati finanziari caricati:', this.financialData);
    } catch (error) {
      console.error('❌ Errore nel caricamento dei dati:', error);
      this.financialData = null;
    }
  }

  createUI() {
    // Widget floating button
    this.chatWidget = document.createElement('div');
    this.chatWidget.id = 'chatbot-widget';
    this.chatWidget.className = 'chatbot-widget';
    this.chatWidget.innerHTML = `
      <button class="chatbot-toggle" aria-label="Apri assistente AI">
        <i class="ri-robot-2-line"></i>
      </button>
    `;

    // Finestra chat
    this.chatWindow = document.createElement('div');
    this.chatWindow.id = 'chatbot-window';
    this.chatWindow.className = 'chatbot-window';
    this.chatWindow.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <i class="ri-robot-2-fill"></i>
          <div>
            <h3>Assistente Finanziario AI</h3>
            <p class="chatbot-status">
              <span class="status-dot"></span>
              Gemini 2.5 Flash
            </p>
          </div>
        </div>
        <button class="chatbot-close" aria-label="Chiudi chat">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="chatbot-messages" id="chatbot-messages">
        <!-- Messaggi verranno inseriti qui -->
      </div>

      <div class="chatbot-input-container">
        <div class="chatbot-api-key-setup" id="api-key-setup">
          <p class="api-key-notice">
            <i class="ri-key-2-line"></i>
            Inserisci la tua API key di Gemini (gratuita)
          </p>
          <div class="api-key-input-group">
            <input
              type="password"
              id="gemini-api-key-input"
              placeholder="AIzaSy..."
              class="api-key-input"
            />
            <button id="save-api-key-btn" class="btn-save-key">
              <i class="ri-check-line"></i> Salva
            </button>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            class="api-key-link"
          >
            <i class="ri-external-link-line"></i>
            Ottieni una API key gratuita
          </a>
        </div>

        <div class="chatbot-input" id="chat-input-area" style="display: none;">
          <input
            type="text"
            id="chatbot-input-field"
            placeholder="Chiedi qualcosa sui dati finanziari..."
            autocomplete="off"
          />
          <button id="chatbot-send-btn" class="btn-send" aria-label="Invia messaggio">
            <i class="ri-send-plane-fill"></i>
          </button>
        </div>
      </div>
    `;

    // Aggiungi al DOM
    document.body.appendChild(this.chatWidget);
    document.body.appendChild(this.chatWindow);

    // Riferimenti agli elementi
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.inputField = document.getElementById('chatbot-input-field');

    // Carica API key dal localStorage
    this.loadApiKey();
  }

  bindEvents() {
    // Toggle chat window
    const toggleBtn = this.chatWidget.querySelector('.chatbot-toggle');
    toggleBtn.addEventListener('click', () => this.toggleChat());

    // Close button
    const closeBtn = this.chatWindow.querySelector('.chatbot-close');
    closeBtn.addEventListener('click', () => this.toggleChat());

    // Save API key
    const saveKeyBtn = document.getElementById('save-api-key-btn');
    saveKeyBtn.addEventListener('click', () => this.saveApiKey());

    // Send message
    const sendBtn = document.getElementById('chatbot-send-btn');
    sendBtn.addEventListener('click', () => this.sendMessage());

    // Enter key per inviare
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // API key input - Enter per salvare
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveApiKey();
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.chatWindow.classList.add('open');
      this.chatWidget.classList.add('hidden');
      this.inputField?.focus();
    } else {
      this.chatWindow.classList.remove('open');
      this.chatWidget.classList.remove('hidden');
    }
  }

  loadApiKey() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      this.apiKey = savedKey;
      this.showChatInput();
    }
  }

  saveApiKey() {
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    const key = apiKeyInput.value.trim();

    if (!key) {
      alert('Per favore inserisci una API key valida');
      return;
    }

    if (!key.startsWith('AIzaSy')) {
      alert('La API key di Gemini dovrebbe iniziare con "AIzaSy"');
      return;
    }

    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);

    this.showChatInput();
    this.addMessage('bot', 'API key salvata! ✅ Ora puoi farmi domande sui dati finanziari.');
  }

  showChatInput() {
    document.getElementById('api-key-setup').style.display = 'none';
    document.getElementById('chat-input-area').style.display = 'flex';
    this.inputField?.focus();
  }

  async sendMessage() {
    if (this.isLoading) return;

    const message = this.inputField.value.trim();
    if (!message) return;

    // Aggiungi messaggio utente
    this.addMessage('user', message);
    this.inputField.value = '';

    // Mostra loading
    this.isLoading = true;
    const loadingId = this.addMessage('bot', '<div class="typing-indicator"><span></span><span></span><span></span></div>');

    try {
      // Chiamata a Gemini API
      const response = await this.callGeminiAPI(message);

      // Rimuovi loading
      this.removeMessage(loadingId);

      // Aggiungi risposta
      this.addMessage('bot', response);

    } catch (error) {
      console.error('Errore Gemini API:', error);

      // Rimuovi loading
      this.removeMessage(loadingId);

      // Mostra errore
      let errorMessage = '❌ Si è verificato un errore. ';

      if (error.message.includes('API key')) {
        errorMessage += 'Verifica che la tua API key sia corretta.';
      } else if (error.message.includes('429')) {
        errorMessage += 'Hai raggiunto il limite di richieste. Riprova tra qualche minuto.';
      } else if (error.message.includes('quota')) {
        errorMessage += 'Quota API esaurita. Riprova domani o verifica i tuoi limiti su Google AI Studio.';
      } else {
        errorMessage += error.message;
      }

      this.addMessage('bot', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  async callGeminiAPI(userMessage) {
    if (!this.apiKey) {
      throw new Error('API key non configurata');
    }

    // Costruisci il system prompt con i dati finanziari
    const systemPrompt = this.buildSystemPrompt();

    // Aggiungi il messaggio alla history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Prepara il payload per Gemini
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...this.conversationHistory
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    // Chiamata API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Estrai la risposta
    const botResponse = data.candidates[0]?.content?.parts[0]?.text;

    if (!botResponse) {
      throw new Error('Risposta vuota da Gemini API');
    }

    // Aggiungi risposta alla history
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: botResponse }]
    });

    return botResponse;
  }

  buildSystemPrompt() {
    if (!this.financialData) {
      return 'Sei un assistente AI per analisi finanziarie. I dati non sono disponibili al momento.';
    }

    const data = this.financialData;

    return `Sei un assistente AI esperto in analisi finanziaria che lavora per BFLOWS S.R.L.

Il tuo compito è:
1. Rispondere a domande sull'andamento finanziario dell'azienda
2. Analizzare i dati di bilancio e fornire insights
3. Esplorare scenari "what-if" (es. "cosa succede se i ricavi calano del 20%?")
4. Fornire raccomandazioni basate sui dati

DATI AZIENDALI COMPLETI:

## Informazioni Generali
- Nome: ${data.company.name}
- Settore: ${data.company.ateco}
- Fondata: ${data.company.foundedDate}
- Dipendenti: ${data.company.employees.current}
- Capitale Sociale: €${data.company.capitaleSociale.toLocaleString('it-IT')}

## Risk Assessment
- Indice di Rischio: ${data.riskAssessment.score}/100
- Categoria: ${data.riskAssessment.category} (${data.riskAssessment.categoryLabel})
- Rating: ${data.riskAssessment.rating} (precedente: ${data.riskAssessment.previousRating})
- Descrizione: ${data.riskAssessment.description}

## Dati Finanziari 2024
- Ricavi: €${data.keyMetrics.find(m => m.id === 'revenues')?.value || 'N/D'} (${data.keyMetrics.find(m => m.id === 'revenues')?.trend?.value}% vs 2023)
- EBITDA: €${data.financialData.stats.find(s => s.id === 'ebitda')?.value || 'N/D'} (${data.financialData.stats.find(s => s.id === 'ebitda')?.trend?.value} vs 2023)
- EBITDA Margin: ${data.keyMetrics.find(m => m.id === 'ebitda-margin')?.value || 'N/D'}
- Utile Netto: €${data.financialData.stats.find(s => s.id === 'utile')?.value || 'N/D'} (${data.financialData.stats.find(s => s.id === 'utile')?.trend?.value} vs 2023)
- Cash Flow Operativo: ${data.keyMetrics.find(m => m.id === 'cash-flow')?.value || 'N/D'}

## Stato Patrimoniale
- Patrimonio Netto: €${data.financialData.stats.find(s => s.id === 'patrimonio')?.value || 'N/D'}
- Totale Attivo: €${data.noteTecniche[1]?.statoPatrimoniale?.attivo?.totaleAttivo?.['2024'] || 'N/D'}
- Totale Debiti: €${data.noteTecniche[1]?.statoPatrimoniale?.passivo?.totaleDebiti?.['2024'] || 'N/D'}
- Disponibilità Liquide: €${data.noteTecniche[1]?.statoPatrimoniale?.attivo?.circolante?.find(c => c.voce === 'Disponibilità liquide')?.['2024'] || 'N/D'}

## Indicatori Finanziari
- ROE: ${data.financialData.stats.find(s => s.id === 'roe')?.value || 'N/D'}
- ROI: ${data.financialData.stats.find(s => s.id === 'roi')?.value || 'N/D'}
- ROS: ${data.financialData.stats.find(s => s.id === 'ros')?.value || 'N/D'}
- Liquidità Corrente: ${data.keyMetrics.find(m => m.id === 'liquidity')?.value || 'N/D'}
- Leverage: ${data.financialData.stats.find(s => s.id === 'leverage')?.value || 'N/D'}
- DSCR: ${data.keyMetrics.find(m => m.id === 'dscr')?.value || 'N/D'}
- DSO (Giorni Incasso Clienti): ${data.keyMetrics.find(m => m.id === 'dso')?.value || 'N/D'}

## Profili di Rischio (scala 1-5)
${data.profiles.map(p => `- ${p.name}: ${p.score}/5 (${p.evaluation})`).join('\n')}

## Punti di Forza
${data.executiveSummary.strengths.map(s => `- ${s}`).join('\n')}

## Criticità
${data.executiveSummary.weaknesses.map(w => `- ${w}`).join('\n')}

## Indici Codice della Crisi
Status: ${data.codiceCrisi.status.overall} (${data.codiceCrisi.status.indiciOk} OK, ${data.codiceCrisi.status.indiciAllerta} in allerta)
${data.codiceCrisi.indices.map(i => `- ${i.name}: ${i.value} (${i.status})`).join('\n')}

## Raccomandazioni
${data.outlook.raccomandazioni.map(r => `- ${r}`).join('\n')}

## Outlook
${data.outlook.outlook}

---

ISTRUZIONI PER LE RISPOSTE:
1. Usa sempre i dati sopra riportati per rispondere
2. Formatta le risposte in modo chiaro e leggibile (usa emoji dove appropriato)
3. Per scenari "what-if", calcola gli impatti sui vari indicatori
4. Sii professionale ma amichevole
5. Se una domanda non riguarda i dati disponibili, spiegalo gentilmente
6. Rispondi SEMPRE in italiano
7. Usa formattazione markdown per tabelle e liste quando utile
8. Evidenzia i numeri importanti e i trend
9. Fornisci sempre contesto e interpretazione, non solo numeri secchi

Esempio di risposta ben strutturata:
"📊 Analisi della situazione finanziaria:

**Ricavi 2024**: €197.250 ⬆️ +839% vs 2023
Ottima crescita, ma...

**EBITDA**: -€98.912 (NEGATIVO)
⚠️ L'azienda non sta ancora generando profitto operativo nonostante la crescita dei ricavi.

[... continua con analisi dettagliata ...]"
`;
  }

  addMessage(sender, text) {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `chatbot-message ${sender}`;

    if (sender === 'bot') {
      messageDiv.innerHTML = `
        <div class="message-avatar">
          <i class="ri-robot-2-fill"></i>
        </div>
        <div class="message-content">${this.parseMarkdown(text)}</div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">${this.escapeHtml(text)}</div>
        <div class="message-avatar">
          <i class="ri-user-3-fill"></i>
        </div>
      `;
    }

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();

    return messageId;
  }

  removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
      message.remove();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  parseMarkdown(text) {
    // Semplice parser markdown per formattazione base
    return text
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Headers
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Inizializza il chatbot quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  window.financialChatbot = new FinancialChatbot();
});
