import { useState } from "react"

import { isAndroid, isIOS, isMobileDevice } from "../helpers/device"

export function useDevice() {
  return useState(() => ({
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isMobileDevice: isMobileDevice(),
  }))[0]
}
