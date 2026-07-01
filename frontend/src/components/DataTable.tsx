import { useMemo, useState, type ReactNode } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { cn } from '../lib/utils'

export interface ColumnDefinition<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  className?: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: ColumnDefinition<T>[]
  data: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
}

export function DataTable<T>({ columns, data, rowKey, emptyMessage = 'No data available.' }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data
    }

    return [...data].sort((left, right) => {
      const leftValue = left[sortKey as keyof T]
      const rightValue = right[sortKey as keyof T]
      const normalizedLeft = String(leftValue ?? '').toLowerCase()
      const normalizedRight = String(rightValue ?? '').toLowerCase()
      const comparison = normalizedLeft.localeCompare(normalizedRight, undefined, { numeric: true })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortDirection, sortKey])

  const handleSort = (column: ColumnDefinition<T>) => {
    if (!column.sortable) {
      return
    }

    const nextKey = String(column.key)
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDirection('asc')
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-cyber-border bg-cyber-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-cyber-border text-left text-sm text-cyber-text-secondary">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-cyan-300">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-2',
                      column.sortable ? 'cursor-pointer hover:text-cyan-200' : 'cursor-default',
                    )}
                    onClick={() => handleSort(column)}
                  >
                    {column.label}
                    {column.sortable ? <ArrowUpDown className="h-3.5 w-3.5" /> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/70">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-cyber-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-white/5">
                  {columns.map((column) => (
                    <td key={String(column.key)} className={cn('px-4 py-3 align-top', column.className)}>
                      {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
