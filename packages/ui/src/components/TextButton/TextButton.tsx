import { FC, Ref } from "react"

import { ChevronRight } from "@/assets/icons"
import { MoveUpRight } from "@/assets/icons"
import { Icon } from "@/components/Icon"

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
    return <Icon component={ChevronRight} size="xs" />

  if (direction === "external")
    return <Icon component={MoveUpRight} size="xs" />

  return null
}

export const TextButton: FC<
  TextButtonProps & { ref?: Ref<HTMLButtonElement> }
> = ({ direction = "none", ref, ...props }) => (
  <STextButton ref={ref} type="button" {...props}>
    {props.children}
    <TextButtonIcon direction={direction} />
  </STextButton>
)

export type LinkTextButtonProps = React.ComponentPropsWithoutRef<"a"> &
  CustomTextButtonProps

export const LinkTextButton: FC<
  LinkTextButtonProps & { ref?: Ref<HTMLAnchorElement> }
> = ({ direction = "external", variant = "plain", ref, ...props }) => (
  <SLinkTextButton
    ref={ref}
    target="_blank"
    rel="noreferrer"
    direction={direction}
    variant={variant}
    {...props}
  >
    {props.children}
    <TextButtonIcon direction={direction} />
  </SLinkTextButton>
)
