import { MoveUpRight } from "@galacticcouncil/ui/assets/icons"
import {
  ExternalLink,
  Icon,
  Prose,
  ProseProps,
} from "@galacticcouncil/ui/components"
import { MDXProvider } from "@mdx-js/react"
import { Link } from "@tanstack/react-router"
import { lazy, Suspense, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { mdx } from "@/i18n/content"

export type MarkdownProps = ProseProps & {
  id: string
  values?: Record<string, string | number>
}

export const Markdown: React.FC<MarkdownProps> = ({ id, values, ...props }) => {
  const { i18n } = useTranslation()
  const locale = i18n.language

  const Mdx = useMemo(() => {
    const key = `./${id}/${locale}.mdx`
    const loader = mdx[key]
    if (!loader) return null
    return lazy(loader)
  }, [id, locale])

  if (!Mdx) return null

  return (
    <Suspense>
      <Prose {...props}>
        <MDXProvider
          components={{
            a: ({ href, children, ...rest }) =>
              href?.startsWith("http") ? (
                <ExternalLink href={href} {...rest}>
                  {children}
                  <Icon component={MoveUpRight} size="1em" ml="xs" />
                </ExternalLink>
              ) : (
                <Link to={href} {...rest}>
                  {children}
                </Link>
              ),
          }}
        >
          <Mdx {...values} />
        </MDXProvider>
      </Prose>
    </Suspense>
  )
}
