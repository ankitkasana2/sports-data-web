"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(1) : "-"
}
function decOdds(p) {
  return p > 0 ? (1 / p).toFixed(2) : "-"
}

export default function Scorecard({ A, B, possessions, outputs, market, onMarket }) {
  const { ptsA, ptsB, total, margin, winProbA, winProbB, fairPriceA, fairPriceB, fairHandicapA } = outputs

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scorecard</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Possessions</div>
            <div className="text-xl font-semibold">{fmt(possessions.total)}</div>
            <div className="text-xs text-muted-foreground">
              +{fmt(possessions.refPace)} ref pace, +{fmt(possessions.addedTime)} added, {fmt(possessions.latency)}{" "}
              latency
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{A.name} points</div>
            <div className="text-xl font-semibold">{fmt(ptsA)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{B.name} points</div>
            <div className="text-xl font-semibold">{fmt(ptsB)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total / Margin</div>
            <div className="text-xl font-semibold">
              {fmt(total)} / {fmt(margin)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Win prob ({A.name})</div>
            <div className="text-xl font-semibold">{(winProbA * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Win prob ({B.name})</div>
            <div className="text-xl font-semibold">{(winProbB * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Fair price ({A.name})</div>
            <div className="text-xl font-semibold">{decOdds(winProbA)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Fair handicap ({A.name})</div>
            <div className="text-xl font-semibold">{fmt(fairHandicapA)}</div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Value compare (optional)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="grid gap-1">
              <Label>Book Spread ({A.name})</Label>
              <Input
                type="number"
                value={market.spreadA}
                onChange={(e) => onMarket({ ...market, spreadA: Number(e.target.value || 0) })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Book Total</Label>
              <Input
                type="number"
                value={market.total}
                onChange={(e) => onMarket({ ...market, total: Number(e.target.value || 0) })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Price {A.name} (dec)</Label>
              <Input
                type="number"
                step="0.01"
                value={market.priceA}
                onChange={(e) => onMarket({ ...market, priceA: Number(e.target.value || 0) })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Price {B.name} (dec)</Label>
              <Input
                type="number"
                step="0.01"
                value={market.priceB}
                onChange={(e) => onMarket({ ...market, priceB: Number(e.target.value || 0) })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
