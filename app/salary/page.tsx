'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from '@/components/sidebar';
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useCreateSalaryMutation,
  usePaySalaryMutation,
  useGetPayablesQuery,
  useGetSalaryStatisticsQuery,
  useGenerateMonthlySalariesMutation,
} from '@/lib/store/api/employeeApi';
import type { 
  Employee, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest,
  CreateSalaryRequest,
  PaySalaryRequest
} from '@/types/employee';

// Components
import { EmployeeForm } from '@/components/EmployeeForm';
import { SalaryPaymentForm } from '@/components/SalaryPaymentForm';
import { EmployeeTable } from '@/components/EmployeeTable';
import { PayablesSection } from '@/components/PayablesSection';
import { StatisticsSection } from '@/components/StatisticsSection';
import { UnpaidSalariesTable } from '@/components/UnpaidSalariesTable';

export default function EmployeePage() {
  // API Hooks
  const { data: employees, isLoading, error, refetch } = useGetEmployeesQuery();
  const { data: payables } = useGetPayablesQuery({});
  const { data: statistics } = useGetSalaryStatisticsQuery({});
  
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [createSalary] = useCreateSalaryMutation();
  const [paySalary, { isLoading: isPayingSalary }] = usePaySalaryMutation();
  const [generateMonthlySalaries, { isLoading: isGenerating }] = useGenerateMonthlySalariesMutation();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Filter employees based on search
  const filteredEmployees = employees?.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event Handlers
  const handleCreateEmployee = async (data: CreateEmployeeRequest) => {
    try {
      await createEmployee(data).unwrap();
      toast.success('Employee created successfully');
      setShowForm(false);
      refetch();
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      toast.error(error?.data?.message || 'Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (data: UpdateEmployeeRequest) => {
    if (!editingEmployee) return;
    try {
      await updateEmployee({ id: editingEmployee.id, body: data }).unwrap();
      toast.success('Employee updated successfully');
      setEditingEmployee(null);
      refetch();
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      toast.error(error?.data?.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    
    try {
      await deleteEmployee(id).unwrap();
      toast.success('Employee deactivated successfully');
      refetch();
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      toast.error(error?.data?.message || 'Failed to deactivate employee');
    }
  };

  const handlePaySalary = async (data: CreateSalaryRequest & { paidDate: string }) => {
    try {
      // First create the salary record
      await createSalary({
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        overtimeHours: data.overtimeHours,
        bonus: data.bonus,
        deductions: data.deductions,
      }).unwrap();

      // Then mark it as paid
      await paySalary({
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        paidDate: data.paidDate,
      }).unwrap();

      toast.success('Salary processed successfully');
      setShowSalaryForm(false);
      setSelectedEmployee(null);
      refetch();
    } catch (error: any) {
      console.error('Failed to process salary:', error);
      toast.error(error?.data?.message || 'Failed to process salary');
    }
  };

  // NEW: Direct payment for unpaid salaries
  const handlePayUnpaidSalary = async (payData: PaySalaryRequest) => {
    try {
      await paySalary(payData).unwrap();
      toast.success('Salary paid successfully');
      refetch();
    } catch (error: any) {
      console.error('Failed to pay salary:', error);
      toast.error(error?.data?.message || 'Failed to pay salary');
    }
  };

  // NEW: Generate monthly salaries
  const handleGenerateMonthlySalaries = async () => {
    if (!confirm('Generate monthly salary records for all active employees? This will create PENDING salary entries for the current month.')) {
      return;
    }

    try {
      const result = await generateMonthlySalaries({}).unwrap();
      toast.success(`Monthly salaries generated: ${result.summary.created} created, ${result.summary.skipped} skipped`);
      refetch();
    } catch (error: any) {
      console.error('Failed to generate monthly salaries:', error);
      toast.error(error?.data?.message || 'Failed to generate monthly salaries');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading employees...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-destructive">Error loading employees</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
              <p className="text-muted-foreground">
                Manage your employees, payroll, and salary payments
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleGenerateMonthlySalaries}
                disabled={isGenerating}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Generate Monthly'}
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>

          {/* Statistics Section */}
          {statistics && <StatisticsSection statistics={statistics} />}

          {/* Unpaid Salaries Table - NEW SECTION */}
          {payables?.unpaid && payables.unpaid.length > 0 && (
            <UnpaidSalariesTable
              unpaidSalaries={payables.unpaid}
              onPaySalary={handlePayUnpaidSalary}
              isPaying={isPayingSalary}
            />
          )}

          {/* Search Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees by name, email, designation, or ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payables Section */}
          {payables && <PayablesSection payables={payables} />}

          {/* Employee Form */}
          {showForm && (
            <EmployeeForm
              onSubmit={handleCreateEmployee}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Edit Employee Form */}
          {editingEmployee && (
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleUpdateEmployee}
              onCancel={() => setEditingEmployee(null)}
            />
          )}

          {/* Salary Payment Form */}
          {showSalaryForm && selectedEmployee && (
            <SalaryPaymentForm
              employee={selectedEmployee}
              onPay={handlePaySalary}
              onCancel={() => {
                setShowSalaryForm(false);
                setSelectedEmployee(null);
              }}
            />
          )}

          {/* Employees Table */}
          <EmployeeTable
            employees={filteredEmployees || []}
            searchTerm={searchTerm}
            onEditEmployee={setEditingEmployee}
            onPaySalary={(employee) => {
              setSelectedEmployee(employee);
              setShowSalaryForm(true);
            }}
            onDeleteEmployee={handleDeleteEmployee}
          />
        </div>
      </div>
    </div>
  );
}