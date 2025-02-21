import { ArrowDown } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  ModalContentDivider,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetPrice } from "@/components"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly assetIn: TAsset | undefined
}

export const TradeDivider: FC<Props> = ({ assetIn }) => {
  const { t } = useTranslation("trade")

  return (
    <Box height={35} alignContent="center" sx={{ position: "relative" }}>
      <ModalContentDivider />
      <Flex
        justify="space-between"
        sx={{
          position: "absolute",
          px: 12,
          top: "50%",
          width: "100%",
          transform: "translateY(-50%)",
        }}
      >
        {/* TODO tokens border radius */}
        <Box
          borderRadius={32}
          p={10}
          bg={getToken("details.separators")}
          sx={{ backdropFilter: "blur(3px)" }}
        >
          <ArrowDown sx={{ size: 12 }} />
        </Box>
        <Text
          py={5}
          px={14}
          //    TODO tokens border radius
          borderRadius={16}
          bg={getToken("details.separators")}
          fw={500}
          fs="p6"
          lh={px(15.4)}
          color={getToken("text.high")}
          alignContent="center"
          display="flex"
          alignItems="center"
          gap={2}
          sx={{ backdropFilter: "blur(3px)" }}
        >
          {assetIn ? (
            <>
              {t("otc.divider.price", { symbol: assetIn.symbol })}
              <AssetPrice assetId={assetIn.id} value={1} compact />
            </>
          ) : (
            "N / A"
          )}
        </Text>
      </Flex>
    </Box>
  )
}
