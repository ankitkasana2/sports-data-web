import PlayersPage from "../../components/player/AllPlayer"

export default function Players() {
  return (
    <main className="min-h-[100vh] px-4 py-6 md:px-8 bg-background">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-700 text-balance">Players</h1>
        <p className="text-sm text-slate-700/80">Search, filter, and manage your squad.</p>
      </header>
      <PlayersPage />
    </main>
  )
}