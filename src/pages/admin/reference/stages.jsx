
import { useState } from "react"
import { ArrowUpDown, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createActionsColumn } from "@/components/admin/data-table"
import { FormDialog } from "@/components/admin/form-dialog"

// Mock data - in real app this would come from API/database
const mockStages = [
  {
    id: "1",
    competition_season_id: "1",
    competition_name: "WSHC 2025",
    phase: "group",
    round_code: "GR1",
    round_name: "Group Round 1",
    matchday_number: 1,
    sort_order: 1,
    group_label: "Group A",
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "2",
    competition_season_id: "1",
    competition_name: "WSHC 2025",
    phase: "group",
    round_code: "GR2",
    round_name: "Group Round 2",
    matchday_number: 2,
    sort_order: 2,
    group_label: "Group A",
    status: "active",
    created_at: "2024-01-16T14:30:00Z",
    updated_at: "2024-01-16T14:30:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "3",
    competition_season_id: "1",
    competition_name: "WSHC 2025",
    phase: "knockout",
    round_code: "QF",
    round_name: "Quarter-Final",
    sort_order: 10,
    status: "active",
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "4",
    competition_season_id: "1",
    competition_name: "WSHC 2025",
    phase: "knockout",
    round_code: "SF",
    round_name: "Semi-Final",
    sort_order: 11,
    status: "active",
    created_at: "2024-01-18T11:45:00Z",
    updated_at: "2024-01-18T11:45:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "5",
    competition_season_id: "1",
    competition_name: "WSHC 2025",
    phase: "knockout",
    round_code: "F",
    round_name: "Final",
    sort_order: 12,
    status: "active",
    created_at: "2024-01-19T16:20:00Z",
    updated_at: "2024-01-19T16:20:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
]

const stageFormFields = [
  { key: "competition_name", label: "Competition", type: "text", required: true },
  {
    key: "phase",
    label: "Phase",
    type: "select",
    required: true,
    options: [
      { value: "group", label: "Group Stage" },
      { value: "knockout", label: "Knockout" },
    ],
  },
  { key: "round_code", label: "Round Code", type: "text", required: true },
  { key: "round_name", label: "Round Name", type: "text", required: true },
  { key: "matchday_number", label: "Matchday Number", type: "text" },
  { key: "sort_order", label: "Sort Order", type: "text", required: true },
  { key: "group_label", label: "Group Label", type: "text" },
]

export default function StagesPage() {
  const [stages, setStages] = useState(mockStages)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStage, setEditingStage] = useState(null)

  const handleAdd = () => {
    setEditingStage(null)
    setDialogOpen(true)
  }

  const handleEdit = (stage) => {
    setEditingStage(stage)
    setDialogOpen(true)
  }

  const handleDelete = (stage) => {
    // In real app, this would be a soft delete (status = 'inactive')
    setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, status: "inactive" } : s)))
  }

  const handleSubmit = (data) => {
    const now = new Date().toISOString()

    if (editingStage) {
      // Update existing stage
      setStages((prev) =>
        prev.map((s) =>
          s.id === editingStage.id
            ? {
                ...s,
                ...data,
                matchday_number: data.matchday_number ? Number.parseInt(data.matchday_number) : undefined,
                sort_order: Number.parseInt(data.sort_order),
                updated_at: now,
                updated_by: "current_user",
              }
            : s
        )
      )
    } else {
      // Add new stage
      const newStage = {
        id: (stages.length + 1).toString(),
        competition_season_id: "1", // In real app, this would be selected
        competition_name: data.competition_name,
        phase: data.phase,
        round_code: data.round_code,
        round_name: data.round_name,
        matchday_number: data.matchday_number ? Number.parseInt(data.matchday_number) : undefined,
        sort_order: Number.parseInt(data.sort_order),
        group_label: data.group_label,
        status: "active",
        created_at: now,
        updated_at: now,
        created_by: "current_user",
        updated_by: "current_user",
      }
      setStages((prev) => [...prev, newStage])
    }
  }

  const columns = [
    {
      accessorKey: "round_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <Target className="mr-2 h-4 w-4" />
          Round
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("round_name")}</div>
          <div className="text-sm text-muted-foreground">{row.original.round_code}</div>
        </div>
      ),
    },
    {
      accessorKey: "competition_name",
      header: "Competition",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("competition_name")}</div>,
    },
    {
      accessorKey: "phase",
      header: "Phase",
      cell: ({ row }) => {
        const phase = row.getValue("phase")
        const variant = phase === "knockout" ? "default" : "secondary"
        return (
          <Badge variant={variant} className="capitalize">
            {phase}
          </Badge>
        )
      },
    },
    {
      accessorKey: "group_label",
      header: "Group",
      cell: ({ row }) => {
        const group = row.getValue("group_label")
        return group ? <Badge variant="outline">{group}</Badge> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "matchday_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Matchday
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const matchday = row.getValue("matchday_number")
        return matchday ? `MD ${matchday}` : "—"
      },
    },
    {
      accessorKey: "sort_order",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Order
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("sort_order")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
      },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at"))
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>
      },
    },
    createActionsColumn(handleEdit, handleDelete),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stages & Rounds</h2>
          <p className="text-muted-foreground">
            Manage competition stages, rounds, and groups for match organization
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={stages.filter((s) => s.status === "active")}
        searchKey="round_name"
        onAdd={handleAdd}
        addLabel="Add Stage"
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingStage ? "Edit Stage" : "Add New Stage"}
        description={
          editingStage
            ? "Update the stage information below."
            : "Add a new stage/round to the master data list."
        }
        fields={stageFormFields}
        initialData={editingStage || undefined}
        onSubmit={handleSubmit}
        submitLabel={editingStage ? "Update Stage" : "Add Stage"}
      />
    </div>
  )
}
