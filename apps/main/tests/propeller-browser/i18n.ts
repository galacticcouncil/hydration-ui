import translations from "../../src/i18n/locales/en/propeller.json"
const t = (key, opts = {}) => {
  const value = translations[key] ?? key
  if (opts.returnObjects && Array.isArray(value)) return value
  if (key === "common:currency")
    return opts.symbol
      ? `${opts.value} ${opts.symbol}`
      : `$${Number(opts.value).toFixed(2)}`
  if (key === "common:number") return String(opts.value)
  return Object.entries(opts).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    value,
  )
}
export const useTranslation = () => ({ t })
export default { t }
