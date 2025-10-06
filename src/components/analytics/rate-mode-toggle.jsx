
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

export function RateModeToggle({ value, onChange }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v)}>
      <ToggleGroupItem value="perMatch">per match</ToggleGroupItem>
      <ToggleGroupItem value="per100">per-100 poss</ToggleGroupItem>
    </ToggleGroup>
  )
}
