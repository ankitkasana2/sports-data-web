import { useState , useEffect} from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea"
import { secondsToHHMMSS } from "../LiveUtils"
export const CardDialog = observer(function CardDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentCard.open

  const [cardType, setCardType] = useState("")
  const [team, setTeam] = useState(" ")
  const [player, setPlayer] = useState("")
  const [message, setMessage] = useState('')


  useEffect(() => {
      if (open) {
        setTeam("");
   
      }
    }, [open]);
  
    const teamsReady =
      !!store.team_a_name && !!store.team_b_name;

  const onSave = () => {
    try {
      if (team == '') {
        toast(<div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select a team.</span>
        </div>)
        return
      } else if (player == '') {
        toast(<div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select player.</span>
        </div>)
        return
      } else if (cardType == '') {
        toast(<div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select card.</span>
        </div>)
        return
      }

      // store event 
      store.addEvent({
        event_type: 'card',
        card_player_id: player,
        card_type: cardType,
        card_reason: message,
        team_id: team,
      })

      setTeam('')
      setPlayer('')
      setCardType('')
      setMessage('')
      toast.success("Data saved successfully!")
      store.closeDialogs()
    } catch (error) {
      toast.error("Failed to save event")
      console.error(error)

    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
             <DialogTitle className="flex gap-3 items-center">
                      <span>Card</span>
                      <span className="flex gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
                        <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
                      </span>
                    </DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-1 gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Team</label>
          <Select
              disabled={!teamsReady}
              value={team || undefined}
              onValueChange={setTeam}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={teamsReady ? "Select team" : "Loading teams..."}
                />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={store.team_a_name}>
                  {store.team_a_name}
                </SelectItem>

                <SelectItem value={store.team_b_name}>
                  {store.team_b_name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* player  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Player</label>
            <Select value={player} onValueChange={(v) => setPlayer(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player1">Player 1</SelectItem>
                <SelectItem value="player2">Player 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* card  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Card Type</label>
            <Select value={cardType} onValueChange={(v) => setCardType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Yellow</SelectItem>
                <SelectItem value="R">Red</SelectItem>
                <SelectItem value="B">Black</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 ">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Reason</label>
              <Textarea placeholder="Type your message here." value={message}
                onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => store.closeDialogs()} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
