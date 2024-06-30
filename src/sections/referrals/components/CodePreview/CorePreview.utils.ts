import { LINKS } from "utils/navigation"

export const REFERRAL_PROD_HOST = "hydradx.io"
export const REFERRAL_PARAM_NAME = "referral"
export function getShareUrl(code: string, origin?: string) {
  if (origin && import.meta.env.VITE_ENV !== "production") {
    return new URL(`${origin}${LINKS.swap}?${REFERRAL_PARAM_NAME}=${code}`)
  }

  return new URL(`https://${REFERRAL_PROD_HOST}/${code}`)
}
