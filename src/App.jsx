import { Routes, Route } from "react-router-dom"
import { Navigation } from "./components/Navigation"
import Home from "./pages/Home"
import HomePage from "./pages/Home"
import Teams from "./pages/teams/Teams"
import Players from "./pages/players/Players"
// import Matches from "./pages/matches/Matches"
// import MatchSetup from "./pages/matches/MatchSetup"
// import LivePage from "./pages/LivePage"
// import AnalyticsPage from "./pages/AnalyticsPage"
// import PlayersPage from "./pages/PlayersPage"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* <Navigation /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<Teams />} />
        {/* <Route path="/matches" element={<MatchesPage />} /> */}
        {/* <Route path="/live" element={<LivePage />} /> */}
        {/* <Route path="/analytics" element={<AnalyticsPage />} /> */}
        <Route path="/players" element={<Players />} />
      </Routes>
    </div>
  )
}

export default App
