import { Key } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useUnlockNativeLocks } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock.tx"

type Props = {
  readonly unlockableIds: ReadonlyArray<{ voteId: number; classId: number }>
  readonly value: string
  readonly className?: string
}

export const AssetDetailUnlock: FC<Props> = ({
  unlockableIds,
  value,
  className,
}) => {
  const { t } = useTranslation(["wallet"])

  const unlock = useUnlockNativeLocks(unlockableIds, value)
  return (
    <Button
      variant="accent"
      outline
      className={className}
      disabled={!unlockableIds.length || unlock.isPending}
      onClick={() => unlock.mutate()}
    >
      <Key />
      {new Big(value).gt(0)
        ? t("myAssets.expandedNative.actions.unlockAvailableAssets")
        : t("myAssets.expandedNative.actions.clearLocks")}
    </Button>
  )
}
