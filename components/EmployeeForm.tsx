import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [totalSalary, setTotalSalary] = useState<number>(
    employee ? (
      employee.baseSalary + 
      employee.homeRentAllowance + 
      employee.healthAllowance + 
      employee.travelAllowance + 
      employee.mobileAllowance + 
      employee.otherAllowances
    ) : 0
  );

  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    designation: employee?.designation || '',
    joinDate: employee?.joinDate ? format(new Date(employee.joinDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    baseSalary: employee?.baseSalary || 0,
    homeRentAllowance: employee?.homeRentAllowance || 0,
    healthAllowance: employee?.healthAllowance || 0,
    travelAllowance: employee?.travelAllowance || 0,
    mobileAllowance: employee?.mobileAllowance || 0,
    otherAllowances: employee?.otherAllowances || 0,
    overtimeRate: employee?.overtimeRate || 0,
  });

  useEffect(() => {
    if (totalSalary > 0) {
      const base = Math.round(totalSalary * 0.47);
      const home = Math.round(totalSalary * 0.30);
      const health = Math.round(totalSalary * 0.10);
      const travel = Math.round(totalSalary * 0.07);
      const mobile = Math.round(totalSalary * 0.03);
      const other = totalSalary - (base + home + health + travel + mobile);

      setFormData(prev => ({
        ...prev,
        baseSalary: base,
        homeRentAllowance: home,
        healthAllowance: health,
        travelAllowance: travel,
        mobileAllowance: mobile,
        otherAllowances: other,
      }));
    }
  }, [totalSalary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert joinDate to proper ISO string with timezone
    const joinDateWithTimezone = new Date(formData.joinDate + 'T00:00:00.000Z').toISOString();
    
    const submitData = {
      ...formData,
      joinDate: joinDateWithTimezone,
    };
    
    onSubmit(submitData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
        <CardDescription>
          {employee ? 'Update employee information' : 'Create a new employee record'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Designation</label>
              <Input
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Join Date</label>
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
          </div>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salary Information</CardTitle>
              <CardDescription>
                Enter total monthly salary - ILO scheme breakdown is applied automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Monthly Salary (BDT)</label>
                <Input
                  type="number"
                  value={totalSalary}
                  onChange={(e) => setTotalSalary(Number(e.target.value))}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Overtime Rate (per hour)</label>
                <Input
                  type="number"
                  value={formData.overtimeRate}
                  onChange={(e) => setFormData({ ...formData, overtimeRate: Number(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Monthly Salary:</span>
                  <span className="font-bold">{totalSalary.toFixed(2)} BDT</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Salary breakdown follows ILO scheme (47% base salary)
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {employee ? 'Update Employee' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}