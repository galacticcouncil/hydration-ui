import React, { FC, ReactNode } from "react"
import { SBackdrop } from "./Backdrop.styled"

type BackdropProps = {
  onClick?: () => void
  variant?: "default" | "success" | "error"
  children?: ReactNode
}

export const Backdrop: FC<BackdropProps> = (p) => <SBackdrop {...p} />
