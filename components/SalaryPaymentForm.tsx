import { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Employee, CreateSalaryRequest } from '@/types/employee';

interface SalaryPaymentFormProps {
  employee: Employee;
  onPay: (data: CreateSalaryRequest & { paidDate: string }) => void;
  onCancel: () => void;
}

export function SalaryPaymentForm({ employee, onPay, onCancel }: SalaryPaymentFormProps) {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    overtimeHours: 0,
    bonus: 0,
    deductions: 0,
    paidDate: format(currentDate, 'yyyy-MM-dd'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert paidDate to proper ISO string with timezone
    const paidDateWithTimezone = new Date(formData.paidDate + 'T00:00:00.000Z').toISOString();
    
    onPay({
      employeeId: employee.id,
      ...formData,
      paidDate: paidDateWithTimezone,
    });
  };

  const netSalary = employee.baseSalary + 
    (employee.homeRentAllowance + employee.healthAllowance + employee.travelAllowance + employee.mobileAllowance + employee.otherAllowances) +
    ((employee.overtimeRate || 0) * formData.overtimeHours) +
    formData.bonus -
    formData.deductions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Salary Payment</CardTitle>
        <CardDescription>
          Process salary for {employee.name} - {employee.designation}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Overtime Hours</label>
              <Input
                type="number"
                value={formData.overtimeHours}
                onChange={(e) => setFormData({ ...formData, overtimeHours: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bonus (BDT)</label>
              <Input
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deductions (BDT)</label>
              <Input
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Date</label>
              <Input
                type="date"
                value={formData.paidDate}
                onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Salary Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salary Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span>{employee.baseSalary.toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between">
                <span>Allowances:</span>
                <span>{(employee.homeRentAllowance + employee.healthAllowance + employee.travelAllowance + employee.mobileAllowance + employee.otherAllowances).toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime ({formData.overtimeHours} hrs):</span>
                <span>{((employee.overtimeRate || 0) * formData.overtimeHours).toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between">
                <span>Bonus:</span>
                <span>{formData.bonus.toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between">
                <span>Deductions:</span>
                <span>{formData.deductions.toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Net Salary:</span>
                <span>{netSalary.toFixed(2)} BDT</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <DollarSign className="w-4 h-4 mr-2" />
              Process Payment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}