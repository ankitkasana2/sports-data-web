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
import VenuesPage from "./pages/admin/reference/Venues"
import RefereesPage from "./pages/admin/reference/referees"
import StagesPage from "./pages/admin/reference/stages"
import CompetitionsPage from "./pages/admin/reference/competitions"


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
        <Route path="/admin/reference/referees" element={<RefereesPage/>}/>
        <Route path="/admin/reference/stages" element={<StagesPage/>}/>
        <Route path="/admin/reference/competitions" element={<CompetitionsPage/>}/>
      </Routes>
    </div>
  )
}

export default App
