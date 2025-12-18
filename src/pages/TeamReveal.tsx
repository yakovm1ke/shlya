import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './TeamReveal.css'

interface Team {
  name: string
  players: string[]
  score: number
  timeBonus: number
}

const TEAM_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Фиолетовые' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Розовые' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Голубые' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Зелёные' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Оранжевые' },
  { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Пастельные' },
]

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

type Phase = 'rolling' | 'forming' | 'done'

export default function TeamReveal() {
  const { players, teamSizes, setTeams } = useGame()
  const navigate = useNavigate()

  const [phase, setPhase] = useState<Phase>('rolling')
  const [diceValues, setDiceValues] = useState([0, 0])
  const [formedTeams, setFormedTeams] = useState<Team[]>([])
  const [revealedTeamIndex, setRevealedTeamIndex] = useState(-1)

  // Перемешивание массива
  const shuffle = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [])

  // Формирование команд
  const formTeams = useCallback(() => {
    if (!teamSizes) return []

    const shuffledPlayers = shuffle(players)
    const teams: Team[] = []
    let playerIndex = 0

    teamSizes.forEach((size, i) => {
      teams.push({
        name: TEAM_COLORS[i % TEAM_COLORS.length].name,
        players: shuffledPlayers.slice(playerIndex, playerIndex + size),
        score: 0,
        timeBonus: 0
      })
      playerIndex += size
    })

    return teams
  }, [players, teamSizes, shuffle])

  // Анимация костей
  useEffect(() => {
    if (phase !== 'rolling') return

    const rollInterval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6)
      ])
    }, 100)

    const rollTimeout = setTimeout(() => {
      clearInterval(rollInterval)
      const teams = formTeams()
      setFormedTeams(teams)
      setPhase('forming')
    }, 2500)

    return () => {
      clearInterval(rollInterval)
      clearTimeout(rollTimeout)
    }
  }, [phase, formTeams])

  // Последовательное появление команд
  useEffect(() => {
    if (phase !== 'forming') return
    if (revealedTeamIndex >= formedTeams.length - 1) {
      setTimeout(() => {
        setTeams(formedTeams)
        setPhase('done')
      }, 800)
      return
    }

    const timeout = setTimeout(() => {
      setRevealedTeamIndex(prev => prev + 1)
    }, 600)

    return () => clearTimeout(timeout)
  }, [phase, revealedTeamIndex, formedTeams, setTeams])

  const handleContinue = () => navigate('/game')

  if (!teamSizes || players.length === 0) {
    return (
      <div className="team-reveal-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Сначала настройте игру</p>
          <Link to="/players" className="back-button">К игрокам</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="team-reveal-page">
      {phase === 'rolling' && (
        <div className="rolling-screen">
          <h1>Формируем команды</h1>
          <div className="dice-container">
            <div className="dice rolling">{DICE_FACES[diceValues[0]]}</div>
            <div className="dice rolling">{DICE_FACES[diceValues[1]]}</div>
          </div>
          <p className="rolling-text">Бросаем кости...</p>
        </div>
      )}

      {(phase === 'forming' || phase === 'done') && (
        <div className="teams-result">
          <h1>Ваши команды!</h1>

          <div className="teams-grid">
            {formedTeams.map((team, teamIndex) => (
              <div
                key={teamIndex}
                className={`team-card ${teamIndex <= revealedTeamIndex ? 'revealed' : ''}`}
                style={{
                  '--team-color': TEAM_COLORS[teamIndex % TEAM_COLORS.length].bg,
                  animationDelay: `${teamIndex * 0.1}s`
                } as React.CSSProperties}
              >
                <div className="team-header" style={{ background: TEAM_COLORS[teamIndex % TEAM_COLORS.length].bg }}>
                  <span className="team-number">Команда {teamIndex + 1}</span>
                  <span className="team-name">{team.name}</span>
                </div>
                <div className="team-players">
                  {team.players.map((player, playerIndex) => (
                    <div
                      key={playerIndex}
                      className="team-player"
                      style={{ animationDelay: `${teamIndex * 0.15 + playerIndex * 0.1}s` }}
                    >
                      <div
                        className="player-avatar-small"
                        style={{ background: TEAM_COLORS[teamIndex % TEAM_COLORS.length].bg }}
                      >
                        {player.charAt(0).toUpperCase()}
                      </div>
                      <span>{player}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {phase === 'done' && (
            <button className="continue-button" onClick={handleContinue}>
              Начать игру!
              <span className="arrow">→</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

