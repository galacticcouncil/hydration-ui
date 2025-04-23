import { FC } from "react"
import { SWavySeparator } from "./WavySeparator.styled"

export type Props = {
  className?: string
}

export const WavySeparator: FC<Props> = ({ className }) => {
  return <SWavySeparator className={className} aria-hidden />
}
