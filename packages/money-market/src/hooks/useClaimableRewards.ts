import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { getUserClaimableRewards } from "@/utils/user"

export const useClaimableRewards = () => {
  const { user, loading } = useAppDataContext()

  const rewards = getUserClaimableRewards(user)

  return {
    ...rewards,
    loading,
  }
}
