import { AnchorHTMLAttributes, FC, Ref } from "react"

import { SLink } from "@/components/ExternalLink/ExternalLink.styled"

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  underlined?: boolean
  readonly ref?: Ref<HTMLAnchorElement>
}

export const ExternalLink: FC<ExternalLinkProps> = ({
  underlined = true,
  ...props
}) => {
  return (
    <SLink
      target="_blank"
      rel="noopener noreferrer"
      underlined={underlined}
      ref={props.ref}
      {...props}
    />
  )
}
