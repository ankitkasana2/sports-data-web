import { useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { PanelLeft } from "lucide-react"

const ITEMS = [
  { label: "Overview", href: "/analytics", enabled: true },
  { label: "Teams", href: "/analytics/teams", enabled: true },
  { label: "Players", href: "/analytics/players", enabled: false },
  { label: "Venues", href: "/analytics/venues", enabled: false },
  { label: "Referees", href: "/analytics/referees", enabled: false },
  { label: "Comparison", href: "/analytics/comparison", enabled: false },
  { label: "Prediction", href: "/analytics/prediction", enabled: false },
]

export default function LeftMenu() {
  const pathname = useLocation()

  return (
    <aside className="hidden md:flex w-56 fixed left-0 top-0 h-screen  border-r bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 px-3 h-12 border-b">
          <PanelLeft className="h-4 w-4" />
          <span className="font-medium">Analytics</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2">
            {ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  disabled={!item.enabled}
                  className={cn("w-full justify-start mb-1", !item.enabled && "opacity-60 cursor-not-allowed")}
                >
                  <a href={item.enabled ? item.href : "#"} aria-disabled={!item.enabled}>
                    {item.label}
                  </a>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  )
}
