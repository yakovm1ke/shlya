import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './Game.css'

const ROUND_TIME = 60 // 1 минута
const ROUND_NAMES = ['', 'Объяснение', 'Пантомима', 'Одно слово']
const ROUND_ICONS = ['', '💬', '🎭', '☝️']
const ROUND_DESCRIPTIONS = [
  '',
  'Объясняй слово любыми словами, кроме однокоренных',
  'Показывай жестами, без звуков',
  'Скажи только одно слово-ассоциацию'
]

type GamePhase = 'waiting' | 'playing' | 'turnEnd'

export default function Game() {
  const navigate = useNavigate()
  const {
    teams,
    words,
    currentRound,
    setCurrentRound,
    currentTeamIndex,
    setCurrentTeamIndex,
    currentPlayerIndices,
    setCurrentPlayerIndices,
    remainingWords,
    setRemainingWords,
    addGuess,
    updateTeamScore,
    addTimeBonus
  } = useGame()

  const [phase, setPhase] = useState<GamePhase>('waiting')
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [wordsGuessedThisTurn, setWordsGuessedThisTurn] = useState(0)

  // Оставшееся время для каждой команды
  const [teamTimes, setTeamTimes] = useState<number[]>([])

  // Инициализация игры
  useEffect(() => {
    if (teams.length > 0 && currentPlayerIndices.length === 0) {
      setCurrentPlayerIndices(teams.map(() => 0))
    }
    if (teams.length > 0 && teamTimes.length === 0) {
      setTeamTimes(teams.map(() => ROUND_TIME))
    }
    if (words.length > 0 && remainingWords.length === 0) {
      setRemainingWords(shuffleArray([...words]))
    }
  }, [teams, words, currentPlayerIndices.length, remainingWords.length, teamTimes.length, setCurrentPlayerIndices, setRemainingWords])

  const currentTeam = teams[currentTeamIndex]
  const currentPlayerIndex = currentPlayerIndices[currentTeamIndex] || 0
  const currentPlayer = currentTeam?.players[currentPlayerIndex]
  const currentWord = remainingWords[currentWordIndex]
  const totalWordsInRound = words.length
  const guessedInRound = totalWordsInRound - remainingWords.length + currentWordIndex

  // Таймер
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      endTurn(0)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, timeLeft])

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const startTurn = () => {
    setPhase('playing')
    // Используем сохранённое время для этой команды
    // Если время = 0, даём полное время
    const savedTime = teamTimes[currentTeamIndex]
    const timeToUse = savedTime > 0 ? savedTime : ROUND_TIME
    setTimeLeft(timeToUse)
    setWordsGuessedThisTurn(0)
    setCurrentWordIndex(0)
  }

  const handleGuessed = useCallback(() => {
    // Записываем угаданное слово
    addGuess({
      word: currentWord,
      guessedBy: currentPlayer,
      team: currentTeam.name,
      round: currentRound
    })
    updateTeamScore(currentTeamIndex, 1)
    setWordsGuessedThisTurn(prev => prev + 1)

    // Убираем слово из оставшихся
    const newRemaining = remainingWords.filter((_, i) => i !== currentWordIndex)

    if (newRemaining.length === 0) {
      // Все слова угаданы в этом раунде!
      addTimeBonus(currentTeamIndex, timeLeft)
      setRemainingWords([])

      // Сохраняем оставшееся время для следующего раунда
      const newTeamTimes = [...teamTimes]
      newTeamTimes[currentTeamIndex] = timeLeft // Сохраняем остаток времени
      setTeamTimes(newTeamTimes)

      if (currentRound < 3) {
        // Следующий раунд - время команд сохраняется!
        setCurrentRound(currentRound + 1)
        setRemainingWords(shuffleArray([...words]))
        setCurrentWordIndex(0)
        setPhase('waiting')
      } else {
        // Игра окончена
        navigate('/results')
      }
    } else {
      setRemainingWords(newRemaining)
      setCurrentWordIndex(0)
    }
  }, [currentWord, currentPlayer, currentTeam, currentRound, currentTeamIndex, remainingWords, currentWordIndex, timeLeft, words, teams, teamTimes, addGuess, updateTeamScore, addTimeBonus, setRemainingWords, setCurrentRound, navigate])

  const endTurn = useCallback((remainingTime: number) => {
    // Сохраняем оставшееся время для этой команды
    const newTeamTimes = [...teamTimes]
    newTeamTimes[currentTeamIndex] = remainingTime
    setTeamTimes(newTeamTimes)
    setPhase('turnEnd')
  }, [teamTimes, currentTeamIndex])

  const nextTurn = () => {
    // Переход к следующему игроку в текущей команде
    const newPlayerIndices = [...currentPlayerIndices]
    newPlayerIndices[currentTeamIndex] = (currentPlayerIndex + 1) % currentTeam.players.length
    setCurrentPlayerIndices(newPlayerIndices)

    // Переход к следующей команде
    setCurrentTeamIndex((currentTeamIndex + 1) % teams.length)
    setPhase('waiting')
  }

  if (!currentTeam || !currentPlayer) {
    return (
      <div className="game-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Сначала настройте игру</p>
          <Link to="/" className="back-button">На главную</Link>
        </div>
      </div>
    )
  }

  // Экран ожидания хода
  if (phase === 'waiting') {
    const savedTime = teamTimes[currentTeamIndex]
    const timeToShow = savedTime > 0 ? savedTime : ROUND_TIME

    return (
      <div className="game-page">
        <div className="waiting-screen">
          <div className="round-badge">
            <span className="round-icon">{ROUND_ICONS[currentRound]}</span>
            <span>Раунд {currentRound}: {ROUND_NAMES[currentRound]}</span>
          </div>

          <div className="pass-phone">
            <div className="phone-icon">📱</div>
            <h1>Передайте телефон</h1>
            <div className="player-name">{currentPlayer}</div>
            <div className="team-name">Команда «{currentTeam.name}»</div>
          </div>

          <div className="game-stats">
            <div className="stat">
              <span className="stat-value">{guessedInRound}</span>
              <span className="stat-label">угадано</span>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat">
              <span className="stat-value">{remainingWords.length}</span>
              <span className="stat-label">осталось</span>
            </div>
          </div>

          <div className="time-remaining">
            ⏱️ Осталось времени: {timeToShow} сек
          </div>

          <div className="round-rules">
            <p>{ROUND_DESCRIPTIONS[currentRound]}</p>
          </div>

          <button className="start-turn-button" onClick={startTurn}>
            Начать ход
          </button>
        </div>
      </div>
    )
  }

  // Игровой экран
  if (phase === 'playing') {
    return (
      <div className="game-page">
        <div className="playing-screen">
          <div className="timer-container">
            <div
              className={`timer ${timeLeft <= 10 ? 'warning' : ''} ${timeLeft <= 5 ? 'danger' : ''}`}
            >
              {timeLeft}
            </div>
            <div className="timer-bar">
              <div
                className="timer-progress"
                style={{ width: `${(timeLeft / ROUND_TIME) * 100}%` }}
              />
            </div>
          </div>

          <div className="word-display">
            <div className="current-word">{currentWord}</div>
          </div>

          <div className="turn-stats">
            Угадано за ход: {wordsGuessedThisTurn}
          </div>

          <button className="guessed-button" onClick={handleGuessed}>
            Угадали! ✓
          </button>
        </div>
      </div>
    )
  }

  // Конец хода
  return (
    <div className="game-page">
      <div className="turn-end-screen">
        <div className="time-up-icon">⏰</div>
        <h1>Время вышло!</h1>

        <div className="turn-result">
          <div className="result-player">{currentPlayer}</div>
          <div className="result-stats">
            угадал(а) <span className="result-count">{wordsGuessedThisTurn}</span> {getWordsWord(wordsGuessedThisTurn)}
          </div>
        </div>

        <div className="scores-preview">
          {teams.map((team, i) => (
            <div key={i} className={`score-row ${i === currentTeamIndex ? 'current' : ''}`}>
              <span className="score-team">{team.name}</span>
              <span className="score-value">{team.score}</span>
            </div>
          ))}
        </div>

        <button className="next-turn-button" onClick={nextTurn}>
          Следующий ход →
        </button>
      </div>
    </div>
  )
}

function getWordsWord(count: number): string {
  if (count === 1) return 'слово'
  if (count >= 2 && count <= 4) return 'слова'
  return 'слов'
}
