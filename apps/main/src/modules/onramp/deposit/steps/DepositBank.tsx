import { useNavigate } from "@tanstack/react-router"

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"

export type DepositBankProps = {
  onBack: () => void
}

export const DepositBank: React.FC<DepositBankProps> = ({ onBack }) => {
  const navigate = useNavigate()

  return (
    <BankFlow
      direction="deposit"
      onExit={onBack}
      onClose={() => navigate({ to: "/portfolio/deposits" })}
    />
  )
}
