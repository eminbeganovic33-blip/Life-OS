/**
 * Idle-time prefetch of every lazy route/panel chunk.
 *
 * Code-splitting keeps first paint fast, but it costs offline completeness:
 * the service worker only caches /assets/ chunks when they're fetched, so an
 * installed-app user who goes offline and opens a tab they've never visited
 * would hit a failed dynamic import. Prefetching during idle time closes that
 * gap (every import below hits the SW → runtime-cached) and makes tab/panel
 * opens instant as a bonus.
 *
 * The import() paths mirror AppShell's lazy() calls — Vite resolves both to
 * the same chunk URLs, so nothing is downloaded twice.
 */
export function prefetchLazyChunks() {
  const imports = [
    () => import("../components/screens/TrainScreen"),
    () => import("../components/screens/LearnScreen"),
    () => import("../components/screens/ForgeScreen"),
    () => import("../components/screens/MeScreen"),
    () => import("../components/panels/DomainPanel"),
    () => import("../components/panels/JournalPanel"),
    () => import("../components/panels/ForgePanel"),
    () => import("../components/panels/DojoPanel"),
    () => import("../components/panels/ProgressPanel"),
    () => import("../components/panels/AcademyPanel"),
    () => import("../components/panels/TrophyPanel"),
    () => import("../components/panels/KnowledgePanel"),
    () => import("../components/panels/CustomQuestPanel"),
    () => import("../components/panels/AvatarPickerPanel"),
    () => import("../components/panels/BookLibraryPanel"),
    () => import("../components/panels/LeaderboardPanel"),
    () => import("../components/panels/CharacterPanel"),
    () => import("../components/panels/CardCollectionPanel"),
    () => import("../components/panels/QuestLibraryPanel"),
    () => import("../components/panels/InboxPanel"),
  ];

  let i = 0;
  const next = () => {
    if (i >= imports.length) return;
    // Swallow failures — this is opportunistic; lazyWithRetry still guards
    // the real render path.
    imports[i++]().catch(() => {}).finally(() => schedule(next));
  };
  const schedule = (fn) => {
    if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 2000 });
    else setTimeout(fn, 300);
  };
  schedule(next);
}
