import { AnchorHTMLAttributes, forwardRef } from "react"

export const ExternalLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  return <a target="_blank" rel="noopener noreferrer" ref={ref} {...props} />
})
