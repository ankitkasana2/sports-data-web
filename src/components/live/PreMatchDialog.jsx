import { useMemo } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import PreMatchChecklistDialog from "./PreMatchChecklistDialog"

/**
 * PreMatchDialog
 * - Keeps the existing import path used by app/live/page.tsx
 * - Renders the provided PreMatchChecklistDialog UI
 * - Translates the saved match_context into our reducer's SAVE_PREMATCH shape
 */
export const PreMatchDialog = observer(function PreMatchDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.prematchOpen

  // Build minimal initialMatch. The imported dialog has solid defaults, we mainly pass code.
  const initialMatch = useMemo(
    () => ({
      code: store.code,
    }),
    [store.code]
  )


  return (
    <PreMatchChecklistDialog
      open={open}
      onOpenChange={(o) => store.openPrematch(o)}
      initialMatch={initialMatch}
      onSave={(match_context) => {
        store.savePrematch(match_context)
        store.openPrematch(false)
      }}
    />
  )
})

export default PreMatchDialog
