import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ViewToggle } from "@/components/analytics/view-toggle"
import { RateModeToggle } from "@/components/analytics/rate-mode-toggle"
import { Badge } from "@/components/ui/badge"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { toJS } from "mobx"
import { useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TopBar = ({

  opponentAdjusted,
  onOpponentAdjustedChange,
  showDiff,
  onShowDiffChange,
  showDelta,
  onShowDeltaChange,
  showPercentile,
  onShowPercentileChange,
}) => {
  const { analyticsStore } = useStores()

  useEffect(() => {
    console.log("View changed to:", toJS(analyticsStore.filter))
  }, [toJS(analyticsStore.filter)])







  return (
    <div className="sticky top-30 z-30 border-b bg-background/80 backdrop-blur">
      <div className="px-3 md:px-4 py-2 flex flex-col gap-2 md:gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <ViewToggle value={analyticsStore.filter.view} onChange={(v) => analyticsStore.setFilterField('view', v)} />
          <RateModeToggle value={analyticsStore.filter.rateMode} onChange={(v) => analyticsStore.setFilterField('rateMode', v)} />

          <div className="flex items-center gap-2 ml-auto">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  <Switch checked={opponentAdjusted} onCheckedChange={onOpponentAdjustedChange} id="opp-adj" />
                  <label htmlFor="opp-adj" className="text-sm">
                    Opponent-adjusted
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adj by Elo (efficiency only)</p>
              </TooltipContent>
            </Tooltip>
            {analyticsStore.filter.view == 'Paired' && <div className="flex items-center gap-2">
              <Switch checked={analyticsStore.filter.showDiff} onCheckedChange={() => analyticsStore.setFilterField('showDiff', !analyticsStore.filter.showDiff)} id="diff" />
              <label htmlFor="diff" className="text-sm">
                DIFF
              </label>
            </div>}
            <div className="flex items-center gap-2">
              <Switch checked={analyticsStore.filter.showDelta} onCheckedChange={() => analyticsStore.setFilterField('showDelta', !analyticsStore.filter.showDelta)} id="delta" />
              <label htmlFor="delta" className="text-sm">
                Δ vs League
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={analyticsStore.filter.percentile} onCheckedChange={() => analyticsStore.setFilterField('percentile', !analyticsStore.filter.percentile)} id="pct" />
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


export default observer(TopBar)
