import { ReactNode } from "react"
import {
  SBlockContent,
  SLinkText,
  SBlockLink,
  SBlockDescription,
  SLinkContent,
} from "./BlockContent.styled"
import { Link } from "components/Link/Link"
import ChevronRight from "assets/icons/ChevronRight.svg?react"

type Props = {
  title: ReactNode
  description: string
  link: string
  linkText: string
  onLinkClick?: () => void
}

export const BlockContent = ({
  title,
  description,
  linkText,
  link,
  onLinkClick,
}: Props) => {
  const linkContentElement = (
    <SLinkContent>
      <SLinkText fw={400} fs={14} color="brightBlue300">
        {linkText}
      </SLinkText>
      <ChevronRight sx={{ color: "brightBlue300" }} />
    </SLinkContent>
  )

  return (
    <SBlockContent>
      <div>{title}</div>
      <SBlockLink>
        {link.includes("http") ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer noopener"
            onClick={onLinkClick}
          >
            {linkContentElement}
          </a>
        ) : (
          <Link to={link} onClick={onLinkClick}>
            {linkContentElement}
          </Link>
        )}
      </SBlockLink>
      <SBlockDescription fw={400} color="basic400" lh={20}>
        {description}
      </SBlockDescription>
    </SBlockContent>
  )
}
