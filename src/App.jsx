import { Routes, Route } from "react-router-dom"
import Navigation from "./components/Navigation"
import Home from "./pages/Home"
import HomePage from "./pages/Home"
import Players from "./pages/players/Players"
import TeamsPage from "./pages/teams/Teams"
import Matches from "./pages/matches/Matches"
import LiveMatchesList from "./pages/live/LiveMatchesList"
import MatchTagging from "./pages/live/MatchTagging"
import Analytics from "./pages/analytics/Analytics"
import VenuesPage from "./pages/admin/reference/venues"


function App() {
  return (
    <div className="min-h-screen ">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/live" element={<LiveMatchesList />} />
        <Route path="/live/:matchId" element={<MatchTagging />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/players" element={<Players />} />
        <Route path="/admin/reference/venues" element={<VenuesPage />} />
      </Routes>
    </div>
  )
}

export default App
