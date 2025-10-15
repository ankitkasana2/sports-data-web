
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"

export default function DriversTable({ drivers }) {
  const rows = drivers.rows
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Driver breakdown (delta vs neutral)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead className="text-right">Team A</TableHead>
              <TableHead className="text-right">Team B</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-right">{fmtDelta(r.a)}</TableCell>
                <TableCell className="text-right">{fmtDelta(r.b)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-semibold">Total ORtg/DRtg change</TableCell>
              <TableCell className="text-right font-semibold">{fmtDelta(drivers.total.a)}</TableCell>
              <TableCell className="text-right font-semibold">{fmtDelta(drivers.total.b)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function fmtDelta(x) {
  if (x == null) return "-"
  const sign = x > 0 ? "+" : ""
  return `${sign}${x.toFixed(2)}`
}
