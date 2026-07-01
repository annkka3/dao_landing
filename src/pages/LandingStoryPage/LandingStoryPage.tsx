import { useEffect, useMemo, useRef, useState, type FormEvent, type TouchEvent } from "react";
import "./LandingStoryPage.css";

type StoryLanguage = "ru" | "en";
type StoryTheme = "dark" | "light";
type StoryVisual =
  | "hero"
  | "pain"
  | "fragmentation"
  | "vision"
  | "game"
  | "journal"
  | "education"
  | "guardian"
  | "economy"
  | "roadmap"
  | "team"
  | "final";
type StoryIcon = "telegram" | "sun" | "moon" | "deck" | "close";

const TELEGRAM_URL = "https://t.me/the_dao_way";
const DAO_WAY_LOGO_SRC = "/assets/landing/logo_new.png";
const DAO_WAY_WORDMARK_SRC = "/assets/landing/dao-way-logo-wordmark.png";

const STORAGE_KEYS = {
  language: "dao-way-landing-language",
  theme: "dao-way-landing-theme-default-dark",
};

const STORY_VISUAL_ASSETS: Partial<Record<StoryVisual, string>> = {
  pain: "/assets/landing/story/mobile/02.png",
  fragmentation: "/assets/landing/story/mobile/03.png",
  vision: "/assets/landing/story/mobile/04.png",
  game: "/assets/landing/story/mobile/05.png",
  journal: "/assets/landing/story/mobile/06.png",
  education: "/assets/landing/story/mobile/07.png",
  guardian: "/assets/landing/story/mobile/08.png",
  economy: "/assets/landing/story/mobile/09.png",
  roadmap: "/assets/landing/story/mobile/10.png",
  team: "/assets/landing/story/mobile/11.png",
};

const storyContent = {
  ru: {
    meta: {
      title: "THE DAO WAY - story landing",
      description: "Mobile-first intro в экосистему THE DAO WAY для криптотрейдеров.",
    },
    controls: {
      classic: "Classic landing",
      pitchdeck: "Pitchdeck",
      theme: "Переключить тему",
      language: "Язык",
      progress: "Прогресс истории",
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
    screens: [
      {
        id: "story-hero",
        visual: "hero",
        title: "THE DAO WAY",
        thought: "Операционная система развития криптотрейдера.",
        cta: "Начать путешествие",
        ctaHref: "#story-market",
        microCopy: "12 экранов • 2 минуты • путь от хаоса к системе",
      },
      {
        id: "story-market",
        visual: "pain",
        title: "Большинство розничных трейдеров теряют капитал.",
        thought: "Проблема не в стратегиях. Проблема в хаосе.",
        description:
          "Рынок симулирует лёгкий вход, но скрывает системные ловушки: тильт, отсутствие дисциплины, эмоции и овертрейдинг.",
      },
      {
        id: "story-fragmentation",
        visual: "fragmentation",
        title: "Инструменты трейдера разорваны на части.",
        thought: "Фрагментация убивает фокус.",
        description:
          "Сигналы - в Telegram, обучение - на YouTube, графики - в TradingView, логи - в Excel, сделки - на бирже. Время уходит на переключение платформ.",
      },
      {
        id: "story-vision",
        visual: "vision",
        title: "Все инструменты. В одном окне Telegram.",
        thought: "Экосистема растёт вместе с пользователем.",
        description:
          "THE DAO WAY объединяет геймификацию, аналитику, обучение и защиту от рисков в единую систему.",
      },
      {
        id: "story-game",
        visual: "game",
        title: "Шаг 1. Играй",
        thought: "Crypto Reality - безопасный старт в крипто-хаосе без риска для реальных денег.",
        description:
          "Проживи торговую неделю в симулированном шторме рынка, выживи до пятницы и узнай свой психологический архетип трейдера.",
      },
      {
        id: "story-journal",
        visual: "journal",
        title: "Шаг 2. Анализируй",
        thought: "Trader Journal - автоматический трекинг вместо рутины в Excel.",
        description:
          "Модуль логирует сделки, оцифровывает статистику и превращает хаотичные действия в понятные графики.",
        rows: ["Take Profit", "Leverage", "Strategy Tag", "Risk", "PnL"],
      },
      {
        id: "story-education",
        visual: "education",
        title: "Шаг 3. Учись",
        thought: "DAO Education - операционная система твоих знаний.",
        description:
          "Платформа подбирает обучение не по обещаниям гуру, а по ошибкам, которые фиксирует твой Дневник.",
        metrics: ["178 lessons", "37.6 hours", "25 modules"],
      },
      {
        id: "story-guardian",
        visual: "guardian",
        title: "Шаг 4. Улучшай",
        thought: "Risk Guardian AI - цифровой страж твоего риск-профиля.",
        description:
          "AI анализирует торговые паттерны и предупреждает о признаках тильта, нарушении дисциплины и повышенном риске.",
      },
      {
        id: "story-economy",
        visual: "economy",
        title: "Экономика устойчивого роста.",
        thought: "Один пользователь - несколько независимых слоёв монетизации.",
        description:
          "THE DAO WAY монетизирует жизненный цикл трейдера: игровые предметы, обучение, SaaS-инструменты, подписки и B2B-лицензии.",
        layers: ["SaaS", "Game Economy", "EdTech", "B2B", "Market", "Premium Tools", "Education", "Future Token/NFT"],
      },
      {
        id: "story-roadmap",
        visual: "roadmap",
        title: "Дорожная карта развития экосистемы",
        stages: [
          "Этап 1 - READY: Релиз Crypto Reality и базовой архитектуры образования.",
          "Этап 2 - MVP: Запуск Trader Journal и калькулятора рисков.",
          "Этап 3 - Roadmap: Интеграция Risk Guardian AI и запуск Meme Hero Farming.",
          "Этап 4 - Roadmap: B2B-лицензирование, токеномика и масштабирование на TON / Solana.",
        ],
      },
      {
        id: "story-team",
        visual: "team",
        title: "Команда, которая строит систему",
        cards: [
          {
            title: "Олег - Co-founder & CEO",
            text: "Инвестор, 20+ лет опыта в управлении капиталом, финансовых рынках и реальном секторе. Стратегия, токеномика и бизнес-модель.",
          },
          {
            title: "Анна - Co-founder & CTO",
            text: "Технологический лидер, специалист по Big Data, AI и Machine Learning. Архитектура платформы и разработка Risk Guardian AI.",
          },
          {
            title: "Стас - Co-founder - Growth & PR",
            text: "Эксперт по стратегическим коммуникациям и PR с 20+ годами опыта. Маркетинг, комьюнити-менеджмент и mass adoption.",
          },
        ],
      },
      {
        id: "story-final",
        visual: "final",
        title: "Твоё следующее решение начинается здесь.",
        thought: "Готов войти в экосистему THE DAO WAY?",
        cta: "Запустить Mini App",
        ctaHref: TELEGRAM_URL,
      },
    ],
  },
  en: {
    meta: {
      title: "THE DAO WAY - story landing",
      description: "A mobile-first intro into The DAO Way ecosystem for crypto traders.",
    },
    controls: {
      classic: "Classic landing",
      pitchdeck: "Pitchdeck",
      theme: "Toggle theme",
      language: "Language",
      progress: "Story progress",
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
    screens: [
      {
        id: "story-hero",
        visual: "hero",
        title: "THE DAO WAY",
        thought: "The Operating System for Crypto Trader Evolution.",
        cta: "Start Your Journey",
        ctaHref: "#story-market",
        microCopy: "12 screens • 2 minutes • from chaos to system",
      },
      {
        id: "story-market",
        visual: "pain",
        title: "Most retail traders lose capital.",
        thought: "The problem isn't the strategies. It's the chaos.",
        description:
          "The market simulates an easy entry but hides systemic traps: tilt, lack of discipline, emotions, and overtrading.",
      },
      {
        id: "story-fragmentation",
        visual: "fragmentation",
        title: "Trader tools are fragmented.",
        thought: "Fragmentation kills your focus.",
        description:
          "Signals live in Telegram, lessons on YouTube, charts in TradingView, logs in Excel, and trades on exchanges. Time is lost switching platforms.",
      },
      {
        id: "story-vision",
        visual: "vision",
        title: "All tools. In one Telegram window.",
        thought: "The ecosystem grows with the user.",
        description:
          "The DAO Way merges gamification, analytics, education, and risk protection into one cohesive system.",
      },
      {
        id: "story-game",
        visual: "game",
        title: "Step 1. Play",
        thought: "Crypto Reality - a safe start in crypto chaos with zero risk to real money.",
        description:
          "Survive a trading week in a simulated market storm, make it to Friday, and discover your psychological trading archetype.",
      },
      {
        id: "story-journal",
        visual: "journal",
        title: "Step 2. Analyze",
        thought: "Trader Journal - automated tracking instead of Excel routines.",
        description: "The module logs trades, digitizes statistics, and turns chaotic actions into clear charts.",
        rows: ["Take Profit", "Leverage", "Strategy Tag", "Risk", "PnL"],
      },
      {
        id: "story-education",
        visual: "education",
        title: "Step 3. Learn",
        thought: "DAO Education - the operating system for your knowledge.",
        description:
          "The platform adapts lessons not by guru promises, but by the real mistakes captured by your Journal.",
        metrics: ["178 lessons", "37.6 hours", "25 modules"],
      },
      {
        id: "story-guardian",
        visual: "guardian",
        title: "Step 4. Improve",
        thought: "Risk Guardian AI - your digital risk-profile guardian.",
        description: "AI analyzes trading patterns and warns about tilt, discipline violations, and elevated risk.",
      },
      {
        id: "story-economy",
        visual: "economy",
        title: "The Economy of Sustainable Growth.",
        thought: "One user - multiple independent monetization layers.",
        description:
          "The DAO Way monetizes the trader lifecycle through game items, education, SaaS tools, subscriptions, and B2B licensing.",
        layers: ["SaaS", "Game Economy", "EdTech", "B2B", "Market", "Premium Tools", "Education", "Future Token/NFT"],
      },
      {
        id: "story-roadmap",
        visual: "roadmap",
        title: "Ecosystem Roadmap",
        stages: [
          "Stage 1 - READY: Crypto Reality release and baseline education architecture.",
          "Stage 2 - MVP: Trader Journal and risk calculator launch.",
          "Stage 3 - Roadmap: Risk Guardian AI integration and Meme Hero Farming launch.",
          "Stage 4 - Roadmap: B2B licensing, tokenomics, and scaling on TON / Solana.",
        ],
      },
      {
        id: "story-team",
        visual: "team",
        title: "The team building the system",
        cards: [
          {
            title: "Oleg - Co-founder & CEO",
            text: "Investor with 20+ years of experience in capital management, financial markets, and the real sector. Strategy, tokenomics, and business model.",
          },
          {
            title: "Anna - Co-founder & CTO",
            text: "Tech lead specializing in Big Data, AI, and Machine Learning. Platform architecture and Risk Guardian AI development.",
          },
          {
            title: "Stas - Co-founder - Growth & PR",
            text: "Strategic communications and PR expert with 20+ years of experience. Marketing, community growth, and mass adoption.",
          },
        ],
      },
      {
        id: "story-final",
        visual: "final",
        title: "Your next decision starts here.",
        thought: "Ready to enter The DAO Way ecosystem?",
        cta: "Launch Mini App",
        ctaHref: TELEGRAM_URL,
      },
    ],
  },
} as const;

type StoryScreenData = (typeof storyContent)[StoryLanguage]["screens"][number];

function getInitialLanguage(): StoryLanguage {
  const saved = window.localStorage.getItem(STORAGE_KEYS.language);
  return saved === "en" || saved === "ru" ? saved : "ru";
}

function getInitialTheme(): StoryTheme {
  const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
  return saved === "dark" || saved === "light" ? saved : "dark";
}

function Icon({ name, size = 18 }: { name: StoryIcon; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<StoryIcon, JSX.Element> = {
    telegram: <path d="m21 3-7.4 18-4.1-7.2L3 10.8 21 3Zm-11.5 10.8 4.6-4.5" />,
    sun: <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m14.4-6.4 1.4-1.4M4.2 19.8l1.4-1.4m0-12.8L4.2 4.2m15.6 15.6-1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
    moon: <path d="M21 14.7A7.4 7.4 0 0 1 9.3 3a8.8 8.8 0 1 0 11.7 11.7Z" />,
    deck: <path d="M5 4h12a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2V4Zm2 14v2h12M9 8h6M9 12h4" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function useStorySeo(language: StoryLanguage) {
  useEffect(() => {
    const meta = storyContent[language].meta;
    document.documentElement.lang = language;
    document.title = meta.title;

    const description = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", meta.description);
  }, [language]);
}

function StoryTopbar({
  language,
  theme,
  onLanguage,
  onTheme,
  onPitchdeck,
}: {
  language: StoryLanguage;
  theme: StoryTheme;
  onLanguage: (language: StoryLanguage) => void;
  onTheme: () => void;
  onPitchdeck: () => void;
}) {
  const t = storyContent[language].controls;
  const nextLanguage = language === "ru" ? "en" : "ru";

  return (
    <header className="storyLandingTopbar">
      <a className="storyLandingBrand" href="#story-hero" aria-label="THE DAO WAY">
        <img src={DAO_WAY_WORDMARK_SRC} alt="THE DAO WAY" />
      </a>
      <div className="storyLandingControls">
        <a className="storyLandingControl storyLandingControl--icon storyLandingControl--version" href="/landing-classic" aria-label={t.classic} title={t.classic}>
          V1
        </a>
        <button
          className="storyLandingControl storyLandingControl--icon storyLandingControl--language"
          type="button"
          onClick={() => onLanguage(nextLanguage)}
          aria-label={`${t.language}: ${nextLanguage.toUpperCase()}`}
          title={nextLanguage.toUpperCase()}
        >
          {nextLanguage.toUpperCase()}
        </button>
        <button className="storyLandingControl storyLandingControl--icon storyLandingControl--theme" type="button" onClick={onTheme} aria-label={t.theme}>
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <button className="storyLandingControl storyLandingControl--text storyLandingControl--deck" type="button" onClick={onPitchdeck}>
          <Icon name="deck" />
          <span>{t.pitchdeck}</span>
        </button>
      </div>
    </header>
  );
}

function StoryProgress({
  activeIndex,
  screens,
  label,
}: {
  activeIndex: number;
  screens: readonly StoryScreenData[];
  label: string;
}) {
  return (
    <nav className="storyProgress" aria-label={label}>
      {screens.map((screen, index) => (
        <a
          key={screen.id}
          className={activeIndex === index ? "isActive" : ""}
          href={`#${screen.id}`}
          aria-label={`${index + 1}. ${screen.title}`}
        />
      ))}
    </nav>
  );
}

function StoryVisual({ screen }: { screen: StoryScreenData }) {
  if (screen.visual === "hero") {
    return (
      <div className="storyVisual storyVisual--hero" aria-hidden="true">
        <div className="storyLogoRibbon" aria-hidden="true">
          <span />
        </div>
        <img className="storyVisualLogo" src={DAO_WAY_LOGO_SRC} alt="" />
      </div>
    );
  }

  const assetSrc = STORY_VISUAL_ASSETS[screen.visual];
  if (assetSrc) {
    return (
      <div className="storyVisual storyVisual--asset" aria-hidden="true">
        <img className="storyVisualAsset" src={assetSrc} alt="" loading="lazy" />
      </div>
    );
  }

  if (screen.visual === "pain") {
    return (
      <div className="storyVisual storyVisual--pain" aria-hidden="true">
        <svg viewBox="0 0 260 180" className="storyVisualChart">
          <path d="M18 38 C48 30 58 74 88 64 C112 56 117 96 145 91 C178 86 184 128 230 145" />
          <path d="M185 127 L230 145 L196 160" />
        </svg>
        <div className="storyWarningRing" />
        <span className="storyWarningMark">!</span>
      </div>
    );
  }

  if (screen.visual === "fragmentation") {
    return (
      <div className="storyVisual storyVisual--fragmentation" aria-hidden="true">
        {["Telegram", "YouTube", "TradingView", "Excel", "Exchange"].map((item, index) => (
          <span key={item} className={`storyFragmentNode storyFragmentNode--${index + 1}`}>
            {item}
          </span>
        ))}
        <svg viewBox="0 0 300 220" className="storyFragmentLine">
          <path d="M48 42 L226 54 L72 106 L248 152 L92 176" />
        </svg>
      </div>
    );
  }

  if (screen.visual === "vision") {
    return (
      <div className="storyVisual storyVisual--vision" aria-hidden="true">
        <div className="storyPhone">
          <div className="storyPhoneTop" />
          <div className="storyPhoneMessage">Crypto Reality</div>
          <div className="storyPhoneMessage storyPhoneMessage--accent">Journal + Risk</div>
          <div className="storyPhoneMessage">DAO Education</div>
        </div>
        <div className="storyAssemble storyAssemble--one">Game</div>
        <div className="storyAssemble storyAssemble--two">AI</div>
        <div className="storyAssemble storyAssemble--three">Tools</div>
      </div>
    );
  }

  if (screen.visual === "game") {
    return (
      <div className="storyVisual storyVisual--game" aria-hidden="true">
        <div className="storyRpgCard">
          <span>Crypto Reality</span>
          <strong>Friday Survivor</strong>
          <small>Archetype unlocked</small>
        </div>
        <div className="storyDice">6</div>
        <div className="storyStorm" />
      </div>
    );
  }

  if (screen.visual === "journal") {
    return (
      <div className="storyVisual storyVisual--journal" aria-hidden="true">
        <div className="storyJournalPanel">
          {(screen.rows ?? []).map((row, index) => (
            <div key={row} className="storyJournalRow">
              <span>{row}</span>
              <i style={{ width: `${42 + index * 9}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen.visual === "education") {
    return (
      <div className="storyVisual storyVisual--education" aria-hidden="true">
        <div className="storyCap">DAO</div>
        <div className="storyMetricStack">
          {(screen.metrics ?? []).map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </div>
      </div>
    );
  }

  if (screen.visual === "guardian") {
    return (
      <div className="storyVisual storyVisual--guardian" aria-hidden="true">
        <div className="storyNotification">
          <span>Risk Guardian AI</span>
          <strong>Tilt detected</strong>
          <small>Risk profile warning</small>
        </div>
        <div className="storyShield">AI</div>
      </div>
    );
  }

  if (screen.visual === "economy") {
    return (
      <div className="storyVisual storyVisual--economy" aria-hidden="true">
        <div className="storyUserCore">User</div>
        {(screen.layers ?? []).map((layer, index) => (
          <span key={layer} className={`storyLayer storyLayer--${index + 1}`}>
            {layer}
          </span>
        ))}
      </div>
    );
  }

  if (screen.visual === "roadmap") {
    return (
      <div className="storyVisual storyVisual--roadmap" aria-hidden="true">
        {["READY", "MVP", "Roadmap", "Scale"].map((stage) => (
          <span key={stage}>{stage}</span>
        ))}
      </div>
    );
  }

  if (screen.visual === "team") {
    return (
      <div className="storyVisual storyVisual--team" aria-hidden="true">
        <span>CEO</span>
        <span>CTO</span>
        <span>Growth</span>
      </div>
    );
  }

  return (
    <div className="storyVisual storyVisual--final" aria-hidden="true">
      <div className="storyLogoRibbon" aria-hidden="true">
        <span />
      </div>
      <img src={DAO_WAY_LOGO_SRC} alt="" />
    </div>
  );
}

function StoryScreen({
  screen,
  index,
  isActive,
  setRef,
}: {
  screen: StoryScreenData;
  index: number;
  isActive: boolean;
  setRef: (node: HTMLElement | null) => void;
}) {
  const ctaHref = "ctaHref" in screen ? screen.ctaHref : undefined;
  const isExternalCta = ctaHref?.startsWith("http");
  const isPrimaryStoryCta = screen.visual === "hero" || screen.visual === "final";

  return (
    <section id={screen.id} ref={setRef} className={`storyScreen${isActive ? " isActive" : ""}`} data-screen={index + 1}>
      <div className="storyScreenInner">
        <StoryVisual screen={screen} />
        <div className="storyScreenCopy">
          <h1>{screen.title}</h1>
          {"thought" in screen && screen.thought && <p className="storyScreenThought">{screen.thought}</p>}
          {"description" in screen && screen.description && <p className="storyScreenDescription">{screen.description}</p>}
          {"stages" in screen && screen.stages && (
            <ol className="storyRoadmapList">
              {screen.stages.map((stage) => (
                <li key={stage}>{stage}</li>
              ))}
            </ol>
          )}
          {"cards" in screen && screen.cards && (
            <div className="storyTeamCards">
              {screen.cards.map((card) => (
                <article key={card.title}>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          )}
          {"cta" in screen && screen.cta && ctaHref && (
            <a
              className={`storyLandingCta${isPrimaryStoryCta ? " storyLandingCta--primaryScreen" : ""}`}
              href={ctaHref}
              target={isExternalCta ? "_blank" : undefined}
              rel={isExternalCta ? "noreferrer" : undefined}
            >
              {isExternalCta && <Icon name="telegram" />}
              {screen.cta}
            </a>
          )}
          {"microCopy" in screen && screen.microCopy && <p className="storyMicroCopy">{screen.microCopy}</p>}
        </div>
      </div>
      {screen.visual === "hero" && <span className="storyScrollCue" aria-hidden="true" />}
    </section>
  );
}

function PitchdeckModal({
  language,
  open,
  onClose,
}: {
  language: StoryLanguage;
  open: boolean;
  onClose: () => void;
}) {
  const t = storyContent[language].modal;
  const modalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstInput = modalRef.current?.querySelector<HTMLElement>("button, input, textarea");
    firstInput?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.classList.add("storyLandingModalOpen");
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("storyLandingModalOpen");
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
    <div className="storyLandingModal" role="dialog" aria-modal="true" aria-labelledby="story-pitchdeck-title">
      <button className="storyLandingModalScrim" type="button" aria-label={t.close} onClick={onClose} />
      <div className="storyLandingModalPanel" ref={modalRef}>
        <button className="storyLandingModalClose" type="button" aria-label={t.close} onClick={onClose}>
          <Icon name="close" />
        </button>
        <h2 id="story-pitchdeck-title">{t.title}</h2>
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
            {error && <p className="storyLandingFormError">{error}</p>}
            <button className="storyLandingCta" type="submit">
              <Icon name="deck" />
              {t.send}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function LandingStoryPage() {
  const [language, setLanguage] = useState<StoryLanguage>(() => getInitialLanguage());
  const [theme, setTheme] = useState<StoryTheme>(() => getInitialTheme());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPitchdeckOpen, setPitchdeckOpen] = useState(false);
  const screenRefs = useRef<Array<HTMLElement | null>>([]);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const t = useMemo(() => storyContent[language], [language]);

  useStorySeo(language);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const index = screenRefs.current.findIndex((node) => node === visible.target);
        if (index >= 0) setActiveIndex(index);
      },
      { threshold: [0.45, 0.62, 0.8] }
    );

    screenRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [language]);

  function scrollToStoryIndex(index: number) {
    const targetIndex = Math.max(0, Math.min(t.screens.length - 1, index));
    const target = screenRefs.current[targetIndex];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveIndex(targetIndex);
  }

  function onStoryTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (!window.matchMedia("(max-width: 900px)").matches || isPitchdeckOpen) return;

    const touch = event.touches[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }

  function onStoryTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || !window.matchMedia("(max-width: 900px)").matches || isPitchdeckOpen) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const elapsed = Date.now() - start.time;
    const isHorizontalSwipe = Math.abs(deltaX) >= 58 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35 && elapsed <= 900;

    if (!isHorizontalSwipe) return;

    scrollToStoryIndex(deltaX > 0 ? activeIndex + 1 : activeIndex - 1);
  }

  return (
    <div
      className={`storyLanding storyLanding--${theme}`}
      onTouchStart={onStoryTouchStart}
      onTouchEnd={onStoryTouchEnd}
    >
      <StoryTopbar
        language={language}
        theme={theme}
        onLanguage={setLanguage}
        onTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        onPitchdeck={() => setPitchdeckOpen(true)}
      />
      <StoryProgress activeIndex={activeIndex} screens={t.screens} label={t.controls.progress} />
      <main className="storyLandingScreens">
        {t.screens.map((screen, index) => (
          <StoryScreen
            key={screen.id}
            screen={screen}
            index={index}
            isActive={activeIndex === index}
            setRef={(node) => {
              screenRefs.current[index] = node;
            }}
          />
        ))}
      </main>
      <PitchdeckModal language={language} open={isPitchdeckOpen} onClose={() => setPitchdeckOpen(false)} />
    </div>
  );
}
