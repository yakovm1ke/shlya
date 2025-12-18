import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './Words.css'

type Phase = 'pass' | 'input' | 'done'

export default function Words() {
  const { players, wordsPerPlayer, addWords } = useGame()
  const navigate = useNavigate()

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('pass')
  const [playerWords, setPlayerWords] = useState<string[]>(Array(wordsPerPlayer).fill(''))

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const currentPlayer = players[currentPlayerIndex]
  const isLastPlayer = currentPlayerIndex === players.length - 1

  const handleReady = () => setPhase('input')

  const handleWordChange = (index: number, value: string) => {
    const updated = [...playerWords]
    updated[index] = value
    setPlayerWords(updated)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // Если текущее поле заполнено
      if (playerWords[index].trim().length > 0) {
        // Если есть следующее поле — переходим к нему
        if (index < wordsPerPlayer - 1) {
          inputRefs.current[index + 1]?.focus()
        } else {
          // Это последнее поле — если все заполнены, сабмитим
          if (allWordsFilled) {
            handleSubmitWords()
          }
        }
      }
    }
  }

  const allWordsFilled = playerWords.every(w => w.trim().length > 0)

  const handleSubmitWords = () => {
    const trimmedWords = playerWords.map(w => w.trim()).filter(w => w.length > 0)
    addWords(trimmedWords)

    if (isLastPlayer) {
      setPhase('done')
    } else {
      setPlayerWords(Array(wordsPerPlayer).fill(''))
      setCurrentPlayerIndex(prev => prev + 1)
      setPhase('pass')
    }
  }

  const handleContinue = () => navigate('/team-reveal')

  if (players.length === 0) {
    return (
      <div className="words-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Сначала добавьте игроков</p>
          <Link to="/players" className="back-button">К игрокам</Link>
        </div>
      </div>
    )
  }

  if (phase === 'pass') {
    return (
      <div className="words-page">
        <div className="pass-screen">
          <div className="pass-icon">📱</div>
          <h1>Передай телефон</h1>
          <div className="player-name-big">{currentPlayer}</div>
          <p className="pass-hint">
            {currentPlayerIndex === 0
              ? 'Первый игрок придумывает слова'
              : 'Твоя очередь придумывать слова'}
          </p>
          <button className="ready-button" onClick={handleReady}>
            Я {currentPlayer}, готов!
          </button>
          <div className="progress">
            Игрок {currentPlayerIndex + 1} из {players.length}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'input') {
    return (
      <div className="words-page">
        <div className="input-screen">
          <div className="input-header">
            <span className="hat-mini">🎩</span>
            <h2>{currentPlayer}, положи слова в шляпу</h2>
          </div>

          <p className="input-hint">
            Придумай {wordsPerPlayer} слов, которые другие будут объяснять
          </p>

          <div className="words-inputs">
            {playerWords.map((word, index) => (
              <div key={index} className="word-input-row">
                <span className="word-number">{index + 1}</span>
                <input
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  value={word}
                  onChange={(e) => handleWordChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  placeholder="Введи слово..."
                  autoFocus={index === 0}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <button
            className="submit-button"
            onClick={handleSubmitWords}
            disabled={!allWordsFilled}
          >
            {isLastPlayer ? 'Завершить' : 'Готово, передать дальше'}
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="words-page">
      <div className="done-screen">
        <div className="done-icon">🎩✨</div>
        <h1>Шляпа готова!</h1>
        <p className="done-stats">
          {players.length} игроков положили<br/>
          <span className="words-count">{players.length * wordsPerPlayer} слов</span>
        </p>
        <button className="continue-button" onClick={handleContinue}>
          Распределить команды
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  )
}
