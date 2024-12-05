"use client"

import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors
        ${variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
        ${variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
        ${variant === "outline" ? "border border-input hover:bg-accent hover:text-accent-foreground" : ""}
        ${variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" : ""}
        ${size === "default" ? "h-10 px-4 py-2" : ""}
        ${size === "sm" ? "h-9 rounded-md px-3" : ""}
        ${size === "lg" ? "h-11 rounded-md px-8" : ""}`}
      {...props}
    />
  )
)
Button.displayName = "Button"

export { Button }