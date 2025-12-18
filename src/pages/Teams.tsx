import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './Teams.css'

interface TeamOption {
  teamCount: number
  playersPerTeam: number
  remainder: number
}

export default function Teams() {
  const { players, setTeamSizes } = useGame()
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const totalPlayers = players.length

  const options = useMemo(() => {
    const result: TeamOption[] = []
    for (let teams = 2; teams <= Math.floor(totalPlayers / 2); teams++) {
      const playersPerTeam = Math.floor(totalPlayers / teams)
      const remainder = totalPlayers % teams
      if (playersPerTeam >= 2) {
        result.push({ teamCount: teams, playersPerTeam, remainder })
      }
    }
    return result
  }, [totalPlayers])

  const handleContinue = () => {
    if (selectedOption === null) return
    const option = options[selectedOption]
    const sizes: number[] = []
    for (let i = 0; i < option.teamCount; i++) {
      sizes.push(option.playersPerTeam + (i < option.remainder ? 1 : 0))
    }
    setTeamSizes(sizes)
    navigate('/words')
  }

  if (totalPlayers < 4) {
    return (
      <div className="teams-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Недостаточно игроков</p>
          <Link to="/players" className="back-button">Добавить игроков</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="teams-page">
      <Link to="/players" className="back-link">← Назад к игрокам</Link>
      <h1>Команды</h1>
      <p className="subtitle">
        Выберите как разделить {totalPlayers} {getPlayersWord(totalPlayers)}
      </p>

      <div className="options-list">
        {options.map((option, index) => (
          <button
            key={index}
            className={`option-card ${selectedOption === index ? 'selected' : ''}`}
            onClick={() => setSelectedOption(index)}
          >
            <div className="option-teams">
              {Array.from({ length: option.teamCount }).map((_, i) => (
                <div key={i} className="team-preview">
                  <div className="team-icon">👥</div>
                  <span className="team-size">
                    {option.playersPerTeam + (i < option.remainder ? 1 : 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="option-description">
              {formatOptionDescription(option)}
            </div>
          </button>
        ))}
      </div>

      {selectedOption !== null && (
        <button className="continue-button" onClick={handleContinue}>
          Продолжить
          <span className="arrow">→</span>
        </button>
      )}
    </div>
  )
}

function formatOptionDescription(option: TeamOption): string {
  const { teamCount, playersPerTeam, remainder } = option
  if (remainder === 0) {
    return `${teamCount} ${getTeamsWord(teamCount)} по ${playersPerTeam} ${getPlayersWord(playersPerTeam)}`
  }
  const smallTeams = teamCount - remainder
  const bigTeams = remainder
  if (smallTeams === 0) {
    return `${teamCount} ${getTeamsWord(teamCount)} по ${playersPerTeam + 1} ${getPlayersWord(playersPerTeam + 1)}`
  }
  return `${bigTeams} ${getTeamsWord(bigTeams)} по ${playersPerTeam + 1} и ${smallTeams} ${getTeamsWord(smallTeams)} по ${playersPerTeam}`
}

function getTeamsWord(count: number): string {
  if (count === 1) return 'команда'
  if (count >= 2 && count <= 4) return 'команды'
  return 'команд'
}

function getPlayersWord(count: number): string {
  if (count === 1) return 'человек'
  if (count >= 2 && count <= 4) return 'человека'
  return 'человек'
}

