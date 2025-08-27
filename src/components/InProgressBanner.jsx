import React from "react"
import { Card, CardContent } from "..//components/ui/card"
import { Button } from "../components/ui/button"
import { Play, Clock, RotateCcw } from "lucide-react"
import { observer } from "mobx-react-lite"
import { useStores } from "../stores/StoresProvider"
import data from "../../data"
import { Progress } from "../components/ui/progress"

function InProgressBanner() {

  const match = data.matchData[0]


  return (
    <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-900 dark:text-orange-100">
                Match in Progress
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {match.team_a_id} vs {match.team_b_id} • {match.venue_name}
            </div>
          </div>

          <div className="flex items-center gap-7">
            <div className="flex items-center gap-1 flex-col">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last saved 2 hours ago</span>
                <span>• 67% complete</span>
              </div>
              <Progress value={67} className="w-full mt-2" />
            </div>
            <Button size="sm">
              <RotateCcw className="h-3 w-3 mr-1" />
              Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default observer(InProgressBanner) 