import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  title: string
  description?: string
  data: T[]
  columns: Column<T>[]
  actions?: (item: T) => React.ReactNode
  emptyState?: React.ReactNode
}

export function DataTable<T extends Record<string, any>>({
  title,
  description,
  data,
  columns,
  actions,
  emptyState,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{emptyState}</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                {columns.map((column) => (
                  <div key={String(column.key)}>
                    <p className="text-sm font-medium text-muted-foreground">{column.label}</p>
                    <div className="mt-1">
                      {column.render ? (
                        column.render(item[column.key], item)
                      ) : (
                        <span className="text-sm">{item[column.key]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {actions && <div className="ml-4">{actions(item)}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
