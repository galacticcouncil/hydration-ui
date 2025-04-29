import React, { FC, ReactNode } from "react"
import { SBackdrop } from "./Backdrop.styled"

export type BackdropVariant = "default" | "error" | "success"

type BackdropProps = {
  onClick?: () => void
  variant?: BackdropVariant
  children?: ReactNode
}

export const Backdrop: FC<BackdropProps> = ({ variant = "default", ...p }) => (
  <SBackdrop variant={variant} {...p} />
)
