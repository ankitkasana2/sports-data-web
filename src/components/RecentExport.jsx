import React, { useState, useEffect} from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
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

export default function RecentExportCard() {

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
                    <Download className="h-5 w-5" />
                    Recent Exports
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (

                    <div className="space-y-3 flex flex-col gap-2">
                        <div className="flex  justify-between">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-52 " />
                                <Skeleton className="h-3 w-44 " />
                            </div>
                            <div className="flex gap-3 items-center">
                                <Skeleton className="h-7 w-10 " />
                                <Skeleton className="h-7 w-10 " />
                            </div>
                        </div>
                        <div className="flex  justify-between">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-52 " />
                                <Skeleton className="h-3 w-44 " />
                            </div>
                            <div className="flex gap-3 items-center">
                                <Skeleton className="h-7 w-10 " />
                                <Skeleton className="h-7 w-10 " />
                            </div>
                        </div>
                    </div>

                ) :
                    (<div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Wexford SHC 2025 - Full Stats</p>
                                <p className="text-xs text-muted-foreground">Excel • 2.4 MB</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                    <Download className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Referee Analysis Report</p>
                                <p className="text-xs text-muted-foreground">PDF • 1.8 MB</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                    <Download className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>)}
            </CardContent>
        </Card>
    )
}
