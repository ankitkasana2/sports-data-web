import { useMemo } from "react"
import { Card } from "../ui/card"
import { toTotalPoints } from "../../stores/LiveMatchStore"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { Settings } from "lucide-react"
import { Button } from "../ui/button"

export const LiveStatsPanel = observer(function LiveStatsPanel({ compact = false }) {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore

  // ALWAYS SAFE ARRAY
  const events = store.events ?? [];
  const possessions = store.possessions ?? [];
  const scoreA = store.score?.home ?? { goals: 0, points: 0 };
  const scoreB = store.score?.away ?? { goals: 0, points: 0 };

  // ---------------------------- SHOTS ----------------------------
  const shots = useMemo(() => {
  const list = events.filter((e) => e.event_type === "shot");
  const attempts = list.length;

  const ptsTotal = toTotalPoints(scoreA) + toTotalPoints(scoreB);
  const completed = possessions.filter((p) => p?.end != null).length || 1;

  const pps = ptsTotal / completed;

  return { attempts, ptsTotal, pps };
}, [events.length, scoreA, scoreB, possessions.length]);

const Free = useMemo(() => {
  const list = events.filter((e) => e.event_type === "free");
  const attempts = list.length;

  const ptsTotal = toTotalPoints(scoreA) + toTotalPoints(scoreB);
  const completed = possessions.filter((p) => p?.end != null).length || 1;

  const pps = ptsTotal / completed;

  return { attempts, ptsTotal, pps };
}, [events.length, scoreA, scoreB, possessions.length]);

  // ---------------------------- RESTARTS ----------------------------
  const restarts = useMemo(() => {
    const isKick = store.code === "football";

    const list = events.filter((e) =>
      isKick ? e.event_type === "kickout" : e.event_type === "puckout"
    );

    return {
      total: list.length,
      ownRetentionPct: 0,
    };
  }, [events, store.code]);

  if (compact) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto py-2 text-sm">
        <StatPill label="Shots" value={`${shots.attempts}`} />

        <StatPill
          label="Scores"
          value={`${scoreA.goals}-${scoreA.points} • ${scoreB.goals}-${scoreB.points}`}
          sub={`A ${toTotalPoints(scoreA)} • B ${toTotalPoints(scoreB)}`}
        />

        <StatPill label="Frees" value={`${Free.attempts}`} />

        <StatPill
          label="Restart retention"
          value={
            restarts.ownRetentionPct !== null
              ? `${(restarts.ownRetentionPct * 100).toFixed(0)}%`
              : "—"
          }
        />

        <StatPill label="PPP" value={shots.pps.toFixed(2)} />

        <Button size="sm" className="ml-auto">
          <Settings className="h-3 w-3 mr-1" />
          Setting
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-3">
      <div className="mb-2 text-sm font-medium">Live Stats</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded border p-2">
          <div className="font-medium">Shots</div>
          <div>Attempts: {shots.attempts}</div>
          <div>PPP: {shots.pps.toFixed(2)}</div>
        </div>

        <div className="rounded border p-2">
          <div className="font-medium">
            {store.code === "football" ? "Kick-outs" : "Puck-outs"}
          </div>
          <div>Total: {restarts.total}</div>
          <div>
            Own retention:{" "}
            {restarts.ownRetentionPct !== null
              ? `${(restarts.ownRetentionPct * 100).toFixed(0)}%`
              : "—"}
          </div>
        </div>
      </div>
    </Card>
  );
});

function StatPill({ label, value, sub }) {
  return (
    <div className="rounded-full border px-3 py-1">
      <span className="font-medium">{label}:</span>{" "}
      <span className="ml-1">{value}</span>
      {sub && <span className="ml-2 text-muted-foreground">{sub}</span>}
    </div>
  );
}
