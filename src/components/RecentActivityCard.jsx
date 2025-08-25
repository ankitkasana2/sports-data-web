import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
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

export default function RecentActivityCard({}) {

    const [isLoading, setIsLoading] = useState(true)

     useEffect(() => {
          setTimeout(() => {
            setIsLoading(false)
          }, 2000);
        }, [])

    return (
        <Card className="h-auto max-h-[300px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-52" />
                            </div>
                            <Skeleton className="h-3 w-10 "/>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-52" />
                            </div>
                            <Skeleton className="h-3 w-10 "/>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-52" />
                            </div>
                            <Skeleton className="h-3 w-10 "/>
                        </div>
                    </div>
                ) :
                    (<div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Completed match: Kilmacow vs Ballyhale</span>
                            <span className="text-muted-foreground ml-auto">2h ago</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Updated team roster: Oulart-The Ballagh</span>
                            <span className="text-muted-foreground ml-auto">4h ago</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>Exported analytics report</span>
                            <span className="text-muted-foreground ml-auto">1d ago</span>
                        </div>
                    </div>)}
            </CardContent>
        </Card>
    )
}
