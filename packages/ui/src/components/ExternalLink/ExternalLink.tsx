import { AnchorHTMLAttributes, FC, Ref } from "react"

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  readonly ref?: Ref<HTMLAnchorElement>
}

export const ExternalLink: FC<ExternalLinkProps> = (props) => {
  return (
    <a target="_blank" rel="noopener noreferrer" ref={props.ref} {...props} />
  )
}
