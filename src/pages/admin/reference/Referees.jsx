
import { useState } from "react"
import { ArrowUpDown, Castle as Whistle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createActionsColumn } from "@/components/admin/data-table"
import { FormDialog } from "@/components/admin/form-dialog"

// Mock data - in real app this would come from API/database
const mockReferees = [
  {
    id: "1",
    name: "John Murphy",
    grade: "National",
    county: "Cork",
    phone: "+353 87 123 4567",
    email: "john.murphy@gaa.ie",
    experience_years: 15,
    specialization: ["Hurling", "Football"],
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "2",
    name: "Sarah O'Brien",
    grade: "Provincial",
    county: "Dublin",
    phone: "+353 86 987 6543",
    email: "sarah.obrien@gaa.ie",
    experience_years: 8,
    specialization: ["Camogie", "Ladies Football"],
    status: "active",
    created_at: "2024-01-16T14:30:00Z",
    updated_at: "2024-01-16T14:30:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "3",
    name: "Michael Walsh",
    grade: "County",
    county: "Kilkenny",
    phone: "+353 85 555 1234",
    email: "michael.walsh@gaa.ie",
    experience_years: 12,
    specialization: ["Hurling"],
    status: "active",
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
]

const refereeFormFields = [
  { key: "name", label: "Full Name", type: "text", required: true },
  {
    key: "grade",
    label: "Grade",
    type: "select",
    required: true,
    options: [
      { value: "National", label: "National" },
      { value: "Provincial", label: "Provincial" },
      { value: "County", label: "County" },
      { value: "Club", label: "Club" },
      { value: "Development", label: "Development" },
    ],
  },
  { key: "county", label: "County", type: "text", required: true },
  { key: "phone", label: "Phone", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "experience_years", label: "Years Experience", type: "text" },
  {
    key: "specialization",
    label: "Specialization",
    type: "select",
    options: [
      { value: "Hurling", label: "Hurling" },
      { value: "Football", label: "Football" },
      { value: "Camogie", label: "Camogie" },
      { value: "Ladies Football", label: "Ladies Football" },
    ],
  },
]

export default function RefereesPage() {
  const [referees, setReferees] = useState(mockReferees)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReferee, setEditingReferee] = useState(null)

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

  const handleSubmit = (data) => {
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
        id: (referees.length + 1).toString(),
        name: data.name,
        grade: data.grade,
        county: data.county,
        phone: data.phone,
        email: data.email,
        experience_years: data.experience_years ? Number.parseInt(data.experience_years) : undefined,
        specialization: data.specialization ? [data.specialization] : [],
        status: "active",
        created_at: now,
        updated_at: now,
        created_by: "current_user",
        updated_by: "current_user",
      }
      setReferees((prev) => [...prev, newReferee])
    }
  }

  const columns = [
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
      accessorKey: "grade",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Grade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const grade = row.getValue("grade")
        const variant = grade === "National" ? "default" : grade === "Provincial" ? "secondary" : "outline"
        return <Badge variant={variant}>{grade}</Badge>
      },
    },
    {
      accessorKey: "county",
      header: "County",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("county")}</div>,
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => {
        const specializations = row.getValue("specialization") || []
        return (
          <div className="flex gap-1">
            {specializations.map((spec, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>
        )
      },
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
          <h2 className="text-2xl font-bold">Referees</h2>
          <p className="text-muted-foreground">Manage referee master data for matches and analytics</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={referees.filter((r) => r.status === "active")}
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
