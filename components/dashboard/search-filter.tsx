"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filters?: Array<{
    key: string
    label: string
    active: boolean
    onClick: () => void
  }>
  placeholder?: string
}

export function SearchFilter({ searchTerm, onSearchChange, filters, placeholder = "Search..." }: SearchFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {filters && filters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant={filter.active ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80"
              onClick={filter.onClick}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
