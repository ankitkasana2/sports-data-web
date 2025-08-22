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

export default function EdgeDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Edge Dashboard
                </CardTitle>
                <CardDescription>Your competitive insights at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Elo Movements (30d)</span>
                        <Badge variant="secondary">+3 teams</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Ballyhale +127 pts, biggest mover</p>
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Venue Scoring</span>
                        <Badge variant="outline">Nowlan +4.2</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Above competition average</p>
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Ref Profile</span>
                        <Badge variant="destructive">Murphy +28%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Cards above average, +4.2 pts/game</p>
                </div>
            </CardContent>
        </Card>
    )
}
