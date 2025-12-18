import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './Results.css'

export default function Results() {
  const { teams, guessHistory, resetGame } = useGame()

  // Сортируем команды по очкам (включая бонус времени)
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const scoreA = a.score + a.timeBonus
      const scoreB = b.score + b.timeBonus
      return scoreB - scoreA
    })
  }, [teams])

  const winner = sortedTeams[0]

  // Статистика по игрокам
  const playerStats = useMemo(() => {
    const stats: Record<string, { guessed: number, team: string }> = {}

    guessHistory.forEach(record => {
      if (!stats[record.guessedBy]) {
        stats[record.guessedBy] = { guessed: 0, team: record.team }
      }
      stats[record.guessedBy].guessed++
    })

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.guessed - a.guessed)
  }, [guessHistory])

  const topPlayer = playerStats[0]

  const handleNewGame = () => {
    resetGame()
  }

  if (teams.length === 0) {
    return (
      <div className="results-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>Нет данных об игре</p>
          <Link to="/" className="back-button">На главную</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="results-page">
      <div className="results-content">
        <div className="winner-section">
          <div className="trophy">🏆</div>
          <h1>Победитель!</h1>
          <div className="winner-name">{winner?.name}</div>
          <div className="winner-score">
            {winner?.score} {getPointsWord(winner?.score || 0)}
            {winner?.timeBonus > 0 && (
              <span className="time-bonus"> (+{winner.timeBonus}с бонус)</span>
            )}
          </div>
        </div>

        <div className="final-scores">
          <h2>Итоговый счёт</h2>
          {sortedTeams.map((team, index) => (
            <div key={index} className={`final-score-row ${index === 0 ? 'winner' : ''}`}>
              <div className="position">{index + 1}</div>
              <div className="team-info">
                <span className="team-name">{team.name}</span>
                {team.timeBonus > 0 && (
                  <span className="bonus-info">+{team.timeBonus}с</span>
                )}
              </div>
              <div className="team-score">{team.score + team.timeBonus}</div>
            </div>
          ))}
        </div>

        {topPlayer && (
          <div className="mvp-section">
            <h2>🌟 MVP игры</h2>
            <div className="mvp-card">
              <div className="mvp-avatar">
                {topPlayer.name.charAt(0).toUpperCase()}
              </div>
              <div className="mvp-info">
                <div className="mvp-name">{topPlayer.name}</div>
                <div className="mvp-stats">
                  Объяснил(а) {topPlayer.guessed} {getWordsWord(topPlayer.guessed)}
                </div>
                <div className="mvp-team">Команда «{topPlayer.team}»</div>
              </div>
            </div>
          </div>
        )}

        {playerStats.length > 1 && (
          <div className="all-players-stats">
            <h2>Статистика игроков</h2>
            <div className="players-list">
              {playerStats.map((player, index) => (
                <div key={index} className="player-stat-row">
                  <span className="player-rank">{index + 1}</span>
                  <span className="player-name">{player.name}</span>
                  <span className="player-guessed">{player.guessed}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="results-actions">
          <Link to="/" className="new-game-button" onClick={handleNewGame}>
            Новая игра
          </Link>
        </div>
      </div>
    </div>
  )
}

function getPointsWord(count: number): string {
  if (count === 1) return 'очко'
  if (count >= 2 && count <= 4) return 'очка'
  return 'очков'
}

function getWordsWord(count: number): string {
  if (count === 1) return 'слово'
  if (count >= 2 && count <= 4) return 'слова'
  return 'слов'
}

