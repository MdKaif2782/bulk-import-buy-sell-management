"use client"

import { Suspense } from "react"
import ReportsPageInner from "./reports-page-inner"

export default function ReportsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsPageInner />
    </Suspense>
  )
}