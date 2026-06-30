import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import "./LandingPage.css";
import heroBg from "../../assets/hero-bg.png";
import heroBgLight from "../../assets/hero-bg-light.png";

type LandingLanguage = "ru" | "en";
type LandingTheme = "dark" | "light";
type IconName =
  | "telegram"
  | "play"
  | "menu"
  | "close"
  | "sun"
  | "moon"
  | "orbit"
  | "user"
  | "book"
  | "toolbox"
  | "shield"
  | "gamepad"
  | "zap"
  | "cart"
  | "gem"
  | "coin"
  | "map"
  | "award"
  | "chart"
  | "dollar"
  | "download"
  | "file"
  | "send";

const TELEGRAM_URL = "https://t.me/the_dao_way";
const DAO_WAY_FULL_LOGO_SRC = "/assets/landing/logo_new.png";
const DAO_WAY_WORDMARK_SRC = "/assets/landing/dao-way-logo-wordmark.png";
const JOURNEY_LOGO_SRCS = [
  "/assets/landing/site-logo-normalized/1_game.png",
  "/assets/landing/site-logo-normalized/2_archetype.png",
  "/assets/landing/site-logo-normalized/3_education.png",
  "/assets/landing/site-logo-normalized/4_tools.png",
  "/assets/landing/site-logo-normalized/5_risk.png",
  "/assets/landing/site-logo-normalized/6_meme.png",
  "/assets/landing/site-logo-normalized/7_sparks.png",
  "/assets/landing/site-logo-normalized/8_market.png",
  "/assets/landing/site-logo-normalized/9_nft.png",
  "/assets/landing/site-logo-normalized/10_token.png",
];
const USP_ICON_SRCS = [
  "/assets/landing/start-icons/map_new.png",
  "/assets/landing/start-icons/2_tasks.png",
  "/assets/landing/start-icons/3_levels.png",
  "/assets/landing/start-icons/4_money.png",
];
const TRACTION_ICON_SRCS = [
  "/assets/landing/traction-icons/modules.png",
  "/assets/landing/traction-icons/lessons.png",
  "/assets/landing/traction-icons/products.png",
  "/assets/landing/traction-icons/revenue.png",
];
const PRESS_ICON_SRCS = [
  "/assets/landing/press-icons/one_paper.png",
  "/assets/landing/press-icons/pitch_deck.png",
  "/assets/landing/press-icons/faq.png",
  "/assets/landing/press-icons/whitepaper.png",
  "/assets/landing/press-icons/brand_story.png",
  "/assets/landing/press-icons/roadmap.png",
];

const STORAGE_KEYS = {
  language: "dao-way-landing-language",
  theme: "dao-way-landing-theme-default-dark",
};

// Journey path in hero coordinate system (0–100% of full hero width × height)
// Chaos (red vortex) is lower-left, System (city) is upper-right
// Dots placed on original hero-bg.png (1254×1254).
// Conversion: y_hero = (y_img_fraction × 1440 - 70) / 830
// x is the same % in image and hero (both 100% width).
// Dot positions from background image file:
// img%:  1(38,50) 2(45,48) 3(50,45) 4(56,42) 5(60,39) 6(63,35) 7(68,31) 8(71,27) 9(75,22) 10(79,16)
const JOURNEY_PATH = "M 35 88 C 38.5 87, 40.5 85, 42 84 C 45 82.5, 47.5 81, 50 80 C 53 78, 55 75.5, 57 75 C 59 73, 61 71, 63 71 C 65 67, 66 64, 67 63 C 70 58, 71 56, 72 54 C 73 49, 74 46, 74 43 C 76 38, 77 36, 77 35 C 78 31, 79 28, 79 26";

// Node positions aligned to the glowing journey path over the hero background
const journeyNodePositions: { x: number; y: number; tooltip: "right" | "left" }[] = [
  { x: 35, y: 88, tooltip: "right" }, // 1
  { x: 42, y: 84, tooltip: "right" }, // 2
  { x: 50, y: 80, tooltip: "right" }, // 3
  { x: 57, y: 75, tooltip: "right" }, // 4
  { x: 63, y: 71, tooltip: "right" }, // 5
  { x: 67, y: 63, tooltip: "right" }, // 6
  { x: 72, y: 54, tooltip: "left"  }, // 7
  { x: 74, y: 43, tooltip: "left"  }, // 8
  { x: 77, y: 35, tooltip: "left"  }, // 9
  { x: 79, y: 26, tooltip: "left"  }, // 10
];

// Chaos label moved left toward the red vortex; system near city
const heroMarkers = {
  chaos:  { x: 20, y: 90 },  // left — closer to the actual vortex
  system: { x: 88, y: 13 },
};

const content = {
  ru: {
    meta: {
      title: "THE DAO WAY - путь от хаоса к системе",
      description:
        "Telegram-native Web3-экосистема для обучения, инструментов, игровых механик, Sparks, DAO Market и DAO Token.",
    },
    nav: {
      home: "Главная",
      products: "Продукты",
      roadmap: "Дорожная карта",
      tokenomics: "Токеномика",
      materials: "Материалы",
      about: "О нас",
      launch: "Запустить в Telegram",
      pitchdeck: "Запросить Pitchdeck",
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
      theme: "Переключить тему",
    },
    hero: {
      superheading: "Telegram-native экосистема для нового финансового мира",
      titleTop: "Пройди путь",
      titleMiddle: "от хаоса",
      titleBottom: "к системе",
      subtitle:
        "The DAO Way - это интерактивная экосистема в Telegram, объединяющая обучение, инструменты, игровые механики и продукты для роста, заработка и управления в Web3.",
      demo: "Смотреть демо",
      users: "25 000+ пользователей уже в пути",
      rating: "4.9 рейтинг сообщества",
      chaos: "ХАОС",
      chaosCaption: "Риск, шум, неопределенность",
      system: "СИСТЕМА",
      systemCaption: "Свобода, владение, влияние",
      visualNote: "Твой путь. Твой темп.",
    },
    progressSteps: [
      ["Crypto Reality", "Пойми реальность крипторынка", "orbit"],
      ["Archetype", "Определи свой криптоархетип", "user"],
      ["DAO Education", "Обучение и комьюнити для роста", "book"],
      ["DAO Tools", "Инструменты для действий", "toolbox"],
      ["Risk Guardian", "Управление рисками и безопасностью", "shield"],
      ["Meme Hero Farming", "Фарминг, задания и игровые механики", "gamepad"],
      ["Sparks", "Микро-возможности каждый день", "zap"],
      ["DAO Market", "Маркетплейс товаров, услуг и возможностей", "cart"],
      ["NFT Heroes", "Героические NFT и коллекции", "gem"],
      ["DAO Token", "Владей. Участвуй. Создавай ценность.", "coin"],
    ],
    traction: [
      ["25", "Модулей", "Практические знания и пошаговые стратегии", "book"],
      ["178", "Уроков", "От основ до продвинутых механик Web3", "award"],
      ["8", "Продуктов", "Интегрированы в одну экосистему", "gem"],
      ["10", "Источников выручки", "Создавай, зарабатывай и масштабируйся", "coin"],
    ],
    usp: {
      title: "Твой путь. Твой темп.",
      subtitle:
        "The DAO Way помогает двигаться по Web3 не хаотично, а через понятную карту прогресса, задания, награды и продукты экосистемы.",
      items: [
        ["Интерактивная карта прогресса", "map"],
        ["Задания и награды", "award"],
        ["Баллы, уровни и достижения", "chart"],
        ["Доходные механики на каждом шаге", "dollar"],
      ],
    },
    infrastructure: {
      title: "Web3-инфраструктура и рынки, вокруг которых строится обучение",
      subtitle:
        "Мы обучаем пользователей ориентироваться в ключевых продуктах, сетях, инструментах и рыночной инфраструктуре Web3.",
      note: "Логотипы используются как рыночный контекст и не означают партнёрство или одобрение.",
      mapLabel: "Web3 Market Map",
      categories: ["Exchanges", "Networks", "Data", "Tools"],
    },
    press: {
      title: "Материалы и документы проекта",
      subtitle: "Скачайте открытые материалы или запросите доступ к документам для инвесторов и партнеров.",
      comingSoon: "Скоро",
      cards: [
        ["One Pager", "Одностраничное резюме проекта", "Для быстрого знакомства с проектом", "Открыто", "Скачать PDF", "download"],
        ["Pitch Deck", "Презентация для инвесторов и партнеров", "Для инвесторов и стратегических партнёров", "По запросу", "Request Access", "send"],
        ["FAQ", "Ответы на частые вопросы", "Ключевые вопросы об экосистеме", "Открыто", "Читать онлайн", "file"],
        ["Whitepaper Lite", "Облегченная концептуальная документация", "Концепция, логика продукта и экономика", "Открыто / По запросу", "Подробнее", "file"],
        ["Brand Story", "История бренда и нарратив", "Нарратив, миссия и позиционирование", "Открыто", "Читать", "book"],
        ["Roadmap", "План развития по этапам", "Этапы развития и будущие продукты", "Открыто", "Смотреть", "map"],
      ],
    },
    finalCta: {
      title: "Начни свой путь сегодня",
      subtitle: "Запусти The DAO Way в Telegram или запроси материалы проекта для партнерства и инвестиций.",
      microline: "Telegram-native. Game-driven. DAO-ready.",
    },
    footer: {
      description:
        "Telegram-native Web3-экосистема, где обучение, инструменты, игровые механики и DAO-продукты собираются в понятный путь роста.",
      privacy: "Privacy Policy",
      terms: "Terms",
      copyright: "© 2026 THE DAO WAY. All rights reserved.",
    },
    modal: {
      title: "Request Pitchdeck",
      subtitle: "Оставьте контакты, и мы подготовим доступ к материалам проекта.",
      name: "Имя",
      email: "Email",
      company: "Компания",
      purpose: "Цель запроса",
      send: "Отправить",
      success: "Спасибо! Мы получили запрос и свяжемся с вами.",
      required: "Заполните имя, email и цель запроса.",
      emailError: "Введите корректный email.",
      close: "Закрыть модальное окно",
    },
  },
  en: {
    meta: {
      title: "THE DAO WAY - from chaos to system",
      description:
        "Telegram-native Web3 ecosystem for education, tools, game mechanics, Sparks, DAO Market, and DAO Token.",
    },
    nav: {
      home: "Home",
      products: "Products",
      roadmap: "Roadmap",
      tokenomics: "Tokenomics",
      materials: "Materials",
      about: "About",
      launch: "Launch in Telegram",
      pitchdeck: "Request Pitchdeck",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      theme: "Toggle theme",
    },
    hero: {
      superheading: "Telegram-native ecosystem for the new financial world",
      titleTop: "Move from",
      titleMiddle: "chaos",
      titleBottom: "to system",
      subtitle:
        "The DAO Way is an interactive Telegram ecosystem combining education, tools, game mechanics, and products for growth, earning, and governance in Web3.",
      demo: "Watch Demo",
      users: "25,000+ users already on the path",
      rating: "4.9 community rating",
      chaos: "CHAOS",
      chaosCaption: "Risk, noise, uncertainty",
      system: "SYSTEM",
      systemCaption: "Freedom, ownership, influence",
      visualNote: "Your path. Your pace.",
    },
    progressSteps: [
      ["Crypto Reality", "Understand the reality of the crypto market", "orbit"],
      ["Archetype", "Discover your crypto archetype", "user"],
      ["DAO Education", "Education and community for growth", "book"],
      ["DAO Tools", "Tools for action", "toolbox"],
      ["Risk Guardian", "Risk and security management", "shield"],
      ["Meme Hero Farming", "Farming, quests, and game mechanics", "gamepad"],
      ["Sparks", "Micro-opportunities every day", "zap"],
      ["DAO Market", "Marketplace for goods, services, and opportunities", "cart"],
      ["NFT Heroes", "Heroic NFTs and collections", "gem"],
      ["DAO Token", "Own. Participate. Create value.", "coin"],
    ],
    traction: [
      ["25", "Modules", "Practical knowledge and step-by-step strategies", "book"],
      ["178", "Lessons", "From basics to advanced Web3 mechanics", "award"],
      ["8", "Products", "Integrated into one ecosystem", "gem"],
      ["10", "Revenue streams", "Create, earn, and scale", "coin"],
    ],
    usp: {
      title: "Your path. Your pace.",
      subtitle: "The DAO Way helps users move through Web3 with a clear progress map, quests, rewards, and ecosystem products.",
      items: [
        ["Interactive progress map", "map"],
        ["Quests and rewards", "award"],
        ["Points, levels, and achievements", "chart"],
        ["Earning mechanics at each step", "dollar"],
      ],
    },
    infrastructure: {
      title: "Web3 infrastructure and markets our education is built around",
      subtitle: "We help users navigate the key products, networks, tools, and market infrastructure of Web3.",
      note: "Logos are used as market context and do not imply partnership or endorsement.",
      mapLabel: "Web3 Market Map",
      categories: ["Exchanges", "Networks", "Data", "Tools"],
    },
    press: {
      title: "Project materials and documents",
      subtitle: "Download public materials or request access to investor and partner documents.",
      comingSoon: "Coming soon",
      cards: [
        ["One Pager", "One-page project summary", "Quick project overview", "Public", "Download PDF", "download"],
        ["Pitch Deck", "Investor and partner presentation", "For investors and strategic partners", "On request", "Request Access", "send"],
        ["FAQ", "Frequently asked questions", "Key questions about the ecosystem", "Public", "Read Online", "file"],
        ["Whitepaper Lite", "Lightweight concept documentation", "Concept, product logic, and economy", "Public / On request", "Learn More", "file"],
        ["Brand Story", "Brand story and narrative", "Narrative, mission, and positioning", "Public", "Read", "book"],
        ["Roadmap", "Development roadmap by stages", "Development stages and future products", "Public", "View", "map"],
      ],
    },
    finalCta: {
      title: "Start your path today",
      subtitle: "Launch The DAO Way in Telegram or request project materials for partnership and investment discussions.",
      microline: "Telegram-native. Game-driven. DAO-ready.",
    },
    footer: {
      description:
        "A Telegram-native Web3 ecosystem where education, tools, game mechanics, and DAO products become a clear growth path.",
      privacy: "Privacy Policy",
      terms: "Terms",
      copyright: "© 2026 THE DAO WAY. All rights reserved.",
    },
    modal: {
      title: "Request Pitchdeck",
      subtitle: "Leave your contacts and we will prepare access to project materials.",
      name: "Name",
      email: "Email",
      company: "Company",
      purpose: "Purpose",
      send: "Send Request",
      success: "Thank you! We received your request and will contact you.",
      required: "Please fill in name, email, and purpose.",
      emailError: "Please enter a valid email.",
      close: "Close modal",
    },
  },
} as const;

const marketLogos = [
  {
    name: "Binance",
    src: "/assets/landing/market-icons/binance.png",
    lightSrc: "/assets/landing/market-icons/binance_light_theme.png",
  },
  {
    name: "OKX",
    src: "/assets/landing/market-icons/okh.png",
    lightSrc: "/assets/landing/market-icons/okh_light_theme.png",
  },
  {
    name: "Gate.io",
    src: "/assets/landing/market-icons/gate.png",
    lightSrc: "/assets/landing/market-icons/gate_light_theme.png",
  },
  {
    name: "TON",
    src: "/assets/landing/market-icons/ton.png",
    lightSrc: "/assets/landing/market-icons/ton_light_theme.png",
  },
  {
    name: "Chainlink",
    src: "/assets/landing/market-icons/chairlink.png",
    lightSrc: "/assets/landing/market-icons/chainlink_light_theme.png",
  },
  {
    name: "Dextools",
    src: "/assets/landing/market-icons/dex.png",
    lightSrc: "/assets/landing/market-icons/dex_light_theme.png",
  },
  {
    name: "CoinGecko",
    src: "/assets/landing/market-icons/coingecko.png",
    lightSrc: "/assets/landing/market-icons/coingecko_light_theme.png",
  },
];
const navTargets = ["home", "products", "roadmap", "tokenomics", "materials", "about"] as const;

function getInitialLanguage(): LandingLanguage {
  const saved = window.localStorage.getItem(STORAGE_KEYS.language);
  return saved === "en" || saved === "ru" ? saved : "ru";
}

function getInitialTheme(): LandingTheme {
  const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === "dark" || saved === "light") return saved;
  return "dark";
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, JSX.Element> = {
    telegram: <path d="m21 3-7.4 18-4.1-7.2L3 10.8 21 3Zm-11.5 10.8 4.6-4.5" />,
    play: <path d="M8 5v14l11-7-11-7Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    sun: <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m14.4-6.4 1.4-1.4M4.2 19.8l1.4-1.4m0-12.8L4.2 4.2m15.6 15.6-1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
    moon: <path d="M21 14.7A7.4 7.4 0 0 1 9.3 3a8.8 8.8 0 1 0 11.7 11.7Z" />,
    orbit: <path d="M12 12h.01M4 12c3.2-5.3 12.8-5.3 16 0-3.2 5.3-12.8 5.3-16 0Zm16 0c-3.2 5.3-12.8 5.3-16 0" />,
    user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
    book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />,
    toolbox: <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 5h14M4 7h16v12H4V7Zm8 4v3" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5" />,
    gamepad: <path d="M8 13h.01M6 11h4m6 2h.01M18 11h.01M7 8h10a4 4 0 0 1 3.8 2.8l1 3.2a3 3 0 0 1-5 3l-1.3-1H8.5L7.2 17a3 3 0 0 1-5-3l1-3.2A4 4 0 0 1 7 8Z" />,
    zap: <path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z" />,
    cart: <path d="M5 6h16l-2 8H7L5 2H2m7 18h.01M18 20h.01" />,
    gem: <path d="m6 3 12 0 4 6-10 12L2 9l4-6Zm-4 6h20M8 3l4 18 4-18" />,
    coin: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v12m3-9.5c-.7-.7-1.7-1-3-1-1.5 0-2.5.8-2.5 2s1 1.8 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.3 0-2.3-.3-3-1" />,
    map: <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Zm0-15v15m6-12v15" />,
    award: <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3 0-1 7 4-2 4 2-1-7" />,
    chart: <path d="M4 19V5m5 14v-7m5 7V8m5 11V3" />,
    dollar: <path d="M12 2v20m4-15.5c-.8-.8-2-1.2-3.5-1.2-2 0-3.5 1-3.5 2.7s1.4 2.3 3.5 2.8 3.5 1.2 3.5 3-1.5 3-3.7 3c-1.7 0-3-.5-4.1-1.5" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />,
    file: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h5" />,
    send: <path d="m22 2-7 20-4-9-9-4 20-7Zm-11 11 4-4" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function BrandMark() {
  return (
    <a className="landing-brand" href="#home" aria-label="THE DAO WAY">
      <img className="landing-brand__wordmark" src={DAO_WAY_WORDMARK_SRC} alt="THE DAO WAY" />
    </a>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="landing-section" id={id}>
      <div className="landing-section__inner">
        {(eyebrow || title || subtitle) && (
          <div className="landing-section__head reveal">
            {eyebrow && <p className="landing-eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function useLandingSeo(language: LandingLanguage) {
  useEffect(() => {
    const meta = content[language].meta;
    document.documentElement.lang = language;
    document.title = meta.title;

    const setMeta = (selector: string, attr: "content", value: string) => {
      const element = document.head.querySelector<HTMLMetaElement>(selector);
      if (element) element.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", meta.description);
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[name="twitter:title"]', "content", meta.title);
    setMeta('meta[name="twitter:description"]', "content", meta.description);
  }, [language]);
}

function LandingHeader({
  language,
  theme,
  isMenuOpen,
  onLanguage,
  onTheme,
  onMenu,
  onPitchdeck,
}: {
  language: LandingLanguage;
  theme: LandingTheme;
  isMenuOpen: boolean;
  onLanguage: (language: LandingLanguage) => void;
  onTheme: () => void;
  onMenu: () => void;
  onPitchdeck: () => void;
}) {
  const t = content[language];
  const nav = navTargets.map((target) => (
    <a key={target} href={`#${target}`}>
      {t.nav[target]}
    </a>
  ));

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <BrandMark />
        <nav className="landing-nav" aria-label="Primary navigation">
          {nav}
        </nav>
        <div className="landing-header__actions">
          <a className="landing-btn landing-btn--primary" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
            <Icon name="telegram" />
            {t.nav.launch}
          </a>
          <button className="landing-btn landing-btn--ghost" type="button" onClick={onPitchdeck}>
            {t.nav.pitchdeck}
          </button>
          <a className="landing-icon-btn landing-version-btn" href="/landing-story" aria-label="Open story landing" title="Story landing">
            V2
          </a>
          <LanguageToggle language={language} onChange={onLanguage} />
          <button className="landing-icon-btn landing-theme-toggle" type="button" onClick={onTheme} aria-label={t.nav.theme}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
        </div>
        <button className="landing-icon-btn landing-menu-btn" type="button" onClick={onMenu} aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}>
          <Icon name={isMenuOpen ? "close" : "menu"} />
        </button>
      </div>
      <div className={`landing-mobile-menu${isMenuOpen ? " is-open" : ""}`} aria-hidden={!isMenuOpen}>
        {nav}
        <a className="landing-btn landing-btn--primary" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
          <Icon name="telegram" />
          {t.nav.launch}
        </a>
        <button className="landing-btn landing-btn--ghost" type="button" onClick={onPitchdeck}>
          {t.nav.pitchdeck}
        </button>
        <div className="landing-mobile-menu__controls">
          <a className="landing-icon-btn landing-version-btn" href="/landing-story" aria-label="Open story landing" title="Story landing">
            V2
          </a>
          <LanguageToggle language={language} onChange={onLanguage} />
          <button className="landing-icon-btn landing-theme-toggle" type="button" onClick={onTheme} aria-label={t.nav.theme}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
        </div>
      </div>
    </header>
  );
}

function LanguageToggle({ language, onChange }: { language: LandingLanguage; onChange: (language: LandingLanguage) => void }) {
  const nextLanguage = language === "ru" ? "en" : "ru";

  return (
    <button
      className="landing-icon-btn landing-lang-toggle"
      type="button"
      onClick={() => onChange(nextLanguage)}
      aria-label={`Switch language to ${nextLanguage.toUpperCase()}`}
      title={`Switch to ${nextLanguage.toUpperCase()}`}
    >
      {nextLanguage.toUpperCase()}
    </button>
  );
}

function Hero({ language, onPitchdeck }: { language: LandingLanguage; onPitchdeck: () => void }) {
  const t = content[language];

  return (
    <main className="landing-hero" id="home">
      <div className="landing-hero__bg" aria-hidden="true" />
      <div className="landing-hero__inner">
        <div className="landing-hero__copy">
          <p className="landing-pill">
            <Icon name="telegram" />
            {t.hero.superheading}
          </p>
          <h1>
            <span>{t.hero.titleTop}</span>
            <span className="landing-gradient-text" data-text={t.hero.titleMiddle}>{t.hero.titleMiddle}</span>
            <span className="landing-cyan-text">{t.hero.titleBottom}</span>
          </h1>
          <p className="landing-hero__subtitle">{t.hero.subtitle}</p>
          <div className="landing-hero__actions">
            <a className="landing-btn landing-btn--primary landing-btn--large" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
              <Icon name="telegram" />
              {t.nav.launch}
            </a>
            <button className="landing-btn landing-btn--ghost landing-btn--large" type="button" onClick={onPitchdeck}>
              <Icon name="play" />
              {t.hero.demo}
            </button>
          </div>
        </div>
        {/* right column spacer — desktop only */}
        <div className="landing-hero__journey-spacer" aria-hidden="true" />
      </div>
      {/* Desktop: absolute path layer */}
      <HeroJourneyLayer language={language} />
      {/* Mobile: vertical step list */}
      <MobileJourney language={language} />
    </main>
  );
}

function MobileJourney({ language }: { language: LandingLanguage }) {
  const t = content[language];
  return (
    <div className="mobile-journey" aria-label="Progress journey">
      <div className="mobile-journey__line" aria-hidden="true" />
      {t.progressSteps.map(([title, description], index) => (
        <div className="mobile-journey__step" key={title}>
          <div className="mobile-journey__orb">
            <span className="mobile-journey__num">{index + 1}</span>
            <img className="mobile-journey__icon" src={JOURNEY_LOGO_SRCS[index]} alt="" aria-hidden="true" />
          </div>
          <div className="mobile-journey__text">
            <strong>{title}</strong>
            <span>{description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroJourneyLayer({ language }: { language: LandingLanguage }) {
  const t = content[language];

  return (
    <div className="hero-journey-layer" aria-label="Progress journey">
      {/* SVG path spans 100% of hero */}
      <svg className="journey-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--journey-path-start, #ef4444)" stopOpacity="0.95" />
            <stop offset="35%"  stopColor="var(--journey-path-mid-1, #a855f7)" stopOpacity="1" />
            <stop offset="70%"  stopColor="var(--journey-path-mid-2, #6366f1)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--journey-path-end, #38bdf8)" stopOpacity="1" />
          </linearGradient>
          <filter id="sparkGlow" x="-500%" y="-500%" width="1100%" height="1100%">
            <feGaussianBlur stdDeviation="0.8 1.38" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path className="journey__path-halo" d={JOURNEY_PATH} />
        <path className="journey__path-core" d={JOURNEY_PATH} />

        <circle r="0.55" fill="rgba(168,85,247,0.5)" filter="url(#sparkGlow)">
          <animateMotion dur="5.5s" repeatCount="indefinite" path={JOURNEY_PATH} />
        </circle>
        <circle r="0.18" fill="#ffffff">
          <animateMotion dur="5.5s" repeatCount="indefinite" path={JOURNEY_PATH} />
        </circle>
      </svg>

      {/* ХАОС marker — near red vortex, bottom-left */}
      <div
        className="journey-marker journey-marker--chaos"
        style={{ "--mx": `${heroMarkers.chaos.x}%`, "--my": `${heroMarkers.chaos.y}%` } as CSSProperties}
      >
        <strong>{t.hero.chaos}</strong>
        <span>{t.hero.chaosCaption}</span>
      </div>

      {/* System glow orb — pulsing aura behind the city */}
      <span
        className="hero-system-glow"
        style={{ left: `${heroMarkers.system.x}%`, top: `${heroMarkers.system.y}%` } as CSSProperties}
        aria-hidden="true"
      />

      {/* СИСТЕМА marker — near city, upper-right */}
      <div
        className="journey-marker journey-marker--system"
        style={{ "--mx": `${heroMarkers.system.x}%`, "--my": `${heroMarkers.system.y}%` } as CSSProperties}
      >
        <strong>{t.hero.system}</strong>
        <span>{t.hero.systemCaption}</span>
      </div>

      {/* 10 journey nodes, each absolutely positioned on the path */}
      {t.progressSteps.map(([title, description], index) => {
        const pos = journeyNodePositions[index];
        return (
          <button
            type="button"
            className={`journey-node journey-node--tooltip-${pos.tooltip} journey-node--step-${index + 1}`}
            key={title}
            aria-label={`${index + 1}. ${title}. ${description}`}
            style={{
              "--x":     `${pos.x}%`,
              "--y":     `${pos.y}%`,
              "--delay": `${index * 70}ms`,
            } as CSSProperties}
          >
            <span className="journey-node__orb">
              <span className="journey-node__number">{index + 1}</span>
              <img className="journey-node__icon" src={JOURNEY_LOGO_SRCS[index]} alt="" aria-hidden="true" />
            </span>
            <span className="journey-node__copy" role="tooltip">
              <span className="journey-node__tooltip-number">{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </span>
          </button>
        );
      })}

      {/* Twinkling stars — CSS divs in screen space, no SVG distortion */}
      {[
        { x: "12%", y: "18%", size: 3, dur: "2.1s", delay: "0s",   color: "#38bdf8" },
        { x: "28%", y: "42%", size: 2, dur: "3.4s", delay: "0.7s", color: "#a855f7" },
        { x: "18%", y: "65%", size: 3, dur: "1.8s", delay: "1.2s", color: "#f472b6" },
        { x: "45%", y: "20%", size: 2, dur: "2.7s", delay: "0.3s", color: "#ffffff" },
        { x: "60%", y: "88%", size: 3, dur: "3.1s", delay: "1.8s", color: "#fde68a" },
        { x: "82%", y: "72%", size: 2, dur: "2.4s", delay: "0.9s", color: "#38bdf8" },
        { x: "90%", y: "45%", size: 3, dur: "1.6s", delay: "0.4s", color: "#a855f7" },
        { x: "70%", y: "15%", size: 2, dur: "2.9s", delay: "1.5s", color: "#ffffff" },
        { x: "35%", y: "10%", size: 3, dur: "2.2s", delay: "2.1s", color: "#f472b6" },
        { x:  "8%", y: "35%", size: 2, dur: "3.6s", delay: "0.6s", color: "#fde68a" },
        { x: "55%", y: "55%", size: 2, dur: "1.9s", delay: "1.1s", color: "#38bdf8" },
        { x: "88%", y: "22%", size: 2, dur: "2.6s", delay: "1.7s", color: "#ffffff" },
        { x:  "5%", y: "55%", size: 2, dur: "2.3s", delay: "0.2s", color: "#38bdf8" },
        { x: "22%", y: "78%", size: 3, dur: "3.0s", delay: "1.0s", color: "#a855f7" },
        { x: "40%", y: "50%", size: 2, dur: "1.7s", delay: "0.5s", color: "#ffffff" },
        { x: "50%", y: "33%", size: 2, dur: "2.8s", delay: "1.4s", color: "#f472b6" },
        { x: "65%", y: "62%", size: 3, dur: "2.0s", delay: "0.8s", color: "#fde68a" },
        { x: "75%", y: "40%", size: 2, dur: "3.2s", delay: "2.3s", color: "#38bdf8" },
        { x: "92%", y: "60%", size: 2, dur: "1.5s", delay: "0.1s", color: "#a855f7" },
        { x: "15%", y: "90%", size: 3, dur: "2.5s", delay: "1.6s", color: "#ffffff" },
        { x: "48%", y: "75%", size: 2, dur: "3.8s", delay: "0.4s", color: "#f472b6" },
        { x: "30%", y: "25%", size: 2, dur: "2.0s", delay: "1.9s", color: "#fde68a" },
        { x: "62%", y: "8%",  size: 3, dur: "2.4s", delay: "0.7s", color: "#38bdf8" },
        { x: "95%", y: "30%", size: 2, dur: "1.8s", delay: "2.4s", color: "#ffffff" },
      ].map(({ x, y, size, dur, delay, color }) => (
        <span
          key={`${x}-${y}`}
          className="hero-star"
          style={{
            left: x, top: y,
            width: `${size}px`, height: `${size}px`,
            background: color,
            boxShadow: `0 0 ${size * 3}px ${size}px ${color}`,
            animationDuration: dur,
            animationDelay: delay,
          } as CSSProperties}
          aria-hidden="true"
        />
      ))}

      {/* Community proof */}
      <aside className="journey-proof" aria-label="Community metrics">
        <div className="journey-proof__avatars" aria-hidden="true">
          <span>A</span><span>D</span><span>W</span>
        </div>
        <div className="journey-proof__stats">
          <p>{t.hero.users}</p>
          <p><span className="landing-stars">★★★★★</span> {t.hero.rating}</p>
        </div>
      </aside>
    </div>
  );
}

function TractionSection({ language }: { language: LandingLanguage }) {
  const t = content[language];

  return (
    <SectionShell id="products">
      <div className="traction-grid reveal">
        {t.traction.map(([value, label, description], index) => (
          <article className="traction-card" key={label}>
            <img className="traction-card__icon" src={TRACTION_ICON_SRCS[index]} alt="" aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function UspSection({ language }: { language: LandingLanguage }) {
  const t = content[language];

  return (
    <SectionShell id="roadmap" title={t.usp.title} subtitle={t.usp.subtitle}>
      <div className="usp-layout">
        <EcosystemOrbitPanel language={language} />
        <div className="usp-grid reveal">
          {t.usp.items.map(([label], index) => (
            <article className="glow-card" key={label}>
              <img className="glow-card__icon" src={USP_ICON_SRCS[index]} alt="" aria-hidden="true" />
              <h3>{label}</h3>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function EcosystemOrbitPanel({ language }: { language: LandingLanguage }) {
  const t = content[language];

  return (
    <div className="usp-orbit-panel reveal" aria-label={t.usp.title}>
      <div className="usp-orbit-panel__aura" aria-hidden="true" />
      <div className="usp-orbit-panel__ribbon-track" aria-hidden="true">
        <span />
      </div>
      <img className="usp-orbit-panel__logo" src={DAO_WAY_FULL_LOGO_SRC} alt="THE DAO WAY" />
    </div>
  );
}

function InfrastructureSection({ language }: { language: LandingLanguage }) {
  const t = content[language];

  return (
    <SectionShell id="tokenomics" title={t.infrastructure.title} subtitle={t.infrastructure.subtitle}>
      <div className="market-panel reveal">
        <div className="market-panel__head">
          <span>{t.infrastructure.mapLabel}</span>
          <div>
            {t.infrastructure.categories.map((category) => (
              <small key={category}>{category}</small>
            ))}
          </div>
        </div>
        <div className="market-strip">
        <div className="market-strip__track">
          {[...marketLogos, ...marketLogos].map((logo, index) => (
            <span className="market-logo" key={`${logo.name}-${index}`} aria-label={logo.name}>
              <img className="market-logo__img market-logo__img--dark" src={logo.src} alt="" aria-hidden="true" />
              <img className="market-logo__img market-logo__img--light" src={logo.lightSrc} alt="" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
      </div>
      <p className="landing-note">{t.infrastructure.note}</p>
    </SectionShell>
  );
}

function PressKitSection({ language, onPitchdeck }: { language: LandingLanguage; onPitchdeck: () => void }) {
  const t = content[language];

  return (
    <SectionShell id="materials" title={t.press.title} subtitle={t.press.subtitle}>
      <div className="press-grid">
        {t.press.cards.map(([title, description, meta, badge, action], index) => {
          const isPitchDeck = title === "Pitch Deck";
          return (
            <article className="press-card reveal" key={title}>
              <div className="press-card__top">
                <img className="press-card__icon" src={PRESS_ICON_SRCS[index]} alt="" aria-hidden="true" />
                <span className={badge.includes("По запросу") || badge.includes("On request") ? "is-request" : "is-open"}>{badge}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <small>{meta}</small>
              <button className="landing-btn landing-btn--ghost" type="button" onClick={isPitchDeck ? onPitchdeck : undefined} disabled={!isPitchDeck}>
                {isPitchDeck ? action : t.press.comingSoon}
              </button>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

function FinalCta({ language, onPitchdeck }: { language: LandingLanguage; onPitchdeck: () => void }) {
  const t = content[language];

  return (
    <section className="final-cta reveal" id="about">
      <div className="final-cta__inner">
        <p className="landing-eyebrow">THE DAO WAY</p>
        <h2>{t.finalCta.title}</h2>
        <p>{t.finalCta.subtitle}</p>
        <span className="final-cta__microline">{t.finalCta.microline}</span>
        <div>
          <a className="landing-btn landing-btn--primary landing-btn--large" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
            <Icon name="telegram" />
            {t.nav.launch}
          </a>
          <button className="landing-btn landing-btn--ghost landing-btn--large" type="button" onClick={onPitchdeck}>
            {t.nav.pitchdeck}
          </button>
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ language }: { language: LandingLanguage }) {
  const t = content[language];

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <BrandMark />
          <p>{t.footer.description}</p>
          <div className="landing-footer__legal">
            <a href="#privacy">{t.footer.privacy}</a>
            <a href="#terms">{t.footer.terms}</a>
            <span>{t.footer.copyright}</span>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          {navTargets.map((target) => (
            <a key={target} href={`#${target}`}>
              {t.nav[target]}
            </a>
          ))}
        </nav>
        <div className="landing-footer__socials">
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer">
            Twitter/X
          </a>
          <a href="https://discord.com" target="_blank" rel="noreferrer">
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}

function RequestPitchdeckModal({
  language,
  open,
  onClose,
}: {
  language: LandingLanguage;
  open: boolean;
  onClose: () => void;
}) {
  const t = content[language].modal;
  const modalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = modalRef.current?.querySelector<HTMLElement>("button, input, textarea, [href], select");
    focusable?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !modalRef.current) return;

      const items = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input, textarea, select, [href]")
      );
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.body.classList.add("landing-modal-open");
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("landing-modal-open");
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const purpose = String(form.get("purpose") ?? "").trim();

    if (!name || !email || !purpose) {
      setError(t.required);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.emailError);
      return;
    }

    setError("");
    setStatus("success");
    event.currentTarget.reset();
  }

  return (
    <div className="landing-modal" role="dialog" aria-modal="true" aria-labelledby="pitchdeck-title">
      <button className="landing-modal__scrim" type="button" onClick={onClose} aria-label={t.close} />
      <div className="landing-modal__panel" ref={modalRef}>
        <button className="landing-icon-btn landing-modal__close" type="button" onClick={onClose} aria-label={t.close}>
          <Icon name="close" />
        </button>
        <h2 id="pitchdeck-title">{t.title}</h2>
        <p>{status === "success" ? t.success : t.subtitle}</p>
        {status === "idle" && (
          <form onSubmit={onSubmit} noValidate>
            <label>
              {t.name}
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              {t.email}
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              {t.company}
              <input name="company" autoComplete="organization" />
            </label>
            <label>
              {t.purpose}
              <textarea name="purpose" rows={4} required />
            </label>
            {error && <p className="landing-form-error">{error}</p>}
            <button className="landing-btn landing-btn--primary" type="submit">
              <Icon name="send" />
              {t.send}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function LandingPage() {
  const [language, setLanguage] = useState<LandingLanguage>(() => getInitialLanguage());
  const [theme, setTheme] = useState<LandingTheme>(() => getInitialTheme());
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isPitchdeckOpen, setPitchdeckOpen] = useState(false);
  const t = useMemo(() => content[language], [language]);

  useLandingSeo(language);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [language]);

  return (
    <div className={`dao-landing dao-landing--${theme} dao-landing--${language}`}>
      <div className="landing-hero-wrap" style={{ backgroundImage: `url(${theme === "light" ? heroBgLight : heroBg})` }}>
        <LandingHeader
          language={language}
          theme={theme}
          isMenuOpen={isMenuOpen}
          onLanguage={setLanguage}
          onTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          onMenu={() => setMenuOpen((current) => !current)}
          onPitchdeck={() => setPitchdeckOpen(true)}
        />
        <Hero language={language} onPitchdeck={() => setPitchdeckOpen(true)} />
      </div>
      <TractionSection language={language} />
      <UspSection language={language} />
      <InfrastructureSection language={language} />
      <PressKitSection language={language} onPitchdeck={() => setPitchdeckOpen(true)} />
      <FinalCta language={language} onPitchdeck={() => setPitchdeckOpen(true)} />
      <LandingFooter language={language} />
      <RequestPitchdeckModal language={language} open={isPitchdeckOpen} onClose={() => setPitchdeckOpen(false)} />
      <span className="landing-sr-only" aria-live="polite">
        {t.meta.title}
      </span>
    </div>
  );
}
