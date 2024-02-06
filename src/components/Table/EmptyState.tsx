import styled from "@emotion/styled"
import { useNavigate } from "@tanstack/react-location"
import { Button } from "components/Button/Button"
import { ReactNode } from "react"

const SEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 17px;

  min-height: 250px;
  width: 100%;
`

export const EmptyState = ({
  navigateTo,
  btnText,
  desc,
}: {
  navigateTo?: string
  btnText?: string
  desc: ReactNode
}) => {
  const navigate = useNavigate()

  return (
    <tr sx={{ height: 250 }}>
      <td colSpan={4}>
        <SEmptyState>
          {desc}
          {navigateTo && btnText && (
            <Button
              onClick={() =>
                navigate({
                  to: navigateTo,
                })
              }
            >
              {btnText}
            </Button>
          )}
        </SEmptyState>
      </td>
    </tr>
  )
}
