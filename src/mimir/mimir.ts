import { inject, isMimirReady, MIMIR_REGEXP } from "@mimirdev/apps-inject"

export const isMimirIframe = async (): Promise<boolean> => {
  // is iframe
  const openInIframe = window !== window.parent

  if (!openInIframe) {
    return false
  }

  const origin = await isMimirReady()

  // Verify if the URL matches Mimir's pattern
  return !!origin && MIMIR_REGEXP.test(origin)
}

export const injectMimir = (): void => {
  inject()
}
