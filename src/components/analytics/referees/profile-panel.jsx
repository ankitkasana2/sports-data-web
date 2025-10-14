"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ProfilePanel({ refData, onOpenChange, league }) {
  const open = !!refData
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] sm:w-[680px] bg-card text-foreground">
        <SheetHeader>
          <SheetTitle>{refData?.ref_name || "Referee"}</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Detailed sub-tables; inherits current filters. Export per-panel CSV in production.
          </SheetDescription>
        </SheetHeader>

        {!refData ? null : (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">GP</div>
              <div>{refData.gp}</div>
              <div className="text-muted-foreground">Whistles/100</div>
              <div>{refData.whistlesPer100.toFixed(2)}</div>
              <div className="text-muted-foreground">Frees/100</div>
              <div>{refData.freesPer100.toFixed(2)}</div>
              <div className="text-muted-foreground">Poss/60</div>
              <div>{refData.possPer60.toFixed(1)}</div>
            </div>

            <Tabs defaultValue="games" className="mt-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="setpieces">Set-pieces</TabsTrigger>
                <TabsTrigger value="advantage">Advantage</TabsTrigger>
              </TabsList>

              <TabsContent value="games" className="mt-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Games list (demo)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>
                        Team A vs Team B — Frees/100: {refData.freesPer100.toFixed(1)} — Poss/match:{" "}
                        {(refData.possPer60 * 1.0).toFixed(1)}
                      </li>
                      <li>Team C vs Team D — Added time/half: 90s — Cards/100: {refData.cardsY.toFixed(2)}</li>
                      <li>Team E vs Team F — Ball-in-play %: 51 — Stoppages/60: 34</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="setpieces" className="mt-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Set-piece bands (demo)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Avg distance (m)</div>
                      <div>
                        {refData.freeDistance.toFixed(1)} (Δ vs league{" "}
                        {(refData.freeDistance - league.freeDistance).toFixed(1)})
                      </div>
                      <div className="text-muted-foreground">Penalties att/game</div>
                      <div>{refData.penaltiesAtt.toFixed(2)}</div>
                      <div className="text-muted-foreground">Penalties conv %</div>
                      <div>{refData.penaltiesConvPct.toFixed(1)}%</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advantage" className="mt-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Advantage (demo)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Applied %</div>
                      <div>{refData.advantageAppliedPct.toFixed(1)}%</div>
                      <div className="text-muted-foreground">Quality Δ (pp100)</div>
                      <div>{refData.advantageQualityDelta.toFixed(2)}</div>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      PPP_adv vs PPP_free driver shown in main table as Δ pp100 → pts after possessions conversion.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
