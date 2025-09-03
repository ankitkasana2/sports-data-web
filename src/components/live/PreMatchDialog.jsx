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

  function toLivePreMatch(mc) {
    // Metadata
    const seasonNum =
      typeof mc?.metadata?.season === "string"
        ? Number.parseInt(mc.metadata.season, 10)
        : mc?.metadata?.season ?? undefined
    const dateTime = mc?.metadata?.dateTime
    const date = dateTime ? dateTime.slice(0, 10) : undefined
    const throwInLocal = dateTime ? dateTime.slice(11, 16) : undefined

    // Wind strength mapping
    const ws =
      mc?.field?.wind?.strength === "medium" ? "med" : mc?.field?.wind?.strength ?? "none"

    // Ends
    const teamAEndLeftH1 = (mc?.field?.endA_H1 ?? "left") === "left"

    // Rules (football toggles; if hurling, provide safe defaults)
    const r = mc?.rules ?? {}
    const rules = {
      rulePackLabel: store.code === "football" ? "2025_Football" : "2025_Hurling",
      twoPointArc: !!r.twoPointArc,
      officialStopClock: !!r.officialStopClock,
      advancedMark: !!r.advancedMark,
      tapAndGo: !!r.tapAndGo,
      gkBackPassRestriction: !!r.gkBackPassRestrict,
      kickoutBeyond40Info: true,
      extraTime: false,
      penalties: false,
      pitchPreset: "football",
      xyGrid: "0-100",
    }

    // Panels: flatten starters + bench, mark starters
    const makePanel = (team) => {
      const starters = (team?.starters ?? []).map((p) => ({
        jersey: p?.jersey ?? 0,
        name: p?.name ?? "",
        playerId: p?.id,
        starting: true,
      }))
      const bench = (team?.bench ?? []).map((p) => ({
        jersey: p?.jersey ?? 0,
        name: p?.name ?? "",
        playerId: p?.id,
        starting: false,
      }))
      return [...starters, ...bench]
    }

    const preMatch = {
      competition: mc?.metadata?.competition,
      round: mc?.metadata?.round,
      season: seasonNum,
      date,
      throwInLocal,
      venue: { name: mc?.metadata?.venue },
      referee: { name: mc?.metadata?.referee },
      weather: { wind: ws, rain: "none" },
      windOrientationTeamAAttacksEnd1H1: teamAEndLeftH1,
      rules,
      panels: {
        teamA: makePanel(mc?.teams?.teamA),
        teamB: makePanel(mc?.teams?.teamB),
      },
    }
    return preMatch
  }

  return (
    <PreMatchChecklistDialog
      open={open}
      onOpenChange={(o) => store.openPrematch(o)}
      initialMatch={initialMatch}
      onSave={(mc) => {
        store.savePrematch(toLivePreMatch(mc))
        store.openPrematch(false)
      }}
    />
  )
})

export default PreMatchDialog
