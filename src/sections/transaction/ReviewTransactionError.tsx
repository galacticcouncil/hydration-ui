import { Text } from "components/Typography/Text/Text"
import { Button, ButtonTransparent } from "components/Button/Button"
import FullFailIcon from "assets/icons/FullFailIcon.svg?react"
import { css } from "@emotion/react"
import { useTranslation } from "react-i18next"
import { SButtons } from "./ReviewTransactionError.styled"
import { Heading } from "components/Typography/Heading/Heading"

export const ReviewTransactionError = (props: {
  onClose: () => void
  onReview: () => void
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", align: "center", my: 40 }}>
      <FullFailIcon />
      <Heading fs={19} fw={500} tAlign="center" sx={{ mt: 20 }}>
        {t("liquidity.reviewTransaction.modal.error.title")}
      </Heading>
      <div sx={{ flex: "column", align: "center", px: 20, mt: 20 }}>
        <Text tAlign="center" fs={16} color="basic400" fw={400} lh={22}>
          {t("liquidity.reviewTransaction.modal.error.description")}
        </Text>

        <SButtons>
          <Button
            type="button"
            variant="secondary"
            sx={{ mt: 40 }}
            onClick={props.onClose}
            css={css`
              width: 100%;
              text-align: center;
              flex-grow: 1;
            `}
          >
            {t("liquidity.reviewTransaction.modal.error.close")}
          </Button>

          <ButtonTransparent
            type="button"
            sx={{ mt: 10, color: "brightBlue400", fontSize: 14 }}
            onClick={props.onReview}
          >
            {t("liquidity.reviewTransaction.modal.error.review")}
          </ButtonTransparent>
        </SButtons>
      </div>
    </div>
  )
}
