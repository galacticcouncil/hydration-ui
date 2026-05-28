import type { ComponentType } from "react"

type MdxModule = { default: ComponentType }
export const mdx = import.meta.glob<MdxModule>("./**/*.mdx")
