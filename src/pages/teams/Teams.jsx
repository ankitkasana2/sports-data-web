import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Users } from "lucide-react"
import data from "../../../data"

const counties = [
    "Antrim", "Armagh", "Carlow", "Cavan", "Clare", "Cork", "Derry", "Donegal", "Down", "Dublin",
    "Fermanagh", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford",
    "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Tyrone",
    "Waterford", "Westmeath", "Wexford", "Wicklow",
]

export default function Teams() {
    const [teams, setTeams] = useState([])
    const [newTeam, setNewTeam] = useState({
        name: "",
        county: "",
        sport: "hurling",
    })

    // Load teams from localStorage
    useEffect(() => {
        const savedTeams = localStorage.getItem("gaa-teams")
        if (savedTeams) {
            setTeams(JSON.parse(savedTeams))
        }
    }, [])

    // Save teams to localStorage
    useEffect(() => {
        localStorage.setItem("gaa-teams", JSON.stringify(teams))
    }, [teams])

    const addTeam = () => {
        if (!newTeam.name || !newTeam.county) return

        const team = {
            id: Date.now().toString(),
            name: newTeam.name,
            county: newTeam.county,
            sport: newTeam.sport,
            players: [],
        }

        setTeams([...teams, team])
        setNewTeam({ name: "", county: "", sport: "hurling" })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Team Management</h1>
                <p className="text-slate-600">Register and manage your hurling and football teams</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Add New Team */}
                <Card className='h-[60vh]'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlusCircle className="w-5 h-5" />
                            Add New Team
                        </CardTitle>
                        <CardDescription>Register a new hurling or football team</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input
                                id="team-name"
                                placeholder="e.g., Kilkenny Senior Hurling"
                                value={newTeam.name}
                                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sport">Sport</Label>
                            <Select
                                onValueChange={(value) => setNewTeam({ ...newTeam, sport: value })}
                            >
                                <SelectTrigger className='w-[50%]'>
                                    <SelectValue placeholder="Select a game code" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hurling">Hurling</SelectItem>
                                    <SelectItem value="football">Football</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={addTeam} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            Add Team
                        </Button>
                    </CardContent>
                </Card>

                {/* Teams List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Registered Teams ({data.team.length})
                        </CardTitle>
                        <CardDescription>Manage your hurling and football teams</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {data.team.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No teams registered yet</p>
                            ) : (
                                data.team.map((team) => (
                                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <h4 className="font-semibold">{team.TeamID}</h4>
                                            <p className="text-sm text-muted-foreground">{team.TeamName}</p>
                                        </div>
                                        <Badge variant={team.sport === "hurling" ? "default" : "secondary"}>
                                            {team.Code}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}