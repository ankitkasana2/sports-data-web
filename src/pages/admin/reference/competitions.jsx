
import { useState } from "react"
import { ArrowUpDown, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createActionsColumn } from "@/components/admin/dataTable"
import { FormDialog } from "@/components/admin/formDialog"
import TopBar from "../../../components/admin/TabBar"
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/StoresProvider"
import { toJS } from "mobx"
import { nanoid } from 'nanoid';
import { toast } from "sonner"
import { Check, Ban } from 'lucide-react';
import { useNavigate } from "react-router-dom"


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
    ],
  },
  {
    key: "grade", label: "Grade", type: "select", required: true, options: [
      { value: "Senior", label: "Senior" },
      { value: "Intermediate", label: "Intermediate" },
      { value: "Junior", label: "Junior" },
      { value: "U20", label: "U20" },
      { value: "U17", label: "U17" },
    ]
  },
  {
    key: "level",
    label: "Level",
    type: "select",
    required: true,
    options: [
      { value: "Inter-County", label: "Inter-County" },
      { value: "Club", label: "Club" },
    ],
  },
  { key: "county", label: "County", type: "text" },
  { key: "province", label: "Province", type: "text" },
  { key: "flags", label: "Flags", type: "switch" },
  { key: "notes", label: "Notes", type: "textarea" },
]

const competitionSeasonFormFields = [
  { key: "name", label: "Competition Name", type: "text", required: true },
  { key: "season", label: "Season", type: "text", required: true, readOnly: true},
  {
    key: "game_code",
    label: "Game Type",
    type: "select",
    required: true,
    options: [
      { value: "Hurling", label: "Hurling" },
      { value: "Football", label: "Football" },
    ],
  },
  {
    key: "grade", label: "Grade", type: "select", required: true, options: [
      { value: "Senior", label: "Senior" },
      { value: "Intermediate", label: "Intermediate" },
      { value: "Junior", label: "Junior" },
      { value: "U20", label: "U20" },
      { value: "U17", label: "U17" },
    ]
  },
  {
    key: "level",
    label: "Level",
    type: "select",
    required: true,
    options: [
      { value: "Inter-County", label: "Inter-County" },
      { value: "Club", label: "Club" },
    ],
  },
  { key: "county", label: "County", type: "text" },
  { key: "province", label: "Province", type: "text" },
  { key: "flags", label: "Flags", type: "switch" },
  { key: "notes", label: "Notes", type: "textarea" },

]

const CompetitionsPage = () => {
  const { competitionsStore } = useStores()
  const [competitions, setCompetitions] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState(null)
  const [competitionSeason, setCompetitionSeason] = useState(false)
  const navigate = useNavigate()

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

  const handleAddSeason = (competition) => {
    setCompetitionSeason(true)
    setDialogOpen(true)
  }

  const handleSubmit = async (data) => {
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
        id: `Competition_${nanoid(6)}`,
        name: data.name,
        code: data.code,
        game_code: data.game_code,
        grade: data.grade,
        level: data.level,
        county: data.county,
        province: data.province,
        flags: data.flags,
        notes: data.notes,
      }

      const created = await competitionsStore.createCompetition(newCompetition)

      if (created) {
        toast(<div className="flex gap-3">
          <Check className="text-green-800" /><span>Competition has been created Successfully.</span>
        </div>)
        navigate(0)
      } else {
        toast(<div className="flex gap-3">
          <Ban className="text-red-700" /><span>Competition not created.</span>
        </div>)
      }
    }
  }

  const columns = [
    {
      accessorKey: "id",
      header: "Id",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
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
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => <div >{row.getValue("grade")}</div>,
    },
    {
      accessorKey: "level",
      header: 'Level',
      cell: ({ row }) => <div>{row.getValue("level")}</div>,
    },
    {
      accessorKey: "county",
      header: "County",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("county") ? row.getValue("county") : ' — '}</div>,
    },

    {
      accessorKey: "flags",
      header: "Is-all-ireland",
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
    createActionsColumn(handleEdit, handleDelete, 'competition', handleAddSeason),
  ]

  return (
    <div className="space-y-6 p-10">
      <TopBar />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Competitions</h2>
          <p className="text-muted-foreground">Manage competition master data and season configurations</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={competitionsStore.allCompetition}
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
        fields={competitionSeason == true ? competitionSeasonFormFields : competitionFormFields}
        initialData={editingCompetition || undefined}
        onSubmit={handleSubmit}
        submitLabel={editingCompetition ? "Update Competition" : "Add Competition"}
      />
    </div>
  )
}

export default observer(CompetitionsPage)
