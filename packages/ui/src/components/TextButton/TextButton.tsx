import { forwardRef } from "react"

import { ChevronRight, MoveUpRight } from "@/assets/icons/index"

import {
  CustomTextButtonProps,
  SLinkTextButton,
  STextButton,
} from "./TextButton.styled"

export type TextButtonProps = React.ComponentPropsWithoutRef<"p"> &
  CustomTextButtonProps

export const TextButton = forwardRef<HTMLParagraphElement, TextButtonProps>(
  ({ direction = "internal", withArrow = false, ...props }, ref) => (
    <STextButton
      ref={ref}
      direction={direction}
      withArrow={withArrow}
      {...props}
    >
      {props.children}
      {withArrow && direction === "internal" ? (
        <ChevronRight size={10} strokeWidth={3} />
      ) : (
        <MoveUpRight size={10} strokeWidth={3} />
      )}
    </STextButton>
  ),
)

TextButton.displayName = "TextButton"

export type LinkTextButtonProps = React.ComponentPropsWithoutRef<"a"> &
  CustomTextButtonProps

export const LinkTextButton = forwardRef<
  HTMLAnchorElement,
  LinkTextButtonProps
>((props, ref) => <SLinkTextButton ref={ref} {...props} />)

LinkTextButton.displayName = "LinkButton"
