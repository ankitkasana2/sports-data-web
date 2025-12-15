import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../../../stores/StoresProvider";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { secondsToHHMMSS } from "../LiveUtils";

export const BackPassDialog = observer(function BackPassDialog() {
  const { liveMatchStore } = useStores();
  const store = liveMatchStore;
  const open = Boolean(store.ui.currentBackPass.open);

  // ✅ ONLY TEAM NAME (STRING)
  const [teamName, setTeamName] = useState("");
  const [outcome, setOutcome] = useState("");

  useEffect(() => {
    if (open) {
      setTeamName("");
      setOutcome("");
    }
  }, [open]);

  const teamsReady =
    !!store.team_a_name && !!store.team_b_name;

  const onSave = () => {
    if (!teamName) {
      toast(
        <div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select a team</span>
        </div>
      );
      return;
    }

    if (!outcome) {
      toast(
        <div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select outcome</span>
        </div>
      );
      return;
    }

    // ✅ SEND ONLY TEAM NAME
    store.addEvent({
      event_type: "Back",
      free_type: "ordinary",
      free_outcome: outcome,
      team_id: teamName,
      outcome_restart: outcome,        // 👈 STRING ONLY
      awarded_team_id: teamName // 👈 STRING ONLY (optional)
    });

    toast.success("Data successfully saved");
    store.closeDialogs();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex gap-3 items-center">
            <span>Back Pass To GK Violation</span>
            <span className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded bg-muted">
                {store.clock.period}
              </span>
              <span className="font-mono text-sm">
                {secondsToHHMMSS(store.clock.seconds)}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {/* TEAM SELECT (STRING ONLY) */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Offending Team</label>

            <Select
              disabled={!teamsReady}
              value={teamName || undefined}
              onValueChange={setTeamName}
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

          {/* OUTCOME */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Outcome</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="play_on">Play On</SelectItem>
                <SelectItem value="set_shot">Set Shot Now</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => store.closeDialogs()}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
