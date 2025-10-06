
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { ChartContainer } from "../../ui/chart"

const sample = [
  { i: 1, sq: 0.48 },
  { i: 2, sq: 0.52 },
  { i: 3, sq: 0.55 },
  { i: 4, sq: 0.51 },
  { i: 5, sq: 0.57 },
  { i: 6, sq: 0.6 },
]

export default function Sparkline({ dataKey = "sq", data = sample }) {
  return (
    <ChartContainer
      className="h-[120px]"
      config={{
        [dataKey]: { label: "Value", color: "hsl(var(--chart-1))" },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="var(--color-sq, hsl(var(--chart-1)))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
