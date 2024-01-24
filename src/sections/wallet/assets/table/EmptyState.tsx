import styled from "@emotion/styled"
import { useNavigate } from "@tanstack/react-location"
import EmptyStateIcon from "assets/icons/NoActivities.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import PlusIcon from "assets/icons/PlusIcon.svg?react"

const SEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 17px;

  min-height: 250px;
  width: 100%;
`

export const EmptyState = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <tr sx={{ height: 250 }}>
      <td colSpan={4}>
        <SEmptyState>
          <Icon sx={{ color: "basic600" }} icon={<EmptyStateIcon />} />
          <Text
            fs={14}
            color="basic700"
            tAlign="center"
            sx={{ width: 355, mb: 10 }}
          >
            {t("wallet.assets.table.empty.desc")}
          </Text>
          <Button
            onClick={() =>
              navigate({
                to: "/cross-chain",
              })
            }
          >
            <Icon icon={<PlusIcon />} />
            {t("wallet.assets.table.empty.btn")}
          </Button>
        </SEmptyState>
      </td>
    </tr>
  )
}
