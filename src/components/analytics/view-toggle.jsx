
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function ViewToggle({ value, onChange }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v)}>
      <ToggleGroupItem value="Attacking">Attacking</ToggleGroupItem>
      <ToggleGroupItem value="Defending">Defending</ToggleGroupItem>
      <ToggleGroupItem value="Paired">Paired</ToggleGroupItem>
    </ToggleGroup>
  )
}
