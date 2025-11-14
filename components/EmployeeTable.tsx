import { format } from 'date-fns';
import { Edit, Trash2, BadgeDollarSign, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Employee } from '@/types/employee';

interface EmployeeTableProps {
  employees: Employee[];
  searchTerm: string;
  onEditEmployee: (employee: Employee) => void;
  onPaySalary: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export function EmployeeTable({ 
  employees, 
  searchTerm, 
  onEditEmployee, 
  onPaySalary, 
  onDeleteEmployee 
}: EmployeeTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees ({employees.length})</CardTitle>
        <CardDescription>
          All active employees in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.employeeId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{employee.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {employee.designation}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {(employee.baseSalary + employee.homeRentAllowance + employee.healthAllowance + employee.travelAllowance + employee.mobileAllowance + employee.otherAllowances).toFixed(2)} BDT
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Base: {employee.baseSalary.toFixed(2)} BDT
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(employee.joinDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditEmployee(employee)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPaySalary(employee)}
                    >
                      <BadgeDollarSign className="w-3 h-3 mr-1" />
                      Pay
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {employees.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}