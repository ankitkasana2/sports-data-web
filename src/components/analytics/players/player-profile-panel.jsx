
import { fmtNumber, fmtPercent } from "../../../lib/players-utils"

export default function PlayerProfilePanel({ player, onClose }) {
  if (!player) return null

  return (
    <aside
      role="complementary"
      aria-label="Player profile"
      className="fixed right-0 top-0 h-dvh w-full max-w-[420px] border-l border-border bg-background text-foreground shadow-lg overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-pretty">{player.name}</h2>
          <p className="text-sm opacity-70">
            {player.team} • {player.position || "—"}
          </p>
        </div>
        <button
          aria-label="Close profile"
          className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <section className="p-4 space-y-6">
        {/* Match log (simplified) */}
        <div>
          <h3 className="text-sm font-medium mb-2">Match log</h3>
          <div className="grid grid-cols-5 gap-2 text-xs opacity-70 mb-1">
            <div>Date</div>
            <div>Min</div>
            <div>Pts</div>
            <div>Shots</div>
            <div>Frees</div>
          </div>
          <div className="space-y-1">
            {(player.matchLog || []).slice(0, 10).map((m, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 text-sm">
                <div>{m.date || "—"}</div>
                <div>{fmtNumber(m.minutes || 0, 0)}</div>
                <div>{fmtNumber(m.points || 0, 0)}</div>
                <div>{fmtNumber(m.shots || 0, 0)}</div>
                <div>{fmtNumber(m.frees || 0, 0)}</div>
              </div>
            ))}
            {(!player.matchLog || player.matchLog.length === 0) && (
              <div className="text-sm opacity-60">No match data</div>
            )}
          </div>
        </div>

        {/* Shot matrix (type × band) simplified numeric */}
        <div>
          <h3 className="text-sm font-medium mb-2">Shot matrix</h3>
          <div className="grid grid-cols-4 gap-2 text-xs opacity-70 mb-1">
            <div>Type</div>
            <div>Att</div>
            <div>Sc</div>
            <div>%</div>
          </div>
          <div className="space-y-1">
            {(player.shotMatrix || []).slice(0, 6).map((row, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 text-sm">
                <div className="truncate">{row.type || "—"}</div>
                <div>{row.att ?? "—"}</div>
                <div>{row.sc ?? "—"}</div>
                <div>{row.pct != null ? fmtPercent(row.pct, 1) : "—"}</div>
              </div>
            ))}
            {(!player.shotMatrix || player.shotMatrix.length === 0) && (
              <div className="text-sm opacity-60">No shot matrix</div>
            )}
          </div>
        </div>

        {/* On-pitch impact mini-table */}
        <div>
          <h3 className="text-sm font-medium mb-2">On-pitch impact</h3>
          <div className="grid grid-cols-5 gap-2 text-xs opacity-70 mb-1">
            <div>ORtg_on</div>
            <div>DRtg_on</div>
            <div>Net</div>
            <div>Pace</div>
            <div>+/-/60</div>
          </div>
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div>{fmtNumber(player.ortg_on, 1)}</div>
            <div>{fmtNumber(player.drtg_on, 1)}</div>
            <div>{fmtNumber(player.net_on, 1)}</div>
            <div>{fmtNumber(player.pace_on, 1)}</div>
            <div>{fmtNumber(player.plus_minus_per60, 1)}</div>
          </div>
        </div>

        {/* Chemistry detail (top dyads numeric) */}
        <div>
          <h3 className="text-sm font-medium mb-2">Chemistry (top dyads)</h3>
          <div className="grid grid-cols-3 gap-2 text-xs opacity-70 mb-1">
            <div>Teammate</div>
            <div>Events</div>
            <div>Share</div>
          </div>
          <div className="space-y-1">
            {(player.chemistry || []).slice(0, 3).map((d, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 text-sm">
                <div className="truncate" title={d.name}>
                  {d.name || "—"}
                </div>
                <div>{d.events ?? "—"}</div>
                <div>{d.share != null ? fmtPercent(d.share, 1) : "—"}</div>
              </div>
            ))}
            {(!player.chemistry || player.chemistry.length === 0) && <div className="text-sm opacity-60">No dyads</div>}
          </div>
        </div>
      </section>
    </aside>
  )
}
