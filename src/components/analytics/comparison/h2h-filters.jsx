"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const VENUE_OPTIONS = ["Stadium A", "Stadium B", "Stadium C"]
const REF_OPTIONS = ["Ref 1", "Ref 2", "Ref 3"]

export default function H2HFilters({ filters, setFilters, disableVenues }) {
  function toggleArray(list, value) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }

  return (
    <Card className="p-3 md:p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="grid gap-2">
          <Label className="text-sm">Venue</Label>
          <div className="grid gap-2">
            {VENUE_OPTIONS.map((v) => (
              <label key={v} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.venues.includes(v)}
                  onCheckedChange={() => setFilters({ ...filters, venues: toggleArray(filters.venues, v) })}
                  disabled={disableVenues}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-sm">Ref</Label>
          <div className="grid gap-2">
            {REF_OPTIONS.map((v) => (
              <label key={v} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.refs.includes(v)}
                  onCheckedChange={() => setFilters({ ...filters, refs: toggleArray(filters.refs, v) })}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-sm">Home / Neutral</Label>
          <RadioGroup value={filters.homeNeutral} onValueChange={(v) => setFilters({ ...filters, homeNeutral: v })}>
            <Radio label="Any" value="any" />
            <Radio label="Home" value="home" />
            <Radio label="Neutral" value="neutral" />
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label className="text-sm">Phase</Label>
          <RadioGroup value={filters.phase} onValueChange={(v) => setFilters({ ...filters, phase: v })}>
            <Radio label="Any" value="any" />
            <Radio label="League" value="league" />
            <Radio label="KO" value="ko" />
          </RadioGroup>
        </div>
      </div>
    </Card>
  )
}

function Radio({ label, value }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={value} />
      <label htmlFor={value} className="text-sm">
        {label}
      </label>
    </div>
  )
}
