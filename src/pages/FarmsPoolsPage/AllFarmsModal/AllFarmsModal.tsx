import { FC } from "react"
import { Modal } from "components/Modal/Modal"
import { Trans, useTranslation } from "react-i18next"
import {
  StyledFarm,
  StyledFarmIcon,
  StyledFarmRow,
} from "pages/FarmsPoolsPage/AllFarmsModal/AllFarmsModal.styled"
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
}

// TODO: handle crypto icons
export const AllFarmsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("farmsPoolsPage.allFarms.modal.title", {
        symbol1: mock.symbol1,
        symbol2: mock.symbol2,
      })}
    >
      <Box flex column gap={8} mt={24}>
        {mock.farms.map((farm) => (
          <StyledFarm key={farm.id}>
            <Box flex column gap={8}>
              <Box flex acenter gap={8}>
                <BasiliskIcon />
                <Text fw={700}>{farm.symbol}</Text>
              </Box>
              <Text fs={20} lh={28} fw={600} color="primary200">
                {t("farmsPoolsPage.allFarms.modal.apr", {
                  from: farm.apr.from * 100,
                  to: farm.apr.to * 100,
                })}
              </Text>
            </Box>
            <Box flex column>
              <StyledFarmRow>
                <FillBar
                  percentage={
                    (farm.distribution.distributed / farm.distribution.max) *
                    100
                  }
                />
                <Text>
                  <Trans
                    t={t}
                    i18nKey="farmsPoolsPage.allFarms.modal.distribution"
                    tOptions={{
                      distributed: farm.distribution.distributed,
                      max: farm.distribution.max,
                    }}
                  >
                    <Text as="span" fs={14} color="neutralGray100" />
                    <Text as="span" fs={14} color="neutralGray300" />
                  </Trans>
                </Text>
              </StyledFarmRow>
              <StyledFarmRow>
                <FillBar percentage={farm.capacity * 100} />
                <Text fs={14} color="neutralGray100">
                  {t("farmsPoolsPage.allFarms.modal.capacity", {
                    capacity: farm.capacity * 100,
                  })}
                </Text>
              </StyledFarmRow>
              <Text fs={12} lh={16} fw={400} color="neutralGray500">
                {t("farmsPoolsPage.allFarms.modal.end", { end: farm.end })}
              </Text>
            </Box>
            <StyledFarmIcon>
              <ChevronDown />
            </StyledFarmIcon>
          </StyledFarm>
        ))}
      </Box>
    </Modal>
  )
}
