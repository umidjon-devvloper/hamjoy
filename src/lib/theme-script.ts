/** localStorage key for the user's theme choice (shared with lib/theme.ts). */
export const THEME_STORAGE_KEY = 'hamjoy:theme';

/**
 * Inlined in <head> so the saved theme is applied before first paint
 * (no light→dark flash). Plain module — the root layout is a Server Component.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark'){document.documentElement.dataset.theme='dark'}}catch(e){}`;
