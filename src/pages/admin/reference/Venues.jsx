
import { useState } from "react"
import { ArrowUpDown, MapPin } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { DataTable, createActionsColumn } from "../../../components/admin/dataTable"
import { FormDialog } from "../../../components/admin/formDialog"
import TopBar from "../../../components/admin/TabBar"

// Mock data - in real app this would come from API/database
const mockVenues = [
  {
    id: "1",
    name: "Croke Park",
    type: "Stadium",
    location: "Dublin",
    capacity: 82300,
    notes: "GAA Headquarters",
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "2",
    name: "Wexford Park",
    type: "County Ground",
    location: "Wexford",
    capacity: 25000,
    notes: "Home of Wexford GAA",
    status: "active",
    created_at: "2024-01-16T14:30:00Z",
    updated_at: "2024-01-16T14:30:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
  {
    id: "3",
    name: "Semple Stadium",
    type: "Provincial Ground",
    location: "Thurles, Tipperary",
    capacity: 45000,
    notes: "Munster GAA Headquarters",
    status: "active",
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z",
    created_by: "admin",
    updated_by: "admin",
  },
]

const venueFormFields = [
  { key: "name", label: "Name", type: "text", required: true },
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "Stadium", label: "Stadium" },
      { value: "County Ground", label: "County Ground" },
      { value: "Provincial Ground", label: "Provincial Ground" },
      { value: "Club Ground", label: "Club Ground" },
      { value: "Training Ground", label: "Training Ground" },
    ],
  },
  { key: "location", label: "Location", type: "text", required: true },
  { key: "capacity", label: "Capacity", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
]

export default function VenuesPage() {
  const [venues, setVenues] = useState(mockVenues)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)

  const handleAdd = () => {
    setEditingVenue(null)
    setDialogOpen(true)
  }

  const handleEdit = (venue) => {
    setEditingVenue(venue)
    setDialogOpen(true)
  }

  const handleDelete = (venue) => {
    // In real app, this would be a soft delete (status = 'inactive')
    setVenues((prev) =>
      prev.map((v) => (v.id === venue.id ? { ...v, status: "inactive" } : v))
    )
  }

  const handleSubmit = (data) => {
    const now = new Date().toISOString()

    if (editingVenue) {
      // Update existing venue
      setVenues((prev) =>
        prev.map((v) =>
          v.id === editingVenue.id
            ? {
              ...v,
              ...data,
              capacity: data.capacity ? Number.parseInt(data.capacity) : undefined,
              updated_at: now,
              updated_by: "current_user",
            }
            : v
        )
      )
    } else {
      // Add new venue
      const newVenue = {
        id: (venues.length + 1).toString(),
        name: data.name,
        type: data.type,
        location: data.location,
        capacity: data.capacity ? Number.parseInt(data.capacity) : undefined,
        notes: data.notes,
        status: "active",
        created_at: now,
        updated_at: now,
        created_by: "current_user",
        updated_by: "current_user",
      }
      setVenues((prev) => [...prev, newVenue])
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
          <MapPin className="mr-2 h-4 w-4" />
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant="secondary">{row.getValue("type")}</Badge>,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("location")}</div>
      ),
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Capacity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const capacity = row.getValue("capacity")
        return capacity ? capacity.toLocaleString() : "—"
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        )
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
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        )
      },
    },
    createActionsColumn(handleEdit, handleDelete),
  ]

  return (
    <div className="space-y-6 p-10">
      <TopBar/>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Venues</h2>
          <p className="text-muted-foreground">
            Manage venue master data for matches and analytics
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={venues.filter((v) => v.status === "active")}
        searchKey="name"
        onAdd={handleAdd}
        addLabel="Add Venue"
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingVenue ? "Edit Venue" : "Add New Venue"}
        description={
          editingVenue
            ? "Update the venue information below."
            : "Add a new venue to the master data list."
        }
        fields={venueFormFields}
        initialData={editingVenue || undefined}
        onSubmit={handleSubmit}
        submitLabel={editingVenue ? "Update Venue" : "Add Venue"}
      />
    </div>
  )
}
