import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  ModalBody,
  ModalHeader,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { useMount } from "react-use"

import { AssetSelectRow } from "@/modules/onramp/components/AssetSelectRow"
import { CEX_CONFIG } from "@/modules/onramp/config/cex"
import { useDepositStore } from "@/modules/onramp/store/useDepositStore"
import { AssetConfig } from "@/modules/onramp/types"

const ASSET_ROW_HEIGHT = 60
const CEX_ROW_HEIGHT = 34

export type DepositCexSelectProps = {
  onAssetSelect: (asset: AssetConfig) => void
  onBack: () => void
}

export const DepositCexSelect: React.FC<DepositCexSelectProps> = ({
  onAssetSelect,
  onBack,
}) => {
  const { t } = useTranslation(["onramp"])
  const { setCexId, cexId, setCurrentDeposit } = useDepositStore()

  useMount(() => setCurrentDeposit(null))

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)

  if (!cex) return null

  return (
    <>
      <ModalHeader
        title={t("deposit.cex.select.title")}
        align="center"
        onBack={onBack}
        closable={false}
      />
      <ModalBody noPadding>
        <Grid columnTemplate={["64px 1fr", "180px 1fr"]}>
          <Box p={getTokenPx("scales.paddings.s")}>
            <VirtualizedList
              items={CEX_CONFIG}
              maxVisibleItems={10}
              itemSize={CEX_ROW_HEIGHT}
              renderItem={(cex, { key }) => {
                const isActive = cex.id === cexId
                return (
                  <Button
                    key={key}
                    variant={isActive ? "accent" : "transparent"}
                    outline={isActive}
                    onClick={() => setCexId(cex.id)}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      color: isActive
                        ? getToken("text.high")
                        : getToken("text.medium"),
                      px: getTokenPx("scales.paddings.base"),
                    }}
                  >
                    <Icon component={cex.logo} />
                    <Flex>
                      <Text fs={12} fw={500}>
                        {cex.title}
                      </Text>
                    </Flex>
                  </Button>
                )
              }}
            />
          </Box>
          <VirtualizedList
            items={cex.assets}
            maxVisibleItems={10}
            sx={{ minHeight: ASSET_ROW_HEIGHT * 3 }}
            itemSize={ASSET_ROW_HEIGHT}
            separated
            renderItem={(item, { key }) => {
              return (
                <AssetSelectRow
                  key={key}
                  onClick={() => onAssetSelect(item)}
                  assetId={item.assetId}
                />
              )
            }}
          />
        </Grid>
      </ModalBody>
    </>
  )
}
