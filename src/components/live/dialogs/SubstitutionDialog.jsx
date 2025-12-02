import { useState, useEffect, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';

export const SubstitutionDialog = observer(function SubstitutionDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentSubstitution.open

  const [team, setTeam] = useState("Team_A")
  const [playerOut, setPlayerOut] = useState("")
  const [playerIn, setPlayerIn] = useState("")

  const defaultTeam = {
    players: [
      { id: "1", name: "Lionel Messi", jersey: "10" },
      { id: "2", name: "Cristiano Ronaldo", jersey: "7" },
      { id: "3", name: "Neymar Jr.", jersey: "11" },
      { id: "4", name: "Kylian Mbappé", jersey: "7" },
      { id: "5", name: "Kevin De Bruyne", jersey: "17" },
      { id: "6", name: "Mohamed Salah", jersey: "11" },
      { id: "7", name: "Virgil van Dijk", jersey: "4" },
      { id: "8", name: "Robert Lewandowski", jersey: "9" },
      { id: "9", name: "Sadio Mané", jersey: "10" },
      { id: "10", name: "Luka Modrić", jersey: "10" }
    ],
    onPitch: ["1", "2", "3", "4", "5", "6", "7"]
  }

  const currentTeam = useMemo(() => {
    return team === "Team_A" ? (store.teamA || defaultTeam) : (store.teamB || defaultTeam)
  }, [team, store.teamA, store.teamB])

  const onPitchPlayers = useMemo(() => currentTeam.players.filter(p => currentTeam.onPitch.includes(p.id)), [currentTeam])
  const benchPlayers = useMemo(() => currentTeam.players.filter(p => !currentTeam.onPitch.includes(p.id)), [currentTeam])

  // Update selected players when team changes
  useEffect(() => {
    setPlayerOut(onPitchPlayers.length ? onPitchPlayers[0].id : "")
    setPlayerIn(benchPlayers.length ? benchPlayers[0].id : "")
  }, [team, onPitchPlayers, benchPlayers])

  const onSave = () => { try{
    if (!team) return toast(<div className="flex gap-2 items-center"><CircleAlert className="text-red-500 h-4 w-4" /><span>Please select a team.</span></div>)
    if (!playerOut) return toast(<div className="flex gap-2 items-center"><CircleAlert className="text-red-500 h-4 w-4" /><span>Please select player OUT.</span></div>)
    if (!playerIn) return toast(<div className="flex gap-2 items-center"><CircleAlert className="text-red-500 h-4 w-4" /><span>Please select player IN.</span></div>)

    store.addEvent({
      event_type: 'substitution',
      awarded_team_id: team,
      player_out_id: playerOut,
      player_in_id: playerIn,
    })
    toast.success("Data saved successfully!")
    store.closeDialogs()
  }catch (error) {
    toast.error("Failed to save event")
    console.error(error)
  }

  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Substitution</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Team</label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Team_A">Team A</SelectItem>
                <SelectItem value="Team_B">Team B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Player OUT (On Pitch)</label>
            <Select value={playerOut} onValueChange={setPlayerOut}>
              <SelectTrigger><SelectValue placeholder="Select player OUT" /></SelectTrigger>
              <SelectContent>
                {onPitchPlayers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.jersey} — {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Player IN (Bench)</label>
            <Select value={playerIn} onValueChange={setPlayerIn}>
              <SelectTrigger><SelectValue placeholder="Select player IN" /></SelectTrigger>
              <SelectContent>
                {benchPlayers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.jersey} — {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => store.closeDialogs()} variant="outline">Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
