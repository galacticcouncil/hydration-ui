import { SizeProps } from "common/styles"
import { FC } from "react"
import { StyledInput } from "./Input.styled"

type InputProps = {} & SizeProps

export const Input: FC<InputProps> = p => <StyledInput {...p} />
