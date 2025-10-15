
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function RateModeToggle({ value, onChange }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v)}>
          <ToggleGroupItem value="perMatch">per-match</ToggleGroupItem>
          <ToggleGroupItem value="per100">per-100 poss</ToggleGroupItem>
        </ToggleGroup>
      </TooltipTrigger>
      <TooltipContent>
        <p>Affects rate columns only; %/averages unchanged.</p>
      </TooltipContent>
    </Tooltip>

  )
}
