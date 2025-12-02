"use client"

import { Suspense } from "react"
import HomeInner from "./home-inner"

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeInner />
    </Suspense>
  )
}


