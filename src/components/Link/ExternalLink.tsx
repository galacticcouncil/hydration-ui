import { FC, PropsWithChildren } from "react"
import { ColorProps } from "utils/styles"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { SExternalLink, SExternalLinkAdornment } from "./ExternalLink.styled"

const ExternalLinkAdornment = () => (
  <SExternalLinkAdornment>
    <LinkIcon />
    &nbsp; &nbsp;
  </SExternalLinkAdornment>
)

type Props = { href: string } & ColorProps

export const ExternalLink: FC<PropsWithChildren<Props>> = ({
  href,
  color,
  bg,
  children,
}) => {
  return (
    <SExternalLink href={href} color={color} bg={bg}>
      {children} <ExternalLinkAdornment />
    </SExternalLink>
  )
}
