import { Plus, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Button,
  Flex,
  Grid,
  Icon,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { arraySearch } from "@galacticcouncil/utils"
import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { AccountMultisigOption } from "@/components/account/AccountMultisigOption"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useMultisigConfigs } from "@/hooks/useMultisigConfigs"
import { MultisigConfig, useMultisigStore } from "@/hooks/useMultisigStore"

export const MultisigConfigSelectContent = () => {
  const { t } = useTranslation()
  const { setPage } = useWeb3ConnectContext()
  const { setActive, remove, add, update } = useMultisigStore(
    useShallow(pick(["setActive", "remove", "add", "update"])),
  )
  const configs = useMultisigConfigs()

  const [searchVal, setSearchVal] = useState("")
  const [search, setSearch] = useState("")

  useDebounce(
    () => {
      setSearch(searchVal ?? "")
    },
    100,
    [searchVal],
  )

  const filteredConfigs = useMemo(() => {
    if (!search) return configs

    return arraySearch(configs, search, ["name", "address"])
  }, [configs, search])

  const shouldRenderSearch = configs.length > 1

  const handleMultisigSelect = useCallback(
    (config: MultisigConfig) => {
      setActive(config.id, null)
      setPage(Web3ConnectModalPage.MultisigSignerSelect)
    },
    [setActive, setPage],
  )

  const handleRename = useCallback(
    (config: MultisigConfig, newName: string) => {
      const trimmed = newName.trim().slice(0, 32)
      if (config.isCustom) {
        update(config.id, { name: trimmed })
        return
      }
      add({
        address: config.address,
        name: trimmed,
        signers: config.signers,
        threshold: config.threshold,
        isCustom: true,
      })
    },
    [add, update],
  )

  return (
    <>
      <ModalHeader
        title={t("multisig.configSelect.title")}
        align="center"
        onBack={() => setPage(Web3ConnectModalPage.ProviderSelect)}
        customHeader={
          shouldRenderSearch && (
            <Flex direction="column" gap="xl" mt="base">
              <Input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                customSize="large"
                iconStart={Search}
                placeholder={t("account.searchPlaceholder")}
              />
            </Flex>
          )
        }
      />
      <ModalBody scrollable>
        <Grid gap="base" maxHeight="5xl">
          {filteredConfigs.map((config) => (
            <AccountMultisigOption
              key={config.id}
              config={config}
              onSelect={handleMultisigSelect}
              onRename={handleRename}
              onDelete={remove}
            />
          ))}
          {!filteredConfigs.length && (
            <Alert
              variant="info"
              title={t("multisig.configSelect.empty.title")}
              description={t("multisig.configSelect.empty.description")}
            />
          )}
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="accent"
          outline
          size="large"
          width="100%"
          type="button"
          onClick={() => setPage(Web3ConnectModalPage.MultisigSetup)}
        >
          <Icon size="s" component={Plus} />
          {t("multisig.configSelect.setupNew")}
        </Button>
      </ModalFooter>
    </>
  )
}
