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

export default function RecentExportCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Recent Exports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
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
                </div>
            </CardContent>
        </Card>
    )
}
