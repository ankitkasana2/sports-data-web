"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SensitivityPanel({ sensitivity }) {
  const { dTotalPerPoss, dPtsPerTwoPt5pct, dPtsPerFree2135pp5 } = sensitivity
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sensitivity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-3">
        <div>
          <div className="text-sm text-muted-foreground">±1 possession → total ±X pts</div>
          <div className="text-xl font-semibold">{dTotalPerPoss.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">±5% 2-pt attempts → ±Y pts (A,B)</div>
          <div className="text-xl font-semibold">
            {dPtsPerTwoPt5pct.a.toFixed(2)} / {dPtsPerTwoPt5pct.b.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">±5 pp free conv (21–35 m) → ±Z pts (A,B)</div>
          <div className="text-xl font-semibold">
            {dPtsPerFree2135pp5.a.toFixed(2)} / {dPtsPerFree2135pp5.b.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
