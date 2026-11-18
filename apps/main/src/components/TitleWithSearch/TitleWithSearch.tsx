import {
  Flex,
  SearchInput,
  SearchInputProps,
  SectionHeader,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ComponentProps, FC, ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"

type SectionHeaderProps = ComponentProps<typeof SectionHeader>

type Props = Omit<SearchInputProps, "width"> &
  (
    | (Pick<SectionHeaderProps, "title" | "as" | "noTopPadding"> & {
        filters?: never
      })
    | {
        filters: ReactNode
        title?: never
        as?: never
        noTopPadding?: never
      }
  )

export const TitleWithSearch: FC<Props> = ({
  title,
  filters,
  as,
  noTopPadding,
  onFocus,
  onBlur,
  placeholder,
  ...props
}) => {
  const { t } = useTranslation()
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useBreakpoints()

  const isOpen = isFocused || !!props.value
  const isCollapsed = isMobile && !isOpen
  const isLeadHidden = isMobile && isOpen

  const search = (
    <SearchInput
      {...props}
      placeholder={isCollapsed ? t("search.placeholder.compact") : placeholder}
      width={[isOpen ? "100%" : "3xl", "4xl"]}
      onFocus={(e) => {
        setIsFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        onBlur?.(e)
      }}
    />
  )

  if (filters !== undefined) {
    return (
      <Flex
        justify={isLeadHidden ? "flex-end" : "space-between"}
        align="center"
        gap="xl"
      >
        {!isLeadHidden && filters}
        {search}
      </Flex>
    )
  }

  return (
    <SectionHeader
      as={as}
      noTopPadding={noTopPadding}
      title={isLeadHidden ? "" : (title ?? "")}
      actions={search}
    />
  )
}
