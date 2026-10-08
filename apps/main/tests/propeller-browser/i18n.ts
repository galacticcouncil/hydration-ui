import translations from "../../src/i18n/locales/en/propeller.json"
const t = (key, opts = {}) =>
  Object.entries(opts).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    translations[key] ?? key,
  )
export const useTranslation = () => ({ t })
export default { t }
