import {
  Dropdown,
  DropdownProps,
  DropdownTriggerContent,
  DropdownTriggerContentProps,
  TDropdownItem,
} from "components/Dropdown/DropdownRebranded"
import CheckMark from "assets/icons/CheckMark.svg?react"
import { Icon } from "components/Icon/Icon"
import { theme } from "theme"
import { createContext, useContext } from "react"
import { useTranslation } from "react-i18next"

const DROPDOWN_MULTI_ALL_ITEM_KEY = "all"

type ContextType<TKey extends string> = {
  readonly selectedKeys: ReadonlyArray<TKey>
  readonly items: ReadonlyArray<TDropdownItem<TKey>>
  readonly areAllItemsSelected: boolean
}

const Context = createContext<ContextType<string> | null>(null)

type DropdownMultiProps<TKey extends string> = Omit<
  DropdownProps<TKey>,
  "onSelect"
> & {
  readonly selectedKeys: ReadonlyArray<TKey>
  readonly withAllOption?: boolean
  readonly onSelect: (keys: ReadonlyArray<TKey>) => void
}

export const DropdownMulti = <TKey extends string = string>({
  children,
  items,
  selectedKeys,
  withAllOption,
  onSelect,
  ...props
}: DropdownMultiProps<TKey>) => {
  const { t } = useTranslation()
  const allItemKeys = items.map((item) => item.key)
  const areAllItemsSelected = selectedKeys.length >= allItemKeys.length

  const allItem = {
    key: DROPDOWN_MULTI_ALL_ITEM_KEY as TKey,
    label: t("all"),
  } satisfies TDropdownItem

  return (
    <Context.Provider
      value={{
        items,
        selectedKeys,
        areAllItemsSelected,
      }}
    >
      <Dropdown
        items={withAllOption ? [allItem, ...items] : items}
        closeOnSelect={false}
        fullWidth
        onSelect={(item) => {
          if (item.key === DROPDOWN_MULTI_ALL_ITEM_KEY) {
            return onSelect(areAllItemsSelected ? [] : allItemKeys)
          }

          if (areAllItemsSelected) {
            return onSelect([item.key])
          }

          onSelect(
            selectedKeys.includes(item.key)
              ? selectedKeys.filter((filter) => filter !== item.key)
              : [...selectedKeys, item.key],
          )
        }}
        renderTrail={(item) => {
          if (!withAllOption && !selectedKeys.includes(item.key)) {
            return null
          }

          if (
            withAllOption &&
            areAllItemsSelected &&
            item.key !== DROPDOWN_MULTI_ALL_ITEM_KEY
          ) {
            return null
          }

          if (
            withAllOption &&
            !areAllItemsSelected &&
            !selectedKeys.includes(item.key)
          ) {
            return null
          }

          return (
            <Icon
              icon={<CheckMark />}
              size={12}
              sx={{ ml: "auto" }}
              css={{
                "& svg": { color: theme.colors.brightBlue300 },
              }}
            />
          )
        }}
        {...props}
      >
        {children}
      </Dropdown>
    </Context.Provider>
  )
}

type DropdownMultiTriggerProps = Omit<DropdownTriggerContentProps, "value">

export const DropdownMultiTrigger = (props: DropdownMultiTriggerProps) => {
  const { t } = useTranslation()
  const context = useContext(Context)

  if (!context) {
    throw new Error(
      "DropdownMultiTrigger cannot be used without DropdownMulti parent component.",
    )
  }

  const { items, selectedKeys, areAllItemsSelected } = context

  const value = ((): string => {
    if (areAllItemsSelected) {
      return t("all")
    }

    const selectedLabels = items
      .filter((item) => selectedKeys.includes(item.key))
      .map((item) => item.label)

    const label = selectedLabels.slice(0, 2).join(", ")
    const trail =
      selectedLabels.length > 2 ? `, ...(+${selectedLabels.length - 2})` : ""

    return `${label}${trail}`
  })()

  return <DropdownTriggerContent value={value} {...props} />
}
