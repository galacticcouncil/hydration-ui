import { FC, useState } from "react"
import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import {
  SSlippage,
  STradingPairContainer,
} from "sections/pools/pool/modals/removeLiquidity/PoolRemoveLiquidity.styled"
import { Button } from "components/Button/Button"
import { Heading } from "components/Typography/Heading/Heading"
import { Slider } from "components/Slider/Slider"
import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Input } from "components/Input/Input"
import { Text } from "components/Typography/Text/Text"
import { Box } from "components/Box/Box"
import { PoolRemoveLiquidityReward } from "sections/pools/pool/modals/removeLiquidity/reward/PoolRemoveLiquidityReward"
import { Separator } from "components/Separator/Separator"

const options = [
  { label: "24%", value: 24 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
]

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const PoolRemoveLiquidity: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [slider, setSlider] = useState(25)
  const [selected, setSelected] = useState<number | undefined>(50)
  const [input, setInput] = useState("")

  const onChange = (value: string) => {
    setSelected(undefined)
    setInput(value)
  }

  const onSelect = (value: number) => {
    setInput("")
    setSelected(value)
  }

  return (
    <Modal
      title={t("pools.removeLiquidity.modal.title")}
      open={isOpen}
      onClose={onClose}
    >
      <Heading fs={42} lh={52} mb={16} mt={16}>
        {slider}%
      </Heading>

      <Slider
        value={[slider]}
        onChange={(val) => setSlider(val[0])}
        min={0}
        max={100}
        step={1}
      />

      <SSlippage>
        <BoxSwitch options={options} selected={selected} onSelect={onSelect} />
        <Input
          value={input}
          onChange={onChange}
          name="custom"
          label="Custom"
          placeholder="Custom"
        />
      </SSlippage>

      <STradingPairContainer>
        <Text color="neutralGray400">
          {t("pools.removeLiquidity.modal.receive")}
        </Text>
        <PoolRemoveLiquidityReward
          name="Basilisk"
          symbol="BSX"
          amount={1000000.579187897408}
        />
        <PoolRemoveLiquidityReward
          name="Karura"
          symbol="KAR"
          amount={34456.56}
        />
      </STradingPairContainer>

      <Box mb={32} mt={16}>
        <Box flex acenter justify="space-between">
          <Text color="neutralGray500" fs={15}>
            {t("pools.removeLiquidity.modal.cost")}
          </Text>
          <Box flex acenter gap={4}>
            <Text fs={14}>≈ 12 BSX</Text>
            <Text fs={14} color="primary400">
              (2%)
            </Text>
          </Box>
        </Box>
        <Separator mt={8} mb={8} size={2} />
        <Box flex acenter justify="space-between">
          <Text fs={15} color="neutralGray500">
            {t("pools.removeLiquidity.modal.price")}
          </Text>
          <Text fs={14}>1 BSX = 225 KAR</Text>
        </Box>
      </Box>

      <Button variant="primary" fullWidth>
        {t("pools.removeLiquidity.modal.confirm")}
      </Button>
    </Modal>
  )
}
