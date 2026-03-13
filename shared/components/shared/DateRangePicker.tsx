"use client"

import * as React from "react"
import { CalendarBlank } from "@phosphor-icons/react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { cn } from "../../lib/utils"
import type { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Pilih rentang tanggal",
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarBlank className="mr-2 size-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd MMM yyyy", { locale: id })} -{" "}
                {format(value.to, "dd MMM yyyy", { locale: id })}
              </>
            ) : (
              format(value.from, "dd MMM yyyy", { locale: id })
            )
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          locale={id}
        />
      </PopoverContent>
    </Popover>
  )
}
