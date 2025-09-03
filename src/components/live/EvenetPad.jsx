import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { ShotDialog } from "./ShotDialog"
import { FreeDialog } from "./FreeDialog"
import { RestartDialog } from "./RestartDialog"
import { TurnoverDialog } from "./TurnoverDialog"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"

export const EventPad = observer(function EventPad() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const [ping, setPing] = useState(null)

  // Hotkeys
  useEffect(() => {
    const handler = (e) => {
      const target = e.target
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return

      if (e.key === " ") {
        e.preventDefault()
        store.clock.running ? store.pauseClock() : store.startClock()
        setPing("space")
      } else if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault()
        store.undo()
        setPing("z")
      } else if (
        e.key.toLowerCase() === "y" ||
        (e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault()
        store.redo()
        setPing("y")
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault()
        store.openDialog("shot")
        setPing("s")
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault()
        store.openDialog("free")
        setPing("f")
      } else if (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "p") {
        e.preventDefault()
        store.openDialog("restart")
        setPing("k")
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault()
        store.openDialog("turnover")
        setPing("t")
      } else if (e.key === "Escape") {
        store.closeDialogs()
      }
      setTimeout(() => setPing(null), 150)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [store])

  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => store.openDialog("shot")}
          aria-keyshortcuts="S"
          variant={ping === "s" ? "default" : "secondary"}
        >
          Shot (S)
        </Button>
        <Button
          onClick={() => store.openDialog("free")}
          aria-keyshortcuts="F"
          variant={ping === "f" ? "default" : "secondary"}
        >
          Free (F)
        </Button>
        <Button
          onClick={() => store.openDialog("restart")}
          aria-keyshortcuts={store.code === "football" ? "K" : "P"}
          variant={ping === "k" ? "default" : "secondary"}
        >
          {store.code === "football" ? "Kick-out (K)" : "Puck-out (P)"}
        </Button>
        <Button
          onClick={() => store.openDialog("turnover")}
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
            <DropdownMenuItem onClick={() => store.openDialog("restart")}>
              Sideline / Throw-in
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto text-xs text-muted-foreground">
          Tip: hotkeys — S/F/K(or P)/T, Space to start/pause, Esc to close
        </div>
      </div>

      <ShotDialog />
      <FreeDialog />
      <RestartDialog />
      <TurnoverDialog />
    </div>
  )
})
