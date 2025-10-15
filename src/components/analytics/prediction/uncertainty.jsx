"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function Line({ label, v }) {
  if (!v) return null
  const { median, p25, p75, p5, p95 } = v
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">
        median {fmt(median)} | 50% {fmt(p25)}–{fmt(p75)} | 90% {fmt(p5)}–{fmt(p95)}
      </span>
    </div>
  )
}

export default function UncertaintyPanel({ mc }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uncertainty bands</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {!mc ? (
          <div className="text-sm text-muted-foreground">Monte Carlo disabled.</div>
        ) : (
          <>
            <Line label="Team A points" v={mc.pointsA} />
            <Line label="Team B points" v={mc.pointsB} />
            <Line label="Total" v={mc.total} />
            <Line label="Margin" v={mc.margin} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(1) : "-"
}
