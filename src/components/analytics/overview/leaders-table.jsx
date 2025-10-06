
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"

export default function LeadersTable({ rows }) {
  const top = [...rows].sort((a, b) => b.ortg_for - a.ortg_for).slice(0, 5)
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">ORtg</TableHead>
            <TableHead className="text-right">DRtg</TableHead>
            <TableHead className="text-right">Pace</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top.map((r) => (
            <TableRow key={r.team}>
              <TableCell>{r.team}</TableCell>
              <TableCell className="text-right">{r.ortg_for.toFixed(1)}</TableCell>
              <TableCell className="text-right">{r.drtg_against.toFixed(1)}</TableCell>
              <TableCell className="text-right">{r.pace}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
