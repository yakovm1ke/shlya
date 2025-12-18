import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import Home from './pages/Home'
import Players from './pages/Players'
import Teams from './pages/Teams'
import Words from './pages/Words'
import TeamReveal from './pages/TeamReveal'
import Game from './pages/Game'
import Results from './pages/Results'
import './App.css'

function App() {
  return (
    <GameProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/players" element={<Players />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/words" element={<Words />} />
          <Route path="/team-reveal" element={<TeamReveal />} />
          <Route path="/game" element={<Game />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App
