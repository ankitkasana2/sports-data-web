import React, { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch" // ✅ Import Switch

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialData,
  onSubmit,
  submitLabel = "Save",
}) {
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      const resetData = {}
      fields.forEach((field) => {
        if (field.type === "switch") resetData[field.key] = false
        else resetData[field.key] = ""
      })
      setFormData(resetData)
    }
  }, [initialData, fields, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className={`grid ${
                  field.type === "switch" ? "grid-cols-2" : "grid-cols-4"
                } items-center gap-4`}
              >
                <Label
                  htmlFor={field.key}
                  className={`${field.type === "switch" ? "text-left" : "text-right"}`}
                >
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>

                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="col-span-3"
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.key}
                    value={formData[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background 
                               placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
                               focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "switch" ? (
                  <Switch
                    id={field.key}
                    checked={!!formData[field.key]}
                    onCheckedChange={(checked) => updateField(field.key, checked)}
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={formData[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="col-span-3"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
