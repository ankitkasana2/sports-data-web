
import { Badge } from "../ui/badge"

const GROUPS = [
  "Scoring & Ratings",
  "Shooting Types",
  "Distance & Angle",
  "Restarts",
  "Possessions & Chains",
  "Transition",
  "Discipline",
  "Context",
  "Exposure",
]

export default function ColumnGroups({ activeGroups, onToggleGroup }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GROUPS.map((g) => {
        const active = activeGroups.includes(g)
        return (
          <button
            key={g}
            onClick={() => onToggleGroup(g)}
            className={`px-2.5 py-1 rounded-md text-sm border transition
              ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {g}
          </button>
        )
      })}
      <Badge variant="outline" className="ml-auto">
        Rate mode applies to per-match rates only
      </Badge>
    </div>
  )
}
