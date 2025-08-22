import React, { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Separator } from "../components/ui/separator"
import QuickActionCard from "../components/QuickActionCard"
import MatchStatusCard from "../components/MatchStatuscard"
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw,
  FileText,
  Download,
  Eye,
} from "lucide-react"
import EdgeDashboard from "../components/EdgeDashboard"
import DataHealthCard from "../components/DataHealthCard"
import RecentActivityCard from "../components/RecentActivityCard"
import RecentExport from "../components/RecentExport"
import RecentExportCard from "../components/RecentExport"
import HomeNavbar from "../components/HomeNavbar"



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
      <HomeNavbar/>

      <div className="container mx-auto px-4 py-6">
        {/* Primary Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <QuickActionCard />

          {/* Next Matches & Continue Tagging */}
          <MatchStatusCard/>

          {/* Edge Dashboard */}
          <EdgeDashboard/>
        </div>

        {/* Data Health & Backlog */}
        <DataHealthCard/>

        {/* Recent Activity & Exports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityCard/>

          <RecentExportCard/>
        </div>
      </div>
    </div>
  )
}
