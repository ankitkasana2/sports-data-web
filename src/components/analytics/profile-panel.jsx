"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import Sparkline from "../analytics/charts/Sparkline"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

export default function ProfilePanel({ team, open, onOpenChange }) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[96vw] sm:w-[640px]">
                <SheetHeader>
                    <SheetTitle>{team?.team || "Team"}</SheetTitle>
                </SheetHeader>

                <Tabs defaultValue="shots" className="mt-4">
                    <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="shots">Shots</TabsTrigger>
                        <TabsTrigger value="restarts">Restarts</TabsTrigger>
                        <TabsTrigger value="transition">Transition</TabsTrigger>
                    </TabsList>

                    <TabsContent value="shots" className="space-y-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Type × Distance × Angle</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Matrix breakdown placeholder. Use filters to drill into specific bands.
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Shot Quality Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Sparkline dataKey="sq" />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="restarts" className="space-y-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Retention % (Short / Medium / Long)</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-3">
                                <MiniStat label="Own Short%" value={pct(team?.ko_short_own)} />
                                <MiniStat label="Opp Short%" value={pct(team?.ko_short_opp)} />
                                <MiniStat label="Shots ≤15s/game" value={team?.shots_15_pm?.toFixed(1) || "—"} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transition" className="space-y-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>TO → first shot timing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TrendTable />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-medium">{value ?? "—"}</div>
        </div>
    )
}

function TrendTable() {
    const rows = [
        { bucket: "≤5s", rate: 0.28, contrib: 0.12 },
        { bucket: "6–10s", rate: 0.22, contrib: 0.09 },
        { bucket: "11–15s", rate: 0.18, contrib: 0.07 },
    ]
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Window</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>PP100 contrib</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((r) => (
                    <TableRow key={r.bucket}>
                        <TableCell>{r.bucket}</TableCell>
                        <TableCell>{(r.rate * 100).toFixed(1)}%</TableCell>
                        <TableCell>{(r.contrib * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function pct(x) {
    if (typeof x !== "number") return "—"
    return (x * 100).toFixed(1) + "%"
}
