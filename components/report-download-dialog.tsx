"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar, FileText, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDownloadPdfReportMutation } from "@/lib/store/api/reportApi"
import { toast } from "sonner"

interface ReportDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportType: 'financial' | 'inventory' | 'investor' | 'sales' | 'employee' | 'expense' | 'summary'
  reportTitle: string
}

export function ReportDownloadDialog({
  open,
  onOpenChange,
  reportType,
  reportTitle,
}: ReportDownloadDialogProps) {
  const [year, setYear] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [downloadPdfReport, { isLoading }] = useDownloadPdfReportMutation()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Generate year options (last 10 years)
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)
  
  // Generate month options
  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const getReportScope = () => {
    if (year && month) {
      return `Monthly report for ${getMonthName(parseInt(month))} ${year}`
    } else if (year) {
      return `Yearly report for ${year}`
    } else {
      return `Latest month's report (${getMonthName(currentMonth)} ${currentYear})`
    }
  }

  const getMonthName = (monthNum: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return months[monthNum - 1] || ""
  }

  const handleDownload = async () => {
    try {
      const params: {
        type: typeof reportType;
        year?: number;
        month?: number;
      } = { type: reportType }

      if (year) params.year = parseInt(year)
      if (month) params.month = parseInt(month)

      const blob = await downloadPdfReport(params).unwrap()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const scope = year && month ? `${year}-${month.padStart(2, '0')}` : year ? `${year}` : 'latest'
      link.download = `${reportType}-report-${scope}-${timestamp}.pdf`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully", {
        description: getReportScope()
      })

      onOpenChange(false)
      // Reset form
      setYear("")
      setMonth("")
    } catch (error: any) {
      console.error("Download error:", error)
      toast.error("Failed to download report", {
        description: error?.data?.message || "Please try again later"
      })
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      setYear("")
      setMonth("")
    }
  }

  const validateInputs = () => {
    // All inputs are valid since they come from dropdowns
    return true
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Download {reportTitle} Report
          </DialogTitle>
          <DialogDescription>
            Select the time period for your report. Leave empty for the latest data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Report scope:</strong> {getReportScope()}
            </AlertDescription>
          </Alert>

          {/* Year Input */}
          <div className="space-y-2">
            <Label htmlFor="year" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Year (Optional)
            </Label>
            <Select
              value={year}
              onValueChange={setYear}
              disabled={isLoading}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year or leave empty for current" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave empty for current year, or select a specific year
            </p>
          </div>

          {/* Month Input */}
          <div className="space-y-2">
            <Label htmlFor="month" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Month (Optional)
            </Label>
            <Select
              value={month}
              onValueChange={setMonth}
              disabled={isLoading || !year}
            >
              <SelectTrigger id="month">
                <SelectValue placeholder={year ? "Select month or leave empty for yearly" : "Select a year first"} />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((monthOption) => (
                  <SelectItem key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {year 
                ? "Select month for monthly report, or leave empty for yearly report" 
                : "Select a year first to enable monthly selection"}
            </p>
          </div>

          {/* Report Type Badge */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Report Information</p>
                <p className="text-sm text-muted-foreground">
                  Type: <span className="font-medium text-foreground capitalize">{reportType}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Format: <span className="font-medium text-foreground">PDF</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isLoading || !validateInputs()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
