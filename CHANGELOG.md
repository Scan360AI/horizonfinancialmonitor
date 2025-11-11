# Changelog - Bug Fixes

## Versione 1.1 (11 Novembre 2025)

### 🐛 Bug Corretti

#### 1. stato-patrimoniale.html
**Problema**: Pagina non caricava i dati
- ❌ Cercava `report.data.detailedAnalysis` 
- ✅ Corretto in `report.data.noteTecniche`
- **Causa**: Nome chiave JSON errato
- **Effetto**: Ora carica correttamente bilancio e calcolo DSCR

#### 2. profilo-aziendale.html
**Problema**: Pagina non caricava i dati
- ❌ Doppio `forEach` per partecipazioni (linee 277-278)
- ✅ Rimosso duplicato
- **Causa**: Errore di sintassi JavaScript
- **Effetto**: Ora carica correttamente tutti i dati

### ✅ Verifiche Effettuate

- [x] Tutte le 6 pagine caricano correttamente
- [x] Tutti i dati JSON vengono visualizzati
- [x] Nessun errore nella console JavaScript
- [x] Path JSON corretto per fetch
- [x] Configurazione Netlify ottimizzata

### 📦 File Aggiornati

- `pages/stato-patrimoniale.html` - Fix riferimento dati
- `pages/profilo-aziendale.html` - Fix forEach duplicato

### 🚀 Deploy

Il pacchetto è ora pronto per il deploy su Netlify senza errori.
Tutti i dati si caricano correttamente su:
- ✅ Netlify
- ✅ Server locale (Python, Node, PHP, ecc.)

---

**Note**: Il file funziona perfettamente su server web. L'apertura diretta tramite `file://` non è supportata per motivi di sicurezza CORS del browser.
