import { BasiliskIcon } from "assets/icons/BasiliskIcon"
import { Box } from "components/Box/Box"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { FarmRow } from "./FarmRow/FarmRow"

const mockRows = [
  { id: 1, icon: <BasiliskIcon />, name: "KAR", value: "5-10" },
  { id: 2, icon: <BasiliskIcon />, name: "KAR", value: "10-15" },
  { id: 3, icon: <BasiliskIcon />, name: "KAR", value: "15-20" },
]

type FarmingIncentiveProps = {}

export const FarmingIncentives: FC<FarmingIncentiveProps> = () => {
  const { t } = useTranslation()
  return (
    <Box width={206}>
      <Text fs={14} lh={26} color="neutralGray400" mb={18}>
        {t("farmsPoolsPage.poolCard.farmIncentives.title")}
      </Text>
      {mockRows.map((row, rowI) => (
        <>
          <FarmRow {...row} key={row.id} />
          {rowI !== mockRows.length - 1 && <Separator mb={13} />}
        </>
      ))}
    </Box>
  )
}
