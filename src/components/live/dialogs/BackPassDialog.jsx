import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../../../stores/StoresProvider";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { secondsToHHMMSS } from "../LiveUtils";

export const BackPassDialog = observer(function BackPassDialog() {
  const { liveMatchStore } = useStores();
  const store = liveMatchStore;
  const open = !!store.ui.currentBackPass.open;

  const [team, setTeam] = useState("");
  const [outcome, setOutcome] = useState("");

  // Reset dropdown every time dialog opens
  useEffect(() => {
    if (open) {
      setTeam("");
      setOutcome("");
    }
  }, [open]);

  // 🚀 MOST IMPORTANT FIX:
  // Render nothing until team names are loaded
  if (!store.team_a_name || !store.team_b_name) {
    return null;
  }

  const onSave = () => {
    if (!team) {
      toast(
        <div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select a team.</span>
        </div>
      );
      return;
    }

    if (!outcome) {
      toast(
        <div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select outcome.</span>
        </div>
      );
      return;
    }

    // Save event
    store.addEvent({
      event_type: "Back",
      free_type: "ordinary",
      free_outcome: outcome,
      awarded_team_id: team, // This is the team_id
      team_id: team,
    });

    toast.success("Data successfully saved!");
    store.closeDialogs();

    // Open Shot dialog if needed
    if (outcome === "set_shot") {
      setTimeout(() => {
        store.openDialog("shot", "ordinary");
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex gap-3 items-center">
            <span>Back Pass To GK Violation</span>
            <span className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                {store.clock.period}
              </span>
              <span className="font-mono tabular-nums text-sm">
                {secondsToHHMMSS(store.clock.seconds)}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {/* TEAM SELECT */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Offending Team</label>
            <Select
              value={team === "" ? undefined : String(team)}
              onValueChange={v => setTeam(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={String(store.team_a_id)}>
                  {store.team_a_name}
                </SelectItem>

                <SelectItem value={String(store.team_b_id)}>
                  {store.team_b_name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* OUTCOME SELECT */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Outcome</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="play_on">Play On</SelectItem>
                <SelectItem value="set_shot">Set Shot Now</SelectItem>
              </SelectContent>
            </Select>
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
  );
});
