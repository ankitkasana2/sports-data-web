import React, { useState, useEffect } from "react"
import QuickActionCard from "../components/QuickActionCard"
import MatchStatusCard from "../components/MatchStatuscard"
import InProgressBanner from "../components/InProgressBanner"
import EdgeDashboard from "../components/EdgeDashboard"
import DataHealthCard from "../components/DataHealthCard"
import RecentActivityCard from "../components/RecentActivityCard"
import RecentExport from "../components/RecentExport"
import RecentExportCard from "../components/RecentExport"
import HomeFilterbar from "../components/HomeFilterbar"
import axios from "axios"


export default function Home() {


  return (
    <div className="min-h-screen bg-background">
      {/* Top Filter Bar */}
      <HomeFilterbar />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <InProgressBanner />
        </div>
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
