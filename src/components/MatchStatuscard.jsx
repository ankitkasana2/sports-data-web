import React, { useState,useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "../components/ui/separator"
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

export default function MatchStatusCard() {

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      setTimeout(() => {
        setIsLoading(false)
      }, 2000);
    }, [])
    

    return (
        <Card className='max-h-[420px] h-auto'>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Next Matches
                </CardTitle>
                <CardDescription>Upcoming fixtures and in-progress games</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading?(
                    <>
                  {/* Skeleton for upcoming match */}
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>

                  {/* Skeleton for in-progress match */}
                  <div className="border rounded-lg p-4 space-y-2 bg-accent/10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-2 w-full mt-2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </>
                )
                
               : (<>
                {/* Upcoming Match */}
                    <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold">Kilmacow vs Ballyhale</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    Nowlan Park
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    Today, 3:00 PM
                                </div>
                            </div>
                            <Button size="sm">
                                <Play className="h-3 w-3 mr-1" />
                                Start
                            </Button>
                        </div>
                    </div>

                    {/* In Progress Match */}
                    <div className="border rounded-lg p-4 space-y-2 bg-accent/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold">Oulart vs Rathnure</h4>
                                <div className="text-sm text-muted-foreground">Last saved: 2 hours ago • 67% complete</div>
                                <Progress value={67} className="w-full mt-2" />
                            </div>
                            <Button size="sm" variant="secondary">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Resume
                            </Button>
                        </div>
                    </div>
                </>)}
            </CardContent>
        </Card>
    )
}
