import { Search } from "@galacticcouncil/ui/assets/icons"
import { Input, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { SELECTABLE_PARACHAINS_IDS } from "@/modules/wallet/assets/AddToken/AddToken.utils"
import { AddTokenAssetList } from "@/modules/wallet/assets/AddToken/AddTokenAssetList"
import { AddTokenSource } from "@/modules/wallet/assets/AddToken/AddTokenSource"

export const AddTokenModal: FC = () => {
  const { t } = useTranslation("wallet")

  const [search, setSearch] = useState("")
  const [parachainId, setParachainId] = useState<number>(
    SELECTABLE_PARACHAINS_IDS[0],
  )
  return (
    <>
      <ModalHeader title={t("addToken.modal.title")} align="center" />
      <ModalBody sx={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Input
          sx={{ flexShrink: 0 }}
          autoFocus
          value={search}
          iconStart={Search}
          placeholder={t("addToken.modal.searchPlaceholder")}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AddTokenSource
          sx={{ px: 20 }}
          parachainId={parachainId}
          onChange={setParachainId}
        />
        <AddTokenAssetList
          sx={{ flex: 1, minHeight: 0 }}
          parachainId={parachainId}
          searchPhrase={search}
          // TODO
          onSelect={() => {}}
        />
      </ModalBody>
    </>
  )
}
