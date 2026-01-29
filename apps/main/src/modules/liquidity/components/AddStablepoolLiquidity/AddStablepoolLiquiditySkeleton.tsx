import {
  Button,
  SliderTabs,
  Summary,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components/Flex"
import {
  ModalBody,
  ModalContentDivider,
  ModalHeader,
} from "@galacticcouncil/ui/components/Modal"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { doNothing } from "remeda"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"

import {
  AddStablepoolLiquidityProps,
  AddStablepoolLiquidityTooltip,
} from "./AddStablepoolLiquidity"
import { addStablepoolOptions } from "./AddStablepoolLiquidity.utils"

export const AddStablepoolLiquiditySkeleton = (
  props: AddStablepoolLiquidityProps,
) => {
  const { t } = useTranslation(["liquidity", "common"])

  return (
    <>
      <ModalHeader
        title={props.title ?? t("addLiquidity")}
        closable={props.closable}
        onBack={props.onBack}
        customHeader={
          <Flex
            align="center"
            mt={getTokenPx("containers.paddings.primary")}
            gap={getTokenPx("containers.paddings.tertiary")}
          >
            <SliderTabs
              options={addStablepoolOptions}
              selected={addStablepoolOptions[0]?.id}
              onSelect={doNothing}
              sx={{ flex: 1 }}
              disabled
            />
            <AddStablepoolLiquidityTooltip />
          </Flex>
        }
      />
      <ModalBody sx={{ pt: 0 }}>
        <Flex
          align="center"
          justify="space-between"
          my={getTokenPx("containers.paddings.tertiary")}
        >
          <Text>{t("liquidity.add.stablepool.modal.proportionally")}</Text>
          <Toggle
            size="large"
            checked={true}
            onCheckedChange={doNothing}
            disabled
          />
        </Flex>

        <ModalContentDivider />

        <AssetSelect
          label={t("liquidity.add.modal.selectAsset")}
          disabled
          loading
          assets={[]}
          selectedAsset={undefined}
        />

        <ModalContentDivider />

        <Summary
          separator={<ModalContentDivider />}
          rows={[
            {
              label: t("common:minimumReceived"),
              loading: true,
              content: "",
            },
            {
              label: t("common:tradeLimit"),
              content: <TradeLimit type={TradeLimitType.Liquidity} disabled />,
            },
            {
              label: t("common:apy"),
              content: "",
              loading: true,
            },
            {
              label: t("common:price"),
              content: "",
              loading: true,
            },
          ]}
        />

        <ModalContentDivider />

        <Button
          type="submit"
          size="large"
          width="100%"
          mt={getTokenPx("containers.paddings.primary")}
          disabled
        >
          {t("liquidity.add.modal.submit")}
        </Button>
      </ModalBody>
    </>
  )
}
