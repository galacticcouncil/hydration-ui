import { forwardRef } from "react"

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
      {withArrow && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="24"
          viewBox="0 0 25 24"
          fill="none"
        >
          <path
            d="M8.03906 10.5L12.0443 13.5L16.0496 10.5"
            stroke="#BDCCD4"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
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
