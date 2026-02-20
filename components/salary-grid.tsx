'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { useGetEmployeesQuery } from '@/lib/store/api/employeeApi';
import { useBulkSalaryUploadMutation } from '@/lib/store/api/employeeApi';
import type { Employee } from '@/types/employee';
import {
  SalaryGridRow,
  BulkSalaryUploadData,
  PAYMENT_MODE_OPTIONS,
  MONTH_NAMES,
  calcPerDay,
  calcTotalPayable,
  createEmptyRow,
  gridRowsToEntries,
} from '@/types/bulkSalary';

// ─── Constants ───────────────────────────────────────────────

const INITIAL_ROW_COUNT = 5;

// ─── Helper: parse Excel file ────────────────────────────────

async function parseExcelToRows(file: File): Promise<SalaryGridRow[]> {
  const XLSX = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        const rows: SalaryGridRow[] = json.map((row, idx) => {
          // Try common column name variations
          const getName = (keys: string[]) => {
            for (const k of keys) {
              const found = Object.keys(row).find(
                (rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
              );
              if (found && row[found] !== undefined && row[found] !== '') return row[found];
            }
            return undefined;
          };

          const num = (val: any): number => {
            if (val === undefined || val === null || val === '') return 0;
            const n = Number(val);
            return isNaN(n) ? 0 : n;
          };

          const empId = getName(['SL', 'SLNO', 'IDNO', 'EmployeeNo', 'employeeId', 'ID', 'No']) ?? '';
          const empName = getName(['EmployeeName', 'employeeName', 'Name', 'EMPLOYEENAME']) ?? '';
          const basic = num(getName(['Basic', 'basic', 'BASIC']));
          const joiningDate = getName(['JoiningDate', 'joiningDate', 'JOININGDATE', 'Joining']) ?? '';
          const designation = getName(['Designation', 'designation', 'DESIGNATION']) ?? '';
          const monthlySalary = num(getName([
            'monthlySalary', 'MonthlySalary', 'JunSalary', 'Jun', 'July', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
            'Salary', 'SALARY', 'MonthlySal',
          ])) || basic;
          const medicalMobile = num(getName(['MedicalMobile', 'medicalMobile', 'Medical', 'MEDICALMOBILE', 'MedicalMob']));
          const bonusBoksis = num(getName(['BonusBoksis', 'bonusBoksis', 'Bonus', 'BONASBOKSIS', 'BONUS', 'Boksis']));
          const dailyPresent = num(getName(['DailyPresent', 'dailyPresent', 'DAILYPRESENT', 'Present']));
          const advance = num(getName(['Advance', 'advance', 'ADVANCE']));
          const modeRaw = getName(['ModeofPayment', 'modeOfPayment', 'MODEOFPAYMENT', 'Mode', 'Payment']);
          const balance = num(getName(['Balance', 'balance', 'BLANCE', 'BALANCE']));
          const totalPayableRaw = num(getName(['TotalPayable', 'totalPayable', 'TOTALPAYABLE', 'Total']));

          let modeOfPayment = '0';
          if (modeRaw !== undefined) {
            const mStr = String(modeRaw).trim();
            if (['0', '1', '2', '3'].includes(mStr)) {
              modeOfPayment = mStr;
            } else if (mStr.toUpperCase().includes('BANK')) {
              modeOfPayment = '1';
            } else if (mStr.toUpperCase().includes('CHEQUE')) {
              modeOfPayment = '2';
            } else if (mStr.toUpperCase().includes('CARD')) {
              modeOfPayment = '3';
            }
          }

          return {
            _key: `excel-${Date.now()}-${idx}`,
            slNo: idx + 1,
            employeeId: String(empId),
            employeeName: String(empName),
            basic,
            joiningDate: String(joiningDate),
            designation: String(designation),
            monthlySalary,
            medicalMobile,
            bonusBoksis,
            perDay: 0,
            dailyPresent,
            totalPayable: totalPayableRaw,
            advance,
            modeOfPayment,
            balance,
            _isExistingEmployee: false,
            _currentAdvanceBalance: 0,
          };
        });

        resolve(rows.filter((r) => r.employeeName.trim() !== ''));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Component ──────────────────────────────────────────────

export function SalaryGrid() {
  // State
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [rows, setRows] = useState<SalaryGridRow[]>(() =>
    Array.from({ length: INITIAL_ROW_COUNT }, (_, i) => createEmptyRow(i + 1))
  );
  const [resultDialog, setResultDialog] = useState<BulkSalaryUploadData | null>(null);
  const [employeeDropdownRow, setEmployeeDropdownRow] = useState<number | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');

  // API
  const { data: employees = [], isLoading: employeesLoading } = useGetEmployeesQuery();
  const [bulkUpload, { isLoading: isUploading }] = useBulkSalaryUploadMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEmployeeDropdownRow(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Recalculate auto fields whenever month/year change ───
  const recalcRow = useCallback(
    (row: SalaryGridRow): SalaryGridRow => {
      const perDay = row.basic > 0 ? calcPerDay(row.basic, month, year) : 0;
      const updated = { ...row, perDay };
      const totalPayable = calcTotalPayable(updated, month, year);
      const balance = totalPayable - updated.advance;
      return { ...updated, totalPayable, balance };
    },
    [month, year]
  );

  // ── Cell change handler ────────────────────────────────────
  const updateCell = useCallback(
    (rowIndex: number, field: keyof SalaryGridRow, value: any) => {
      setRows((prev) => {
        const newRows = [...prev];
        const row = { ...newRows[rowIndex], [field]: value };
        // Recalculate derived fields
        newRows[rowIndex] = recalcRow(row);
        return newRows;
      });
    },
    [recalcRow]
  );

  // ── Select employee from dropdown ──────────────────────────
  const selectEmployee = useCallback(
    (rowIndex: number, emp: Employee) => {
      const daysInMonth = new Date(year, month, 0).getDate();
      const advBal = emp.advanceBalance || 0;
      setRows((prev) => {
        const newRows = [...prev];
        const row: SalaryGridRow = {
          ...newRows[rowIndex],
          employeeId: emp.employeeId,
          employeeName: emp.name,
          basic: emp.baseSalary,
          joiningDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
          designation: emp.designation,
          monthlySalary: emp.baseSalary,
          medicalMobile: emp.mobileAllowance || 0,
          dailyPresent: daysInMonth,
          advance: advBal,
          _isExistingEmployee: true,
          _currentAdvanceBalance: advBal,
        };
        newRows[rowIndex] = recalcRow(row);
        return newRows;
      });
      setEmployeeDropdownRow(null);
      setEmployeeSearch('');
    },
    [recalcRow, month, year]
  );

  // ── Autofill all employees ─────────────────────────────────
  const autofillAllEmployees = useCallback(() => {
    const activeEmployees = employees.filter((e) => e.isActive);
    if (activeEmployees.length === 0) {
      toast.error('No active employees found');
      return;
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    const newRows: SalaryGridRow[] = activeEmployees.map((emp, idx) => {
      const advBal = emp.advanceBalance || 0;
      const row: SalaryGridRow = {
        _key: `autofill-${Date.now()}-${idx}`,
        slNo: idx + 1,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        basic: emp.baseSalary,
        joiningDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
        designation: emp.designation,
        monthlySalary: emp.baseSalary,
        medicalMobile: emp.mobileAllowance || 0,
        bonusBoksis: 0,
        perDay: 0,
        dailyPresent: daysInMonth,
        totalPayable: 0,
        advance: advBal,
        modeOfPayment: '0',
        balance: 0,
        _isExistingEmployee: true,
        _currentAdvanceBalance: advBal,
      };
      return recalcRow(row);
    });

    setRows(newRows);
    toast.success(`Autofilled ${newRows.length} employees`);
  }, [employees, recalcRow]);

  // ── Add row ────────────────────────────────────────────────
  const addRow = useCallback(() => {
    setRows((prev) => [...prev, createEmptyRow(prev.length + 1)]);
  }, []);

  // ── Delete row ─────────────────────────────────────────────
  const deleteRow = useCallback((rowIndex: number) => {
    setRows((prev) => {
      const newRows = prev.filter((_, i) => i !== rowIndex);
      return newRows.map((r, i) => ({ ...r, slNo: i + 1 }));
    });
  }, []);

  // ── Import Excel ───────────────────────────────────────────
  const handleFileImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const importedRows = await parseExcelToRows(file);
        if (importedRows.length === 0) {
          toast.error('No valid rows found in the Excel file');
          return;
        }

        // Match imported rows with existing employees
        const matchedRows = importedRows.map((row) => {
          const emp = employees.find(
            (e) =>
              e.name.toLowerCase() === row.employeeName.toLowerCase() ||
              e.employeeId === row.employeeId ||
              (row.employeeId && !isNaN(Number(row.employeeId)) &&
                e.employeeId === `EMP-${String(row.employeeId).padStart(5, '0')}`)
          );
          if (emp) {
            return {
              ...row,
              employeeId: emp.employeeId,
              _isExistingEmployee: true,
              _currentAdvanceBalance: emp.advanceBalance || 0,
            };
          }
          return row;
        });

        // Recalculate derived fields
        const finalRows = matchedRows.map((r) => recalcRow(r));
        setRows(finalRows);
        toast.success(`Imported ${finalRows.length} rows from Excel`);
      } catch (err) {
        console.error('Excel import error:', err);
        toast.error('Failed to parse Excel file. Please check the format.');
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [employees, recalcRow]
  );

  // ── Export to Excel ────────────────────────────────────────
  const handleExport = useCallback(async () => {
    const XLSX = await import('xlsx');
    const exportData = rows.map((r) => ({
      'ID NO': r.slNo,
      'EMPLOYEE NAME': r.employeeName,
      BASIC: r.basic,
      'JOINING DATE': r.joiningDate,
      DESIGNATION: r.designation,
      [`${MONTH_NAMES[month - 1].toUpperCase()} SALARY`]: r.monthlySalary,
      'MEDICAL/MOBILE': r.medicalMobile,
      'BONUS & BOKSIS': r.bonusBoksis,
      'PER DAY': r.perDay,
      'DAILY PRESENT': r.dailyPresent,
      'TOTAL PAYABLE': r.totalPayable,
      'ADV. DEDUCTION': r.advance,
      'MODE OF PAYMENT': PAYMENT_MODE_OPTIONS.find((o) => o.value === r.modeOfPayment)?.label || 'Cash',
      BALANCE: r.balance,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${MONTH_NAMES[month - 1]} ${year}`);
    XLSX.writeFile(wb, `salary_sheet_${MONTH_NAMES[month - 1].toLowerCase()}_${year}.xlsx`);
    toast.success('Excel file exported');
  }, [rows, month, year]);

  // ── Validate ───────────────────────────────────────────────
  const validate = useCallback((): string[] => {
    const errors: string[] = [];
    const filledRows = rows.filter((r) => r.employeeName.trim() !== '');

    if (filledRows.length === 0) {
      errors.push('No salary entries to submit. Add at least one employee row.');
      return errors;
    }

    filledRows.forEach((row, idx) => {
      if (!row.employeeName.trim()) {
        errors.push(`Row ${row.slNo}: Employee name is required`);
      }
      if (row.basic <= 0) {
        errors.push(`Row ${row.slNo}: Basic salary must be greater than 0`);
      }
    });

    // Check duplicates
    const names = filledRows.map((r) => r.employeeName.toLowerCase());
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    if (dupes.length > 0) {
      errors.push(`Duplicate employee names found: ${[...new Set(dupes)].join(', ')}`);
    }

    return errors;
  }, [rows]);

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const errors = validate();
    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
      return;
    }

    const entries = gridRowsToEntries(rows);
    try {
      const result = await bulkUpload({ month, year, entries }).unwrap();
      setResultDialog(result);

      if (result.summary.failed === 0) {
        toast.success(`All ${result.summary.processed} salaries processed successfully!`);
      } else {
        toast.warning(
          `${result.summary.processed} processed, ${result.summary.failed} failed. Check details.`
        );
      }
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      toast.error(err?.data?.message || 'Failed to upload salary sheet');
    }
  }, [rows, month, year, validate, bulkUpload]);

  // ── Recalc all rows when month/year changes ────────────────
  useEffect(() => {
    setRows((prev) => prev.map((r) => recalcRow(r)));
  }, [month, year, recalcRow]);

  // ── Totals ─────────────────────────────────────────────────
  const filledRows = rows.filter((r) => r.employeeName.trim() !== '');
  const totals = {
    basic: filledRows.reduce((s, r) => s + r.basic, 0),
    monthlySalary: filledRows.reduce((s, r) => s + r.monthlySalary, 0),
    medicalMobile: filledRows.reduce((s, r) => s + r.medicalMobile, 0),
    bonusBoksis: filledRows.reduce((s, r) => s + r.bonusBoksis, 0),
    totalPayable: filledRows.reduce((s, r) => s + r.totalPayable, 0),
    advance: filledRows.reduce((s, r) => s + r.advance, 0),
    balance: filledRows.reduce((s, r) => s + r.balance, 0),
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.isActive &&
      (employeeSearch === '' ||
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Bulk Salary Sheet
              </CardTitle>
              <CardDescription>
                Enter salary data or import from Excel. Auto-calculated fields update in real-time.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Month selector */}
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, idx) => (
                    <SelectItem key={idx} value={String(idx + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year selector */}
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                    (y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileImport}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={autofillAllEmployees}
              disabled={employeesLoading || employees.length === 0}
            >
              <Users className="w-4 h-4 mr-2" />
              Autofill All Employees ({employees.filter(e => e.isActive).length})
            </Button>
            <div className="flex-1" />
            <Badge variant="secondary" className="text-xs">
              {filledRows.length} employee{filledRows.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="w-[50px] text-center font-bold text-xs sticky left-0 bg-muted/60 z-10">
                  #
                </TableHead>
                <TableHead className="min-w-[180px] font-bold text-xs">
                  EMPLOYEE NAME
                </TableHead>
                <TableHead className="w-[100px] text-right font-bold text-xs">BASIC</TableHead>
                <TableHead className="w-[120px] font-bold text-xs">JOINING DATE</TableHead>
                <TableHead className="w-[130px] font-bold text-xs">DESIGNATION</TableHead>
                <TableHead className="w-[110px] text-right font-bold text-xs">
                  {MONTH_NAMES[month - 1]?.toUpperCase()} SAL.
                </TableHead>
                <TableHead className="w-[110px] text-right font-bold text-xs">
                  MED/MOBILE
                </TableHead>
                <TableHead className="w-[110px] text-right font-bold text-xs">
                  BONUS
                </TableHead>
                <TableHead className="w-[90px] text-right font-bold text-xs bg-muted/40">
                  PER DAY
                </TableHead>
                <TableHead className="w-[90px] text-right font-bold text-xs">
                  DAILY PRES.
                </TableHead>
                <TableHead className="w-[110px] text-right font-bold text-xs bg-muted/40">
                  TOTAL PAY
                </TableHead>
                <TableHead className="w-[110px] text-right font-bold text-xs">ADV. DEDUCTION</TableHead>
                <TableHead className="w-[130px] font-bold text-xs">PAYMENT</TableHead>
                <TableHead className="w-[100px] text-right font-bold text-xs bg-muted/40">
                  BALANCE
                </TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow
                  key={row._key}
                  className={`group ${row._isExistingEmployee ? '' : row.employeeName ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                >
                  {/* SL NO */}
                  <TableCell className="text-center text-xs text-muted-foreground font-mono sticky left-0 bg-background z-10">
                    {row.slNo}
                  </TableCell>

                  {/* EMPLOYEE NAME */}
                  <TableCell className="p-0 relative">
                    <div className="relative">
                      <Input
                        value={row.employeeName}
                        onChange={(e) => {
                          updateCell(rowIndex, 'employeeName', e.target.value);
                          setEmployeeSearch(e.target.value);
                          setEmployeeDropdownRow(rowIndex);
                        }}
                        onFocus={() => {
                          setEmployeeDropdownRow(rowIndex);
                          setEmployeeSearch(row.employeeName);
                        }}
                        placeholder="Select or type name"
                        className="border-0 rounded-none h-9 text-xs focus-visible:ring-1 focus-visible:ring-inset"
                      />
                      {row._isExistingEmployee && (
                        <Badge
                          variant="secondary"
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] px-1 py-0"
                        >
                          {row.employeeId}
                        </Badge>
                      )}
                      {/* Employee dropdown */}
                      {employeeDropdownRow === rowIndex && !employeesLoading && (
                        <div
                          ref={dropdownRef}
                          className="absolute top-full left-0 z-50 w-[300px] max-h-[200px] overflow-y-auto bg-popover border rounded-md shadow-lg"
                        >
                          {filteredEmployees.length > 0 ? (
                            filteredEmployees.slice(0, 10).map((emp) => (
                              <button
                                key={emp.id}
                                className="w-full px-3 py-2 text-left hover:bg-accent text-xs flex justify-between items-center"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectEmployee(rowIndex, emp);
                                }}
                              >
                                <div>
                                  <div className="font-medium">{emp.name}</div>
                                  <div className="text-muted-foreground">
                                    {emp.designation} &mdash; ৳{emp.baseSalary.toLocaleString()}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] ml-2">
                                  {emp.employeeId}
                                </Badge>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                              No matching employees. New employee will be auto-created.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* BASIC */}
                  <TableCell className="p-0">
                    <Input
                      type="number"
                      value={row.basic || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        updateCell(rowIndex, 'basic', val);
                        // Also update monthly salary to match basic if they were the same
                        if (row.monthlySalary === row.basic || row.monthlySalary === 0) {
                          setRows((prev) => {
                            const newRows = [...prev];
                            newRows[rowIndex] = recalcRow({
                              ...newRows[rowIndex],
                              basic: val,
                              monthlySalary: val,
                            });
                            return newRows;
                          });
                        }
                      }}
                      className="border-0 rounded-none h-9 text-xs text-right focus-visible:ring-1 focus-visible:ring-inset"
                    />
                  </TableCell>

                  {/* JOINING DATE */}
                  <TableCell className="p-0">
                    <Input
                      type="date"
                      value={row.joiningDate}
                      onChange={(e) => updateCell(rowIndex, 'joiningDate', e.target.value)}
                      className="border-0 rounded-none h-9 text-xs focus-visible:ring-1 focus-visible:ring-inset"
                    />
                  </TableCell>

                  {/* DESIGNATION */}
                  <TableCell className="p-0">
                    <Input
                      value={row.designation}
                      onChange={(e) => updateCell(rowIndex, 'designation', e.target.value)}
                      placeholder="Staff"
                      className="border-0 rounded-none h-9 text-xs focus-visible:ring-1 focus-visible:ring-inset"
                    />
                  </TableCell>

                  {/* MONTHLY SALARY */}
                  <TableCell className="p-0">
                    <Input
                      type="number"
                      value={row.monthlySalary || ''}
                      onChange={(e) =>
                        updateCell(rowIndex, 'monthlySalary', Number(e.target.value) || 0)
                      }
                      className="border-0 rounded-none h-9 text-xs text-right focus-visible:ring-1 focus-visible:ring-inset"
                    />
                  </TableCell>

                  {/* MEDICAL/MOBILE */}
                  <TableCell className="p-0">
                    <Input
                      type="number"
                      value={row.medicalMobile || ''}
                      onChange={(e) =>
                        updateCell(rowIndex, 'medicalMobile', Number(e.target.value) || 0)
                      }
                      className="border-0 rounded-none h-9 text-xs text-right focus-visible:ring-1 focus-visible:ring-inset"
                    />
                  </TableCell>

                  {/* BONUS */}
                  <TableCell className="p-0">
                    <Input
                      type="number"
                      value={row.bonusBoksis || ''}
                      onChange={(e) =>
                        updateCell(rowIndex, 'bonusBoksis', Number(e.target.value) || 0)
                      }
                      className="border-0 rounded-none h-9 text-xs text-right focus-visible:ring-1 focus-visible:ring-inset"
                    />
                  </TableCell>

                  {/* PER DAY (read-only) */}
                  <TableCell className="text-right text-xs font-mono bg-muted/30 tabular-nums">
                    {row.perDay > 0 ? row.perDay.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                  </TableCell>

                  {/* DAILY PRESENT */}
                  <TableCell className="p-0">
                    <Input
                      type="number"
                      value={row.dailyPresent || ''}
                      onChange={(e) =>
                        updateCell(rowIndex, 'dailyPresent', Number(e.target.value) || 0)
                      }
                      min={0}
                      max={31}
                      className="border-0 rounded-none h-9 text-xs text-right focus-visible:ring-1 focus-visible:ring-inset"
                    />
                  </TableCell>

                  {/* TOTAL PAYABLE (read-only) */}
                  <TableCell className="text-right text-xs font-semibold font-mono bg-muted/30 tabular-nums">
                    {row.totalPayable > 0
                      ? `৳${row.totalPayable.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '—'}
                  </TableCell>

                  {/* ADVANCE DEDUCTION */}
                  <TableCell className="p-0 relative">
                    <Input
                      type="number"
                      value={row.advance || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        const max = row._currentAdvanceBalance;
                        updateCell(rowIndex, 'advance', Math.min(Math.max(val, 0), max > 0 ? max : Infinity));
                      }}
                      min={0}
                      max={row._currentAdvanceBalance > 0 ? row._currentAdvanceBalance : undefined}
                      className="border-0 rounded-none h-9 text-xs text-right focus-visible:ring-1 focus-visible:ring-inset"
                    />
                    {row._currentAdvanceBalance > 0 && (
                      <span className="absolute right-1 bottom-0 text-[9px] text-muted-foreground leading-none">
                        max: ৳{row._currentAdvanceBalance.toLocaleString('en-BD')}
                      </span>
                    )}
                  </TableCell>

                  {/* MODE OF PAYMENT */}
                  <TableCell className="p-0">
                    <Select
                      value={row.modeOfPayment}
                      onValueChange={(v) => updateCell(rowIndex, 'modeOfPayment', v)}
                    >
                      <SelectTrigger className="border-0 rounded-none h-9 text-xs focus:ring-1 focus:ring-inset">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_MODE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* BALANCE (read-only) */}
                  <TableCell
                    className={`text-right text-xs font-mono bg-muted/30 tabular-nums ${
                      row.balance < 0 ? 'text-destructive font-semibold' : ''
                    }`}
                  >
                    {row.balance !== 0
                      ? `৳${row.balance.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '—'}
                  </TableCell>

                  {/* DELETE */}
                  <TableCell className="p-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => deleteRow(rowIndex)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-semibold bg-muted/40">
                <TableCell className="text-center text-xs sticky left-0 bg-muted/40 z-10">
                  Σ
                </TableCell>
                <TableCell className="text-xs">TOTAL ({filledRows.length} employees)</TableCell>
                <TableCell className="text-right text-xs font-mono tabular-nums">
                  ৳{totals.basic.toLocaleString('en-BD')}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right text-xs font-mono tabular-nums">
                  ৳{totals.monthlySalary.toLocaleString('en-BD')}
                </TableCell>
                <TableCell className="text-right text-xs font-mono tabular-nums">
                  ৳{totals.medicalMobile.toLocaleString('en-BD')}
                </TableCell>
                <TableCell className="text-right text-xs font-mono tabular-nums">
                  ৳{totals.bonusBoksis.toLocaleString('en-BD')}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right text-xs font-mono tabular-nums font-bold">
                  ৳{totals.totalPayable.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right text-xs font-mono tabular-nums">
                  ৳{totals.advance.toLocaleString('en-BD')}
                </TableCell>
                <TableCell />
                <TableCell className="text-right text-xs font-mono tabular-nums font-bold">
                  ৳{totals.balance.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Card>

      {/* Add Row (bottom) */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>

        <Button onClick={handleSubmit} disabled={isUploading || filledRows.length === 0} size="lg">
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Submit Salary Sheet ({filledRows.length} entries)
            </>
          )}
        </Button>
      </div>

      {/* Result Dialog */}
      <Dialog open={resultDialog !== null} onOpenChange={() => setResultDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resultDialog?.summary.failed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              Bulk Salary Upload Result
            </DialogTitle>
            <DialogDescription>
              {resultDialog?.monthName} {resultDialog?.year} — Processing complete
            </DialogDescription>
          </DialogHeader>

          {resultDialog && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{resultDialog.summary.totalRows}</div>
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {resultDialog.summary.processed}
                  </div>
                  <div className="text-xs text-muted-foreground">Processed</div>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${
                    resultDialog.summary.failed > 0
                      ? 'bg-red-50 dark:bg-red-950/30'
                      : 'bg-muted/50'
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      resultDialog.summary.failed > 0 ? 'text-destructive' : ''
                    }`}
                  >
                    {resultDialog.summary.failed}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{resultDialog.summary.salariesCreated}</div>
                  <div className="text-xs text-muted-foreground">Salaries Created</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{resultDialog.summary.expensesCreated}</div>
                  <div className="text-xs text-muted-foreground">Expenses Created</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{resultDialog.summary.employeesCreated}</div>
                  <div className="text-xs text-muted-foreground">New Employees</div>
                </div>
              </div>

              {/* Created Employees */}
              {resultDialog.createdEmployees.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Auto-Created Employees</h4>
                  <div className="flex flex-wrap gap-1">
                    {resultDialog.createdEmployees.map((empId) => (
                      <Badge key={empId} variant="secondary">
                        {empId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Updated Advance Balances */}
              {Object.keys(resultDialog.updatedAdvanceBalances).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Updated Advance Balances</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(resultDialog.updatedAdvanceBalances).map(([empId, balance]) => (
                      <Badge key={empId} variant={balance > 0 ? 'destructive' : 'secondary'}>
                        {empId}: ৳{Number(balance).toLocaleString('en-BD')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {resultDialog.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Errors ({resultDialog.errors.length})
                  </h4>
                  <div className="space-y-1">
                    {resultDialog.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20"
                      >
                        <span className="font-medium">
                          Row {err.row} ({err.employeeName}):
                        </span>{' '}
                        {err.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setResultDialog(null)}>
              Close
            </Button>
            {resultDialog && resultDialog.summary.failed === 0 && (
              <Button
                onClick={() => {
                  setResultDialog(null);
                  setRows(Array.from({ length: INITIAL_ROW_COUNT }, (_, i) => createEmptyRow(i + 1)));
                }}
              >
                Clear & Start New Sheet
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
