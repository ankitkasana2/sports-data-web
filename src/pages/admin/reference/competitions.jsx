
import { useState } from "react"
import { ArrowUpDown, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createActionsColumn } from "@/components/admin/dataTable"
import { FormDialog } from "@/components/admin/formDialog"
import TopBar from "../../../components/admin/TabBar"

// Mock data - in real app this would come from API/database
const mockCompetitions = [
  {
    id: "1",
    name: "All-Ireland Senior Hurling Championship",
    code: "AISHC",
    game_code: "Hurling",
    grade: "Senior",
    level: "National",
    season: "2025",
    display_name: "AISHC 2025",
    half_length_sec: 2100, // 35 minutes
    extra_time_possible: true,
    penalty_shootout_possible: false,
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "2",
    name: "Wexford Senior Hurling Championship",
    code: "WSHC",
    game_code: "Hurling",
    grade: "Senior",
    level: "County",
    season: "2025",
    display_name: "WSHC 2025",
    half_length_sec: 1800, // 30 minutes
    extra_time_possible: true,
    penalty_shootout_possible: true,
    status: "active",
    created_at: "2024-01-16T14:30:00Z",
    updated_at: "2024-01-16T14:30:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "3",
    name: "Munster Senior Football Championship",
    code: "MSFC",
    game_code: "Football",
    grade: "Senior",
    level: "Provincial",
    season: "2025",
    display_name: "MSFC 2025",
    half_length_sec: 2100, // 35 minutes
    extra_time_possible: true,
    penalty_shootout_possible: false,
    status: "active",
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
]

const competitionFormFields = [
  { key: "name", label: "Competition Name", type: "text", required: true },
  { key: "code", label: "Code", type: "text", required: true },
  {
    key: "game_code",
    label: "Game Type",
    type: "select",
    required: true,
    options: [
      { value: "Hurling", label: "Hurling" },
      { value: "Football", label: "Football" },
      { value: "Camogie", label: "Camogie" },
      { value: "Ladies Football", label: "Ladies Football" },
    ],
  },
  { key: "grade", label: "Grade", type: "text", required: true },
  {
    key: "level",
    label: "Level",
    type: "select",
    required: true,
    options: [
      { value: "National", label: "National" },
      { value: "Provincial", label: "Provincial" },
      { value: "County", label: "County" },
      { value: "Club", label: "Club" },
    ],
  },
  { key: "season", label: "Season", type: "text", required: true },
  { key: "display_name", label: "Display Name", type: "text", required: true },
  { key: "half_length_sec", label: "Half Length (seconds)", type: "text", required: true },
]

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState(mockCompetitions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState(null)

  const handleAdd = () => {
    setEditingCompetition(null)
    setDialogOpen(true)
  }

  const handleEdit = (competition) => {
    setEditingCompetition(competition)
    setDialogOpen(true)
  }

  const handleDelete = (competition) => {
    // In real app, this would be a soft delete (status = 'inactive')
    setCompetitions((prev) => prev.map((c) => (c.id === competition.id ? { ...c, status: "inactive" } : c)))
  }

  const handleSubmit = (data) => {
    const now = new Date().toISOString()

    if (editingCompetition) {
      // Update existing competition
      setCompetitions((prev) =>
        prev.map((c) =>
          c.id === editingCompetition.id
            ? {
              ...c,
              ...data,
              half_length_sec: Number.parseInt(data.half_length_sec),
              extra_time_possible: data.extra_time_possible || false,
              penalty_shootout_possible: data.penalty_shootout_possible || false,
              updated_at: now,
              updated_by: "current_user",
            }
            : c,
        ),
      )
    } else {
      // Add new competition
      const newCompetition = {
        id: (competitions.length + 1).toString(),
        name: data.name,
        code: data.code,
        game_code: data.game_code,
        grade: data.grade,
        level: data.level,
        season: data.season,
        display_name: data.display_name,
        half_length_sec: Number.parseInt(data.half_length_sec),
        extra_time_possible: false,
        penalty_shootout_possible: false,
        status: "active",
        created_at: now,
        updated_at: now,
        created_by: "current_user",
        updated_by: "current_user",
      }
      setCompetitions((prev) => [...prev, newCompetition])
    }
  }

  const columns = [
    {
      accessorKey: "display_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <Trophy className="mr-2 h-4 w-4" />
          Competition
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("display_name")}</div>
          <div className="text-sm text-muted-foreground">{row.original.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("code")}</Badge>,
    },
    {
      accessorKey: "game_code",
      header: "Game Type",
      cell: ({ row }) => {
        const gameType = row.getValue("game_code")
        const variant = gameType === "Hurling" ? "default" : gameType === "Football" ? "secondary" : "outline"
        return <Badge variant={variant}>{gameType}</Badge>
      },
    },
    {
      accessorKey: "level",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const level = row.getValue("level")
        const variant = level === "National" ? "default" : level === "Provincial" ? "secondary" : "outline"
        return <Badge variant={variant}>{level}</Badge>
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("grade")}</div>,
    },
    {
      accessorKey: "season",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Season
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono">{row.getValue("season")}</div>,
    },
    {
      accessorKey: "half_length_sec",
      header: "Half Length",
      cell: ({ row }) => {
        const seconds = row.getValue("half_length_sec")
        const minutes = Math.floor(seconds / 60)
        return `${minutes}min`
      },
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
    <div className="space-y-6 p-10">
      <TopBar/>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Competitions</h2>
          <p className="text-muted-foreground">Manage competition master data and season configurations</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={competitions.filter((c) => c.status === "active")}
        searchKey="display_name"
        onAdd={handleAdd}
        addLabel="Add Competition"
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingCompetition ? "Edit Competition" : "Add New Competition"}
        description={
          editingCompetition
            ? "Update the competition information below."
            : "Add a new competition to the master data list."
        }
        fields={competitionFormFields}
        initialData={editingCompetition || undefined}
        onSubmit={handleSubmit}
        submitLabel={editingCompetition ? "Update Competition" : "Add Competition"}
      />
    </div>
  )
}
