import { ArrowDown } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  Button,
  Flex,
  Icon,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { css, getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"

type Props = {
  readonly otcOffer: OtcOffer
}

export const FillORderModalContent: FC<Props> = ({ otcOffer }) => {
  const { t } = useTranslation()

  return (
    <>
      <ModalHeader
        title={t("trade.otc.fillOrder.nonPartial.title")}
        description={t("trade.otc.fillOrder.nonPartial.description")}
      />
      <ModalBody>
        <AssetInput
          label={t("offer")}
          maxBalance="1024436"
          selectedAssetIcon={<Logo id="10" />}
          symbol="HDX"
          value=""
        />
        <Box sx={{ position: "relative" }}>
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
            <Box borderRadius={32} p={10} bg={getToken("details.separators")}>
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
            >
              Price: 1 HDX = 3 661.923 kUSD
            </Text>
          </Flex>
        </Box>
        <AssetInput
          label={t("buy")}
          maxBalance="1024436"
          selectedAssetIcon={<Logo id="10" />}
          symbol="HDX"
          value=""
        />
        <ModalContentDivider
          css={css`
            margin-bottom: 20px;
          `}
        />
        <Flex justify="space-between">
          <Text fw={400} fs="p5" lh={px(16.8)} color={getToken("text.medium")}>
            {t("tradeFee")}
          </Text>
          <Text fw={500} fs="p5" lh={px(14.4)} color={getToken("text.high")}>
            =24.24 HDX
          </Text>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button size="large" width="100%">
          {t("trade.otc.fillOrder.cta")}
        </Button>
      </ModalFooter>
    </>
  )
}
