/* eslint-disable */

/**
 * Script to set the initial theme based on user preference or system settings.
 */
(function () {
  try {
    const documentElement = document.documentElement;
    const classList = documentElement.classList;

    // Remove any existing theme classes
    classList.remove("light", "dark");

    // Try to get saved theme from localStorage
    const themeStore = localStorage.getItem("theme");
    const savedTheme =
      typeof themeStore === "string"
        ? JSON.parse(themeStore)?.state?.themePreference
        : null;

    const validThemes = ["light", "dark", "system"];
    const isValidTheme = validThemes.includes(savedTheme);

    // Prune invalid theme store
    if (themeStore && !isValidTheme) {
      localStorage.removeItem("theme");
    }

    // If theme is "system" or not set, use system preference
    if (savedTheme === "system" || savedTheme === null) {
      const darkModeQuery = "(prefers-color-scheme: dark)";
      const mediaQuery = window.matchMedia(darkModeQuery);

      // If media query is supported and matches, use dark mode
      if (mediaQuery.media !== darkModeQuery || mediaQuery.matches) {
        documentElement.style.colorScheme = "dark";
        classList.add("dark");
      } else {
        documentElement.style.colorScheme = "light";
        classList.add("light");
      }
    }
    // If a specific theme is saved (e.g., "light" or "dark")
    else {
      classList.add(savedTheme);
    }

    // Set the color-scheme style explicitly if theme is known
    if (savedTheme === "light" || savedTheme === "dark") {
      documentElement.style.colorScheme = savedTheme;
    }
  } catch (error) {
    // Fail silently if something goes wrong
  }
})();

/**
 * Script to detect the user's operating system and browser
 */
(function () {
  const htmlElement = document.documentElement;

  function addClass(name) {
    htmlElement.classList.add(name.toLowerCase().replace(/\s+/g, "-"));
  }

  const ua = navigator.userAgent.toLowerCase();

  // Detect OS
  if (ua.includes("windows")) {
    addClass("windows");
  } else if (ua.includes("mac")) {
    addClass("mac");
  } else if (ua.includes("linux")) {
    addClass("linux");
  } else if (ua.includes("android")) {
    addClass("android");
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    addClass("ios");
  }

  // Detect browser
  if (ua.includes("chrome")) {
    addClass("chrome");
  } else if (ua.includes("firefox")) {
    addClass("firefox");
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    addClass("safari");
  } else if (ua.includes("edge")) {
    addClass("edge");
  } else if (ua.includes("opera") || ua.includes("opr")) {
    addClass("opera");
  }
})();
