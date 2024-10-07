import { Text } from "components/Typography/Text/Text"
import { SHeader, SOpenGovContainer } from "./ReferendumCard.styled"
import { Separator } from "components/Separator/Separator"
import Calendar from "assets/icons/Calendar.svg?react"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"

export const NoReferenda = () => {
  const { t } = useTranslation()

  return (
    <SOpenGovContainer type="staking">
      <SHeader>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          <Icon icon={<Calendar />} css={{ color: "#DFB1F3" }} />
          <Text css={{ color: "#DFB1F3" }} fs={14} fw={500}>
            {t("referenda.empty.title")}
          </Text>
        </div>
      </SHeader>

      <Separator css={{ background: "#372244" }} sx={{ my: 16 }} />

      <div
        sx={{
          flex: "column",
          gap: 4,
          align: "center",
          justify: "center",
          height: 168,
        }}
      >
        <Text color="white" fs={14}>
          {t("referenda.empty.desc.first")}
        </Text>
        <Text css={{ color: "#AEB0B7" }} fs={12}>
          {t("referenda.empty.desc.second")}
        </Text>
      </div>
    </SOpenGovContainer>
  )
}
