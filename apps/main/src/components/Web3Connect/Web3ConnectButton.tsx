import {
  Button,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export const Web3ConnectButton = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  // eslint-disable-next-line
  const [providers, setProviders] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    // eslint-disable-next-line
    const onAnnounceProvider = (event: any) => {
      console.log("Event Triggered: ", event.type)
      console.table(event.detail.info)

      const announcedProvider = {
        ...event.detail,
        accounts: [],
      }

      setProviders((prevProviders) => {
        const providers = new Map(prevProviders)
        providers.set(announcedProvider.info.uuid, announcedProvider)
        return providers
      })
    }

    window.addEventListener(
      "eip6963:announceProvider",
      onAnnounceProvider as EventListener,
    )

    window.dispatchEvent(new Event("eip6963:requestProvider"))
    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        onAnnounceProvider as EventListener,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line
  async function connectProvider(selectedProvider: any) {
    const request =
      selectedProvider.request ?? selectedProvider.provider.request
    try {
      const accounts = (await request({
        method: "eth_requestAccounts",
      })) as string[]
      setProviders((prevProviders) => {
        const providers = new Map(prevProviders)
        providers.set(selectedProvider.info.uuid, {
          ...selectedProvider,
          accounts,
        })
        return providers
      })
      setOpen(false)
    } catch (error) {
      console.log(error)
      throw new Error("Failed to connect to provider")
    }
  }

  const connectedProvider = Array.from(providers).find(
    // eslint-disable-next-line
    ([_, provider]) => !!provider?.accounts?.length,
  )

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={connectedProvider ? "tertiary" : "secondary"}
      >
        {connectedProvider
          ? connectedProvider[1].accounts[0].slice(0, 6) +
            "..." +
            connectedProvider[1].accounts[0].slice(-4)
          : t("connectWallet")}
      </Button>
      <Modal open={open} onOpenChange={setOpen} disableInteractOutside>
        <ModalHeader title="Connect wallet" />
        <ModalBody>
          <Grid columns={[2, 4]} gap={10}>
            {providers.size !== 0 &&
              // eslint-disable-next-line
              Array.from(providers).map(([_, provider]) => (
                <Flex
                  as="button"
                  onClick={async () => await connectProvider(provider)}
                  direction="column"
                  align="center"
                  justify="center"
                  key={provider.info.uuid}
                  p={20}
                  sx={{
                    bg: getToken("surfaces.containers.dim.dimOnBg"),
                    border: "1px solid",
                    borderRadius: "lg",
                    borderColor: getToken("details.borders"),
                  }}
                >
                  <img width={32} height={32} src={provider.info.icon} />
                  <Text fs={14} align="center" mt={10}>
                    {provider.info.name}
                  </Text>
                </Flex>
              ))}
          </Grid>
        </ModalBody>
      </Modal>
    </>
  )
}
