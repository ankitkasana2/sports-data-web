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

export default function DataHealthCard() {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Data Health & Backlog
                </CardTitle>
                <CardDescription>Monitor data quality and completion status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Coverage</span>
                        </div>
                        <div className="text-2xl font-bold">87%</div>
                        <p className="text-sm text-muted-foreground">23/26 matches tagged</p>
                        <Progress value={87} className="w-full" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">Missing Data</span>
                        </div>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-sm text-muted-foreground">Matches need lineups</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Quality Checks</span>
                        </div>
                        <div className="text-2xl font-bold">94%</div>
                        <p className="text-sm text-muted-foreground">Validation passed</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Backlog</span>
                        </div>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-sm text-muted-foreground">Items need attention</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
