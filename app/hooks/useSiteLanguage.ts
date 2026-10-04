import { useEffect, useState } from "react";
import type { Language } from "../portfolio/types";

const LANGUAGE_STORAGE_KEY = "portfolio-language";

export function useSiteLanguage() {
  const [language, setLanguage] = useState<Language>("zh");
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage === "zh" || storedLanguage === "en") {
        setLanguage(storedLanguage);
      }
    } catch {
      // Storage can be unavailable in restrictive/private browser contexts.
    } finally {
      setLanguageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!languageReady) return;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The in-memory language switch still works when storage is unavailable.
    }

    document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
  }, [language, languageReady]);

  return { language, setLanguage, languageReady } as const;
}
