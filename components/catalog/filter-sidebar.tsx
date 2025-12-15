"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FilterOptions } from "@/lib/types"
import { createClientSupabaseClient } from "@/lib/supabase"

interface FilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void
  initialFilters: FilterOptions
}

export default function FilterSidebar({ onFilterChange, initialFilters }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as { id: string; name: string }[],
    woodTypes: [] as string[],
    thicknesses: [] as string[],
    widths: [] as string[],
    lengths: [] as string[],
    grades: [] as string[],
    moistures: [] as string[],
    surfaceTreatments: [] as string[],
    purposes: [] as string[],
  })

  useEffect(() => {
    const fetchFilterOptions = async () => {
      const supabase = createClientSupabaseClient()

      // Fetch categories
      const { data: categories } = await supabase.from("categories").select("id, name").order("name")

      // Fetch distinct values for each filter field
      const { data: woodTypes } = await supabase
        .from("products")
        .select("wood_type")
        .not("wood_type", "is", null)
        .order("wood_type")

      const { data: thicknesses } = await supabase
        .from("products")
        .select("thickness")
        .not("thickness", "is", null)
        .order("thickness")

      const { data: widths } = await supabase.from("products").select("width").not("width", "is", null).order("width")

      const { data: lengths } = await supabase
        .from("products")
        .select("length")
        .not("length", "is", null)
        .order("length")

      const { data: grades } = await supabase.from("products").select("grade").not("grade", "is", null).order("grade")

      const { data: moistures } = await supabase
        .from("products")
        .select("moisture")
        .not("moisture", "is", null)
        .order("moisture")

      const { data: surfaceTreatments } = await supabase
        .from("products")
        .select("surface_treatment")
        .not("surface_treatment", "is", null)
        .order("surface_treatment")

      const { data: purposes } = await supabase
        .from("products")
        .select("purpose")
        .not("purpose", "is", null)
        .order("purpose")

      setFilterOptions({
        categories: categories?.map((cat) => ({ id: cat.id.toString(), name: cat.name })) || [],
        woodTypes: [...new Set(woodTypes?.map((item) => item.wood_type) || [])],
        thicknesses: [...new Set(thicknesses?.map((item) => item.thickness) || [])],
        widths: [...new Set(widths?.map((item) => item.width) || [])],
        lengths: [...new Set(lengths?.map((item) => item.length) || [])],
        grades: [...new Set(grades?.map((item) => item.grade) || [])],
        moistures: [...new Set(moistures?.map((item) => item.moisture) || [])],
        surfaceTreatments: [...new Set(surfaceTreatments?.map((item) => item.surface_treatment) || [])],
        purposes: [...new Set(purposes?.map((item) => item.purpose) || [])],
      })
    }

    fetchFilterOptions()
  }, [])

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter((item) => item !== value)
      } else {
        newFilters[filterType] = [...newFilters[filterType], value]
      }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      categories: [],
      woodTypes: [],
      thicknesses: [],
      widths: [],
      lengths: [],
      grades: [],
      moistures: [],
      surfaceTreatments: [],
      purposes: [],
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm text-gray-500">
          Сбросить
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {filterOptions.categories.length > 0 && (
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-medium py-2">Категории</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => handleFilterChange("categories", category.id)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.woodTypes.length > 0 && (
          <AccordionItem value="woodTypes">
            <AccordionTrigger className="text-sm font-medium py-2">Тип древесины</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.woodTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`woodType-${type}`}
                      checked={filters.woodTypes.includes(type)}
                      onCheckedChange={() => handleFilterChange("woodTypes", type)}
                    />
                    <Label htmlFor={`woodType-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.thicknesses.length > 0 && (
          <AccordionItem value="thicknesses">
            <AccordionTrigger className="text-sm font-medium py-2">Толщина</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.thicknesses.map((thickness) => (
                  <div key={thickness} className="flex items-center space-x-2">
                    <Checkbox
                      id={`thickness-${thickness}`}
                      checked={filters.thicknesses.includes(thickness)}
                      onCheckedChange={() => handleFilterChange("thicknesses", thickness)}
                    />
                    <Label htmlFor={`thickness-${thickness}`} className="text-sm">
                      {thickness}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.widths.length > 0 && (
          <AccordionItem value="widths">
            <AccordionTrigger className="text-sm font-medium py-2">Ширина</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.widths.map((width) => (
                  <div key={width} className="flex items-center space-x-2">
                    <Checkbox
                      id={`width-${width}`}
                      checked={filters.widths.includes(width)}
                      onCheckedChange={() => handleFilterChange("widths", width)}
                    />
                    <Label htmlFor={`width-${width}`} className="text-sm">
                      {width}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.lengths.length > 0 && (
          <AccordionItem value="lengths">
            <AccordionTrigger className="text-sm font-medium py-2">Длина</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.lengths.map((length) => (
                  <div key={length} className="flex items-center space-x-2">
                    <Checkbox
                      id={`length-${length}`}
                      checked={filters.lengths.includes(length)}
                      onCheckedChange={() => handleFilterChange("lengths", length)}
                    />
                    <Label htmlFor={`length-${length}`} className="text-sm">
                      {length}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.grades.length > 0 && (
          <AccordionItem value="grades">
            <AccordionTrigger className="text-sm font-medium py-2">Сорт</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.grades.map((grade) => (
                  <div key={grade} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grade-${grade}`}
                      checked={filters.grades.includes(grade)}
                      onCheckedChange={() => handleFilterChange("grades", grade)}
                    />
                    <Label htmlFor={`grade-${grade}`} className="text-sm">
                      {grade}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.moistures.length > 0 && (
          <AccordionItem value="moistures">
            <AccordionTrigger className="text-sm font-medium py-2">Влажность</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.moistures.map((moisture) => (
                  <div key={moisture} className="flex items-center space-x-2">
                    <Checkbox
                      id={`moisture-${moisture}`}
                      checked={filters.moistures.includes(moisture)}
                      onCheckedChange={() => handleFilterChange("moistures", moisture)}
                    />
                    <Label htmlFor={`moisture-${moisture}`} className="text-sm">
                      {moisture}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.surfaceTreatments.length > 0 && (
          <AccordionItem value="surfaceTreatments">
            <AccordionTrigger className="text-sm font-medium py-2">Обработка поверхности</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.surfaceTreatments.map((treatment) => (
                  <div key={treatment} className="flex items-center space-x-2">
                    <Checkbox
                      id={`treatment-${treatment}`}
                      checked={filters.surfaceTreatments.includes(treatment)}
                      onCheckedChange={() => handleFilterChange("surfaceTreatments", treatment)}
                    />
                    <Label htmlFor={`treatment-${treatment}`} className="text-sm">
                      {treatment}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterOptions.purposes.length > 0 && (
          <AccordionItem value="purposes">
            <AccordionTrigger className="text-sm font-medium py-2">Назначение</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {filterOptions.purposes.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-2">
                    <Checkbox
                      id={`purpose-${purpose}`}
                      checked={filters.purposes.includes(purpose)}
                      onCheckedChange={() => handleFilterChange("purposes", purpose)}
                    />
                    <Label htmlFor={`purpose-${purpose}`} className="text-sm">
                      {purpose}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}
