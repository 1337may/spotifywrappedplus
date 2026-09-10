import { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "language";

const translations = {
  ru: {
    appTitle: "Spotify Taste Summary",
    loginSubtitle: "Узнайте свои любимые треки и исполнителей.",
    error_state_mismatch: "Не удалось проверить запрос авторизации, попробуйте ещё раз.",
    error_access_denied: "Доступ к Spotify не был предоставлен.",
    error_token_exchange_failed: "Не удалось завершить авторизацию в Spotify.",
    error_missing_credentials: "Введите Client ID и Client Secret.",
    error_generic: "Что-то пошло не так.",
    setupIntro:
      "Из-за ограничений Spotify (Development Mode, до 5 пользователей на приложение) у каждого посетителя должно быть своё Spotify-приложение. Это бесплатно и занимает пару минут:",
    setupStep1: "Откройте",
    setupStep1End: "и нажмите Create app",
    setupStep2: "Впишите любое название (не начинающееся на «Spot») и описание",
    setupStep3: "В поле Redirect URIs добавьте ровно:",
    setupStep4: "Сохраните и откройте Settings приложения — там будут Client ID и Client Secret",
    clientIdPlaceholder: "Client ID",
    clientSecretPlaceholder: "Client Secret",
    loginButton: "Войти через Spotify",
    summaryTitle: "Ваша выжимка",
    logout: "Выйти",
    range_short_term: "1 месяц",
    range_medium_term: "6 месяцев",
    range_long_term: "Всё время",
    loading: "Загрузка...",
    summaryError: "Не удалось загрузить данные из Spotify.",
    topTracks: "Топ треков",
    topArtists: "Топ исполнителей",
  },
  en: {
    appTitle: "Spotify Taste Summary",
    loginSubtitle: "Discover your favorite tracks and artists.",
    error_state_mismatch: "Could not verify the authorization request, please try again.",
    error_access_denied: "Access to Spotify was not granted.",
    error_token_exchange_failed: "Could not complete Spotify authorization.",
    error_missing_credentials: "Enter your Client ID and Client Secret.",
    error_generic: "Something went wrong.",
    setupIntro:
      "Due to Spotify's restrictions (Development Mode, up to 5 users per app), every visitor needs their own Spotify app. It's free and takes a couple of minutes:",
    setupStep1: "Open",
    setupStep1End: "and click Create app",
    setupStep2: "Enter any name (not starting with \"Spot\") and description",
    setupStep3: "In the Redirect URIs field, add exactly:",
    setupStep4: "Save and open the app's Settings — you'll find Client ID and Client Secret there",
    clientIdPlaceholder: "Client ID",
    clientSecretPlaceholder: "Client Secret",
    loginButton: "Log in with Spotify",
    summaryTitle: "Your Recap",
    logout: "Log out",
    range_short_term: "1 month",
    range_medium_term: "6 months",
    range_long_term: "All time",
    loading: "Loading...",
    summaryError: "Could not load data from Spotify.",
    topTracks: "Top Tracks",
    topArtists: "Top Artists",
  },
};

const LanguageContext = createContext(null);

function detectDefaultLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ru" || stored === "en") return stored;
  return navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectDefaultLanguage);

  function setLang(next) {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key) => translations[lang][key] ?? key,
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
