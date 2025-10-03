import { Link, useLocation } from "react-router-dom"
import { Home, Users, Trophy, BarChart3, Target, UserCheck, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import { useStores } from "../stores/StoresProvider"
import { useEffect, useState } from "react"
import { Settings } from 'lucide-react';

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const { homeFilterbarStore } = useStores()
  const { filters, years, competitions, grades, groups, matches } = homeFilterbarStore

  const [match, setMatch] = useState([])


  useEffect(() => {
    if (matches.length != 0) {
      const fetchMetch = matches.find((m) => m.match_status == "paused");
      if (fetchMetch) {
        setMatch(() => fetchMetch)
      }
    }
  }, [matches])

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/teams", icon: Users, label: "Teams" },
    { path: "/players", icon: UserCheck, label: "Players" },
    { path: "/matches", icon: Trophy, label: "Matches" },
    { path: "/live", icon: BarChart3, label: "Live" },
    { path: "/analytics", icon: Target, label: "Analytics" },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50 h-14">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl text-slate-800">
            GAA Stats
          </Link>
          <div className="flex space-x-8">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === path
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}

            {/* resume match button  */}
            <Button size="sm" onClick={() => navigate(`live/${match.match_id}`)}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Resume
            </Button>

            {/* admin button  */}
            <Button  onClick={() => navigate(`/admin/reference/Venues`)} variant="secondary" className='hover:cursor-pointer'><Settings/>Admin</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default observer(Navigation)