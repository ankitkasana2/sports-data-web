import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"

function TeamDetails() {
    const { teamId } = useParams()
    const navigate = useNavigate()
    const { playersStore } = useStores()

    useEffect(() => {
        if (teamId) {
            playersStore.getPlayerByTeam(teamId)
        }
    }, [teamId, playersStore])

    const players = playersStore.players || []

    return (
        <main className="min-h-[100vh] px-4 py-6 md:px-8 bg-background">
            <header className="mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Teams
                </Button>
                <h1 className="text-2xl font-semibold text-slate-700">Team Players</h1>
                <p className="text-sm text-slate-700/80">List of players within this team.</p>
            </header>

            <section className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-orange-50/50 text-slate-700">
                            <TableHead>Name</TableHead>
                            <TableHead>Preferred Position</TableHead>
                            <TableHead>Dominant Side</TableHead>
                            <TableHead>Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No players found for this team.
                                </TableCell>
                            </TableRow>
                        ) : (
                            players.map((player) => (
                                <TableRow key={player.player_id}>
                                    <TableCell className="font-medium">{player.display_name}</TableCell>
                                    <TableCell>{player.preferred_position || "-"}</TableCell>
                                    <TableCell>{player.dominant_side || "-"}</TableCell>
                                    <TableCell>
                                        {player.active_flag === 'active' ? (
                                            <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                                                No
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </section>
        </main>
    )
}

export default observer(TeamDetails)
