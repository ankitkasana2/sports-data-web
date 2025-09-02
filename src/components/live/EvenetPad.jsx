import { useEffect, useState } from "react"
import { useLive } from "./LiveContext"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ShotDialog } from "./ShotDialog"
import { FreeDialog } from "./FreeDialog"
import { RestartDialog } from "./RestartDialog"
import { TurnoverDialog } from "./TurnoverDialog"

export function EventPad() {
  const { state, dispatch } = useLive()
  const [ping, setPing] = useState(null)

  // Hotkeys
  useEffect(() => {
    const handler = (e) => {
      const target = e.target
      // Ignore hotkeys when typing in inputs
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return

      if (e.key === " ") {
        e.preventDefault()
        dispatch({ type: state.clock.running ? "CLOCK_PAUSE" : "CLOCK_START" })
        setPing("space")
      } else if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: "UNDO" })
        setPing("z")
      } else if (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault()
        dispatch({ type: "REDO" })
        setPing("y")
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault()
        dispatch({ type: "OPEN_DIALOG", dialog: "shot" })
        setPing("s")
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault()
        dispatch({ type: "OPEN_DIALOG", dialog: "free" })
        setPing("f")
      } else if (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "p") {
        e.preventDefault()
        dispatch({ type: "OPEN_DIALOG", dialog: "restart" })
        setPing("k")
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault()
        dispatch({ type: "OPEN_DIALOG", dialog: "turnover" })
        setPing("t")
      } else if (e.key === "?") {
        e.preventDefault()
        dispatch({ type: "SET_HOTKEY_OVERLAY", open: true })
      } else if (e.key === "Escape") {
        dispatch({ type: "CLOSE_DIALOGS" })
        dispatch({ type: "SET_HOTKEY_OVERLAY", open: false })
      }
      setTimeout(() => setPing(null), 150)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [dispatch, state.clock.running])

  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => dispatch({ type: "OPEN_DIALOG", dialog: "shot" })}
          aria-keyshortcuts="S"
          variant={ping === "s" ? "default" : "secondary"}
        >
          Shot (S)
        </Button>
        <Button
          onClick={() => dispatch({ type: "OPEN_DIALOG", dialog: "free" })}
          aria-keyshortcuts="F"
          variant={ping === "f" ? "default" : "secondary"}
        >
          Free (F)
        </Button>
        <Button
          onClick={() => dispatch({ type: "OPEN_DIALOG", dialog: "restart" })}
          aria-keyshortcuts={state.code === "football" ? "K" : "P"}
          variant={ping === "k" ? "default" : "secondary"}
        >
          {state.code === "football" ? "Kick-out (K)" : "Puck-out (P)"}
        </Button>
        <Button
          onClick={() => dispatch({ type: "OPEN_DIALOG", dialog: "turnover" })}
          aria-keyshortcuts="T"
          variant={ping === "t" ? "default" : "secondary"}
        >
          Turnover (T)
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">More ▾</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => dispatch({ type: "OPEN_DIALOG", dialog: "restart" })}>
              Sideline / Throw-in
            </DropdownMenuItem>
            {/* For brevity: Cards/Subs could open future dialogs */}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto text-xs text-muted-foreground">Tip: ? shows hotkeys • Esc closes</div>
      </div>

      <ShotDialog />
      <FreeDialog />
      <RestartDialog />
      <TurnoverDialog />
    </div>
  )
}
