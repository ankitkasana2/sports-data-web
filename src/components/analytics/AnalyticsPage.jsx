
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, MapPin, Users, Trophy, Target } from "lucide-react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { toJS } from "mobx"
import { useState } from "react"


const eloMovers = [
  { team: "Team Alpha", change: +125, current: 1850, trend: "up" },
  { team: "Team Beta", change: -89, current: 1642, trend: "down" },
  { team: "Team Gamma", change: +67, current: 1723, trend: "up" },
  { team: "Team Delta", change: -45, current: 1598, trend: "down" },
  { team: "Team Epsilon", change: +156, current: 1901, trend: "up" },
]

const AnalyticsPage = () => {

  const { matchesStore, homeFilterbarStore, teamsStore, refereesStore, analyticsStore, venuesStore } = useStores()

  const [showAll, setShowAll] = useState(false);

  // Show only first 5 referees unless "showAll" is true
  const displayedReferees = showAll
    ? refereesStore.allRefrees
    : refereesStore.allRefrees.slice(0, 5);



  const calculateVSI = (venueId) => {
    const possessionData = toJS(analyticsStore.possession);

    if (!possessionData || possessionData.length === 0) return 0;

    // Filter matches for this venue
    const venueMatches = possessionData.filter(
      (m) => m.venue_id === venueId
    );

    if (venueMatches.length === 0) return 0;

    // Step 1: Compute pp100 for each match at this venue
    const matchesWithPP100 = venueMatches.map((m) => {
      const points = Number(m.total_point);
      const possessions = Number(m.total_possessions);
      return {
        ...m,
        pp100: (points / possessions) * 100
      };
    });

    // Step 2: Compute league-wide pp100 (all matches, weighted by possessions)
    const totalLeaguePossessions = possessionData.reduce(
      (sum, m) => sum + Number(m.total_possessions),
      0
    );
    const leaguePP100 =
      possessionData.reduce(
        (sum, m) => sum + ((Number(m.total_point) / Number(m.total_possessions)) * 100) * Number(m.total_possessions),
        0
      ) / totalLeaguePossessions;

    // Step 3: Compute venue pp100 (weighted by possessions)
    const totalVenuePossessions = matchesWithPP100.reduce(
      (sum, m) => sum + Number(m.total_possessions),
      0
    );
    const pp100Venue =
      matchesWithPP100.reduce((sum, m) => sum + m.pp100 * Number(m.total_possessions), 0) /
      totalVenuePossessions;

    // Step 4: Compute VSI
    const vsi = pp100Venue - leaguePP100;

    // Optional: return rounded value
    return Math.round(vsi);
  };




  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Venue Scoring Index */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Venue Scoring Index
                </CardTitle>
                <CardDescription>Performance metrics across different venues</CardDescription>
              </div>
              <Button variant="secondary" size="sm">
                View Details
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venuesStore.allVenues.map((venue) => (
                  <div key={venue.venue_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{venue.venue_name}</span>
                        <span className="text-sm font-semibold">{calculateVSI(venue.venue_id)}{'%'}</span>
                      </div>
                      <Progress value={venue.index} className="h-2" />
                    </div>
                    <Badge variant="outline" className="ml-3">
                      {venue.matches} 
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Referee Profiles */}
          <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${showAll ? "h-auto" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referee Profiles
                </CardTitle>
                <CardDescription>Top performing referees and their stats</CardDescription>
              </div>
              {!showAll && (
                <Button variant="secondary" size="sm" onClick={() => setShowAll(true)}>
                  See All
                </Button>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {displayedReferees.map((referee) => (
                  <div
                    key={referee.referee_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border">
                        <span className="text-sm font-semibold">
                          {referee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{referee.name}</p>
                        <p className="text-sm text-muted-foreground">{referee.experience}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{referee.match_count} matches</p>
                      <p className="text-sm text-muted-foreground">{referee.experience_years} years</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Elo Movers */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Elo Movers
                </CardTitle>
                <CardDescription>Teams with significant rating changes</CardDescription>
              </div>
              <Button variant="secondary" size="sm">
                Full Rankings
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eloMovers.map((team, index) => (
                  <div key={team.team} className="flex items-center justify-between p-3 rounded-lg bg-muted border">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-muted border">
                        {team.trend === "up" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{team.team}</p>
                        <p className="text-sm text-muted-foreground">Current: {team.current}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {team.change > 0 ? "+" : ""}
                      {team.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">156</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">24</div>
              <div className="text-sm text-muted-foreground">Active Teams</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground">Venues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">8</div>
              <div className="text-sm text-muted-foreground">Referees</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



export default observer(AnalyticsPage)
