export const toggleLocalStorageClick = (
  value: boolean,
  func: (val: boolean) => void,
  localStorageName: string,
) => {
  if (value) {
    localStorage.setItem(localStorageName, "false")
    console.log("setting", localStorageName, false)
    func(false)
  } else {
    localStorage.setItem(localStorageName, "true")
    console.log("setting", localStorageName, true)
    func(true)
  }
}
