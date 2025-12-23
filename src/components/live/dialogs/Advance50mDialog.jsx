// Advance50mDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
export const Advance50mDialog = observer(function Advance50mDialog() {
  const { liveMatchStore } = useStores();
  const store = liveMatchStore;

  const open = !!store.ui?.current50mAdvance?.open;

  // Manual players (temporary)
  const manualPlayers = {
    teamA: [
      { id: "A1", name: "Player A1" },
      { id: "A2", name: "Player A2" },
      { id: "A3", name: "Player A3" },
    ],
    teamB: [
      { id: "B1", name: "Player B1" },
      { id: "B2", name: "Player B2" },
      { id: "B3", name: "Player B3" },
    ],
  };

  // Local state
  const [team, setTeam] = useState("");
  const [entryPoint, setEntryPoint] = useState("free");
  const [offenderType, setOffenderType] = useState("none");
  const [offenderPlayerId, setOffenderPlayerId] = useState("");
  const [offenderBenchName, setOffenderBenchName] = useState("");
  const [message, setMessage] = useState("");

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setTeam("teamA");
      setEntryPoint("free");
      setOffenderType("none");
      setOffenderPlayerId("");
      setOffenderBenchName("");
      setMessage("");
    }
  }, [open]);

  // Players for team (manual for now)
  const playersForTeam = useMemo(() => manualPlayers[team] || [], [team]);

  // -------------------------------------------
  // Helpers
  // -------------------------------------------
  function getLastAdvanceForTeam(teamId) {
    if (!store.events) return null;
    for (let i = store.events.length - 1; i >= 0; i--) {
      const e = store.events[i];
      if (e?.type === "advance_50" && e.team === teamId) return e;
    }
    return null;
  }

  function computeStack() {
    const last = getLastAdvanceForTeam(team);
    const prevStack = last?.stack ?? 0;
    return prevStack + 1;
  }

  function computeLabel(stack) {
    return stack > 1 ? `+50×${stack}` : "+50";
  }

  function computeNewSpot(stack, misconduct) {
    const current = Number(store.match?.restartSpotMeters ?? 65);

    // misconduct → always 20m
    if (misconduct) return 20;

    const newSpot = current - 50 * stack;

    return Math.max(20, newSpot); // clamp to 20m
  }

  function eligibleTwoPoint(newSpot) {
    return newSpot <= 40;
  }

  const showErr = (msg) =>
    toast(
      <div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>{msg}</span>
      </div>
    );

  function validate() {
    if (offenderType === "player" && !offenderPlayerId) {
      showErr("Select offending player.");
      return false;
    }
    if (offenderType === "bench" && !offenderBenchName.trim()) {
      showErr("Enter bench official name.");
      return false;
    }
    return true;
  }

  // -------------------------------------------
  // Save
  // -------------------------------------------
  const onSave = () => {

    try {
    if (!validate()) return;

    const misconduct = entryPoint === "misconduct" || offenderType === "bench";

    const stack = computeStack();
    const label = computeLabel(stack);
    const after_50 = computeNewSpot(stack, misconduct);
    const twoPoint = eligibleTwoPoint(after_50);

    const evt = {
      shooter_player_id: "adv_" + Date.now(),
      event_type: "advance_50",
      team_id: team,
      entry_point: entryPoint,

      stack,
      label,
      advance_distance: stack * 50,

      offender:
        offenderType === "player"
          ? { type: "player", id: offenderPlayerId }
          : offenderType === "bench"
          ? { type: "bench_official", name: offenderBenchName }
          : null,

      message,

      timestamp: new Date().toISOString(),

      restart_before: Number(store.match?.restartSpotMeters ?? 65),
      restart_after: after_50,

      two_point_offered: twoPoint,
    };

    // Save event
    store.addEvent(evt);

    // Update restart
    store.updateRestartSpot(after_50);

    toast.success(`${label} recorded (${team})`);
    toast.success("Data saved successfully!")
    store.closeDialogs();
  } catch (error) {
    toast.error("Failed to save event")
    console.error(error)
  }
  }

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <Dialog open={open} onOpenChange={() => store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>50m Advance</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* TEAM */}
          <div className="grid gap-1">
           <SelectGroup
             label="Team"
             value={team || undefined}
             onChange={setTeam}
           >
             <SelectItem value={store.team_a_name}>
               {store.team_a_name}
             </SelectItem>
           
             <SelectItem value={store.team_b_name}>
               {store.team_b_name}
             </SelectItem>
           </SelectGroup>
           
           
          </div>

          {/* ENTRY POINT */}
          <div className="grid gap-1">
            <label>Entry Point</label>
            <Select value={entryPoint} onValueChange={setEntryPoint}>
              <SelectTrigger className={"w-full"}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="kickout">Kick-out</SelectItem>
                <SelectItem value="mark_playon">Mark / Play-on</SelectItem>
                <SelectItem value="solo_and_go">Solo-and-Go</SelectItem>
                <SelectItem value="retreat">Retreat Non-Compliance</SelectItem>
                <SelectItem value="illegal_challenge">Illegal Challenge</SelectItem>
                <SelectItem value="misconduct">Team-Official Misconduct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* OFFENDER */}
          <div className="grid gap-1">
            <label>Offender</label>
            <Select value={offenderType} onValueChange={setOffenderType}>
              <SelectTrigger className={"w-full"}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="bench">Bench Official</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PLAYER LIST */}
          {offenderType === "player" && (
            <div className="grid gap-1">
              <label>Offending Player</label>
              <Select
                value={offenderPlayerId}
                onValueChange={setOffenderPlayerId}
              >
                <SelectTrigger className={"w-full"}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {playersForTeam.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* BENCH OFFICIAL */}
          {offenderType === "bench" && (
            <Textarea
              placeholder="Bench official name"
              value={offenderBenchName}
              onChange={(e) => setOffenderBenchName(e.target.value)}
            />
          )}

          {/* NOTES */}
          <Textarea
            placeholder="Optional notes"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <DialogFooter>
         <Button variant="outline" onClick={() => store.closeDialogs()}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

function SelectGroup({ label, value, onChange, children }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}