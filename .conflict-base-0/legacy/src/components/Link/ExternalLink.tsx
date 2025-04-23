import { ComponentProps, FC, PropsWithChildren } from "react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { SExternalLink, SExternalLinkAdornment } from "./ExternalLink.styled"

const ExternalLinkAdornment = () => (
  <SExternalLinkAdornment>
    <LinkIcon />
    &nbsp; &nbsp;
  </SExternalLinkAdornment>
)

type Props = { href?: string } & ComponentProps<typeof SExternalLink>

export const ExternalLink: FC<PropsWithChildren<Props>> = ({
  href,
  className,
  children,
  onClick,
}) => {
  return (
    <SExternalLink href={href} className={className} onClick={onClick}>
      {children} <ExternalLinkAdornment />
    </SExternalLink>
  )
}
