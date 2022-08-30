import { FC } from "react"
import { Modal } from "components/Modal/Modal"
import { Trans, useTranslation } from "react-i18next"
import {
  SFarm,
  SFarmIcon,
  SFarmRow,
} from "sections/pools/pool/modals/joinFarm/PoolJoinFarm.styled"
import { Box } from "components/Box/Box"
import { Text } from "components/Typography/Text/Text"
import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { FillBar } from "components/FillBar/FillBar"
import { ChevronDown } from "assets/icons/ChevronDown"

const mock = {
  symbol1: "BSX",
  symbol2: "aUSD",
  farms: [
    {
      id: 1,
      symbol: "BSX",
      apr: { from: 0.05, to: 0.1 },
      distribution: { distributed: 10000000, max: 100000000 },
      capacity: 0.5,
      end: new Date(),
    },
    {
      id: 2,
      symbol: "BSX",
      apr: { from: 0.05, to: 0.1 },
      distribution: { distributed: 25000000, max: 100000000 },
      capacity: 0.27,
      end: new Date(),
    },
    {
      id: 3,
      symbol: "BSX",
      apr: { from: 0.05, to: 0.1 },
      distribution: { distributed: 60000000, max: 100000000 },
      capacity: 0.17,
      end: new Date(),
    },
  ],
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: () => void
}

// TODO: handle crypto icons
export const PoolJoinFarm: FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("pools.allFarms.modal.title", {
        symbol1: mock.symbol1,
        symbol2: mock.symbol2,
      })}
    >
      <Box flex column gap={8} mt={24}>
        {mock.farms.map((farm) => (
          <SFarm key={farm.id} onClick={onSelect}>
            <Box flex column gap={8}>
              <Box flex acenter gap={8}>
                <BasiliskIcon />
                <Text fw={700}>{farm.symbol}</Text>
              </Box>
              <Text fs={20} lh={28} fw={600} color="primary200">
                {t("pools.allFarms.modal.apr", {
                  from: farm.apr.from * 100,
                  to: farm.apr.to * 100,
                })}
              </Text>
            </Box>
            <Box flex column>
              <SFarmRow>
                <FillBar
                  percentage={
                    (farm.distribution.distributed / farm.distribution.max) *
                    100
                  }
                />
                <Text>
                  <Trans
                    t={t}
                    i18nKey="pools.allFarms.modal.distribution"
                    tOptions={{
                      distributed: farm.distribution.distributed,
                      max: farm.distribution.max,
                    }}
                  >
                    <Text as="span" fs={14} color="neutralGray100" />
                    <Text as="span" fs={14} color="neutralGray300" />
                  </Trans>
                </Text>
              </SFarmRow>
              <SFarmRow>
                <FillBar percentage={farm.capacity * 100} />
                <Text fs={14} color="neutralGray100">
                  {t("pools.allFarms.modal.capacity", {
                    capacity: farm.capacity * 100,
                  })}
                </Text>
              </SFarmRow>
              <Text fs={12} lh={16} fw={400} color="neutralGray500">
                {t("pools.allFarms.modal.end", { end: farm.end })}
              </Text>
            </Box>
            <SFarmIcon>
              <ChevronDown />
            </SFarmIcon>
          </SFarm>
        ))}
      </Box>
    </Modal>
  )
}
