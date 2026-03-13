"use client"

import { cn } from "../../lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  /** #293 — Optional breadcrumb trail above the page title */
  breadcrumbs?: BreadcrumbItem[]
}

export function PageHeader({ title, description, action, className, breadcrumbs }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 pb-1", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <li key={item.href ?? item.label} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">/</span>}
                {item.href && index < breadcrumbs.length - 1 ? (
                  <a href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span aria-current={index === breadcrumbs.length - 1 ? "page" : undefined} className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="mt-3 shrink-0 sm:mt-0">{action}</div>}
      </div>
    </div>
  )
}
