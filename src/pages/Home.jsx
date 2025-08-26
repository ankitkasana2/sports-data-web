import React, { useState } from "react"

import QuickActionCard from "../components/QuickActionCard"
import MatchStatusCard from "../components/MatchStatuscard"

import EdgeDashboard from "../components/EdgeDashboard"
import DataHealthCard from "../components/DataHealthCard"
import RecentActivityCard from "../components/RecentActivityCard"
import RecentExport from "../components/RecentExport"
import RecentExportCard from "../components/RecentExport"
import HomeFilterbar from "../components/HomeFilterbar"



export default function Home() {
  const [filters, setFilters] = useState({
    season: "2025",
    competition: "Wexford SHC",
    code: "Hurling",
    grade: "Senior",
    group: "Group A",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Top Filter Bar */}
      <HomeFilterbar />

      <div className="container mx-auto px-4 py-6">
        {/* Primary Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div>
            <QuickActionCard />
          </div>

          {/* Next Matches & Continue Tagging */}
          <div>
            <MatchStatusCard />
          </div>

          {/* Edge Dashboard */}
          <div>
            <EdgeDashboard />
          </div>
        </div>

        {/* Data Health & Backlog */}
        <DataHealthCard />

        {/* Recent Activity & Exports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityCard />

          <RecentExportCard />
        </div>
      </div>
    </div>
  )
}
