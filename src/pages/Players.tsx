import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './Players.css'

const MIN_PLAYERS = 4

export default function Players() {
  const { players, setPlayers } = useGame()
  const [newPlayer, setNewPlayer] = useState('')
  const navigate = useNavigate()

  const addPlayer = () => {
    const name = newPlayer.trim()
    if (name && !players.includes(name)) {
      setPlayers([...players, name])
      setNewPlayer('')
    }
  }

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPlayer()
    }
  }

  const handleContinue = () => {
    navigate('/teams')
  }

  const canContinue = players.length >= MIN_PLAYERS

  return (
    <div className="players-page">
      <Link to="/" className="back-link">← Назад</Link>

      <h1>Участники</h1>
      <p className="subtitle">Минимум {MIN_PLAYERS} игрока для двух команд</p>

      <div className="add-player">
        <input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите имя..."
          autoFocus
        />
        <button onClick={addPlayer} disabled={!newPlayer.trim()}>
          Добавить
        </button>
      </div>

      {players.length > 0 && (
        <div className="players-list">
          {players.map((player, index) => (
            <div key={index} className="player-card">
              <div className="player-avatar">
                {player.charAt(0).toUpperCase()}
              </div>
              <span className="player-name">{player}</span>
              <button
                className="remove-btn"
                onClick={() => removePlayer(index)}
                aria-label="Удалить"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {players.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>Пока нет участников</p>
        </div>
      )}

      <div className="players-count">
        {players.length} {getPlayersWord(players.length)}
        {!canContinue && players.length > 0 && (
          <span className="hint"> (нужно ещё {MIN_PLAYERS - players.length})</span>
        )}
      </div>

      {canContinue && (
        <button className="continue-button" onClick={handleContinue}>
          Выбрать команды
          <span className="arrow">→</span>
        </button>
      )}
    </div>
  )
}

function getPlayersWord(count: number): string {
  if (count === 1) return 'участник'
  if (count >= 2 && count <= 4) return 'участника'
  return 'участников'
}

