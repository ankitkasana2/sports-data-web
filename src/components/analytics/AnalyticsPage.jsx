
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, MapPin, Users, Trophy, Target } from "lucide-react"

// Mock data for the dashboard
const venueData = [
  { venue: "Stadium A", index: 85, matches: 12 },
  { venue: "Arena B", index: 78, matches: 8 },
  { venue: "Field C", index: 92, matches: 15 },
  { venue: "Court D", index: 67, matches: 6 },
  { venue: "Ground E", index: 88, matches: 10 },
]

const teamFormData = [
  { week: "W1", performance: 65 },
  { week: "W2", performance: 72 },
  { week: "W3", performance: 68 },
  { week: "W4", performance: 85 },
  { week: "W5", performance: 78 },
  { week: "W6", performance: 92 },
]

const refereeProfiles = [
  { name: "John Smith", matches: 45, accuracy: 94, experience: "8 years" },
  { name: "Sarah Johnson", matches: 38, accuracy: 96, experience: "6 years" },
  { name: "Mike Davis", matches: 52, accuracy: 91, experience: "12 years" },
  { name: "Lisa Chen", matches: 41, accuracy: 95, experience: "7 years" },
]

const eloMovers = [
  { team: "Team Alpha", change: +125, current: 1850, trend: "up" },
  { team: "Team Beta", change: -89, current: 1642, trend: "down" },
  { team: "Team Gamma", change: +67, current: 1723, trend: "up" },
  { team: "Team Delta", change: -45, current: 1598, trend: "down" },
  { team: "Team Epsilon", change: +156, current: 1901, trend: "up" },
]

export default function AnalyticsPage() {
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
                {venueData.map((venue, index) => (
                  <div key={venue.venue} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{venue.venue}</span>
                        <span className="text-sm font-semibold">{venue.index}/100</span>
                      </div>
                      <Progress value={venue.index} className="h-2" />
                    </div>
                    <Badge variant="outline" className="ml-3">
                      {venue.matches} matches
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Form */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Team Form
                </CardTitle>
                <CardDescription>Performance trends over recent weeks</CardDescription>
              </div>
              <Button variant="secondary" size="sm">
                View Details
              </Button>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  performance: {
                    label: "Performance",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamFormData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="performance"
                      stroke="var(--color-chart-1)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Referee Profiles */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referee Profiles
                </CardTitle>
                <CardDescription>Top performing referees and their stats</CardDescription>
              </div>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {refereeProfiles.map((referee, index) => (
                  <div key={referee.name} className="flex items-center justify-between p-3 rounded-lg bg-muted border">
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
                      <p className="text-sm font-medium">{referee.accuracy}% accuracy</p>
                      <p className="text-sm text-muted-foreground">{referee.matches} matches</p>
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
