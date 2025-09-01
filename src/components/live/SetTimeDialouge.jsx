
import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function parseMMSS(s) {
  if (!s) return null
  const m = s.trim().match(/^(\d{1,2}):([0-5]\d)$/)
  if (!m) return null
  const mm = Number.parseInt(m[1], 10)
  const ss = Number.parseInt(m[2], 10)
  return mm * 60 + ss
}

export default function SetTimeDialog({
  open,
  onOpenChange,
  initialMMSS = "00:00",
  initialPeriod = "H1",
  paused,
  onSave,
}) {
  const [mmss, setMmss] = useState(initialMMSS)
  const [period, setPeriod] = useState(initialPeriod)

  useEffect(() => {
    if (open) {
      setMmss(initialMMSS)
      setPeriod(initialPeriod)
    }
  }, [open, initialMMSS, initialPeriod])

  const seconds = useMemo(() => parseMMSS(mmss), [mmss])
  const invalid = seconds == null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set match time</DialogTitle>
          <DialogDescription>Enter MM:SS and choose period. Available while the clock is paused.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-slate-500" htmlFor="mmss">
              MM:SS
            </label>
            <input
              id="mmss"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="12:34"
              inputMode="numeric"
              value={mmss}
              onChange={(e) => setMmss(e.target.value)}
            />
            {invalid && <div className="text-xs text-destructive">Enter a valid time, e.g. 12:34</div>}
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-slate-500" htmlFor="period">
              Period
            </label>
            <select
              id="period"
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="H1">H1</option>
              <option value="H2">H2</option>
              <option value="FT">FT</option>
            </select>
          </div>

          {!paused && <div className="text-xs text-amber-600">Pause the clock to adjust time.</div>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={invalid || !paused}
            onClick={() => onSave({ seconds, period })}
            className="bg-sky-600 hover:bg-sky-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
