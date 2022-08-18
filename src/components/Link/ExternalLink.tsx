import { ReactNode } from "react"
import { ColorProps } from "common/styles"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import {
  StyledExternalLink,
  StyledExternalLinkAdornment,
} from "./ExternalLink.styled"

const ExternalLinkAdornment = () => (
  <StyledExternalLinkAdornment>
    <LinkIcon />
    &nbsp; &nbsp;
  </StyledExternalLinkAdornment>
)

export function ExternalLink(
  props: { href: string; children?: ReactNode } & ColorProps,
) {
  return (
    <StyledExternalLink href={props.href} color={props.color} bg={props.bg}>
      {props.children} <ExternalLinkAdornment />
    </StyledExternalLink>
  )
}
