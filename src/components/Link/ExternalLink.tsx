import { ComponentProps, FC, PropsWithChildren } from "react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { SExternalLink, SExternalLinkAdornment } from "./ExternalLink.styled"

const ExternalLinkAdornment = () => (
  <SExternalLinkAdornment>
    <LinkIcon />
    &nbsp; &nbsp;
  </SExternalLinkAdornment>
)

type Props = { href?: string; withArrow?: boolean } & ComponentProps<
  typeof SExternalLink
>

export const ExternalLink: FC<PropsWithChildren<Props>> = ({
  href,
  className,
  children,
  onClick,
  withArrow = false,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}) => {
  return (
    <SExternalLink
      href={href}
      className={className}
      onClick={onClick}
      target={target}
      rel={rel}
      {...props}
    >
      {children} {withArrow && <ExternalLinkAdornment />}
    </SExternalLink>
  )
}
