import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import "./LandingPage.css";
import heroBg from "../../assets/hero-bg.png";
import heroBgLight from "../../assets/hero-bg-light.png";

type LandingLanguage = "ru" | "en";
type LandingTheme = "dark" | "light";
type FaqItem = {
  question: string;
  answer: ReactNode;
};
type FaqCategory = {
  id: string;
  label: string;
  items: FaqItem[];
};
type BrandStoryMember = {
  name: string;
  role: string;
  focus: string;
  description: string;
};
type BrandStoryContent = {
  title: string;
  subtitle: string;
  close: string;
  badges: string[];
  paragraphs: string[];
  teamTitle: string;
  teamIntro: string;
  members: BrandStoryMember[];
  closing: string;
};
type RoadmapStage = {
  title: string;
  status?: string;
  items: string[];
};
type RoadmapContent = {
  title: string;
  subtitle: string;
  close: string;
  readMore: string;
  readLess: string;
  badges: string[];
  stages: RoadmapStage[];
  goalTitle: string;
  goalIntro: string;
  goalItems: string[];
  goalOutro: string;
  images: {
    darkLandscape: string;
    darkPortrait: string;
    lightLandscape: string;
    lightPortrait: string;
  };
};
type OnePagerSection = {
  title: string;
  body?: string;
  items?: string[];
};
type OnePagerContent = {
  title: string;
  subtitle: string;
  close: string;
  readMore: string;
  readLess: string;
  badges: string[];
  sections: OnePagerSection[];
  closing: string;
  images: {
    darkLandscape: string;
    darkPortrait: string;
    lightLandscape: string;
    lightPortrait: string;
  };
};
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
const ROADMAP_IMAGES_RU = {
  darkLandscape: "/assets/landing/roadmap/roadmap-dark-landscape.png",
  darkPortrait: "/assets/landing/roadmap/roadmap-dark-portrait.png",
  lightLandscape: "/assets/landing/roadmap/roadmap-light-landscape.png",
  lightPortrait: "/assets/landing/roadmap/roadmap-light-portrait.png",
};
const ROADMAP_IMAGES_EN = {
  darkLandscape: "/assets/landing/roadmap/roadmap-en-dark-landscape.png",
  darkPortrait: "/assets/landing/roadmap/roadmap-en-dark-portrait.png",
  lightLandscape: "/assets/landing/roadmap/roadmap-en-light-landscape.png",
  lightPortrait: "/assets/landing/roadmap/roadmap-en-light-portrait.png",
};
const ONE_PAGER_IMAGES_RU = {
  darkLandscape: "/assets/landing/one-pager/one-pager-ru-dark-landscape.png",
  darkPortrait: "/assets/landing/one-pager/one-pager-ru-dark-portrait.png",
  lightLandscape: "/assets/landing/one-pager/one-pager-ru-light-landscape.png",
  lightPortrait: "/assets/landing/one-pager/one-pager-ru-light-portrait.png",
};
const ONE_PAGER_IMAGES_EN = {
  darkLandscape: "/assets/landing/one-pager/one-pager-en-dark-landscape.png",
  darkPortrait: "/assets/landing/one-pager/one-pager-en-dark-portrait.png",
  lightLandscape: "/assets/landing/one-pager/one-pager-en-light-landscape.png",
  lightPortrait: "/assets/landing/one-pager/one-pager-en-light-portrait.png",
};

const faqContent: Record<
  LandingLanguage,
  {
    title: string;
    subtitle: string;
    close: string;
    categories: FaqCategory[];
  }
> = {
  ru: {
    title: "FAQ",
    subtitle: "Ключевые вопросы о продукте, экосистеме, экономике, инвестициях и доверии к The DAO Way.",
    close: "Закрыть FAQ",
    categories: [
      {
        id: "product",
        label: "О продукте",
        items: [
          {
            question: "Что такое The DAO Way?",
            answer:
              "The DAO Way - это Telegram-экосистема, объединяющая обучение трейдингу, игровые механики, искусственный интеллект, профессиональные инструменты и DAO-экономику в одном продукте.",
          },
          {
            question: "Какую проблему решает проект?",
            answer:
              "Мы устраняем необходимость использовать десятки разных сервисов для обучения, анализа, ведения статистики и торговли, объединяя всё в единой экосистеме.",
          },
          {
            question: "Для кого создан The DAO Way?",
            answer:
              "Для новичков, опытных трейдеров, инвесторов, пользователей Telegram и всех, кто хочет системно развиваться в криптоиндустрии.",
          },
          {
            question: "Нужен ли опыт торговли?",
            answer: "Нет. Обучение начинается с игрового симулятора без финансовых рисков.",
          },
          {
            question: "Как начать пользоваться платформой?",
            answer: "Достаточно открыть Telegram-бота, зарегистрироваться и пройти первые игровые задания.",
          },
        ],
      },
      {
        id: "ecosystem",
        label: "Экосистема",
        items: [
          {
            question: "Какие продукты входят в экосистему?",
            answer: (
              <ul>
                <li>Crypto Reality</li>
                <li>DAO Education</li>
                <li>DAO Tools</li>
                <li>Risk Guardian AI</li>
                <li>Meme Hero</li>
                <li>DAO Market</li>
              </ul>
            ),
          },
          {
            question: "Что такое Risk Guardian AI?",
            answer:
              "Персональный ИИ-помощник, который анализирует ошибки трейдера, выявляет слабые места и предлагает индивидуальный план развития.",
          },
          {
            question: "Чем проект отличается от TradingView, курсов и криптосообществ?",
            answer:
              "Мы объединяем обучение, аналитику, игровые механики, ИИ и DAO в единую экосистему вместо набора разрозненных сервисов.",
          },
        ],
      },
      {
        id: "economy",
        label: "Экономика",
        items: [
          {
            question: "Можно ли пользоваться платформой бесплатно?",
            answer:
              "Да. Базовый функционал и стартовые игровые механики доступны бесплатно. Дополнительные возможности открываются через премиальные продукты.",
          },
          {
            question: "Как проект зарабатывает?",
            answer: (
              <ul>
                <li>образовательные программы;</li>
                <li>подписка на DAO Tools;</li>
                <li>внутриигровая экономика;</li>
                <li>маркетплейс цифровых товаров;</li>
                <li>White Label-решения;</li>
                <li>будущие DAO-сервисы.</li>
              </ul>
            ),
          },
          {
            question: "Какие перспективы заработка у участников?",
            answer:
              "Экосистема предусматривает игровые вознаграждения, участие во внутренней экономике, цифровой маркетплейс, бонусные программы и будущие механики DAO. Проект не обещает гарантированного дохода: главная задача - помочь пользователям стать более успешными трейдерами и создать устойчивую экосистему.",
          },
          {
            question: "Есть ли собственный токен?",
            answer: "Токеномика предусмотрена дорожной картой проекта и будет запускаться поэтапно.",
          },
          {
            question: "Что дает DAO?",
            answer:
              "DAO позволит участникам участвовать в развитии экосистемы, получать дополнительные преимущества и использовать внутренние сервисы проекта.",
          },
        ],
      },
      {
        id: "investors",
        label: "Инвесторам",
        items: [
          {
            question: "Когда состоится запуск?",
            answer: "MVP находится на завершающей стадии разработки. Точные даты будут опубликованы после окончания тестирования.",
          },
          {
            question: "Можно ли инвестировать в проект?",
            answer: "Да. Для стратегических партнеров и инвесторов открыт Pre-Seed раунд.",
          },
          {
            question: "На что будут направлены инвестиции?",
            answer:
              "На запуск продукта, развитие AI-модулей, маркетинг, привлечение пользователей и масштабирование экосистемы.",
          },
        ],
      },
      {
        id: "trust",
        label: "Доверие",
        items: [
          {
            question: "Кто стоит за проектом?",
            answer:
              "Проект создается командой специалистов с более чем 20-летним опытом в инвестициях, технологиях, искусственном интеллекте, маркетинге и стратегическом развитии.",
          },
          {
            question: "Безопасны ли данные пользователей?",
            answer: "Безопасность данных и защита пользовательской информации являются одним из ключевых приоритетов проекта.",
          },
          {
            question: "Как следить за новостями?",
            answer: "Через официальный Telegram-канал, сайт и социальные сети проекта.",
          },
          {
            question: "Как связаться с командой?",
            answer: "Через форму обратной связи на сайте или официальные контакты проекта.",
          },
        ],
      },
    ],
  },
  en: {
    title: "FAQ",
    subtitle: "Key questions about the product, ecosystem, economy, investment track, and trust layer of The DAO Way.",
    close: "Close FAQ",
    categories: [
      {
        id: "product",
        label: "Product",
        items: [
          {
            question: "What is The DAO Way?",
            answer:
              "The DAO Way is a Telegram ecosystem combining trading education, game mechanics, artificial intelligence, professional tools, and DAO economics in one product.",
          },
          {
            question: "What problem does the project solve?",
            answer:
              "We remove the need to use dozens of separate services for learning, analytics, statistics, and trading by bringing everything into one ecosystem.",
          },
          {
            question: "Who is The DAO Way built for?",
            answer:
              "For beginners, experienced traders, investors, Telegram users, and anyone who wants to grow systematically in the crypto industry.",
          },
          {
            question: "Do I need trading experience?",
            answer: "No. The learning path starts with a game simulator without financial risk.",
          },
          {
            question: "How do I start using the platform?",
            answer: "Open the Telegram bot, register, and complete the first game tasks.",
          },
        ],
      },
      {
        id: "ecosystem",
        label: "Ecosystem",
        items: [
          {
            question: "Which products are part of the ecosystem?",
            answer: (
              <ul>
                <li>Crypto Reality</li>
                <li>DAO Education</li>
                <li>DAO Tools</li>
                <li>Risk Guardian AI</li>
                <li>Meme Hero</li>
                <li>DAO Market</li>
              </ul>
            ),
          },
          {
            question: "What is Risk Guardian AI?",
            answer:
              "A personal AI assistant that analyzes trader mistakes, identifies weak points, and suggests an individual development plan.",
          },
          {
            question: "How is it different from TradingView, courses, and crypto communities?",
            answer:
              "We combine education, analytics, game mechanics, AI, and DAO into one ecosystem instead of offering another set of disconnected services.",
          },
        ],
      },
      {
        id: "economy",
        label: "Economy",
        items: [
          {
            question: "Can I use the platform for free?",
            answer:
              "Yes. Basic functionality and starter game mechanics are available for free. Additional features unlock through premium products.",
          },
          {
            question: "How does the project make money?",
            answer: (
              <ul>
                <li>educational programs;</li>
                <li>DAO Tools subscriptions;</li>
                <li>in-game economy;</li>
                <li>digital goods marketplace;</li>
                <li>White Label solutions;</li>
                <li>future DAO services.</li>
              </ul>
            ),
          },
          {
            question: "What earning opportunities exist for participants?",
            answer:
              "The ecosystem includes game rewards, participation in the internal economy, a digital marketplace, bonus programs, and future DAO mechanics. The project does not promise guaranteed income: the main goal is to help users become more successful traders and build a sustainable ecosystem.",
          },
          {
            question: "Will there be a token?",
            answer: "Tokenomics are included in the project roadmap and will launch step by step.",
          },
          {
            question: "What does DAO provide?",
            answer:
              "DAO will allow participants to take part in ecosystem development, receive additional benefits, and use internal project services.",
          },
        ],
      },
      {
        id: "investors",
        label: "Investors",
        items: [
          {
            question: "When will the launch happen?",
            answer: "The MVP is in the final stage of development. Exact dates will be published after testing is completed.",
          },
          {
            question: "Can I invest in the project?",
            answer: "Yes. The Pre-Seed round is open for strategic partners and investors.",
          },
          {
            question: "What will investment be used for?",
            answer:
              "Product launch, AI module development, marketing, user acquisition, and ecosystem scaling.",
          },
        ],
      },
      {
        id: "trust",
        label: "Trust",
        items: [
          {
            question: "Who is behind the project?",
            answer:
              "The project is created by a team with more than 20 years of experience in investments, technology, artificial intelligence, marketing, and strategic development.",
          },
          {
            question: "Is user data safe?",
            answer: "Data security and user information protection are key priorities for the project.",
          },
          {
            question: "How can I follow the news?",
            answer: "Through the official Telegram channel, website, and project social networks.",
          },
          {
            question: "How can I contact the team?",
            answer: "Through the contact form on the website or the official project contacts.",
          },
        ],
      },
    ],
  },
};

const brandStoryContent: Record<LandingLanguage, BrandStoryContent> = {
  ru: {
    title: "Brand Story",
    subtitle: "История The DAO Way, философия Win-Win и команда, которая строит экосистему.",
    close: "Закрыть Brand Story",
    badges: ["Telegram-native", "AI", "Game-driven", "DAO-ready"],
    paragraphs: [
      "The DAO Way родился из понимания одной простой проблемы: современный трейдер окружён десятками инструментов, но лишён единой системы, которая помогает развиваться последовательно и дисциплинированно.",
      "Курсы, Telegram-каналы, аналитика, торговые боты и AI существуют разрозненно, создавая информационный шум вместо реального прогресса.",
      "Мы создали The DAO Way - интеллектуальную экосистему, объединяющую искусственный интеллект, геймификацию, обучение и экономику сообщества в единую платформу, которая помогает пользователям принимать более качественные решения и расти вместе с экосистемой.",
      "В основе проекта лежит философия Win-Win: чем успешнее становится каждый пользователь, тем сильнее становится вся платформа.",
      "За The DAO Way стоит команда с более чем 60-летним совокупным опытом в инвестициях, финансовых рынках, разработке цифровых продуктов, искусственном интеллекте, маркетинге, PR и масштабировании международных сообществ.",
      "Мы объединяем профессионализм, предпринимательское мышление и энтузиазм, чтобы создавать продукты, которыми сами хотели бы пользоваться.",
    ],
    teamTitle: "Команда",
    teamIntro:
      "The DAO Way объединяет специалистов в области блокчейна, разработки, искусственного интеллекта, UX/UI-дизайна, аналитики, маркетинга, комьюнити-менеджмента и продуктового развития.",
    members: [
      {
        name: "Олег",
        role: "Co-Founder & CEO",
        focus: "Стратегия • Инвестиции • Бизнес",
        description:
          "Более 20 лет опыта в инвестициях, управлении капиталом, финансовых рынках и развитии бизнеса. Отвечает за стратегию проекта, экономическую модель, партнёрства и долгосрочное развитие экосистемы.",
      },
      {
        name: "Анна",
        role: "Co-Founder & CTO",
        focus: "AI • Product • Technology",
        description:
          "Эксперт в области искусственного интеллекта и разработки цифровых продуктов. Архитектор платформы и создатель концепции Risk Guardian AI. Отвечает за технологическое развитие, персонализацию и AI-решения.",
      },
      {
        name: "Стас",
        role: "Co-Founder",
        focus: "Growth • Marketing • PR • Community",
        description:
          "Более 20 лет опыта в маркетинге, PR, построении брендов и масштабировании сообществ. Отвечает за развитие экосистемы, коммуникации, привлечение пользователей, партнёров и формирование сильного международного комьюнити.",
      },
    ],
    closing: "Один Telegram. Один профиль. Одна экосистема. Один путь к мастерству.",
  },
  en: {
    title: "Brand Story",
    subtitle: "The story behind The DAO Way, its Win-Win philosophy, and the team building the ecosystem.",
    close: "Close Brand Story",
    badges: ["Telegram-native", "AI", "Game-driven", "DAO-ready"],
    paragraphs: [
      "The DAO Way was born from one simple insight: modern traders are surrounded by dozens of tools, but lack a single system that helps them grow consistently and with discipline.",
      "Courses, Telegram channels, analytics, trading bots, and AI tools often exist separately, creating information noise instead of real progress.",
      "We created The DAO Way as an intelligent ecosystem that brings artificial intelligence, gamification, education, and community economics into one platform, helping users make better decisions and grow together with the ecosystem.",
      "The project is built on a Win-Win philosophy: the more successful each user becomes, the stronger the entire platform becomes.",
      "Behind The DAO Way is a team with more than 60 years of combined experience in investments, financial markets, digital product development, artificial intelligence, marketing, PR, and scaling international communities.",
      "We combine professionalism, entrepreneurial thinking, and enthusiasm to build products we would want to use ourselves.",
    ],
    teamTitle: "Team",
    teamIntro:
      "The DAO Way brings together specialists in blockchain, development, artificial intelligence, UX/UI design, analytics, marketing, community management, and product development.",
    members: [
      {
        name: "Oleg",
        role: "Co-Founder & CEO",
        focus: "Strategy • Investments • Business",
        description:
          "More than 20 years of experience in investments, capital management, financial markets, and business development. Responsible for project strategy, economic model, partnerships, and long-term ecosystem growth.",
      },
      {
        name: "Anna",
        role: "Co-Founder & CTO",
        focus: "AI • Product • Technology",
        description:
          "Expert in artificial intelligence and digital product development. Platform architect and creator of the Risk Guardian AI concept. Responsible for technology, personalization, and AI solutions.",
      },
      {
        name: "Stas",
        role: "Co-Founder",
        focus: "Growth • Marketing • PR • Community",
        description:
          "More than 20 years of experience in marketing, PR, brand building, and community scaling. Responsible for ecosystem growth, communications, user and partner acquisition, and building a strong international community.",
      },
    ],
    closing: "One Telegram. One profile. One ecosystem. One path to mastery.",
  },
};

const roadmapContent: Record<LandingLanguage, RoadmapContent> = {
  ru: {
    title: "Roadmap",
    subtitle: "6 этапов роста Telegram-native экосистемы The DAO Way.",
    close: "Закрыть Roadmap",
    readMore: "Читать подробнее",
    readLess: "Свернуть описание",
    badges: ["GameFi", "EdTech", "AI", "Trading SaaS", "DAO"],
    images: ROADMAP_IMAGES_RU,
    stages: [
      {
        title: "Этап 1. Запуск экосистемы",
        status: "Готово / MVP Ready",
        items: [
          "Запуск игры Crypto Reality - игрового симулятора криптотрейдинга.",
          "Запуск образовательной платформы DAO Education.",
          "Формирование единого профиля пользователя.",
          "Подготовка инфраструктуры Telegram Mini App.",
          "Готовность основных модулей проекта более чем на 90%.",
        ],
      },
      {
        title: "Этап 2. MVP торговых инструментов",
        items: [
          "Запуск Trader Journal (Дневник трейдера).",
          "Интеграция калькулятора риска.",
          "Сбор и анализ торговой статистики.",
          "Формирование привычки ежедневного ведения журнала.",
          "Первые подписочные SaaS-инструменты.",
        ],
      },
      {
        title: "Этап 3. AI и персонализация",
        items: [
          "Запуск Risk Guardian AI.",
          "Автоматический анализ сделок пользователя.",
          "Персональные рекомендации по развитию.",
          "Определение повторяющихся ошибок трейдера.",
          "Индивидуальные образовательные маршруты на основе поведения пользователя.",
        ],
      },
      {
        title: "Этап 4. Игровая экономика",
        items: [
          "Запуск Meme Hero Farming.",
          "Развитие игровых персонажей.",
          "Внутренняя экономика и система наград.",
          "Маркетплейс цифровых предметов (DAO Market).",
          "Премиальные игровые механики и бустеры.",
        ],
      },
      {
        title: "Этап 5. Масштабирование платформы",
        items: [
          "Запуск DAO Pro Indicator.",
          "Запуск Scalping EMA Bot.",
          "Расширение набора AI-инструментов.",
          "Рост подписочной модели DAO Tools.",
          "Расширение образовательной платформы.",
        ],
      },
      {
        title: "Этап 6. DAO и B2B",
        items: [
          "White Label-решения для криптоакадемий и Web3-сообществ.",
          "B2B-лицензирование платформы.",
          "Запуск DAO-экономики.",
          "Utility-токен проекта.",
          "Голосование сообщества (Governance).",
          "Скидки, премиум-функции и внутренняя экономика экосистемы.",
        ],
      },
    ],
    goalTitle: "Конечная цель",
    goalIntro: "Создать крупнейшую Telegram-native экосистему для криптотрейдеров, объединяющую:",
    goalItems: ["GameFi", "EdTech", "AI-аналитику", "Trading SaaS", "DAO-экономику"],
    goalOutro:
      "В едином продукте с несколькими независимыми источниками дохода и высокой долгосрочной ценностью пользователя.",
  },
  en: {
    title: "Roadmap",
    subtitle: "6 growth stages for The DAO Way Telegram-native ecosystem.",
    close: "Close Roadmap",
    readMore: "Read more",
    readLess: "Collapse details",
    badges: ["GameFi", "EdTech", "AI", "Trading SaaS", "DAO"],
    images: ROADMAP_IMAGES_EN,
    stages: [
      {
        title: "Stage 1. Ecosystem Launch",
        status: "Done / MVP Ready",
        items: [
          "Launch of Crypto Reality, a crypto trading game simulator.",
          "Launch of the DAO Education platform.",
          "Creation of a unified user profile.",
          "Preparation of the Telegram Mini App infrastructure.",
          "Core project modules are more than 90% ready.",
        ],
      },
      {
        title: "Stage 2. Trading Tools MVP",
        items: [
          "Launch of Trader Journal.",
          "Risk calculator integration.",
          "Collection and analysis of trading statistics.",
          "Building the habit of daily journaling.",
          "First subscription SaaS tools.",
        ],
      },
      {
        title: "Stage 3. AI and Personalization",
        items: [
          "Launch of Risk Guardian AI.",
          "Automatic analysis of user trades.",
          "Personal development recommendations.",
          "Detection of recurring trader mistakes.",
          "Individual education paths based on user behavior.",
        ],
      },
      {
        title: "Stage 4. Game Economy",
        items: [
          "Launch of Meme Hero Farming.",
          "Development of game characters.",
          "Internal economy and reward system.",
          "Digital item marketplace (DAO Market).",
          "Premium game mechanics and boosters.",
        ],
      },
      {
        title: "Stage 5. Platform Scaling",
        items: [
          "Launch of DAO Pro Indicator.",
          "Launch of Scalping EMA Bot.",
          "Expansion of AI tools.",
          "Growth of the DAO Tools subscription model.",
          "Expansion of the education platform.",
        ],
      },
      {
        title: "Stage 6. DAO and B2B",
        items: [
          "White Label solutions for crypto academies and Web3 communities.",
          "B2B platform licensing.",
          "Launch of DAO economics.",
          "Project utility token.",
          "Community governance voting.",
          "Discounts, premium features, and internal ecosystem economy.",
        ],
      },
    ],
    goalTitle: "Final Goal",
    goalIntro: "To create the largest Telegram-native ecosystem for crypto traders, combining:",
    goalItems: ["GameFi", "EdTech", "AI analytics", "Trading SaaS", "DAO economy"],
    goalOutro:
      "Inside one product with multiple independent revenue streams and high long-term user value.",
  },
};

const onePagerContent: Record<LandingLanguage, OnePagerContent> = {
  ru: {
    title: "One Pager",
    subtitle: "THE DAO WAY - операционная система для криптотрейдеров.",
    close: "Закрыть One Pager",
    readMore: "Читать подробнее",
    readLess: "Свернуть описание",
    badges: ["Играй", "Учись", "Торгуй", "Развивайся", "Telegram Native"],
    images: ONE_PAGER_IMAGES_RU,
    sections: [
      {
        title: "THE DAO WAY",
        body: "Операционная система для криптотрейдеров. Играй. Учись. Торгуй. Развивайся. Всё в одном Telegram.",
      },
      {
        title: "Миссия",
        body:
          "Помочь энтузиастам и профессионалам перейти от эмоциональной торговли к дисциплинированному и прибыльному подходу, дольше оставаться на рынке и достигать стабильных результатов.",
      },
      {
        title: "Наше Видение",
        body:
          "Мы строим не отдельные инструменты, а единую ОС для роста трейдера. Игра, обучение, ИИ, профессиональные инструменты и DAO-экономика работают вместе. Каждый этап естественно продолжает предыдущий - от первого клика до профессиональной торговли.",
      },
      {
        title: "Экосистема",
        items: [
          "Crypto Reality - психоэмоциональная игра-квест с внутриигровым майнингом.",
          "DAO Trader Journal - ежедневный интеллектуальный трекинг.",
          "DAO Education - 178 практических уроков (37,6 ч).",
          "DAO Tools + Risk Guardian AI - боты, индикаторы и умный анализ ошибок.",
          "DAO Economy - rewards, marketplace и единая экономика.",
        ],
      },
      {
        title: "Ключевые метрики",
        body: "4 ядра • 178 уроков • AI-персонализация • Telegram Native.",
      },
      {
        title: "Маховик роста",
        body: "Играй -> Учись -> Анализируй -> Торгуй -> Развивайся -> Зарабатывай.",
      },
      {
        title: "Бизнес-модель",
        body:
          "Монетизируем весь путь пользователя. Win-Win: Чем лучше трейдер - тем сильнее экосистема.",
      },
    ],
    closing: "The DAO Way - твой путь к дисциплине и долгосрочному успеху в крипте.",
  },
  en: {
    title: "One Pager",
    subtitle: "THE DAO WAY - operating system for crypto traders.",
    close: "Close One Pager",
    readMore: "Read more",
    readLess: "Collapse details",
    badges: ["Play", "Learn", "Trade", "Grow", "Telegram Native"],
    images: ONE_PAGER_IMAGES_EN,
    sections: [
      {
        title: "THE DAO WAY",
        body: "Operating system for crypto traders. Play. Learn. Trade. Grow. Everything in one Telegram.",
      },
      {
        title: "Mission",
        body:
          "To help enthusiasts and professionals move from emotional trading to a disciplined and profitable approach, stay in the market longer, and achieve stable results.",
      },
      {
        title: "Vision",
        body:
          "We are building not a set of separate tools, but a unified operating system for trader growth. Game mechanics, education, AI, professional tools, and DAO economics work together. Each stage naturally continues the previous one, from the first click to professional trading.",
      },
      {
        title: "Ecosystem",
        items: [
          "Crypto Reality - a psycho-emotional quest game with in-game mining.",
          "DAO Trader Journal - daily intelligent tracking.",
          "DAO Education - 178 practical lessons (37.6 hours).",
          "DAO Tools + Risk Guardian AI - bots, indicators, and smart error analysis.",
          "DAO Economy - rewards, marketplace, and unified economics.",
        ],
      },
      {
        title: "Core Metrics",
        body: "4 cores • 178 lessons • AI personalization • Telegram Native.",
      },
      {
        title: "Growth Flywheel",
        body: "Play -> Learn -> Analyze -> Trade -> Grow -> Earn.",
      },
      {
        title: "Business Model",
        body:
          "We monetize the entire user journey. Win-Win: the better the trader, the stronger the ecosystem.",
      },
    ],
    closing: "The DAO Way - your path to discipline and long-term success in crypto.",
  },
};

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
        ["One Pager", "Одностраничное резюме проекта", "Для быстрого знакомства с проектом", "Открыто", "Смотреть", "download"],
        ["Pitch Deck", "Презентация для инвесторов и партнеров", "Для инвесторов и стратегических партнёров", "По запросу", "Запросить", "send"],
        ["FAQ", "Ответы на частые вопросы", "Ключевые вопросы об экосистеме", "Открыто", "Смотреть", "file"],
        ["Whitepaper Lite", "Облегченная концептуальная документация", "Концепция, логика продукта и экономика", "Открыто / По запросу", "Подробнее", "file"],
        ["Brand Story", "История бренда и нарратив", "Нарратив, миссия и позиционирование", "Открыто", "Смотреть", "book"],
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
        ["One Pager", "One-page project summary", "Quick project overview", "Public", "View", "download"],
        ["Pitch Deck", "Investor and partner presentation", "For investors and strategic partners", "On request", "Request Access", "send"],
        ["FAQ", "Frequently asked questions", "Key questions about the ecosystem", "Public", "View", "file"],
        ["Whitepaper Lite", "Lightweight concept documentation", "Concept, product logic, and economy", "Public / On request", "Learn More", "file"],
        ["Brand Story", "Brand story and narrative", "Narrative, mission, and positioning", "Public", "View", "book"],
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
            {language === "ru" ? (
              <span className="landing-pill__text">
                Telegram-native экосистема для нового{" "}
                <span className="landing-pill__mobile-line">финансового мира</span>
              </span>
            ) : (
              t.hero.superheading
            )}
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

function TractionGrid({ language, id }: { language: LandingLanguage; id?: string }) {
  const t = content[language];

  return (
    <div className="traction-grid reveal" id={id}>
      {t.traction.map(([value, label, description], index) => (
        <article className="traction-card" key={label}>
          <div className="traction-card__headline">
            <strong>{value}</strong>
            <img className="traction-card__icon" src={TRACTION_ICON_SRCS[index]} alt="" aria-hidden="true" />
          </div>
          <span>{label}</span>
          <p>{description}</p>
        </article>
      ))}
    </div>
  );
}

function UspSection({ language }: { language: LandingLanguage }) {
  const t = content[language];

  return (
    <SectionShell id="roadmap" title={t.usp.title} subtitle={t.usp.subtitle}>
      <div className="usp-layout">
        <EcosystemOrbitPanel language={language} />
        <div className="usp-right-stack">
          <TractionGrid language={language} id="products" />
          <div className="usp-grid reveal">
            {t.usp.items.map(([label], index) => (
              <article className="glow-card" key={label}>
                <img className="glow-card__icon" src={USP_ICON_SRCS[index]} alt="" aria-hidden="true" />
                <h3>{label}</h3>
              </article>
            ))}
          </div>
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

function PressKitSection({
  language,
  onOnePager,
  onPitchdeck,
  onFaq,
  onBrandStory,
  onRoadmap,
}: {
  language: LandingLanguage;
  onOnePager: () => void;
  onPitchdeck: () => void;
  onFaq: () => void;
  onBrandStory: () => void;
  onRoadmap: () => void;
}) {
  const t = content[language];

  return (
    <SectionShell id="materials" title={t.press.title} subtitle={t.press.subtitle}>
      <div className="press-grid">
        {t.press.cards.map(([title, description, meta, _badge, action], index) => {
          const isOnePager = title === "One Pager";
          const isPitchDeck = title === "Pitch Deck";
          const isFaq = title === "FAQ";
          const isBrandStory = title === "Brand Story";
          const isRoadmap = title === "Roadmap";
          const isActive = isOnePager || isPitchDeck || isFaq || isBrandStory || isRoadmap;
          return (
            <article className="press-card reveal" key={title}>
              <div className="press-card__top">
                <img className="press-card__icon" src={PRESS_ICON_SRCS[index]} alt="" aria-hidden="true" />
                <h3>
                  {title} - <span>{description}</span>
                </h3>
              </div>
              <small>{meta}</small>
              <button
                className="landing-btn landing-btn--ghost"
                type="button"
                onClick={
                  isOnePager
                    ? onOnePager
                    : isPitchDeck
                      ? onPitchdeck
                      : isFaq
                        ? onFaq
                        : isBrandStory
                          ? onBrandStory
                          : isRoadmap
                            ? onRoadmap
                            : undefined
                }
                disabled={!isActive}
              >
                {isActive ? action : t.press.comingSoon}
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

function FaqModal({
  language,
  open,
  onClose,
}: {
  language: LandingLanguage;
  open: boolean;
  onClose: () => void;
}) {
  const t = faqContent[language];
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeCategoryId, setActiveCategoryId] = useState(t.categories[0].id);
  const [openItemId, setOpenItemId] = useState(`${t.categories[0].id}-0`);
  const activeCategory = t.categories.find((category) => category.id === activeCategoryId) ?? t.categories[0];

  useEffect(() => {
    if (!open) return;

    setActiveCategoryId(t.categories[0].id);
    setOpenItemId(`${t.categories[0].id}-0`);

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = modalRef.current?.querySelector<HTMLElement>("button, [href], input, textarea, select");
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
  }, [language, onClose, open, t.categories]);

  if (!open) return null;

  return (
    <div className="landing-modal faq-modal" role="dialog" aria-modal="true" aria-labelledby="faq-title">
      <button className="landing-modal__scrim" type="button" onClick={onClose} aria-label={t.close} />
      <div className="landing-modal__panel faq-modal__panel" ref={modalRef}>
        <button className="landing-icon-btn landing-modal__close" type="button" onClick={onClose} aria-label={t.close}>
          <Icon name="close" />
        </button>
        <div className="faq-modal__head">
          <span>THE DAO WAY</span>
          <h2 id="faq-title">{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <div className="faq-modal__layout">
          <aside className="faq-modal__categories" aria-label={language === "ru" ? "Категории FAQ" : "FAQ categories"}>
            {t.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={category.id === activeCategory.id ? "is-active" : ""}
                onClick={() => {
                  setActiveCategoryId(category.id);
                  setOpenItemId(`${category.id}-0`);
                }}
              >
                <span>{category.label}</span>
                <small>{category.items.length}</small>
              </button>
            ))}
          </aside>
          <div className="faq-modal__questions">
            {activeCategory.items.map((item, index) => {
              const itemId = `${activeCategory.id}-${index}`;
              const isOpen = openItemId === itemId;
              return (
                <article className={isOpen ? "faq-item is-open" : "faq-item"} key={item.question}>
                  <button type="button" onClick={() => setOpenItemId(isOpen ? "" : itemId)} aria-expanded={isOpen}>
                    <span>{item.question}</span>
                    <Icon name="close" />
                  </button>
                  <div className="faq-item__answer">
                    <div>{item.answer}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandStoryModal({
  language,
  open,
  onClose,
}: {
  language: LandingLanguage;
  open: boolean;
  onClose: () => void;
}) {
  const t = brandStoryContent[language];
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = modalRef.current?.querySelector<HTMLElement>("button, [href], input, textarea, select");
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
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="landing-modal brand-story-modal" role="dialog" aria-modal="true" aria-labelledby="brand-story-title">
      <button className="landing-modal__scrim" type="button" onClick={onClose} aria-label={t.close} />
      <div className="landing-modal__panel brand-story-modal__panel" ref={modalRef}>
        <button className="landing-icon-btn landing-modal__close" type="button" onClick={onClose} aria-label={t.close}>
          <Icon name="close" />
        </button>
        <div className="brand-story-modal__hero">
          <div>
            <span>THE DAO WAY</span>
            <h2 id="brand-story-title">{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <div className="brand-story-modal__badges" aria-label={language === "ru" ? "Ключевые принципы" : "Core principles"}>
            {t.badges.map((badge) => (
              <small key={badge}>{badge}</small>
            ))}
          </div>
        </div>
        <div className="brand-story-modal__layout">
          <article className="brand-story-modal__story">
            {t.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <strong>{t.closing}</strong>
          </article>
          <aside className="brand-story-modal__team">
            <div className="brand-story-modal__team-head">
              <span>{t.teamTitle}</span>
              <p>{t.teamIntro}</p>
            </div>
            <div className="brand-story-modal__members">
              {t.members.map((member) => (
                <article className="brand-story-member" key={member.name}>
                  <div>
                    <h3>{member.name}</h3>
                    <span>{member.role}</span>
                  </div>
                  <small>{member.focus}</small>
                  <p>{member.description}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RoadmapModal({
  language,
  open,
  onClose,
}: {
  language: LandingLanguage;
  open: boolean;
  onClose: () => void;
}) {
  const t = roadmapContent[language];
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = modalRef.current?.querySelector<HTMLElement>("button, [href], input, textarea, select");
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
  }, [onClose, open]);

  useEffect(() => {
    if (!open) setDetailsOpen(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="landing-modal roadmap-modal" role="dialog" aria-modal="true" aria-labelledby="roadmap-modal-title">
      <button className="landing-modal__scrim" type="button" onClick={onClose} aria-label={t.close} />
      <div className="landing-modal__panel roadmap-modal__panel" ref={modalRef}>
        <button className="landing-icon-btn landing-modal__close" type="button" onClick={onClose} aria-label={t.close}>
          <Icon name="close" />
        </button>
        <div className="roadmap-modal__hero">
          <div>
            <span>THE DAO WAY</span>
            <h2 id="roadmap-modal-title">{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <div className="roadmap-modal__badges" aria-label={language === "ru" ? "Направления дорожной карты" : "Roadmap tracks"}>
            {t.badges.map((badge) => (
              <small key={badge}>{badge}</small>
            ))}
          </div>
        </div>
        <figure className="roadmap-modal__visual">
          <img
            className="roadmap-modal__image roadmap-modal__image--dark-landscape"
            src={t.images.darkLandscape}
            alt={language === "ru" ? "Дорожная карта The DAO Way" : "The DAO Way roadmap"}
          />
          <img
            className="roadmap-modal__image roadmap-modal__image--dark-portrait"
            src={t.images.darkPortrait}
            alt=""
            aria-hidden="true"
          />
          <img
            className="roadmap-modal__image roadmap-modal__image--light-landscape"
            src={t.images.lightLandscape}
            alt=""
            aria-hidden="true"
          />
          <img
            className="roadmap-modal__image roadmap-modal__image--light-portrait"
            src={t.images.lightPortrait}
            alt=""
            aria-hidden="true"
          />
        </figure>
        <button
          className="roadmap-modal__toggle"
          type="button"
          onClick={() => setDetailsOpen((current) => !current)}
          aria-expanded={isDetailsOpen}
        >
          <span>{isDetailsOpen ? t.readLess : t.readMore}</span>
          <Icon name="close" />
        </button>
        <div className={isDetailsOpen ? "roadmap-modal__details is-open" : "roadmap-modal__details"}>
          <div>
            <div className="roadmap-modal__stages">
              {t.stages.map((stage, index) => (
                <article className="roadmap-stage" key={stage.title}>
                  <div className="roadmap-stage__head">
                    <span>{index + 1}</span>
                    <div>
                      <h3>{stage.title}</h3>
                      {stage.status && <small>{stage.status}</small>}
                    </div>
                  </div>
                  <ul>
                    {stage.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <article className="roadmap-modal__goal">
              <h3>{t.goalTitle}</h3>
              <p>{t.goalIntro}</p>
              <div>
                {t.goalItems.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <p>{t.goalOutro}</p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnePagerModal({
  language,
  open,
  onClose,
}: {
  language: LandingLanguage;
  open: boolean;
  onClose: () => void;
}) {
  const t = onePagerContent[language];
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = modalRef.current?.querySelector<HTMLElement>("button, [href], input, textarea, select");
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
  }, [onClose, open]);

  useEffect(() => {
    if (!open) setDetailsOpen(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="landing-modal one-pager-modal" role="dialog" aria-modal="true" aria-labelledby="one-pager-modal-title">
      <button className="landing-modal__scrim" type="button" onClick={onClose} aria-label={t.close} />
      <div className="landing-modal__panel one-pager-modal__panel" ref={modalRef}>
        <button className="landing-icon-btn landing-modal__close" type="button" onClick={onClose} aria-label={t.close}>
          <Icon name="close" />
        </button>
        <div className="one-pager-modal__hero">
          <div>
            <span>THE DAO WAY</span>
            <h2 id="one-pager-modal-title">{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <div className="one-pager-modal__badges" aria-label={language === "ru" ? "Ключевые тезисы One Pager" : "One Pager key points"}>
            {t.badges.map((badge) => (
              <small key={badge}>{badge}</small>
            ))}
          </div>
        </div>
        <figure className="one-pager-modal__visual">
          <img
            className="one-pager-modal__image one-pager-modal__image--dark-landscape"
            src={t.images.darkLandscape}
            alt={language === "ru" ? "One Pager The DAO Way" : "The DAO Way one pager"}
          />
          <img
            className="one-pager-modal__image one-pager-modal__image--dark-portrait"
            src={t.images.darkPortrait}
            alt=""
            aria-hidden="true"
          />
          <img
            className="one-pager-modal__image one-pager-modal__image--light-landscape"
            src={t.images.lightLandscape}
            alt=""
            aria-hidden="true"
          />
          <img
            className="one-pager-modal__image one-pager-modal__image--light-portrait"
            src={t.images.lightPortrait}
            alt=""
            aria-hidden="true"
          />
        </figure>
        <button
          className="one-pager-modal__toggle"
          type="button"
          onClick={() => setDetailsOpen((current) => !current)}
          aria-expanded={isDetailsOpen}
        >
          <span>{isDetailsOpen ? t.readLess : t.readMore}</span>
          <Icon name="close" />
        </button>
        <div className={isDetailsOpen ? "one-pager-modal__details is-open" : "one-pager-modal__details"}>
          <div>
            <div className="one-pager-modal__sections">
              {t.sections.map((section) => (
                <article className="one-pager-section" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.body && <p>{section.body}</p>}
                  {section.items && (
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
            <article className="one-pager-modal__closing">{t.closing}</article>
          </div>
        </div>
      </div>
    </div>
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
  const [isFaqOpen, setFaqOpen] = useState(false);
  const [isOnePagerOpen, setOnePagerOpen] = useState(false);
  const [isBrandStoryOpen, setBrandStoryOpen] = useState(false);
  const [isRoadmapOpen, setRoadmapOpen] = useState(false);
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
      <UspSection language={language} />
      <InfrastructureSection language={language} />
      <PressKitSection
        language={language}
        onOnePager={() => setOnePagerOpen(true)}
        onPitchdeck={() => setPitchdeckOpen(true)}
        onFaq={() => setFaqOpen(true)}
        onBrandStory={() => setBrandStoryOpen(true)}
        onRoadmap={() => setRoadmapOpen(true)}
      />
      <FinalCta language={language} onPitchdeck={() => setPitchdeckOpen(true)} />
      <LandingFooter language={language} />
      <RequestPitchdeckModal language={language} open={isPitchdeckOpen} onClose={() => setPitchdeckOpen(false)} />
      <FaqModal language={language} open={isFaqOpen} onClose={() => setFaqOpen(false)} />
      <OnePagerModal language={language} open={isOnePagerOpen} onClose={() => setOnePagerOpen(false)} />
      <BrandStoryModal language={language} open={isBrandStoryOpen} onClose={() => setBrandStoryOpen(false)} />
      <RoadmapModal language={language} open={isRoadmapOpen} onClose={() => setRoadmapOpen(false)} />
      <span className="landing-sr-only" aria-live="polite">
        {t.meta.title}
      </span>
    </div>
  );
}
