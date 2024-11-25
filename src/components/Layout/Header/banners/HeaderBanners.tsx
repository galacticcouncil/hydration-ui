import { UnifiedAddressesBanner } from "components/Layout/Header/banners/UnifiedAddressesBanner"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Modal } from "components/Modal/Modal"
import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { NewFarmsBanner } from "sections/pools/components/NewFarmsBanner"
import { Text } from "components/Typography/Text/Text"

import art from "assets/images/unified-addresses-art.webp"
import { Button } from "components/Button/Button"
import { useState } from "react"

export const HeaderBanners = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
  const warnings = useWarningsStore()

  const [unifiedModalVisible, setUnifiedModalVisible] = useState(false)

  return (
    <>
      <UnifiedAddressesBanner onClick={() => setUnifiedModalVisible(true)} />
      {warnings.warnings.hdxLiquidity.visible && (
        <WarningMessage
          text={t("warningMessage.hdxLiquidity.title")}
          type="hdxLiquidity"
        />
      )}

      {isLoaded && <NewFarmsBanner />}

      <Modal
        open={unifiedModalVisible}
        onClose={() => setUnifiedModalVisible(false)}
      >
        <ModalContents
          contents={[
            {
              headerVariant: "simple",
              content: (
                <div sx={{ mt: -40 }}>
                  <div sx={{ px: [20, 40] }}>
                    <img
                      loading="lazy"
                      src={art}
                      alt=""
                      width="100%"
                      height="auto"
                    />
                    <Text
                      font="GeistMonoSemiBold"
                      fs={22}
                      tAlign="center"
                      sx={{ mb: 20 }}
                    >
                      Unified address formatting
                    </Text>
                    <Text
                      color="basic400"
                      lh={20}
                      fs={14}
                      tAlign="center"
                      sx={{ mb: 20 }}
                    >
                      With the Polkadot ecosystem introducing a new address
                      format and chain prefixes, Hydration is leading the way in
                      implementing this change.
                    </Text>
                    <Text color="basic400" lh={20} fs={14} tAlign="center">
                      You’ll now encounter the updated format when performing
                      transfers and other actions involving addresses. While
                      other DEXs and CEXs are still in the process of adopting
                      this update, the old address format will remain available
                      for copying.
                    </Text>
                  </div>
                  <div sx={{ flex: "row", justify: "space-between", mt: 40 }}>
                    <Button
                      onClick={() => setUnifiedModalVisible(false)}
                      variant="secondary"
                    >
                      Close but also love it
                    </Button>
                    <Button
                      onClick={() => setUnifiedModalVisible(false)}
                      variant="primary"
                    >
                      Love it
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  )
}
