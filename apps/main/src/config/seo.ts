/* eslint-disable no-restricted-imports */
import { HtmlTagDescriptor } from "vite"

import common from "../i18n/locales/en/common.json"

const title = common["meta.title"]
const description = common["meta.description"]
const image = "https://hydration.net/twitter-image.png"
const url = "https://app.hydration.net"

export const SEO_CONFIG: HtmlTagDescriptor[] = [
  {
    injectTo: "head",
    tag: "title",
    children: title,
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "description",
      content: description,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "og:type",
      content: "website",
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "og:url",
      content: url,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "og:title",
      content: title,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "og:description",
      content: description,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "og:image",
      content: image,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "twitter:card",
      content: "summary_large_image",
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "twitter:url",
      content: url,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "twitter:title",
      content: title,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "twitter:description",
      content: description,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "twitter:image",
      content: image,
    },
  },
  {
    injectTo: "head",
    tag: "meta",
    attrs: {
      name: "twitter:site:id",
      content: "hydration_net",
    },
  },
  {
    injectTo: "head",
    tag: "link",
    attrs: {
      rel: "icon",
      href: "/favicon/favicon.ico",
    },
  },
  {
    injectTo: "head",
    tag: "link",
    attrs: {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/favicon/apple-touch-icon.png",
    },
  },
  {
    injectTo: "head",
    tag: "link",
    attrs: {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon/favicon-32x32.png",
    },
  },
  {
    injectTo: "head",
    tag: "link",
    attrs: {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon/favicon-16x16.png",
    },
  },
  {
    injectTo: "head",
    tag: "link",
    attrs: {
      rel: "manifest",
      href: "/favicon/manifest.json",
    },
  },
]
