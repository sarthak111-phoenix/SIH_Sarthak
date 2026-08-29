"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, LanguageOption, LanguageOptions, getTranslation, translations } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, paramsOrFallback?: Record<string, any> | string, defaultText?: string) => string;
  currentOption: LanguageOption;
  options: LanguageOption[];
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const RTL_LANGUAGES: LanguageCode[] = ["ar" as LanguageCode];

const FONT_STACKS: Record<LanguageCode, string> = {
  en: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  hi: "'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif",
  hinglish: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mr: "'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif",
  gu: "'Noto Sans Gujarati', 'Plus Jakarta Sans', sans-serif",
  bn: "'Noto Sans Bengali', 'Plus Jakarta Sans', sans-serif",
  ta: "'Noto Sans Tamil', 'Plus Jakarta Sans', sans-serif",
  te: "'Noto Sans Telugu', 'Plus Jakarta Sans', sans-serif",
  kn: "'Noto Sans Kannada', 'Plus Jakarta Sans', sans-serif",
  pa: "'Noto Sans Gurmukhi', 'Plus Jakarta Sans', sans-serif",
};

const GOOGLE_FONT_URLS: Record<LanguageCode, string> = {
  en: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  hi: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  hinglish: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  mr: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  gu: "https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  bn: "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  ta: "https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  te: "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  kn: "https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  pa: "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("factoryiq_language") as LanguageCode;
      if (stored && LanguageOptions.ALL.some((opt) => opt.code === stored)) {
        applyLanguage(stored);
      } else {
        applyLanguage("en");
      }
    }
  }, []);

  const translateDOMInstant = (targetLang: LanguageCode) => {
    if (typeof window === "undefined" || !document.body) return;

    const sourceDict = translations.en;
    const targetDict = translations[targetLang] || translations.en;

    // Create a reverse mapping from any known text value to English key
    const valueToKeyMap: Record<string, string> = {};
    
    // Register English values
    Object.entries(sourceDict).forEach(([key, val]) => {
      if (typeof val === "string" && val.trim()) {
        valueToKeyMap[val.trim().toLowerCase()] = key;
      }
    });

    // Register all dictionary values from all languages to cross-reference
    Object.values(translations).forEach((dict) => {
      Object.entries(dict).forEach(([key, val]) => {
        if (typeof val === "string" && val.trim()) {
          valueToKeyMap[val.trim().toLowerCase()] = key;
        }
      });
    });

    const walkTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
        const trimmed = node.nodeValue.trim().toLowerCase();
        if (trimmed && valueToKeyMap[trimmed]) {
          const key = valueToKeyMap[trimmed];
          const translatedText = targetDict[key];
          if (translatedText) {
            node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), translatedText);
          }
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          // Skip script and style elements
          if (child.nodeName !== "SCRIPT" && child.nodeName !== "STYLE") {
            walkTextNodes(child);
          }
        }
      }
    };

    setTimeout(() => {
      walkTextNodes(document.body);
    }, 50);
  };

  const applyLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("factoryiq_language", code);
      document.cookie = `factoryiq_language=${code}; path=/; max-age=31536000`;
      
      const isRtl = RTL_LANGUAGES.includes(code);
      document.documentElement.lang = code;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
      document.body.dataset.lang = code;

      const fontStack = FONT_STACKS[code] || FONT_STACKS.en;
      const fontUrl = GOOGLE_FONT_URLS[code] || GOOGLE_FONT_URLS.en;

      // Dynamically load Google Font Link tag
      let fontLink = document.getElementById("factoryiq-font-link") as HTMLLinkElement;
      if (!fontLink) {
        fontLink = document.createElement("link");
        fontLink.id = "factoryiq-font-link";
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
      }
      fontLink.href = fontUrl;

      // Inject dynamic global style tag overriding font across all DOM elements
      let styleEl = document.getElementById("factoryiq-dynamic-font") as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "factoryiq-dynamic-font";
        document.head.appendChild(styleEl);
      }

      styleEl.innerHTML = `
        *, *::before, *::after {
          font-family: ${fontStack} !important;
        }
      `;

      // Trigger instant DOM text replacement across the website
      translateDOMInstant(code);
    }
  };

  const setLanguage = (code: LanguageCode) => {
    applyLanguage(code);
  };

  const t = (key: string, paramsOrFallback?: Record<string, any> | string, defaultText?: string) => {
    return getTranslation(language, key, paramsOrFallback, defaultText);
  };

  const currentOption = LanguageOptions.ALL.find((opt) => opt.code === language) || LanguageOptions.ALL[0];
  const dir = RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentOption,
        options: LanguageOptions.ALL,
        dir,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const useTranslation = useLanguage;
