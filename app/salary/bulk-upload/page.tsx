'use client';

import { Sidebar } from '@/components/sidebar';
import { SalaryGrid } from '@/components/salary-grid';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BulkSalaryUploadPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8">
        <div className="space-y-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/salary">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Bulk Salary Upload
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter salary data in a spreadsheet-like grid or import from Excel. Submit the entire sheet at once.
              </p>
            </div>
          </div>

          {/* Grid */}
          <SalaryGrid />
        </div>
      </div>
    </div>
  );
}
