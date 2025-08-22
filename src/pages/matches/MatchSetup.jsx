import { useState } from "react";
import { useRouter } from "next/router";




export default function MatchSetup({ competitions = [], referees = [], teams = [], players = [] }) {
  const [formData, setFormData] = useState({
    gameCode: "Football",
    competition: "",
    season: new Date().getFullYear(),
    round: "",
    date: "",
    time: "",
    venueName: "",
    venueType: "Neutral",
    weather: "",
    referee: "",
    halfLength: 35,
    extraTime: "No",
    teamA: "",
    teamB: "",
    lineups: { teamA: [], teamB: [] },
  });

  const router = useRouter();

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle team selection → filter players
  const handleTeamChange = (teamKey, value) => {
    setFormData((prev) => ({
      ...prev,
      [teamKey]: value,
      lineups: { ...prev.lineups, [teamKey]: [] }, // reset lineups when team changes
    }));
  };

  // Handle lineup change (jersey & position)
  const handleLineupChange = (teamKey, index, field, value) => {
    const newLineup = [...(formData.lineups[teamKey] || [])];
    newLineup[index] = { ...newLineup[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      lineups: { ...prev.lineups, [teamKey]: newLineup },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`1/entry`)

  };

  return (
    <div className=" bg-gray-100 p-6 flex justify-center">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md w-[90vw] flex flex-col gap-3">
        <h2 className="text-xl font-bold">Match Setup (Pre-Match)</h2>

        {/* Game Code */}
        <div>
          <label className="block text-sm font-medium">Game Code</label>
          <select name="gameCode" value={formData.gameCode} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option value="Football">Football</option>
            <option value="Hurling">Hurling</option>
          </select>
        </div>

        {/* Competition */}
        <div>
          <label className="block text-sm font-medium">Competition</label>
          <select name="competition" value={formData.competition} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option value="">Select Competition</option>
            {competitions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div>
          <label className="block text-sm font-medium">Season</label>
          <input type="number" name="season" value={formData.season} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
        </div>

        {/* Round */}
        <div>
          <label className="block text-sm font-medium">Round</label>
          <select name="round" value={formData.round} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option value="">Select Round</option>
            <option>Group</option>
            <option>Quarter-final</option>
            <option>Semi-final</option>
            <option>Final</option>
            <option>Relegation</option>
            <option>Challenge</option>
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium">Throw-in Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium">Venue Name</label>
          <input type="text" name="venueName" value={formData.venueName} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium">Venue Type</label>
          <select name="venueType" value={formData.venueType} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option>Home</option>
            <option>Away</option>
            <option>Neutral</option>
          </select>
        </div>

        {/* Weather */}
        <div>
          <label className="block text-sm font-medium">Weather</label>
          <select name="weather" value={formData.weather} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option value="">Select</option>
            <option>Calm</option>
            <option>Breezy</option>
            <option>Windy</option>
            <option>Rain-light</option>
            <option>Rain-heavy</option>
            <option>Dry</option>
            <option>Cold</option>
            <option>Hot</option>
          </select>
        </div>

        {/* Referee */}
        <div>
          <label className="block text-sm font-medium">Referee</label>
          <select name="referee" value={formData.referee} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option value="">Select Referee</option>
            {referees.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Half Length */}
        <div>
          <label className="block text-sm font-medium">Half Length (minutes)</label>
          <input type="number" name="halfLength" value={formData.halfLength} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
        </div>

        {/* Extra Time */}
        <div>
          <label className="block text-sm font-medium">Extra Time Possible</label>
          <select name="extraTime" value={formData.extraTime} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Team A</label>
            <select value={formData.teamA} onChange={(e) => handleTeamChange("teamA", e.target.value)} className="mt-1 w-full border p-2 rounded-md">
              <option value="">Select Team A</option>
              {teams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Team B</label>
            <select value={formData.teamB} onChange={(e) => handleTeamChange("teamB", e.target.value)} className="mt-1 w-full border p-2 rounded-md">
              <option value="">Select Team B</option>
              {teams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Line-ups */}
        {["teamA", "teamB"].map((teamKey) =>
          formData[teamKey] ? (
            <div key={teamKey} className="border-t pt-4">
              <h3 className="font-medium mb-2">{teamKey === "teamA" ? "Team A" : "Team B"} Line-up</h3>
              {[...Array(15)].map((_, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Jersey #"
                    value={formData.lineups[teamKey]?.[i]?.jersey || ""}
                    onChange={(e) => handleLineupChange(teamKey, i, "jersey", e.target.value)}
                    className="border p-2 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={formData.lineups[teamKey]?.[i]?.position || ""}
                    onChange={(e) => handleLineupChange(teamKey, i, "position", e.target.value)}
                    className="border p-2 rounded-md"
                  />
                  <select
                    value={formData.lineups[teamKey]?.[i]?.player || ""}
                    onChange={(e) => handleLineupChange(teamKey, i, "player", e.target.value)}
                    className="border p-2 rounded-md"
                  >
                    <option value="">Select Player</option>
                    {players
                      .filter((p) => p.team === formData[teamKey])
                      .map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                  </select>
                </div>
              ))}
            </div>
          ) : null
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-950">
            Save Match Setup
          </button>
        </div>
      </form>
    </div>
  );
}