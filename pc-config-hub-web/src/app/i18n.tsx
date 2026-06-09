"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

export type SiteLanguage = "en" | "bg";

const LANGUAGE_STORAGE_KEY = "pc-config-hub.language";
const LANGUAGE_CHANGE_EVENT = "pc-config-hub-language";

type Messages = {
  nav: Record<string, string>;
  authMenu: Record<string, string>;
  profile: Record<string, string>;
  footer: Record<string, string>;
  pages: Record<string, string>;
};

const pagesEn = {
  builderEyebrow: "Configuration lab",
  builderTitle: "Build a new configuration",
  builderIntroUser:
    "Mix public and private parts, then validate compatibility before saving.",
  builderIntroGuest:
    "Select from public parts to explore compatibility. Sign in to save configurations.",
  builderLoadError:
    "Unable to load parts right now. Check server logs for details.",
  catalogEyebrow: "Hardware collection",
  catalogTitle: "Catalog",
  catalogIntroUser: "Showing public components plus your private inventory.",
  catalogIntroGuest:
    "Showing public components only. Sign in to see your private parts.",
  catalogUploadEyebrow: "Upload parts",
  catalogUploadHelp: "Add hardware with specs, tags, logs, and photos.",
  catalogCategories: "Categories",
  catalogAll: "All",
  configurationsEyebrow: "Approved builds gallery",
  configurationsTitle: "Ready configurations",
  configurationsIntroUser:
    "Showing public builds plus your private configurations. Only builds that include a case are listed.",
  configurationsIntroGuest:
    "Showing public builds only. Sign in to see your private configurations. Only builds that include a case are listed.",
  configurationsEmpty: "No configurations available yet.",
  configurationsNoCaseImage: "No case image yet",
  configurationsViewDetails: "View details",
  configurationsPublic: "Public",
  configurationsPrivate: "Private",
  configurationsParts: "{count} parts",
  configurationsEstimatedWatts: "{watts}W est.",
  configurationsByOwner: "By {owner}",
  configurationsMyConfigs: "My configs",
  configurationsOpenManage: "Open / manage",
  homeHeroEyebrow: "Living archive for vintage hardware",
  homeHeroTitle: "Preserving Computer History, One Machine at a Time.",
  homeHeroIntro:
    "Document, organize and share your collection of vintage computers, rare hardware, expansion cards, software, and restorations.",
  homeCreateCollection: "Create Collection",
  homeExploreCollections: "Explore Collections",
  homeTotalCollectors: "Total collectors",
  homeComputersDocumented: "Computers documented",
  homeHardwareComponents: "Hardware components",
  homeRestorationLogs: "Restoration logs",
  homePhotosUploaded: "Photos uploaded",
  homeHallOfFame: "Hall of Fame",
  homeReasonsTitle: "Reasons to keep documenting",
  homeReasonsIntro:
    "The front page rewards preservation work: rare finds, complete systems, restoration activity and historically important machines can all surface here.",
  homeOldestMachine: "Oldest machine",
  homeOldestFallback: "Awaiting the first dated entry",
  homeRarestProcessor: "Rarest processor",
  homeRareCpuFallback: "No rare CPU documented yet",
  homeLargestCollection: "Largest collection",
  homeNoPublicCollection: "No public collection yet",
  homeLastRestoredSystem: "Last restored system",
  homeMachineOfWeek: "Machine of the week",
  homeMachineFallback: "Nominate the first build",
  homeFeaturedCollections: "Featured collections",
  homeFeaturedTitle: "From private shelves to public archive",
  homeBrowseAll: "Browse all",
  homeSystemsSeekingCurator: "{count} systems / seeking curator",
  homePartsByOwner: "{count} parts / by {owner}",
  homeRareSpotlight: "Rare hardware spotlight",
  homeEraUnknown: "Era unknown",
  homeRareDescriptionFallback:
    "A documented piece of computing history from the public archive.",
  homeRareEmpty:
    "Add Voodoo cards, XT motherboards, Apple II hardware, industrial SBCs or prototype hardware to activate the spotlight.",
  homeRecentRestorations: "Recent restorations",
  homeRestorationsTitle: "Every repair is part of the record",
  homeRestorationsIntro:
    "Track capacitor replacements, repairs, battery damage cleanup, retro rebuilds and successful boot tests with notes and photos.",
  homeExploreArchive: "Explore the archive",
  homeBrowseEraPlatform: "Browse by era and platform",
  homeWhy: "Why PCConfigHub?",
  homeWhyTitle: "Not another disappearing forum thread",
  homeWhyIntro:
    "Social posts vanish into feeds. Forum images break. Notes stay on private drives. PCConfigHub keeps collections organized, searchable, linked and preserved for the people who will need them next.",
  homeContribute: "Contribute to the archive",
  homeContributeTitle: "Your collection deserves to be preserved.",
  homeContributeIntro:
    "Whether you own a single XT motherboard or a room full of vintage computers, help document computing history.",
  homeCreateYourCollection: "Create Your Collection",
  homeEra1970Hardware: "Apple II, S-100 systems, early terminals",
  homeEra1970Tone: "Birth of personal computing",
  homeEra1980Hardware: "XT, AT, Commodore, Amiga, CGA/EGA",
  homeEra1980Tone: "Home micros and the IBM PC standard",
  homeEra1990Hardware: "386, 486, Pentium, VLB, PCI, Sound Blaster",
  homeEra1990Tone: "DOS games, multimedia kits and beige towers",
  homeEra2000Hardware: "AGP, Socket A, Pentium 4, early SATA",
  homeEra2000Tone: "Legacy meets modern performance",
  homeEra2010Hardware: "Late optical media, PCIe transitions, rescue systems",
  homeEra2010Tone: "The last bridge before everything became sealed",
  homeFeatureCollectionManagement: "Collection management",
  homeFeatureConfigurationLinking: "Configuration linking",
  homeFeatureRestorationLogs: "Restoration logs",
  homeFeatureTestLogs: "Test logs",
  homeFeatureHardwareDocs: "Hardware documentation",
  homeFeatureHistoricalPreservation: "Historical preservation",
  homeRestorationExample1:
    "Capacitor replacement documented with before and after photos.",
  homeRestorationExample2:
    "Battery leakage cleaned and neutralized on a late 486 motherboard.",
  homeRestorationExample3:
    "Retro rebuild completed with successful POST and DOS boot test.",
  homeRestorationExample4:
    "Noisy drive diagnosed, imaged and preserved before failure.",
};

const pagesBg: Record<keyof typeof pagesEn, string> = {
  builderEyebrow: "Лаборатория за конфигурации",
  builderTitle: "Създай нова конфигурация",
  builderIntroUser:
    "Комбинирай публични и лични части, после провери съвместимостта преди запазване.",
  builderIntroGuest:
    "Избирай от публичните части, за да провериш съвместимост. Влез в профила си, за да запазваш конфигурации.",
  builderLoadError:
    "Частите не могат да се заредят в момента. Провери server logs за подробности.",
  catalogEyebrow: "Хардуерна колекция",
  catalogTitle: "Каталог",
  catalogIntroUser: "Показват се публични компоненти плюс личният ти инвентар.",
  catalogIntroGuest:
    "Показват се само публични компоненти. Влез в профила си, за да видиш личните си части.",
  catalogUploadEyebrow: "Качи части",
  catalogUploadHelp: "Добави хардуер със спецификации, тагове, логове и снимки.",
  catalogCategories: "Категории",
  catalogAll: "Всички",
  configurationsEyebrow: "Галерия с одобрени билдове",
  configurationsTitle: "Готови конфигурации",
  configurationsIntroUser:
    "Показват се публични билдове плюс личните ти конфигурации. Показват се само билдове с кутия.",
  configurationsIntroGuest:
    "Показват се само публични билдове. Влез в профила си, за да видиш личните си конфигурации. Показват се само билдове с кутия.",
  configurationsEmpty: "Все още няма налични конфигурации.",
  configurationsNoCaseImage: "Все още няма снимка на кутия",
  configurationsViewDetails: "Виж детайли",
  configurationsPublic: "Публична",
  configurationsPrivate: "Лична",
  configurationsParts: "{count} части",
  configurationsEstimatedWatts: "{watts}W ориент.",
  configurationsByOwner: "От {owner}",
  configurationsMyConfigs: "Моите конфигурации",
  configurationsOpenManage: "Отвори / управлявай",
  homeHeroEyebrow: "Жив архив за vintage хардуер",
  homeHeroTitle: "Запазваме компютърната история, машина по машина.",
  homeHeroIntro:
    "Документирай, организирай и споделяй колекцията си от vintage компютри, редки компоненти, разширителни карти, софтуер и реставрации.",
  homeCreateCollection: "Създай колекция",
  homeExploreCollections: "Разгледай колекции",
  homeTotalCollectors: "Общо колекционери",
  homeComputersDocumented: "Документирани компютри",
  homeHardwareComponents: "Хардуерни компоненти",
  homeRestorationLogs: "Логове за реставрации",
  homePhotosUploaded: "Качени снимки",
  homeHallOfFame: "Зала на славата",
  homeReasonsTitle: "Причини да продължиш да документираш",
  homeReasonsIntro:
    "Началната страница отличава работата по съхранение: редки находки, завършени системи, реставрации и исторически важни машини могат да се появят тук.",
  homeOldestMachine: "Най-стара машина",
  homeOldestFallback: "Очаква се първият запис с година",
  homeRarestProcessor: "Най-рядък процесор",
  homeRareCpuFallback: "Все още няма документиран рядък CPU",
  homeLargestCollection: "Най-голяма колекция",
  homeNoPublicCollection: "Все още няма публична колекция",
  homeLastRestoredSystem: "Последно реставрирана система",
  homeMachineOfWeek: "Машина на седмицата",
  homeMachineFallback: "Номинирай първия билд",
  homeFeaturedCollections: "Избрани колекции",
  homeFeaturedTitle: "От лични рафтове към публичен архив",
  homeBrowseAll: "Виж всички",
  homeSystemsSeekingCurator: "{count} системи / търси куратор",
  homePartsByOwner: "{count} части / от {owner}",
  homeRareSpotlight: "Фокус върху рядък хардуер",
  homeEraUnknown: "Неизвестна ера",
  homeRareDescriptionFallback:
    "Документирана част от компютърната история в публичния архив.",
  homeRareEmpty:
    "Добави Voodoo карти, XT дънни платки, Apple II хардуер, industrial SBC или прототипи, за да активираш фокуса.",
  homeRecentRestorations: "Последни реставрации",
  homeRestorationsTitle: "Всеки ремонт е част от историята",
  homeRestorationsIntro:
    "Проследявай смени на кондензатори, ремонти, почистване на щети от батерии, retro rebuild-и и успешни boot тестове с бележки и снимки.",
  homeExploreArchive: "Разгледай архива",
  homeBrowseEraPlatform: "Разгледай по ера и платформа",
  homeWhy: "Защо PCConfigHub?",
  homeWhyTitle: "Не още една изчезваща форумна тема",
  homeWhyIntro:
    "Постовете в социалните мрежи потъват. Форумните снимки се чупят. Бележките остават по лични дискове. PCConfigHub пази колекциите организирани, търсими, свързани и съхранени за хората, които ще имат нужда от тях.",
  homeContribute: "Допринеси към архива",
  homeContributeTitle: "Колекцията ти заслужава да бъде запазена.",
  homeContributeIntro:
    "Независимо дали имаш една XT дънна платка или стая с vintage компютри, помогни да документираме компютърната история.",
  homeCreateYourCollection: "Създай своя колекция",
  homeEra1970Hardware: "Apple II, S-100 системи, ранни терминали",
  homeEra1970Tone: "Раждането на персоналните компютри",
  homeEra1980Hardware: "XT, AT, Commodore, Amiga, CGA/EGA",
  homeEra1980Tone: "Домашни микрокомпютри и IBM PC стандартът",
  homeEra1990Hardware: "386, 486, Pentium, VLB, PCI, Sound Blaster",
  homeEra1990Tone: "DOS игри, мултимедийни комплекти и beige tower-и",
  homeEra2000Hardware: "AGP, Socket A, Pentium 4, ранно SATA",
  homeEra2000Tone: "Legacy хардуер среща модерна производителност",
  homeEra2010Hardware: "Късни optical media, PCIe преходи, rescue системи",
  homeEra2010Tone: "Последният мост преди всичко да стане затворено",
  homeFeatureCollectionManagement: "Управление на колекции",
  homeFeatureConfigurationLinking: "Свързване на конфигурации",
  homeFeatureRestorationLogs: "Логове за реставрации",
  homeFeatureTestLogs: "Тестови логове",
  homeFeatureHardwareDocs: "Хардуерна документация",
  homeFeatureHistoricalPreservation: "Историческо съхранение",
  homeRestorationExample1:
    "Смяна на кондензатори, документирана със снимки преди и след.",
  homeRestorationExample2:
    "Почистен и неутрализиран теч от батерия върху късна 486 дънна платка.",
  homeRestorationExample3:
    "Retro rebuild, завършен с успешен POST и DOS boot тест.",
  homeRestorationExample4:
    "Шумен диск е диагностициран, имиджнат и запазен преди отказ.",
};

const messages: Record<SiteLanguage, Messages> = {
  en: {
    nav: {
      home: "Home",
      configurations: "Configurations",
      catalog: "Parts Catalog",
      builder: "Builder",
      login: "Login",
      register: "Register",
    },
    authMenu: {
      open: "Open profile menu",
      loggedIn: "Logged in",
      admin: "Admin",
      moderator: "Moderator",
      profile: "Profile",
      password: "Password",
      language: "Language",
      logout: "Logout",
    },
    profile: {
      title: "Profile settings",
      intro:
        "Manage account preferences for this browser. Your language choice is applied immediately and saved locally.",
      account: "Account",
      signedIn: "Signed in account",
      role: "Role",
      preferences: "Preferences",
      languageTitle: "Site language",
      languageHelp:
        "Choose the interface language for navigation, profile settings, and shared controls.",
      security: "Security",
      passwordHelp: "Update your password from the dedicated security screen.",
      changePassword: "Change password",
    },
    footer: {
      tagline: "Retro-futurist hardware lab interface.",
    },
    pages: pagesEn,
  },
  bg: {
    nav: {
      home: "Начало",
      configurations: "Конфигурации",
      catalog: "Каталог части",
      builder: "Конфигуратор",
      login: "Вход",
      register: "Регистрация",
    },
    authMenu: {
      open: "Отвори профилното меню",
      loggedIn: "Влязъл профил",
      admin: "Админ",
      moderator: "Модератор",
      profile: "Профил",
      password: "Парола",
      language: "Език",
      logout: "Изход",
    },
    profile: {
      title: "Настройки на профила",
      intro:
        "Управлявай предпочитанията за този браузър. Избраният език се прилага веднага и се запазва локално.",
      account: "Профил",
      signedIn: "Влязъл профил",
      role: "Роля",
      preferences: "Предпочитания",
      languageTitle: "Език на сайта",
      languageHelp:
        "Избери езика на интерфейса за навигация, профилни настройки и общи контроли.",
      security: "Сигурност",
      passwordHelp: "Смени паролата си от отделния екран за сигурност.",
      changePassword: "Смяна на парола",
    },
    footer: {
      tagline: "Ретро-футуристичен хардуерен лабораторен интерфейс.",
    },
    pages: pagesBg,
  },
};

type LanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  t: Messages;
  pageText: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLanguage(): SiteLanguage {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === "bg" || savedLanguage === "en") {
    return savedLanguage;
  }

  return window.navigator.language.toLowerCase().startsWith("bg") ? "bg" : "en";
}

function subscribeToLanguageChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  };
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const language = useSyncExternalStore<SiteLanguage>(
    subscribeToLanguageChanges,
    getStoredLanguage,
    () => "en"
  );

  const setLanguage = (nextLanguage: SiteLanguage) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  };

  const pageText = useCallback(
    (key: string, params: Record<string, string | number> = {}) => {
      const template =
        messages[language].pages[key] ?? messages.en.pages[key] ?? key;

      return Object.entries(params).reduce(
        (text, [paramKey, value]) =>
          text.replaceAll(`{${paramKey}}`, String(value)),
        template
      );
    },
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: messages[language],
      pageText,
    }),
    [language, pageText]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return value;
}
