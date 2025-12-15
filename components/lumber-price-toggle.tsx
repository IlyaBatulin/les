"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PriceUnit = "piece" | "cubic"

interface LumberPriceToggleProps {
  /** Текущая выбранная единица измерения */
  selectedUnit: PriceUnit
  /** Callback при изменении единицы измерения */
  onUnitChange: (unit: PriceUnit) => void
  /** Дополнительные CSS классы */
  className?: string
  /** Размер переключателя */
  size?: "sm" | "md" | "lg"
}

/**
 * Переключатель между ценой за штуку и за кубический метр для пиломатериалов
 */
export function LumberPriceToggle({
  selectedUnit,
  onUnitChange,
  className,
  size = "sm"
}: LumberPriceToggleProps) {
  const handleUnitChange = useCallback((unit: PriceUnit) => {
    if (unit !== selectedUnit) {
      onUnitChange(unit)
    }
  }, [selectedUnit, onUnitChange])

  const buttonSizeClasses = {
    sm: "h-7 px-2 text-xs",
    md: "h-8 px-3 text-sm", 
    lg: "h-9 px-4 text-sm"
  }

  const containerSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <div className={cn("inline-flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5", containerSizeClasses[size], className)}>
      <Button
        variant={selectedUnit === "piece" ? "default" : "ghost"}
        size="sm"
        className={cn(
          "transition-all duration-200",
          buttonSizeClasses[size],
          selectedUnit === "piece" 
            ? "bg-white shadow-sm hover:bg-gray-50" 
            : "bg-transparent hover:bg-gray-200 text-gray-600"
        )}
        onClick={() => handleUnitChange("piece")}
      >
        за шт
      </Button>
      <Button
        variant={selectedUnit === "cubic" ? "default" : "ghost"}
        size="sm"
        className={cn(
          "transition-all duration-200",
          buttonSizeClasses[size],
          selectedUnit === "cubic" 
            ? "bg-white shadow-sm hover:bg-gray-50" 
            : "bg-transparent hover:bg-gray-200 text-gray-600"
        )}
        onClick={() => handleUnitChange("cubic")}
      >
        за м³
      </Button>
    </div>
  )
}

/**
 * Хук для управления состоянием переключателя цены
 */
export function useLumberPriceToggle(initialUnit: PriceUnit = "piece") {
  const [priceUnit, setPriceUnit] = useState<PriceUnit>(initialUnit)

  const handleUnitChange = useCallback((unit: PriceUnit) => {
    setPriceUnit(unit)
  }, [])

  return {
    priceUnit,
    setPriceUnit,
    handleUnitChange
  }
}
