import React, { FC, ReactNode } from "react"
import { StyledBackdrop } from "./Backdrop.styled"

type BackdropProps = {
  onClick?: () => void
  children?: ReactNode
}

export const Backdrop: FC<BackdropProps> = (p) => <StyledBackdrop {...p} />
