
import { useState, useEffect } from "react"
import { ArrowUpDown, MapPin } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { DataTable, createActionsColumn } from "../../../components/admin/dataTable"
import { FormDialog } from "../../../components/admin/formDialog"
import TopBar from "../../../components/admin/TabBar"
import { observer } from "mobx-react-lite"
import { useStores } from "@/stores/StoresProvider"
import { toJS } from "mobx"
import { nanoid } from 'nanoid';
import { toast } from "sonner"
import { Check, Ban } from 'lucide-react';



const VenuesPage = () => {
  const { venuesStore, teamsStore } = useStores()
  const [venues, setVenues] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)


  const venueFormFields = [
    { key: "name", label: "Name", type: "text", required: true },
    {
      key: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { value: "Grass", label: "Grass" },
        { value: "Artificial", label: "Artificial" },
      ],
    },
    { key: "location", label: "Location", type: "text", required: true },
    { key: "capacity", label: "Capacity", type: "text" },
    {
      key: "home_team", label: "Home Team", type: "select", options: teamsStore.allTeams.map(team => ({
        value: team.team_name,
        label: team.team_name
      }))

    },
  ]


  const handleAdd = () => {
    setEditingVenue(null)
    setDialogOpen(true)
    teamsStore.getAllTeams()
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

  const handleSubmit = async (data) => {
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
        id: `Venue_${nanoid(6)}`,
        name: data.name,
        type: data.type,
        location: data.location,
        capacity: data.capacity || undefined,
        home_team: data.home_team,
      }

      const created = await venuesStore.createVenue(newVenue)

      if (created) {
        toast(<div className="flex gap-3">
          <Check className="text-green-800" /><span>Venue has been created Successfully.</span>
        </div>)
        navigate(0)
      } else {
        toast(<div className="flex gap-3">
          <Ban className="text-red-700" /><span>Venue not created.</span>
        </div>)
      }
    }
  }

  const columns = [
    {
      accessorKey: "venue_id",
      header: "Id",
      cell: ({ row }) => (
        <div className="text-xs">{row.getValue("venue_id")}</div>
      ),
    },
    {
      accessorKey: "venue_name",
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
      cell: ({ row }) => <div className="font-medium">{row.getValue("venue_name")}</div>,
    },
    {
      accessorKey: "surface_type",
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
      cell: ({ row }) => <Badge variant="secondary">{row.getValue("surface_type")}</Badge>,
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
      <TopBar />
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
        data={venuesStore.allVenues}
        searchKey="venue_name"
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

export default observer(VenuesPage)
