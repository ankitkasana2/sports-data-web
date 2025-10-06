
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ViewToggle } from "@/components/analytics/view-toggle"
import { RateModeToggle } from "@/components/analytics/rate-mode-toggle"
import { Badge } from "@/components/ui/badge"

export default function TopBar({
  sampleWindow,
  onSampleWindowChange,
  view,
  onViewChange,
  rateMode,
  onRateModeChange,
  opponentAdjusted,
  onOpponentAdjustedChange,
  showDiff,
  onShowDiffChange,
  showDelta,
  onShowDeltaChange,
  showPercentile,
  onShowPercentileChange,
}) {
  const sampleOptions = useMemo(() => ["Season", "Last 5", "Last 10", "Custom"], [])
  return (
    <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="px-3 md:px-4 py-2 flex flex-col gap-2 md:gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <Select value={sampleWindow} onValueChange={onSampleWindowChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sample window" />
            </SelectTrigger>
            <SelectContent>
              {sampleOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <Badge variant="outline">Code: Auto</Badge>
            <Badge variant="outline">Stage: All</Badge>
            <Badge variant="outline">Grade: A</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ViewToggle value={view} onChange={onViewChange} />
          <RateModeToggle value={rateMode} onChange={onRateModeChange} />

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2">
              <Switch checked={opponentAdjusted} onCheckedChange={onOpponentAdjustedChange} id="opp-adj" />
              <label htmlFor="opp-adj" className="text-sm">
                Opponent-adjusted
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showDiff} onCheckedChange={onShowDiffChange} id="diff" />
              <label htmlFor="diff" className="text-sm">
                DIFF
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showDelta} onCheckedChange={onShowDeltaChange} id="delta" />
              <label htmlFor="delta" className="text-sm">
                Δ vs League
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showPercentile} onCheckedChange={onShowPercentileChange} id="pct" />
              <label htmlFor="pct" className="text-sm">
                Percentile
              </label>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
