import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CalendarDays,
  Clock,
  MapPin,
  Play,
  RotateCcw,
} from "lucide-react"
import { observer } from "mobx-react-lite"
import { useStores } from "../stores/StoresProvider"
import { toJS } from "mobx"

function MatchStatusCard() {

  const { homeFilterbarStore } = useStores()
  const { filters, years, competitions, grades, groups, matches } = homeFilterbarStore

  const [isLoading, setIsLoading] = useState(true)
  const [matchesData, setMatchesData] = useState([])
  const date = new Date()
  const formattedToday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

  useEffect(() => {
    fetchMatches()
  }, [filters.season, filters.competition, matches])


  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000);

    fetchMatches()
  }, [])

  // fetch matches 
  const fetchMatches = () => {
    let today = new Date()
    today.setHours(0, 0, 0, 0)

    let nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    setIsLoading(true)

    let filteredMatches = matches.filter((match) => {
      const matchDate = new Date(match.match_date)
      matchDate.setHours(0, 0, 0, 0)

      // ✅ check if match is within the next 7 days
      const isWithin7Days = matchDate >= today && matchDate <= nextWeek

      // ✅ check if competition matches (or no filter applied)
      const isCompetitionMatch =
        !filters.competition || match.competition_name === filters.competition

      return isWithin7Days && isCompetitionMatch
    })

    setMatchesData(filteredMatches)

    setTimeout(() => setIsLoading(false), 1000)
  }

  useEffect(() => {
    console.log(matchesData)
  }, [matchesData])




  return (
    <Card className='max-h-[420px] min-h-[370px] h-auto flex flex-col'>
      <CardHeader >
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Next Matches
        </CardTitle>
        <CardDescription>Upcoming fixtures</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
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
            {matchesData.length != 0 ? (matchesData.map((match, index) => {
              return <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{match.team_a_id} vs {match.team_b_id}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {match.venue_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {match.date == formattedToday ? "Today" : match.date}, {match.time}
                    </div>
                  </div>
                  <Button size="sm">
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            })) : <div className="text-sm flex items-center justify-center h-[250px] text-muted-foreground">No matches available</div>}
          </>)}
      </CardContent>
    </Card>
  )
}

export default observer(MatchStatusCard)
