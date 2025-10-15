"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EntityTray({ entityType, entities, setEntities, library }) {
  const [search, setSearch] = useState("")
  const filtered = useMemo(() => {
    if (!search) return library
    const q = search.toLowerCase()
    return library.filter((e) => e.name.toLowerCase().includes(q))
  }, [library, search])

  const canAdd = entities.length < 4

  function addEntityById(id) {
    if (!canAdd) return
    const found = library.find((e) => e.id === id)
    if (!found) return
    if (entities.some((e) => e.id === id)) return
    setEntities([...entities, found])
  }

  function removeAt(idx) {
    setEntities(entities.filter((_, i) => i !== idx))
  }

  function move(idx, dir) {
    const next = [...entities]
    const j = idx + dir
    if (j < 0 || j >= next.length) return
    const tmp = next[idx]
    next[idx] = next[j]
    next[j] = tmp
    setEntities(next)
  }

  return (
    <Card className="p-3 md:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Add {entityType}</span>
            <Input
              className="w-[200px]"
              placeholder={`Search ${entityType}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select onValueChange={addEntityById}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={`Pick ${entityType}`} />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {filtered.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">{entities.length}/4 selected</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => {
            const item = entities[idx]
            return (
              <Card key={idx} className="p-3 bg-secondary">
                {item ? (
                  <div className="flex flex-col gap-2">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => move(idx, -1)} disabled={idx === 0}>
                        ←
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => move(idx, 1)}
                        disabled={idx === entities.length - 1}
                      >
                        →
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeAt(idx)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Empty slot</div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
