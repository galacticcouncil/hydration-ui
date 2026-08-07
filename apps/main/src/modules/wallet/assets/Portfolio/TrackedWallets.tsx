import { ClassicWallet } from "@galacticcouncil/ui/assets/icons"
import TrackedWalletImage from "@galacticcouncil/ui/assets/images/TrackedWallet.png"
import {
  Button,
  Flex,
  Icon,
  Image,
  Modal,
  Paper,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { ManageTrackedWalletsModal } from "@/modules/wallet/assets/Portfolio/ManageTrackedWalletsModal"
import { TrackedWalletCard } from "@/modules/wallet/assets/Portfolio/TrackedWalletCard"
import { TrackedWalletGlyph } from "@/modules/wallet/assets/Portfolio/TrackedWalletGlyph"
import { useTrackedWallets } from "@/states/trackedWallets"

type Props = {
  readonly searchPhrase: string
  readonly sortingProps: SortingProps
}

export const TrackedWallets: FC<Props> = ({ searchPhrase, sortingProps }) => {
  const { t } = useTranslation("wallet")

  const wallets = useTrackedWallets()
  const [isManageOpen, setIsManageOpen] = useState(false)

  return (
    <Flex direction="column" gap="xl">
      <Flex align="center" justify="space-between" gap="base">
        <Flex align="center" gap="s">
          <TrackedWalletGlyph size={20} />
          <Text as="h2" font="primary" fs="h7" fw={500} color="text.high">
            {t("myAssets.tracked.title")}
          </Text>
        </Flex>
        <Button
          size="small"
          variant="muted"
          outline
          onClick={() => setIsManageOpen(true)}
          sx={{
            height: 30,
            px: getToken("buttons.paddings.primary"),
            py: 0,
            borderRadius: getToken("containers.cornerRadius.buttonsPrimary"),
            gap: getToken("buttons.paddings.quart"),
            color: getToken("buttons.secondary.low.onRest"),
            bg: getToken("buttons.secondary.low.rest"),
            borderColor: getToken("buttons.secondary.low.borderRest"),
          }}
        >
          <Icon size="xs" component={ClassicWallet} />
          {t("myAssets.tracked.manage")}
        </Button>
      </Flex>

      {wallets.length === 0 ? (
        <Paper overflow="hidden">
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="base"
            sx={{
              minHeight: 180,
              p: getToken("containers.paddings.primary"),
            }}
          >
            <Image
              src={TrackedWalletImage}
              alt=""
              sx={{
                width: 92,
                height: 92,
                objectFit: "cover",
                objectPosition: "center",
                flexShrink: 0,
              }}
            />
            <Stack gap="xs" align="center">
              <Text font="primary" fs="p3" fw={500} color="text.high">
                {t("myAssets.tracked.empty.title")}
              </Text>
              <Text
                fs="p5"
                lh={1.3}
                align="center"
                color="text.medium"
                sx={{ textWrap: "balance" }}
              >
                {t("myAssets.tracked.empty.description")}
              </Text>
            </Stack>
            <Button
              size="medium"
              variant="secondary"
              onClick={() => setIsManageOpen(true)}
            >
              {t("myAssets.tracked.empty.addAddress")}
            </Button>
          </Flex>
        </Paper>
      ) : (
        <Flex direction="column" gap="l">
          {wallets.map((wallet) => (
            <TrackedWalletCard
              key={wallet.publicKey}
              wallet={wallet}
              searchPhrase={searchPhrase}
              sortingProps={sortingProps}
            />
          ))}
        </Flex>
      )}

      <Modal
        variant="popup"
        open={isManageOpen}
        onOpenChange={() => setIsManageOpen(false)}
      >
        <ManageTrackedWalletsModal />
      </Modal>
    </Flex>
  )
}
