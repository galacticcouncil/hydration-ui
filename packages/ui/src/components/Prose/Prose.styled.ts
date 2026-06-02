import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { createVariants } from "@/utils"

export type ProseSize = "small" | "medium" | "large"

export type ProseStyleProps = {
  muted?: boolean
  size?: ProseSize
}

const sizeVariants = createVariants<ProseSize>((theme) => ({
  small: css`
    font-size: ${theme.fontSizes.p5};
    line-height: 1.4;
  `,
  medium: css`
    font-size: ${theme.fontSizes.p3};
    line-height: 1.6;
  `,
  large: css`
    font-size: ${theme.fontSizes.p1};
    line-height: 1.8;
  `,
}))

export const SProse = styled(Box)<ProseStyleProps>(
  ({ theme, muted, size = "medium" }) => [
    sizeVariants(size),
    css`
      color: ${muted ? theme.text.medium : "currentColor"};

      & > * + * {
        margin-top: 1rem;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: ${theme.text.high};
        font-weight: 600;
        line-height: 1.25;
        text-wrap: balance;
      }

      h1,
      h2,
      h3 {
        font-family: ${theme.fontFamilies1.primary};
      }

      & > h1 + *,
      & > h2 + *,
      & > h3 + *,
      & > h4 + *,
      & > h5 + *,
      & > h6 + * {
        margin-top: 0.5em;
      }

      & > * + h1,
      & > * + h2,
      & > * + h3,
      & > * + h4,
      & > * + h5,
      & > * + h6 {
        margin-top: 1.5em;
      }

      h1 {
        font-size: 1.75em;
      }

      h2 {
        font-size: 1.375em;
      }

      h3 {
        font-size: 1.125em;
      }

      h4 {
        font-size: 1em;
      }

      h5 {
        font-size: 0.875em;
      }

      h6 {
        font-size: 0.75em;
      }

      p {
        font-size: 1em;
        text-wrap: pretty;
      }

      a {
        color: currentColor;
        text-decoration: underline;
        text-underline-offset: 0.15em;
        color: ${theme.text.tint.secondary};
        & > * {
          vertical-align: middle;
        }
      }

      & a:hover {
        opacity: 0.8;
      }

      strong {
        font-weight: 600;
        color: ${theme.text.high};
      }

      em {
        font-style: italic;
      }

      ul,
      ol {
        padding-left: 1.5em;
      }

      ul {
        list-style: disc;
      }

      ol {
        list-style: decimal;
      }

      li + li {
        margin-top: 0.25em;
      }

      figcaption {
        font-size: 0.875em;
        font-style: italic;
        text-align: center;
        margin-top: 0.5em;
      }

      pre {
        padding: ${theme.space.s} ${theme.space.m};
        border-radius: ${theme.radii.m};
        background-color: ${theme.surfaces.containers.high.hover};
        overflow-x: auto;
      }

      code {
        font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
        font-size: ${theme.fontSizes.p3};
      }

      hr {
        height: 1px;
        color: ${theme.details.separators};
        background: ${theme.details.separators};
        border: 0;
        margin: ${theme.space.l} 0;
      }

      blockquote {
        margin-left: 0;
        padding-left: 1em;
        border-left: 2px solid currentColor;
        opacity: 0.85;
        font-style: italic;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: ${theme.fontSizes.p5};
      }

      thead {
        border-bottom: 2px solid ${theme.details.borders};
      }

      tbody tr + tr {
        border-top: 1px solid ${theme.details.borders};
      }

      th,
      td {
        padding: ${theme.space.s};
        text-align: left;
        vertical-align: top;
      }

      th {
        font-weight: 600;
      }
    `,
  ],
)
