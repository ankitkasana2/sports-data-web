import { useMemo } from "react"
import { Card } from "../ui/card"
import { secondsToHHMMSS } from "./LiveUtils"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"

export const EventFeed = observer(function EventFeed() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore

  const rows = useMemo(() => {
     const sorted = [...(store.events || [])].sort((a, b) => a.ts - b.ts)
    return sorted
  }, [store.events])

  return (
    <Card className="p-3">
      <div className="mb-2 text-sm font-medium">Event Feed</div>
      <div className="grid gap-2">
        {rows.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[72px,1fr,auto] items-center gap-2 rounded border p-2"
          >
            <div className="font-mono text-sm tabular-nums">{secondsToHHMMSS(e.ts)}</div>
            <div className="flex items-center gap-2">
              <TypeChip event={e} />
              {e.possession_id && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                  POS {e.possession_id.slice(0, 4)}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{store.clock.period}</div>
          </div>
        ))}
      </div>
    </Card>
  )
})

function TypeChip({ event }) {
  const t = event.type
  const label =
    t === "shot"
      ? "Shot"
      : t === "free"
      ? "Free"
      : t === "kickout"
      ? "Kick-out"
      : t === "puckout"
      ? "Puck-out"
      : t === "turnover"
      ? "Turnover"
      : t
  return (
    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">
      {label}
    </span>
  )
}
