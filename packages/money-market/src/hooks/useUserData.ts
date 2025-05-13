import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"

export const useUserData = () => {
  const { user, loading } = useAppDataContext()

  return {
    ...user,
    loading,
  }
}
