import { createContext, useContext, useState, type ReactNode } from 'react'

export interface Team {
  name: string
  players: string[]
  score: number
  timeBonus: number // Бонусное время за быстрое угадывание
}

export interface GuessRecord {
  word: string
  guessedBy: string // Имя игрока который объяснял
  team: string
  round: number
}

interface GameState {
  players: string[]
  setPlayers: (players: string[]) => void
  teamSizes: number[] | null
  setTeamSizes: (sizes: number[] | null) => void
  teams: Team[]
  setTeams: (teams: Team[]) => void
  words: string[]
  addWords: (newWords: string[]) => void
  wordsPerPlayer: number
  setWordsPerPlayer: (count: number) => void

  // Игровое состояние
  currentRound: number
  setCurrentRound: (round: number) => void
  currentTeamIndex: number
  setCurrentTeamIndex: (index: number) => void
  currentPlayerIndices: number[] // Индекс текущего игрока в каждой команде
  setCurrentPlayerIndices: (indices: number[]) => void
  remainingWords: string[]
  setRemainingWords: (words: string[]) => void
  guessHistory: GuessRecord[]
  addGuess: (record: GuessRecord) => void
  updateTeamScore: (teamIndex: number, points: number) => void
  addTimeBonus: (teamIndex: number, seconds: number) => void

  resetGame: () => void
}

const GameContext = createContext<GameState | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<string[]>([])
  const [teamSizes, setTeamSizes] = useState<number[] | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [words, setWords] = useState<string[]>([])
  const [wordsPerPlayer, setWordsPerPlayer] = useState(5)

  // Игровое состояние
  const [currentRound, setCurrentRound] = useState(1)
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [currentPlayerIndices, setCurrentPlayerIndices] = useState<number[]>([])
  const [remainingWords, setRemainingWords] = useState<string[]>([])
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([])

  const addWords = (newWords: string[]) => {
    setWords(prev => [...prev, ...newWords])
  }

  const addGuess = (record: GuessRecord) => {
    setGuessHistory(prev => [...prev, record])
  }

  const updateTeamScore = (teamIndex: number, points: number) => {
    setTeams(prev => prev.map((team, i) =>
      i === teamIndex ? { ...team, score: team.score + points } : team
    ))
  }

  const addTimeBonus = (teamIndex: number, seconds: number) => {
    setTeams(prev => prev.map((team, i) =>
      i === teamIndex ? { ...team, timeBonus: team.timeBonus + seconds } : team
    ))
  }

  const resetGame = () => {
    setPlayers([])
    setTeamSizes(null)
    setTeams([])
    setWords([])
    setCurrentRound(1)
    setCurrentTeamIndex(0)
    setCurrentPlayerIndices([])
    setRemainingWords([])
    setGuessHistory([])
  }

  return (
    <GameContext.Provider value={{
      players,
      setPlayers,
      teamSizes,
      setTeamSizes,
      teams,
      setTeams,
      words,
      addWords,
      wordsPerPlayer,
      setWordsPerPlayer,
      currentRound,
      setCurrentRound,
      currentTeamIndex,
      setCurrentTeamIndex,
      currentPlayerIndices,
      setCurrentPlayerIndices,
      remainingWords,
      setRemainingWords,
      guessHistory,
      addGuess,
      updateTeamScore,
      addTimeBonus,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}
