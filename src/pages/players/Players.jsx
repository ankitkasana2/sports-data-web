import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Plus, User, MapPin, Calendar } from "lucide-react"
import AddplayerForm from "../../components/AddplayerForm"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


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

export default function Players() {
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Players</h1>
          <p className="text-slate-600 mt-2">Manage GAA players and their information</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      {showAddForm && (
        <AddplayerForm/>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No players registered</h3>
            <p className="text-slate-500">Add your first player to get started</p>
          </div>
        ) : (
          players.map((player) => (
            <Card key={player.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <Badge variant={player.sport === "hurling" ? "default" : "secondary"}>{player.sport}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-slate-600">
                  <User className="w-4 h-4 mr-2" />
                  {player.position}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {player.team}, {player.county}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Age {player.age}
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t">
                  Added: {new Date(player.dateAdded).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}