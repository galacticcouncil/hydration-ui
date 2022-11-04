import { Modal, ModalMeta } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { useAPR } from "utils/farms/apr"
import { u128, u32 } from "@polkadot/types"
import { PoolBase } from "@galacticcouncil/sdk"
import { Fragment, useState } from "react"
import { PoolFarmDeposit } from "sections/pools/farm/deposit/PoolFarmDeposit"
import { PoolFarmDetail } from "sections/pools/farm/detail/PoolFarmDetail"
import {
  PalletLiquidityMiningDepositData,
  PalletLiquidityMiningYieldFarmEntry,
} from "@polkadot/types/lookup"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Button } from "components/Button/Button"

export function PoolFarmJoinSectionList(props: {
  pool: PoolBase
  onSelect: (
    value: {
      yieldFarmId: u32
      globalFarmId: u32
      yieldFarmEntry?: PalletLiquidityMiningYieldFarmEntry
      deposit?: { id: u128; deposit: PalletLiquidityMiningDepositData }
    } | null,
  ) => void
}) {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [openJoinFarm, setOpenJoinFarm] = useState(false)
  const apr = useAPR(props.pool.address)

  const [assetIn, assetOut] = props.pool.tokens

  return (
    <Fragment key="list">
      <ModalMeta
        title={t("pools.allFarms.modal.title", {
          symbol1: assetIn.symbol,
          symbol2: assetOut.symbol,
        })}
      />

      <div sx={{ flex: "column", gap: 28 }}>
        <div sx={{ flex: "column", gap: 12 }}>
          {apr.data.map((farm) => (
            <PoolFarmDetail
              key={[farm.globalFarm.id, farm.yieldFarm.id].join(",")}
              farm={farm}
              pool={props.pool}
              onSelect={() =>
                props.onSelect({
                  globalFarmId: farm.globalFarm.id,
                  yieldFarmId: farm.yieldFarm.id,
                })
              }
            />
          ))}
        </div>

        {isDesktop ? (
          <PoolFarmDeposit pool={props.pool} isDrawer={!isDesktop} />
        ) : (
          <Button
            variant="primary"
            sx={{ width: "inherit" }}
            onClick={() => setOpenJoinFarm(true)}
          >
            {t("farms.deposit.submit")}
          </Button>
        )}
      </div>

      <Modal
        open={openJoinFarm}
        isDrawer
        onClose={() => setOpenJoinFarm(false)}
        titleDrawer={t("farms.deposit.mobile.title")}
      >
        <PoolFarmDeposit pool={props.pool} isDrawer={!isDesktop} />
      </Modal>
    </Fragment>
  )
}
