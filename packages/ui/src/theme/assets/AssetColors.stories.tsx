import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { useTheme } from "@/theme"
import assetColors from "@/theme/assets/assetColors.json"
import { getToken, pxToRem } from "@/utils"

const METADATA_URL =
  "https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master/assets-v2.json"
const HYDRATION_PARACHAIN_ID = "2034"

type AssetMetadata = {
  cdn: { jsDelivr: string }
  repository: string
  path: string
  items: string[]
}

const rawColors: Record<string, string> = assetColors

const useAssetIconSrcs = () => {
  const [srcs, setSrcs] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    fetch(METADATA_URL)
      .then((res) => res.json())
      .then(({ cdn, repository, path, items }: AssetMetadata) => {
        if (!active) return

        const baseUrl = [cdn.jsDelivr, `${repository}@latest`, path].join("/")
        const pattern = new RegExp(
          `polkadot/${HYDRATION_PARACHAIN_ID}/assets/(\\d+)/icon`,
        )

        setSrcs(
          Object.fromEntries(
            items.flatMap((item) => {
              const id = item.match(pattern)?.[1]

              return id ? [[id, `${baseUrl}/${item}`]] : []
            }),
          ),
        )
      })

    return () => {
      active = false
    }
  }, [])

  return srcs
}

const AssetColorTile = ({
  id,
  color,
  raw,
  src,
}: {
  id: string
  color: string
  raw: string
  src?: string
}) => (
  <Flex
    direction="column"
    gap="base"
    p="m"
    borderRadius="m"
    position="relative"
    overflow="hidden"
  >
    <Flex
      position="absolute"
      bg={color}
      sx={{
        inset: 0,
        opacity: 0.3,
      }}
    />
    <Flex gap="base" align="center" position="relative">
      <AssetLogo src={src} alt={id} size="medium" />
      <Flex direction="column">
        <Text fs="p5" fw={600} color={getToken("text.high")}>
          {id}
        </Text>
        <Text fs="p6" color={getToken("text.medium")}>
          {raw === color ? color : `${raw} → ${color}`}
        </Text>
      </Flex>
      {raw !== color && (
        <Flex ml="auto" size={pxToRem(24)} borderRadius="full" bg={raw} />
      )}
      <Flex
        ml={raw === color ? "auto" : undefined}
        size={pxToRem(24)}
        borderRadius="full"
        bg={color}
      />
    </Flex>
  </Flex>
)

const AssetColors = () => {
  const srcs = useAssetIconSrcs()
  const { themeProps } = useTheme()
  const colors = themeProps.assets
  const ids = Object.keys(colors).sort((a, b) => Number(a) - Number(b))

  return (
    <Flex gap="m" wrap>
      {ids.map((id) => (
        <Flex key={id} width={pxToRem(240)}>
          <AssetColorTile
            id={id}
            color={colors[id] ?? ""}
            raw={rawColors[id] ?? ""}
            src={srcs[id]}
          />
        </Flex>
      ))}
    </Flex>
  )
}

export default {
  title: "theme/AssetColors",
  component: AssetColors,
} satisfies Meta<typeof AssetColors>

export const Default: StoryObj<typeof AssetColors> = {}
