import { useState } from 'react'
import namesData from './data/names.json'

function App() {
  const [phase, setPhase] = useState(0) // 0: Intro, 1: Phase1, 2: Phase2, 3: Success
  
  // Phase 1 State
  const [cart, setCart] = useState([]) // Array of { id, text, meaning, originalIds }
  const [mode, setMode] = useState('single') // 'single' or 'double'
  const [tempSelection, setTempSelection] = useState([]) // For double mode
  
  // Phase 2 State
  const [finalChoices, setFinalChoices] = useState([])
  
  // Phase 3 State
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handlers Phase 1
  const handleNameClick = (nameObj) => {
    if (cart.length >= 10) return

    if (mode === 'single') {
      const newEntry = {
        id: `s-${nameObj.id}-${Date.now()}`,
        text: nameObj.name,
        meaning: nameObj.meaning,
        originalIds: [nameObj.id]
      }
      setCart([...cart, newEntry])
    } else {
      // Double mode
      const newTemp = [...tempSelection, nameObj]
      if (newTemp.length === 2) {
        const newEntry = {
          id: `d-${newTemp[0].id}-${newTemp[1].id}-${Date.now()}`,
          text: `${newTemp[0].name} ${newTemp[1].name}`,
          meaning: `${newTemp[0].name}: ${newTemp[0].meaning.split(':').slice(1).join(':').trim()}\n${newTemp[1].name}: ${newTemp[1].meaning.split(':').slice(1).join(':').trim()}`,
          originalIds: [newTemp[0].id, newTemp[1].id]
        }
        setCart([...cart, newEntry])
        setTempSelection([])
      } else {
        setTempSelection(newTemp)
      }
    }
  }

  const removeFromCart = (idToRemove) => {
    setCart(cart.filter(item => item.id !== idToRemove))
  }

  // Handlers Phase 2
  const handleFinalChoice = (cartItem) => {
    if (finalChoices.find(c => c.id === cartItem.id)) {
      setFinalChoices(finalChoices.filter(c => c.id !== cartItem.id))
    } else {
      if (finalChoices.length < 3) {
        setFinalChoices([...finalChoices, cartItem])
      }
    }
  }

  // Submit Handler
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    const payload = {
      name: userName || 'Anonimo',
      choices: finalChoices.map(c => c.text).join(', '),
      details: finalChoices.map(c => c.meaning).join(' | ')
    }

    // Google Apps Script Webhook URL (Placeholder for now)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz9gO4LOsQRVdOrOatoyWqD3LWof3A-_CHrzwohxfwcKQQCjgh8qB48NbkxObzB_6VyIg/exec'
    
    try {
      if (scriptURL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        await fetch(scriptURL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      // Simulate network delay if placeholder
      await new Promise(r => setTimeout(r, 1000))
      setPhase(3)
    } catch (error) {
      console.error('Error submitting form', error)
      alert('Si è verificato un errore durante l\'invio.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-panel">
      {/* Intro Phase */}
      {phase === 0 && (
        <div className="intro-screen">
          <h1 className="title">Nuovo Nome per "Hyaena"</h1>
          <p className="subtitle">Aiutaci a scegliere il nome perfetto per il nostro software!</p>
          
          <div style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
            <p><strong>Fase 1:</strong> Crea una lista dei tuoi 10 nomi preferiti basandoti <em>solo sul suono</em>.</p>
            <p>Puoi scegliere nomi singoli o combinare due parole per crearne uno composto.</p>
            <br/>
            <p><strong>Fase 2:</strong> Scoprirai i significati dei 10 nomi che hai scelto. Dovrai selezionare la tua Top 3 definitiva!</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => setPhase(1)}>Inizia il Sondaggio</button>
          </div>
        </div>
      )}

      {/* Phase 1 */}
      {phase === 1 && (
        <div>
          <h1 className="title">Fase 1: Istinto</h1>
          <p className="subtitle">Seleziona 10 nomi o combinazioni. Basati solo sul suono!</p>
          
          <div className="controls-row">
            <div className="mode-switch">
              <button 
                className={`btn-secondary ${mode === 'single' ? 'btn-active' : ''}`}
                onClick={() => { setMode('single'); setTempSelection([]); }}
              >
                Parola Singola
              </button>
              <button 
                className={`btn-secondary ${mode === 'double' ? 'btn-active' : ''}`}
                onClick={() => setMode('double')}
              >
                Combina 2 Parole
              </button>
            </div>
            
            <div className="status-text">
              Selezionati: {cart.length}/10
            </div>
          </div>

          {mode === 'double' && tempSelection.length === 1 && (
            <div style={{ marginBottom: '1rem', color: 'var(--accent-gold)' }}>
              <em>Hai selezionato: <strong>{tempSelection[0].name}</strong>. Ora clicca una seconda parola per completare.</em>
            </div>
          )}

          <div className="names-grid">
            {namesData.map(nameObj => {
              const isTempSelected = tempSelection.find(t => t.id === nameObj.id)
              return (
                <div 
                  key={nameObj.id} 
                  className={`name-card ${isTempSelected ? 'selected' : ''}`}
                  onClick={() => handleNameClick(nameObj)}
                >
                  {nameObj.name}
                </div>
              )
            })}
          </div>

          <div className="cart-area">
            <h3>Il tuo Carrello ({cart.length}/10)</h3>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-tag">
                  {item.text}
                  <button onClick={() => removeFromCart(item.id)}>&times;</button>
                </div>
              ))}
              {cart.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Nessun nome selezionato...</span>}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                className="btn-primary" 
                disabled={cart.length !== 10}
                onClick={() => setPhase(2)}
              >
                Procedi alla Fase 2
              </button>
              {cart.length !== 10 && (
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Devi selezionare esattamente 10 nomi per procedere.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 2 */}
      {phase === 2 && (
        <div>
          <h1 className="title">Fase 2: Significato</h1>
          <p className="subtitle">Ecco i significati dei 10 nomi che hai scelto. Selezionane esattamente 3!</p>
          
          <div className="controls-row" style={{ justifyContent: 'center' }}>
            <div className="status-text" style={{ fontSize: '1.2rem' }}>
              Selezionati: {finalChoices.length}/3
            </div>
          </div>

          <div className="meaning-list">
            {cart.map(item => {
              const isSelected = finalChoices.find(c => c.id === item.id)
              return (
                <div 
                  key={item.id} 
                  className={`meaning-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleFinalChoice(item)}
                >
                  <div className="meaning-name">{item.text}</div>
                  <div className="meaning-text" style={{ whiteSpace: 'pre-line' }}>{item.meaning}</div>
                </div>
              )
            })}
          </div>

          <div className="cart-area">
            <h3 style={{ marginBottom: '1rem' }}>Invia i tuoi risultati</h3>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Il tuo Nome" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                className="btn-primary" 
                disabled={finalChoices.length !== 3 || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Invio in corso...' : 'Invia Voto'}
              </button>
              {finalChoices.length !== 3 && (
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Devi selezionare esattamente 3 nomi per inviare.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Success */}
      {phase === 3 && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h1 className="title" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</h1>
          <h1 className="title">Grazie per il tuo aiuto!</h1>
          <p className="subtitle">Il tuo voto è stato registrato con successo.</p>
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Le tue scelte finali:</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {finalChoices.map(c => (
                <div key={c.id} className="cart-tag" style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem' }}>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
