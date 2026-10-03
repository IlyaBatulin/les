"use client"
import { useMemo } from "react"
import { createLumberPriceCalculation } from "@/lib/lumber-pricing"
export function useLumberPriceCalculation() {
  return useMemo(createLumberPriceCalculation, [])
}
