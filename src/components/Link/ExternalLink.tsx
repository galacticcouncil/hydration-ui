import { ReactNode } from "react"
import { ColorProps } from "utils/styles"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { SExternalLink, SExternalLinkAdornment } from "./ExternalLink.styled"

const ExternalLinkAdornment = () => (
  <SExternalLinkAdornment>
    <LinkIcon />
    &nbsp; &nbsp;
  </SExternalLinkAdornment>
)

export function ExternalLink(
  props: { href: string; children?: ReactNode } & ColorProps,
) {
  return (
    <SExternalLink href={props.href} color={props.color} bg={props.bg}>
      {props.children} <ExternalLinkAdornment />
    </SExternalLink>
  )
}
