"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ValueCompare({ outputs, market }) {
  const { total, margin, winProbA, winProbB } = outputs
  const spreadEdge = margin - market.spreadA
  const totalEdge = total - market.total
  const priceEdgeA = winProbA > 0 ? 1 / winProbA - market.priceA : 0
  const priceEdgeB = winProbB > 0 ? 1 / winProbB - market.priceB : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Value compare</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="text-sm">
          Total {totalEdge >= 0 ? "+" : ""}
          {totalEdge.toFixed(1)} pts vs line
        </div>
        <div className="text-sm">
          Spread {spreadEdge >= 0 ? "+" : ""}
          {spreadEdge.toFixed(1)} pts vs line
        </div>
        <div className="text-sm">
          Moneyline edge (A) {priceEdgeA >= 0 ? "+" : ""}
          {priceEdgeA.toFixed(2)}
        </div>
        <div className="text-sm">
          Moneyline edge (B) {priceEdgeB >= 0 ? "+" : ""}
          {priceEdgeB.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">No staking advice.</div>
      </CardContent>
    </Card>
  )
}
