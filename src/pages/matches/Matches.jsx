import MatchesPage from "../../components/matches/AllMatches"

export default function Matches() {
  return (
    <main className="min-h-[100vh] px-4 py-6 md:px-8 bg-background">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-700 text-balance">Matches</h1>
        <p className="text-sm text-slate-700/80">Filter, create, import, and manage matches. Select rows for bulk actions later.</p>
      </header>
      <MatchesPage />
    </main>
  )
}
