import PredictionApp from "../../components/analytics/prediction/prediction-app"

export const dynamic = "force-static"

export default function PredictionPage() {
  return (
    <main className="container mx-auto max-w-6xl p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Analytics → Prediction</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Table-first, auditable projections with scenario sliders and drivers.
        </p>
      </header>
      <PredictionApp />
    </main>
  )
}
