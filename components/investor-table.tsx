// components/investor-table.tsx
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Power } from "lucide-react"
import type { Investor } from "@/types/investor"

interface InvestorTableProps {
  investors: Investor[]
  onEdit: (investor: Investor) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onViewDetails: (investor: Investor) => void
  isLoading?: boolean
}

export function InvestorTable({ 
  investors, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onViewDetails,
  isLoading 
}: InvestorTableProps) {
  if (isLoading) {
    return <div className="text-center py-4">Loading investors...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investors.filter(i=>i.name!=="Self").map((investor) => (
          <TableRow key={investor.id}>
            <TableCell className="font-medium">{investor.name}</TableCell>
            <TableCell>{investor.email}</TableCell>
            <TableCell>{investor.phone || "-"}</TableCell>
            <TableCell>
              <Badge variant={investor.isActive ? "default" : "secondary"}>
                {investor.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(investor.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(investor)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(investor)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(investor.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(investor.id)}
                >
                  <Power className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}