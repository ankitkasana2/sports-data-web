import React, { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
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

export default function QuickActionCard() {
    return (

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Schedule New Match
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Add Team/Player
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Import Data
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Reports
                </Button>
            </CardContent>
        </Card>
    )
}
