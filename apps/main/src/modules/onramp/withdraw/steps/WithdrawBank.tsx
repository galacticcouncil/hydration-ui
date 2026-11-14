import { useNavigate } from "@tanstack/react-router"

import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"

export type WithdrawBankProps = {
  onBack: () => void
}

export const WithdrawBank: React.FC<WithdrawBankProps> = ({ onBack }) => {
  const navigate = useNavigate()

  return (
    <BankFlow
      direction="withdraw"
      onExit={onBack}
      onClose={() => navigate({ to: "/portfolio/deposits" })}
    />
  )
}
