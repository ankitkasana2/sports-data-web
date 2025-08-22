import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Plus, User, MapPin, Calendar } from "lucide-react"

const POSITIONS = {
  hurling: [
    "Goalkeeper",
    "Full-back",
    "Wing-back",
    "Centre-back",
    "Midfielder",
    "Wing-forward",
    "Centre-forward",
    "Full-forward",
  ],
  football: [
    "Goalkeeper",
    "Full-back",
    "Wing-back",
    "Centre-back",
    "Midfielder",
    "Wing-forward",
    "Centre-forward",
    "Full-forward",
  ],
}

const COUNTIES = [
  "Antrim", "Armagh", "Carlow", "Cavan", "Clare", "Cork", "Derry", "Donegal", "Down", "Dublin",
  "Fermanagh", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford",
  "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Tyrone",
  "Waterford", "Westmeath", "Wexford", "Wicklow",
]

export default function AddplayerForm() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    team: "",
    age: "",
    county: "",
    sport: "hurling",
  })

  useEffect(() => {
    const savedPlayers = localStorage.getItem("gaa-players")
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers))
    }

    const savedTeams = localStorage.getItem("gaa-teams")
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams))
    }
  }, [])

  const savePlayer = () => {
    if (!newPlayer.name || !newPlayer.position || !newPlayer.team || !newPlayer.age || !newPlayer.county) {
      alert("Please fill in all fields")
      return
    }

    const player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      position: newPlayer.position,
      team: newPlayer.team,
      age: parseInt(newPlayer.age),
      county: newPlayer.county,
      sport: newPlayer.sport,
      dateAdded: new Date().toISOString().split("T")[0],
    }

    const updatedPlayers = [...players, player]
    setPlayers(updatedPlayers)
    localStorage.setItem("gaa-players", JSON.stringify(updatedPlayers))

    setNewPlayer({
      name: "",
      position: "",
      team: "",
      age: "",
      county: "",
      sport: "hurling",
    })
    setShowAddForm(false)
  }

  const getTeamsByCounty = (county) => {
    return teams.filter((team) => team.county === county && team.sport === newPlayer.sport)
  }

  const filteredTeams = newPlayer.county ? getTeamsByCounty(newPlayer.county) : []

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Add New Player</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Player Name</Label>
            <Input
              id="name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              placeholder="Enter player name"
            />
          </div>
          <div>
            <Label htmlFor="sport">Preferred Position</Label>
            <Select
              value={newPlayer.sport}
              onValueChange={(value) =>
                setNewPlayer({ ...newPlayer, sport: value, position: "", team: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hurling">Hurling</SelectItem>
                <SelectItem value="football">Football</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Select
              value={newPlayer.position}
              onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS[newPlayer.sport].map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="county">County</Label>
            <Select
              value={newPlayer.county}
              onValueChange={(value) => setNewPlayer({ ...newPlayer, county: value, team: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {COUNTIES.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="team">Team</Label>
            <Select
              value={newPlayer.team}
              onValueChange={(value) => setNewPlayer({ ...newPlayer, team: value })}
              disabled={!newPlayer.county}
            >
              <SelectTrigger>
                <SelectValue placeholder={newPlayer.county ? "Select team" : "Select county first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredTeams.map((team) => (
                  <SelectItem key={team.id} value={team.name}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={savePlayer} className="bg-emerald-600 hover:bg-emerald-700">
            Add Player
          </Button>
          <Button variant="outline" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}