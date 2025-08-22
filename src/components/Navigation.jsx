import { Link, useLocation } from "react-router-dom"
import { Home, Users, Trophy, BarChart3, Target, UserCheck } from "lucide-react"

export function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/teams", icon: Users, label: "Teams" },
    { path: "/players", icon: UserCheck, label: "Players" },
    { path: "/matches", icon: Trophy, label: "Matches" },
    { path: "/live", icon: BarChart3, label: "Live" },
    { path: "/analytics", icon: Target, label: "Analytics" },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
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
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
