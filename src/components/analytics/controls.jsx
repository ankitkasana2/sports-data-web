
import { useMemo } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Checkbox } from "../ui/checkbox"
import { Download, Columns3, Save } from "lucide-react"


function toCsv(rows, visibleColumns) {
  const headers = visibleColumns.filter((c) => c.enabled).map((c) => c.id)
  const body = rows.map((r) => headers.map((h) => r[h] ?? "").join(","))
  return [headers.join(","), ...body].join("\n")
}

export default function Controls({
  search,
  onSearchChange,
  topBottom,
  onTopBottomChange,
  sort,
  onSortChange,
  visibleColumns,
  onVisibleColumnsChange,
  rows,
  onSaveView,
  savedViews,
  onApplySavedView,
}) {
  const presets = useMemo(
    () => [
      { id: "scan", name: "Scan" },
      { id: "shooting", name: "Shooting Types" },
      { id: "restarts", name: "Restarts" },
      { id: "transition", name: "Transition" },
      { id: "discipline", name: "Discipline" },
      { id: "context", name: "Context" },
    ],
    [],
  )

  function handleExport() {
    const csv = toCsv(rows, visibleColumns)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "teams_view.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-center">
      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search teams..."
          className="w-[200px]"
        />
        <Select value={topBottom} onValueChange={onTopBottomChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="top10">Top 10</SelectItem>
            <SelectItem value="bottom10">Bottom 10</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 md:ml-auto">
        <Select onValueChange={(id) => onApplySavedView(savedViews.find((v) => v.name === id))}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Saved Views" />
          </SelectTrigger>
          <SelectContent>
            {savedViews.map((v) => (
              <SelectItem key={v.name} value={v.name}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => onSaveView(prompt("Name this view") || "Untitled")}>
          <Save className="h-4 w-4 mr-2" /> Save
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Columns3 className="h-4 w-4 mr-2" /> Columns
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Column Picker</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {visibleColumns.map((col) => (
                <div key={col.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={col.enabled}
                    onCheckedChange={(c) =>
                      onVisibleColumnsChange(visibleColumns.map((v) => (v.id === col.id ? { ...v, enabled: !!c } : v)))
                    }
                    id={`col-${col.id}`}
                  />
                  <Label htmlFor={`col-${col.id}`}>{col.label}</Label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>
    </div>
  )
}
