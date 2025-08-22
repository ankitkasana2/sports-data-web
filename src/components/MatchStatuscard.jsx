import React, { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
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
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Next Matches
                </CardTitle>
                <CardDescription>Upcoming fixtures and in-progress games</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
        </Card>
    )
}
