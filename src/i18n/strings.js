// ---------------------------------------------------------------------------
// UI string dictionary for YARPHOENIX MOVIES.
//
// Keys are flat, dotted strings. Values are either a string or a function
// (for interpolation / pluralisation). Looked up via the `t()` helper in
// LanguageContext, which falls back to English and then to the key itself.
//
// Brand names ("Yarphoenix Films/Movies") are intentionally NOT translated.
// ---------------------------------------------------------------------------
import { pluralRu } from "./plural";

export const STRINGS = {
  en: {
    // App shell
    "app.skip": "Skip to content",

    // Header / nav
    "header.homeAria": "YARPHOENIX MOVIES — home",
    "header.logoAlt": "YARPHOENIX logo",
    "nav.primaryAria": "Primary",
    "lang.groupAria": "Language",
    "theme.toDark": "Switch to dark theme",
    "theme.toLight": "Switch to light theme",

    // Footer
    "footer.tagline": "Catalogue in black & white",
    "footer.viaApi": "via API",
    "footer.viaLocal": "via local catalogue",

    // Home — hero
    "home.heroPre": "Everything ",
    "home.heroEm": "worth watching",
    "home.blurb":
      "A curated index of films and series.",
    "home.localNotice": "It's a local catalogue",

    // Home — states
    "home.errorBig": "Couldn’t reach the catalogue.",
    "home.errorDetail":
      "The API request failed. Check the connection and try again.",
    "home.retry": "Retry",
    "home.emptyBig": (q) => `Nothing matches “${q}”.`,
    "home.emptyDetail": "Try another title, or clear the filters.",

    // Search controls
    "search.label": "Search the catalogue",
    "search.placeholder": "Search the catalogue…",
    "search.clear": "clear ✕",
    "search.filterGroupAria": "Filter by type",
    "filters.all": "All",
    "filters.films": "Films",
    "filters.series": "Series",
    "search.count": (n) => `${n} ${n === 1 ? "title" : "titles"}`,

    // Poster (card overlay) + card caption
    "poster.series": "Series",
    "poster.feature": "Feature",
    "card.series": "series",
    "card.film": "film",
    "card.aria": (title, year, typeLabel) => `${title} (${year}, ${typeLabel})`,

    // Detail
    "detail.kickerSeries": "Series",
    "detail.kickerFeature": "Feature film",
    "detail.rating": "Rating",
    "detail.runtime": "Runtime",
    "detail.length": "Length",
    "detail.released": "Released",
    "detail.genre": "Genre",
    "detail.loadingDetails": "Loading details…",
    "detail.noSynopsis": "No synopsis available.",
    "detail.directedBy": "Directed by",
    "detail.starring": "Starring",
    "detail.moreLikeThis": "More like this",
    "detail.failedBig": "Couldn’t load this title.",
    "detail.backToCatalogue": "Back to catalogue",
    "detail.back": "← Back to catalogue",
    "detail.loading": "Loading…",

    // Watch (find where to watch)
    "detail.watch": "▶ Watch",
    "watch.title": "Where to watch",
    "watch.loading": "Searching sources…",
    "watch.empty": "Nothing to watch found.",
    "watch.emptyDetail": "Looks like it isn't on any sources yet. Check back later.",
    "watch.error": "Couldn’t reach the search service.",
    "watch.partial": "Some sources didn’t respond — showing what we found.",
    "watch.notConfigured": "Watching isn’t available in this build.",
    "watch.close": "Close",
    "watch.filterSource": "Filter by source",
    "watch.source.rutube": "Rutube",
    "watch.source.vk": "VK",
    "watch.disclaimer": "Search results are selected automatically and may be inaccurate.",
  },

  ru: {
    // App shell
    "app.skip": "Перейти к содержимому",

    // Header / nav
    "header.homeAria": "YARPHOENIX MOVIES — на главную",
    "header.logoAlt": "Логотип YARPHOENIX",
    "nav.primaryAria": "Основная навигация",
    "lang.groupAria": "Язык",
    "theme.toDark": "Переключить на тёмную тему",
    "theme.toLight": "Переключить на светлую тему",

    // Footer
    "footer.tagline": "Каталог в чёрно-белом",
    "footer.viaApi": "через API",
    "footer.viaLocal": "через локальный каталог",

    // Home — hero
    "home.heroPre": "Всё, что ",
    "home.heroEm": "стоит посмотреть",
    "home.blurb":
      "Тщательно собранный каталог фильмов и сериалов.",
    "home.localNotice": "Это локальный каталог",

    // Home — states
    "home.errorBig": "Не удалось загрузить каталог.",
    "home.errorDetail":
      "Запрос к API не удался. Проверьте соединение и попробуйте снова.",
    "home.retry": "Повторить",
    "home.emptyBig": (q) => `Ничего не найдено по запросу «${q}».`,
    "home.emptyDetail": "Попробуйте другое название или сбросьте фильтры.",

    // Search controls
    "search.label": "Поиск по каталогу",
    "search.placeholder": "Поиск по каталогу…",
    "search.clear": "очистить ✕",
    "search.filterGroupAria": "Фильтр по типу",
    "filters.all": "Все",
    "filters.films": "Фильмы",
    "filters.series": "Сериалы",
    "search.count": (n) =>
      `${n} ${pluralRu(n, ["результат", "результата", "результатов"])}`,

    // Poster (card overlay) + card caption
    "poster.series": "Сериал",
    "poster.feature": "Фильм",
    "card.series": "сериал",
    "card.film": "фильм",
    "card.aria": (title, year, typeLabel) => `${title} (${year}, ${typeLabel})`,

    // Detail
    "detail.kickerSeries": "Сериал",
    "detail.kickerFeature": "Фильм",
    "detail.rating": "Рейтинг",
    "detail.runtime": "Длительность",
    "detail.length": "Длина",
    "detail.released": "Год",
    "detail.genre": "Жанр",
    "detail.loadingDetails": "Загружаем детали…",
    "detail.noSynopsis": "Описание недоступно.",
    "detail.directedBy": "Режиссёр",
    "detail.starring": "В ролях",
    "detail.moreLikeThis": "Похожее",
    "detail.failedBig": "Не удалось загрузить эту страницу.",
    "detail.backToCatalogue": "Назад к каталогу",
    "detail.back": "← Назад к каталогу",
    "detail.loading": "Загрузка…",

    // Watch (где смотреть)
    "detail.watch": "▶ Смотреть",
    "watch.title": "Где смотреть",
    "watch.loading": "Ищем источники…",
    "watch.empty": "Ничего не нашлось для просмотра.",
    "watch.emptyDetail": "Возможно, его ещё нет на сторонних площадках, загляните позже.",
    "watch.error": "Не удалось связаться с сервисом поиска.",
    "watch.partial": "Часть источников не ответила — показываем найденное.",
    "watch.notConfigured": "Просмотр недоступен в этой сборке.",
    "watch.close": "Закрыть",
    "watch.filterSource": "Фильтр по источнику",
    "watch.source.rutube": "Rutube",
    "watch.source.vk": "VK",
      "watch.disclaimer": "Результаты подбираются автоматически и могут быть неточными.",
  },
};
