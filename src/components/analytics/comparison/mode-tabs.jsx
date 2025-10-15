"use client"

import { Button } from "@/components/ui/button"

export default function ModeTabs({ mode, setMode }) {
  return (
    <div className="flex items-center gap-2">
      <ModeButton
        label="Side-by-Side"
        value="side-by-side"
        active={mode === "side-by-side"}
        onClick={() => setMode("side-by-side")}
      />
      <ModeButton label="Diff (vs baseline)" value="diff" active={mode === "diff"} onClick={() => setMode("diff")} />
    </div>
  )
}

function ModeButton({ label, active, onClick }) {
  return (
    <Button variant={active ? "default" : "secondary"} onClick={onClick} aria-pressed={active}>
      {label}
    </Button>
  )
}
