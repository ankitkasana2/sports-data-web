import { useState } from "react"
import { LiveProvider } from "../../components/live/LiveContext"
import { TopBar } from "../../components/live/Topbar"
import { EventPad } from "../../components/live/EvenetPad"
import { EventFeed } from "../../components/live/EventFeed"
import MiniPitchPanel from "../../components/live/MiniPitchPanel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { LiveStatsPanel } from "../../components/live/LiveStatsPanel"
import { LineupsPanel } from "../../components/live/LineupsPanel"
import PreMatchDialog from "../../components/live/PreMatchDialog"

export default function LivePage() {
  // Switch code between "football" and "hurling"
  const [code] = useState("football")

  return (
    <LiveProvider code={code}>
      <main className="flex min-h-[100dvh] flex-col bg-background text-foreground">
        <TopBar />
        <PreMatchDialog/>
        <section className="border-t">
          {/* Sticky compact live stats bar */}
          <div className="sticky top-[56px] z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-3">
              <LiveStatsPanel compact />
            </div>
          </div>

          {/* Main split: Left 60% feed, Right 40% tabs */}
          <div className="mx-auto flex max-w-7xl flex-col gap-4 p-3 lg:grid lg:grid-cols-5">
            {/* Left: Event Feed and Event Pad */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <EventPad />
              <EventFeed />
            </div>

            {/* Right: Tabs with Live Stats (full), Lineups, Mini Pitch (read-only QA) */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="stats">Live Stats</TabsTrigger>
                  <TabsTrigger value="lineups">Lineups</TabsTrigger>
                  <TabsTrigger value="pitch">Mini Pitch</TabsTrigger>
                </TabsList>
                <TabsContent value="stats" className="mt-3">
                  <LiveStatsPanel />
                </TabsContent>
                <TabsContent value="lineups" className="mt-3">
                  <LineupsPanel />
                </TabsContent>
                <TabsContent value="pitch" className="mt-3">
                  <MiniPitchPanel />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </LiveProvider>
  )
}
