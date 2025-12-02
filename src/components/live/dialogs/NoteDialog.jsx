import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';


export const NoteDialog = observer(function NoteDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentNote.open

  const [message, setMessage] = useState('')

  const onSave = () => { 
    try {
    if (message == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please write message.</span>
      </div>)
      return
    }

    // store event 
    store.addEvent({
      event_type: 'note',
      note_text: message
    })
     toast.success("Data saved successfully!")

    store.closeDialogs()
  }catch (error) {
    toast.error("Failed to save event")
    console.error(error)
  }

  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Note</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Note</label>
            <Textarea placeholder="Type your message here." value={message}
              onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => store.closeDialogs()} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
