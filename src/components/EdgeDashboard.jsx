import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    CalendarDays,
    Clock,
    MapPin,
    User,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Play,
    RotateCcw,
    FileText,
    Download,
    Eye,
} from "lucide-react"

export default function EdgeDashboard() {
    const [isLoadingEdge, setIsLoadingEdge] = useState(true)

     useEffect(() => {
          setTimeout(() => {
            setIsLoadingEdge(false)
          }, 2000);
        }, [])

    return (
        <Card className='max-h-[420px]'>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Edge Dashboard
                </CardTitle>
                <CardDescription>Snapshot insights based on current filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoadingEdge ? (
                    <>
                        <div className="space-y-3">
                            <div className="border rounded-lg p-4 cursor-pointer hover:bg-accent/5">
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="border rounded-lg p-4 cursor-pointer hover:bg-accent/5">
                                <Skeleton className="h-5 w-28 mb-2" />
                                <Skeleton className="h-4 w-44" />
                            </div>
                            <div className="border rounded-lg p-4 cursor-pointer hover:bg-accent/5">
                                <Skeleton className="h-5 w-30 mb-2" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-3">
                            {/* Venue Scoring Index */}
                            <div
                                className="border rounded-lg p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                                onClick={() => console.log("[v0] Navigate to Analytics -> Venue view")}
                            >
                                <div className="font-medium text-sm mb-1">Venue Scoring Index</div>
                                <div className="text-sm text-muted-foreground">
                                    Nowlan Park games average +2.5 points vs competition average
                                </div>
                            </div>

                            {/* Referee Profile */}
                            <div
                                className="border rounded-lg p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                                onClick={() => console.log("[v0] Navigate to Analytics -> Referee view")}
                            >
                                <div className="font-medium text-sm mb-1">Referee Profile</div>
                                <div className="text-sm text-muted-foreground">
                                    Ref Murphy games average +4 frees per 100 plays vs mean
                                </div>
                            </div>

                            {/* Half-Split Bias */}
                            <div
                                className="border rounded-lg p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                                onClick={() => console.log("[v0] Navigate to Analytics -> Half-Split view")}
                            >
                                <div className="font-medium text-sm mb-1">Half-Split Bias</div>
                                <div className="text-sm text-muted-foreground">65% of games had more points in 2H than 1H</div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
