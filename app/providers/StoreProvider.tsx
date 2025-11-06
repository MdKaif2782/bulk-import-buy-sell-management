'use client'

import {  useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../../lib/store'
import { hydrateAuth } from '../../lib/store/slices/authSlice'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(makeStore())

  useEffect(() => {
    // Hydrate auth state from localStorage after component mounts
    if (storeRef.current) {
      storeRef.current.dispatch(hydrateAuth())
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}