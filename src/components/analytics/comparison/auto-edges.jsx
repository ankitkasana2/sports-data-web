"use client"

import { Badge } from "@/components/ui/badge"

export default function AutoEdges({ edges }) {
  if (!edges?.length) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Auto-Edges:</span>
      {edges.map((e, i) => (
        <a key={i} href={`#metric-${encodeURIComponent(e.metricKey)}`} className="no-underline">
          <Badge variant="default">
            {e.metricLabel}: {e.leading?.name} {e.symbol} {Math.abs(e.delta).toFixed(2)}
          </Badge>
        </a>
      ))}
    </div>
  )
}
