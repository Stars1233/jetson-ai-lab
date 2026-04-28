/**
 * Shared Tailwind class tokens for Jetson matrix UI (`JetsonModuleTabBar`, `JetsonEngineRail`).
 *
 * ## Cascade / ordering pitfalls
 *
 * - **Module tab states** — Inactive uses `border-b-transparent`; selected uses `border-b-nvidia-green` plus ring.
 *   Apply shared **padding row** before **state** so state border utilities win where Tailwind’s layer order allows.
 *   Do not merge inactive `hover:border-b-nvidia-gray-200` with selected without testing: selected should not pick up gray hover border.
 *
 * - **Engine rail (lg)** — The bar uses `divide-x` / `lg:divide-x-0 lg:divide-y` for hairlines between cells.
 *   Per-button **left accent** uses `lg:!border-l-[3px]` (modal) or `lg:!border-l-[5px]` (panel); the `!` matters when
 *   dividing borders would otherwise fight explicit border width.
 *
 * - **Run modal module bar** — Uses `overflow-x-hidden`, `overflow-y-hidden`, and `shrink-0`. Do not pair
 *   `overflow-x-hidden` with `overflow-y-visible`: CSS forces the visible axis to compute as `auto`, which adds an
 *   unwanted vertical scrollbar on the tab row inside the modal flex column. `shrink-0` keeps the strip from being
 *   compressed under `max-h-[90vh]`. Do not reintroduce `min-w-[10.5rem]` on modal tabs or horizontal scroll returns.
 */

/** Serve panel + catalog one-shot: horizontal scroll + snap */
export const MATRIX_MODULE_BAR_SERVE =
	'inference-matrix-module-bar flex overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-mandatory divide-x divide-nvidia-gray-200 border-b border-gray-200 bg-white w-full';

/** Same as serve strip plus hook class for one-shot scripts / styling */
export const MATRIX_MODULE_BAR_ONE_SHOT =
	'inference-matrix-module-bar one-shot-module-bar flex overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-mandatory divide-x divide-nvidia-gray-200 border-b border-gray-200 bg-white w-full';

/** Run modal: no horizontal scroll; labels wrap; no spurious y-scroll (see file comment) */
export const MATRIX_MODULE_BAR_MODAL =
	'run-modal-module-bar flex w-full min-w-0 max-w-full shrink-0 overflow-x-hidden overflow-y-hidden divide-x divide-nvidia-gray-200 border-b border-gray-200 bg-white';

const MATRIX_TAB_ROW_CORE =
	'group flex flex-row items-center gap-2 sm:gap-3 flex-1 basis-0 transition-colors duration-200';

export const MATRIX_TAB_ROW_MODAL = `run-modal-module-tab ${MATRIX_TAB_ROW_CORE} min-w-0`;

export const MATRIX_TAB_ROW_SERVE = `module-tab-btn ${MATRIX_TAB_ROW_CORE} min-w-[10.5rem] sm:min-w-[11rem] snap-start`;

export const MATRIX_TAB_ROW_ONE_SHOT = `one-shot-module-tab ${MATRIX_TAB_ROW_SERVE}`;

export const MATRIX_TAB_PADDING = 'px-4 sm:px-5 py-2.5 border-b-[5px] pb-3 -mb-px';

export const MATRIX_TAB_STATE_DISABLED =
	'cursor-not-allowed bg-[#999999] text-nvidia-black border-b-transparent pointer-events-none';

export const MATRIX_TAB_STATE_ACTIVE =
	'cursor-pointer bg-nvidia-green/25 text-nvidia-black border-b-nvidia-green ring-1 ring-inset ring-nvidia-green/30';

export const MATRIX_TAB_STATE_INACTIVE =
	'cursor-pointer bg-white border-b-transparent text-nvidia-gray-600 hover:bg-nvidia-gray-50 hover:text-nvidia-black hover:border-b-nvidia-gray-200';

export const MATRIX_TEXT_COL_MODAL =
	'min-w-0 flex-1 overflow-hidden text-left flex flex-col gap-0.5 whitespace-normal group-disabled:opacity-45';

export const MATRIX_TEXT_COL_PANEL =
	'min-w-0 flex-1 text-left flex flex-col gap-0.5 group-disabled:opacity-45';

export const MATRIX_TEXT_KICKER_MODAL =
	'text-[10px] sm:text-[11px] font-medium leading-none opacity-80 text-inherit [overflow-wrap:anywhere]';

export const MATRIX_TEXT_KICKER_PANEL =
	'text-[10px] sm:text-[11px] font-medium leading-none opacity-80 text-inherit';

export const MATRIX_TEXT_TITLE_MODAL =
	'text-xs sm:text-sm font-bold leading-snug text-inherit break-words [overflow-wrap:anywhere]';

export const MATRIX_TEXT_TITLE_PANEL = 'text-xs sm:text-sm font-bold leading-snug text-inherit';

export const MATRIX_TEXT_SUBTITLE_MODAL =
	'text-[10px] sm:text-[11px] font-normal leading-snug text-inherit opacity-80 break-words [overflow-wrap:anywhere]';

export const MATRIX_TEXT_SUBTITLE_PANEL =
	'text-[10px] sm:text-[11px] font-normal leading-snug text-inherit opacity-80';

/** Run modal matrix: compact rail */
export const MATRIX_ENGINE_BAR_MODAL =
	'run-modal-engine-bar flex flex-row lg:flex-col overflow-x-auto overflow-y-hidden lg:overflow-visible overscroll-x-contain divide-x divide-nvidia-gray-200 lg:divide-x-0 lg:divide-y lg:divide-nvidia-gray-200 pb-1 -mx-1 px-2 sm:px-3 lg:mx-0 lg:px-0 lg:border-0 border-b border-nvidia-gray-100 lg:pb-0';

/** Serve panel: snap on mobile rail */
export const MATRIX_ENGINE_BAR_SERVE =
	'inference-matrix-engine-bar flex flex-row lg:flex-col overflow-x-auto overflow-y-hidden lg:overflow-visible overscroll-x-contain snap-x lg:snap-none divide-x divide-nvidia-gray-200 lg:divide-x-0 lg:divide-y lg:divide-nvidia-gray-200 px-2 sm:px-3 pb-3 lg:pb-4 lg:px-0 lg:mx-3 border-b border-nvidia-gray-100/80';

export const MATRIX_ENGINE_BTN_MODAL: readonly string[] = [
	'run-modal-engine-btn text-left cursor-pointer transition-colors duration-200 shrink-0 min-w-[6.5rem] lg:min-w-0 lg:w-full',
	'px-3 sm:px-4 lg:px-0 lg:pl-2.5',
	'border-b-[3px] pb-2 -mb-px lg:mb-0 lg:border-b-0 lg:!border-l-[3px] lg:py-2',
	'border-b-transparent text-gray-500 hover:text-nvidia-black hover:border-b-gray-300 lg:hover:border-l-gray-300',
	'disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-nvidia-gray-400 disabled:text-nvidia-gray-400 disabled:border-b-transparent disabled:lg:border-l-transparent',
];

export const MATRIX_ENGINE_BTN_SERVE: readonly string[] = [
	'engine-rail-btn text-left transition-colors duration-200 shrink-0 lg:w-full min-w-[7rem] lg:min-w-0',
	'px-3 sm:px-4 lg:px-0 lg:pl-3 lg:pr-2',
	'border-b-[5px] pb-2 -mb-px lg:mb-0 lg:border-b-0 lg:!border-l-[5px] lg:py-2.5 lg:rounded-r-md',
	'border-b-transparent text-gray-500 cursor-pointer',
	'hover:text-nvidia-black hover:border-b-gray-300 lg:hover:border-l-gray-300',
	'disabled:bg-nvidia-gray-100 disabled:cursor-not-allowed disabled:pointer-events-none disabled:text-nvidia-gray-400 disabled:border-b-transparent disabled:lg:border-l-transparent',
];

export const MATRIX_ENGINE_TITLE = 'font-semibold text-sm block';

export const MATRIX_ENGINE_SUBTITLE = 'text-xs text-nvidia-gray-500 mt-0.5 block font-normal';
