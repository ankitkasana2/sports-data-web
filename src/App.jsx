import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AnalyticsLayout from "./pages/analytics/Layout"
import AnalyticsPage from '@/components/analytics/AnalyticsPage'
import TeamsAnalyticsPage from "./pages/analytics/Teams"
import Navigation from "./components/Navigation"
import Home from "./pages/Home"
import HomePage from "./pages/Home"
import Players from "./pages/players/Players"
import TeamsPage from "./pages/teams/Teams"
import Matches from "./pages/matches/Matches"
import LiveMatchesList from "./pages/live/LiveMatchesList"
import MatchTagging from "./pages/live/MatchTagging"
import VenuesPage from "./pages/admin/reference/Venues"
import RefereesPage from "./pages/admin/reference/Referees"
import StagesPage from "./pages/admin/reference/stages"
import CompetitionsPage from "./pages/admin/reference/competitions"
import PlayerAnalyticsPage from "./pages/analytics/Player"
import VenueAnalyticsPage from "./pages/analytics/Venues"
import RefereeAnalyticsPage from "./pages/analytics/Referees"
import MatchDashboardPage from "./pages/analytics/MatchDashboard"
import ComparisonPage from "./pages/analytics/Comparison"
import PredictionPage from "./pages/analytics/Prediction"



function App() {


  
  return (
    <div className="min-h-screen ">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/live" element={<LiveMatchesList />} />
        <Route path="/live/:matchId" element={<MatchTagging />} />
        <Route path="/players" element={<Players />} />
        <Route path="/admin/reference/venues" element={<VenuesPage />} />
        <Route path="/admin/reference/referees" element={<RefereesPage />} />
        <Route path="/admin/reference/stages" element={<StagesPage />} />
        <Route path="/admin/reference/competitions" element={<CompetitionsPage />} />


        {/* ✅ Analytics Section (with shared LeftMenu) */}
        <Route path="/analytics" element={<AnalyticsLayout />}>
          <Route index element={<AnalyticsPage />} />
          <Route path="teams" element={<TeamsAnalyticsPage />} />
          <Route path="players" element={<PlayerAnalyticsPage />} />
          <Route path="venues" element={<VenueAnalyticsPage />} />
          <Route path="referees" element={<RefereeAnalyticsPage />} />
          <Route path="comparison" element={<ComparisonPage />} />
          <Route path="prediction" element={<PredictionPage />} />
          {/* add more analytics subpages as needed */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
