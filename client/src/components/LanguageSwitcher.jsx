import { useLanguage } from "../i18n.jsx";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switcher">
      <button
        className={lang === "ru" ? "lang-option active" : "lang-option"}
        onClick={() => setLang("ru")}
      >
        RU
      </button>
      <button
        className={lang === "en" ? "lang-option active" : "lang-option"}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
