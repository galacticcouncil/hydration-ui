export const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export const yearFormatter = new Intl.DateTimeFormat("en", { year: "numeric" })

export const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
})

export const timeFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export const numberFormatter = new Intl.NumberFormat("en")
