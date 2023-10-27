import { Separator } from "components/Separator/Separator"
import { Switch } from "components/Switch/Switch"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { PoolsHeaderTotal } from "sections/pools/header/PoolsHeaderTotal"
import { useAccountStore } from "state/store"
import { theme } from "theme"
import { ClaimAllDropdown } from "sections/pools/farms/components/claimAllDropdown/ClaimAllDropdown"
import { Fragment, ReactElement } from "react"
import Skeleton from "react-loading-skeleton"
import { useRpcProvider } from "providers/rpcProvider"

type Props = {
  myPositions: boolean
  onMyPositionsChange: (value: boolean) => void
  disableMyPositions: boolean
}

export const HeaderSeparator = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return (
    <Separator
      sx={{
        mb: [15, 0],
        height: ["1px", "40px"],
      }}
      css={{ background: `rgba(${theme.rgbColors.white}, 0.12)` }}
      orientation={isDesktop ? "vertical" : "horizontal"}
    />
  )
}

export const HeaderValues = ({
  values,
  skeletonHeight,
}: {
  skeletonHeight?: [number, number]
  values: Array<{
    label?: string
    content: ReactElement
    hidden?: boolean
    disconnected?: boolean
    withoutSeparator?: boolean
    initiallyHidden?: boolean
  }>
}) => {
  const { isLoaded } = useRpcProvider()

  const headerValues = values.reduce((acc, item, i, array) => {
    const isLastElement = i + 1 === array.length

    if (!isLoaded && item.initiallyHidden) return acc

    const content =
      isLoaded && !item.disconnected ? (
        item.content
      ) : (
        <Skeleton
          sx={{ height: skeletonHeight ?? [19, 28], width: [180, 200] }}
          enableAnimation={!item.disconnected}
        />
      )

    if (!item.hidden) {
      acc.push(
        item.label ? (
          <div
            key={`${i}_content`}
            sx={{ flex: ["row", "column"], justify: "space-between" }}
          >
            <Text color="brightBlue300" sx={{ mb: 6 }}>
              {item.label}
            </Text>
            {content}
          </div>
        ) : (
          <Fragment key={`${i}_content`}>{content}</Fragment>
        ),
      )

      if (!isLastElement && !item.withoutSeparator)
        acc.push(<HeaderSeparator key={`${i}_separator`} />)
    }

    return acc
  }, [] as ReactElement[])

  return (
    <div
      sx={{
        flex: ["column", "row"],
        mb: 40,
        flexWrap: "wrap",
        gap: [12, 0],
        align: ["normal", "center"],
        justify: "space-between",
      }}
    >
      {headerValues}
    </div>
  )
}

const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

export const PoolsHeader = ({
  myPositions,
  onMyPositionsChange,
  disableMyPositions,
}: Props) => {
  const { t } = useTranslation()

  const { account } = useAccountStore()

  return (
    <>
      <div
        sx={{
          flex: "row",
          flexWrap: "wrap",
          justify: "space-between",
          gap: 12,
          mb: 43,
        }}
      >
        <Heading fs={20} lh={26} fw={500}>
          {t("liquidity.header.title")}
        </Heading>
        {!!account && (
          <Switch
            value={myPositions}
            onCheckedChange={onMyPositionsChange}
            disabled={disableMyPositions}
            size="small"
            name="my-positions"
            label={t("liquidity.header.switch")}
          />
        )}
      </div>
      <HeaderValues
        values={[
          {
            label: t("liquidity.header.totalLocked"),
            content: (
              <PoolsHeaderTotal variant="pools" myPositions={myPositions} />
            ),
          },
          {
            hidden: !enabledFarms,
            label: t("liquidity.header.totalInFarms"),
            content: (
              <PoolsHeaderTotal variant="farms" myPositions={myPositions} />
            ),
          },
          {
            withoutSeparator: true,
            label: t("liquidity.header.24hours"),
            content: (
              <PoolsHeaderTotal myPositions={myPositions} variant="volume" />
            ),
          },
          {
            initiallyHidden: true,
            hidden: !enabledFarms || !account?.address,
            content: <ClaimAllDropdown />,
          },
        ]}
      />
    </>
  )
}
