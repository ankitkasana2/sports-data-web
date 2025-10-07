
import { useState } from "react"
import { ArrowUpDown, Castle as Whistle } from "lucide-react"
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

const refereeFormFields = [
  { key: "name", label: "Full Name", type: "text", required: true },
  {
    key: "association",
    label: "Association",
    type: "text",
    required: true,
  },
  {
    key: "level", label: "Level", type: "select", required: true, options: [
      { value: "National", label: "National" },
      { value: "Club", label: "Club" },
      { value: "County", label: "County" },
      { value: "Provincial", label: "Provincial" },
    ],
  },
  { key: "experience_years", label: "Years Experience", type: "text", required: true },
]

const RefereesPage = () => {
  const { venuesStore, teamsStore, refereesStore } = useStores()
  const [referees, setReferees] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReferee, setEditingReferee] = useState(null)
  const navigate = useNavigate()

  const handleAdd = () => {
    setEditingReferee(null)
    setDialogOpen(true)
  }

  const handleEdit = (referee) => {
    setEditingReferee(referee)
    setDialogOpen(true)
  }

  const handleDelete = (referee) => {
    // In real app, this would be a soft delete (status = 'inactive')
    setReferees((prev) => prev.map((r) => (r.id === referee.id ? { ...r, status: "inactive" } : r)))
  }

  const handleSubmit = async (data) => {
    const now = new Date().toISOString()

    if (editingReferee) {
      // Update existing referee
      setReferees((prev) =>
        prev.map((r) =>
          r.id === editingReferee.id
            ? {
              ...r,
              ...data,
              experience_years: data.experience_years ? Number.parseInt(data.experience_years) : undefined,
              specialization: data.specialization ? [data.specialization] : [],
              updated_at: now,
              updated_by: "current_user",
            }
            : r,
        ),
      )
    } else {
      // Add new referee
      const newReferee = {
        id: `Referee_${nanoid(6)}`,
        name: data.name,
        association: data.association,
        level: data.level,
        experience_years: data.experience_years,
      }
      const created = await refereesStore.createReferee(newReferee)

      if (created) {
        toast(<div className="flex gap-3">
          <Check className="text-green-800" /><span>Referee has been created Successfully.</span>
        </div>)
        navigate(0)
      } else {
        toast(<div className="flex gap-3">
          <Ban className="text-red-700" /><span>Referee not created.</span>
        </div>)
      }
    }
  }

  const columns = [
    {
      accessorKey: "referee_id",
      header: "Id",
      cell: ({ row }) => (
        <div className="text-xs">{row.getValue("referee_id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <Whistle className="mr-2 h-4 w-4" />
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "association",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Association
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("association")}</div>,
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => <div className="font-medium">{row.getValue("level")}</div>,
    },
    {
      accessorKey: "experience_years",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Experience
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const years = row.getValue("experience_years")
        return years ? `${years} years` : "—"
      },
    },
    {
      accessorKey: "active_flag",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("active_flag")
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
      <TopBar />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Referees</h2>
          <p className="text-muted-foreground">Manage referee master data for matches and analytics</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={refereesStore.allRefrees}
        searchKey="name"
        onAdd={handleAdd}
        addLabel="Add Referee"
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingReferee ? "Edit Referee" : "Add New Referee"}
        description={editingReferee ? "Update the referee information below." : "Add a new referee to the master data list."}
        fields={refereeFormFields}
        initialData={editingReferee || undefined}
        onSubmit={handleSubmit}
        submitLabel={editingReferee ? "Update Referee" : "Add Referee"}
      />
    </div>
  )
}

export default observer(RefereesPage)
