import { Card } from "../../components/ui/card"

export function LineupsPanel() {
  return (
    <Card className="p-3">
      <div className="text-sm font-medium mb-2">Lineups & Subs</div>
      <div className="text-sm text-muted-foreground">
        Lineups management coming next: on-field vs bench, cards, minutes, subs with sin-bin tracking (football).
      </div>
    </Card>
  )
}