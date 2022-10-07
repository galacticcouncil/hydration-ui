import { ComponentProps, FC, PropsWithChildren } from "react"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { SExternalLink, SExternalLinkAdornment } from "./ExternalLink.styled"

const ExternalLinkAdornment = () => (
  <SExternalLinkAdornment>
    <LinkIcon />
    &nbsp; &nbsp;
  </SExternalLinkAdornment>
)

type Props = { href: string } & ComponentProps<typeof SExternalLink>

export const ExternalLink: FC<PropsWithChildren<Props>> = ({
  href,
  className,
  children,
}) => {
  return (
    <SExternalLink href={href} className={className}>
      {children} <ExternalLinkAdornment />
    </SExternalLink>
  )
}
