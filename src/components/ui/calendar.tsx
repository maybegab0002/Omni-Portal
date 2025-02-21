import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface CalendarProps {
  mode?: 'single'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: (date: Date) => boolean
  fromDate?: Date
  toDate?: Date
  showOutsideDays?: boolean
  classNames?: {
    months?: string
    month?: string
    caption?: string
    [key: string]: string | undefined
  }
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  className,
  fromDate = new Date(2017, 0, 1),
  toDate = new Date(2035, 11, 31),
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from(
    { length: toDate.getFullYear() - fromDate.getFullYear() + 1 },
    (_, i) => fromDate.getFullYear() + i
  )

  const handleMonthChange = (value: string) => {
    const monthIndex = months.indexOf(value)
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex))
  }

  const handleYearChange = (value: string) => {
    setCurrentMonth(new Date(parseInt(value), currentMonth.getMonth()))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    if (!selected) return false
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date)
    }
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between space-x-2 pb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex space-x-2">
          <Select
            value={months[currentMonth.getMonth()]}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentMonth.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            index + 1
          )
          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors",
                isSelected(date)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : isToday(date)
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "hover:bg-gray-100",
                hoveredDate === date && !isSelected(date) && "bg-gray-100"
              )}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
