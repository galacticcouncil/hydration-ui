import { forwardRef } from "react"

import { ChevronRight } from "@/assets/icons"
import { MoveUpRight } from "@/assets/icons"

import {
  CustomTextButtonProps,
  SLinkTextButton,
  STextButton,
} from "./TextButton.styled"

export type TextButtonProps = React.ComponentPropsWithoutRef<"button"> &
  CustomTextButtonProps

const TextButtonIcon = ({
  direction,
}: {
  direction: TextButtonProps["direction"]
}) => {
  if (direction === "internal")
    return <ChevronRight size={10} strokeWidth={3} />

  if (direction === "external") return <MoveUpRight size={10} strokeWidth={3} />

  return null
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ direction = "none", ...props }, ref) => (
    <STextButton ref={ref} type="button" {...props}>
      {props.children}
      <TextButtonIcon direction={direction} />
    </STextButton>
  ),
)

TextButton.displayName = "TextButton"

export type LinkTextButtonProps = React.ComponentPropsWithoutRef<"a"> &
  Omit<CustomTextButtonProps, "variant" | "direction">

export const LinkTextButton = forwardRef<
  HTMLAnchorElement,
  LinkTextButtonProps
>((props, ref) => (
  <SLinkTextButton
    ref={ref}
    target="_blank"
    rel="noreferrer"
    direction="external"
    {...props}
  >
    {props.children}
    <TextButtonIcon direction="external" />
  </SLinkTextButton>
))

LinkTextButton.displayName = "LinkButton"
