ig.module(
    'plusplus.core.config'
)
    .requires(
        'plusplus.config-user'
)
    .defines(function() {
        "use strict";

        /**
         * Shared data object for library wide settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig
         * @namespace ig.CONFIG
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG = {};

        /**
         * Whether to force all entities to inherit or extend ig.EntityExtended.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FORCE_ENTITY_EXTENDED = true;

        /**
         * Whether to automatically switch to crisp scaling when game scale goes above 1.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.AUTO_CRISP_SCALING = true;

        /**
         * Minimum time step for better battery life and more stable framerate. Defaults to 60 fps on desktop and 30 fps on mobile.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.MIN_TIME_STEP = (ig.ua.mobile ? (1000 / 30) : (1000 / 60)) / 1000;

        /**
         * Media base directory. Used for dynamic media loading upon class instantiation.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PATH_TO_MEDIA = 'media/';

        /**
         * Function throttle duration.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         * @see ig.utils.throttle
         */
        ig.CONFIG.DURATION_THROTTLE = 500;

        /**
         * Function throttle duration medium.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         * @see ig.utils.throttle
         */
        ig.CONFIG.DURATION_THROTTLE_MEDIUM = 250;

        /**
         * Function throttle duration short.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         * @see ig.utils.throttle
         */
        ig.CONFIG.DURATION_THROTTLE_SHORT = 60;

        /**
         * General tween duration.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DURATION_TWEEN = 500;

        /**
         * Fade tween duration.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DURATION_FADE = 300;

        /**
         * Base width of game.
         * @type {Number}
         * @default ig.ua.viewport.width
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_WIDTH = ig.ua.viewport.width;

        /**
         * Base height of game.
         * @type {Number}
         * @default ig.ua.viewport.height
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_HEIGHT = ig.ua.viewport.height;

        /**
         * What percent of window width to fill, where 0 = keep base size.
         * <span class="alert"><strong>IMPORTANT:</strong> this overrides {@link ig.CONFIG.GAME_WIDTH} to dynamically set size.</span>
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_WIDTH_PCT = 0;

        /**
         * What percent of window height to fill, where 0 = keep base size.
         * <span class="alert"><strong>IMPORTANT:</strong> this overrides {@link ig.CONFIG.GAME_HEIGHT} to dynamically set size.</span>
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_HEIGHT_PCT = 0;

        /**
         * Approximate number of pixels to keep in view on width, where 0 = does not matter.
         * <span class="alert"><strong>IMPORTANT:</strong> this overrides {@link ig.CONFIG.SCALE} to dynamically set scale on resize.</span>
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_WIDTH_VIEW = 0;

        /**
         * Approximate number of pixels to keep in view on height, where 0 = does not matter.
         * <span class="alert"><strong>IMPORTANT:</strong> this overrides {@link ig.CONFIG.SCALE} to dynamically set scale on resize.</span>
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_HEIGHT_VIEW = 0;

        /**
         * Whether the game is in a top-down perspective.
         * @type {boolean}
         */
        ig.CONFIG.TOP_DOWN = false;

        /**
         * Whether to flip animations on the Y-axis when moving up.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> this config value is deprecated, use {@link ig.CONFIG.ENTITY.CAN_FLIP_Y} instead.</span>
         * @type {boolean}
         */
        ig.CONFIG.FLIP_Y = false;

        /**
         * Base scale of game.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.SCALE = 1;

        /**
         * Minimum scale of game.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.SCALE_MIN = 1;

        /**
         * Maximum scale of game.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.SCALE_MAX = Infinity;

        /**
         * Delay in milliseconds to wait after window is resized to actually resize game.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.RESIZE_DELAY = 500;

        /**
         * Magnitude of gravity in down direction.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GRAVITY = 400;

        /**
         * Whether to automatically sort layers.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.AUTO_SORT_LAYERS = false;

        /**
         * Whether to automatically sort overlay layer.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.AUTO_SORT_OVERLAY_LAYER = true;

        /**
         * Whether to automatically sort ui layer.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.AUTO_SORT_UI_LAYER = true;

        /**
         * Whether to automatically prerender maps.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRERENDER_MAPS = true;

        /**
         * Whether to set background layer to automatically prerender maps.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRERENDER_BACKGROUND_LAYER = true;

        /**
         * Whether to set foreground layer to automatically prerender maps.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRERENDER_FOREGROUND_LAYER = true;

        /**
         * Whether ui layer clears between levels.
         * <span class="alert alert-info"><strong>Tip:</strong> set this to true if your UI should be destroyed when changing levels.</span>
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CLEAR_ON_LOAD_UI_LAYER = false;

        /**
         * Whether ui layer ignores game pause.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.IGNORE_PAUSE_UI_LAYER = true;

        /**
         * Whether overlay layer ignores game pause.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.IGNORE_PAUSE_OVERLAY_LAYER = false;

        /**
         * Whether background layer skips update.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.NO_UPDATE_BACKGROUND_LAYER = true;

        /**
         * Whether foreground layer skips update.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.NO_UPDATE_FOREGROUND_LAYER = true;

        /**
         * Whether backgrounds with distance !== 1 should respect parallax on the x axis.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.BACKGROUNDS_PARALLAX_X = true;

        /**
         * Whether backgrounds with distance !== 1 should respect parallax on the y axis.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.BACKGROUNDS_PARALLAX_Y = false;

        /**
         * Max percent of canvas width that loader can take up. Loader will be scaled down to stay below this.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_MAX_WIDTH_PCT = 0.5;

        /**
         * Max percent of canvas height that loader can take up. Loader will be scaled down to stay below this.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_MAX_HEIGHT_PCT = 0.5;

        /**
         * Loader background color.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_BG_COLOR = '#111111';

        /**
         * Loader fade color.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_FADE_COLOR = '#DDDDDD';

        /**
         * Whether loader has a bar to show progress, placed in center of loader.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_BAR = true;

        /**
         * Loader progress bar color.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_BAR_COLOR = '#DDDDDD';

        /**
         * Width, in percent, of loader progress bar relative to canvas height.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_BAR_WIDTH_PCT = 0.25;

        /**
         * Height, in percent, of loader progress bar relative to canvas height.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_BAR_HEIGHT_PCT = 0.025;

        /**
         * Loader progress outline width.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_BAR_LINE_WIDTH = 3;

        /**
         * Space between loader progress bar outline and progress, in percent of canvas size.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_BAR_SPACE_PCT = 0.005;

        /**
         * Percent of canvas to use as spacing between loader elements.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_SPACE_PCT = 0.02;

        /**
         * Main base64 image logo for loader. Placed in top center of loader.
         * @type {String}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_LOGO_SRC_MAIN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP8AAAAtCAYAAABh/r3uAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QUTEQcqYSZEBgAAAVtJREFUeNrt3MGNwjAQBVC8oqPctpxtYevYFiiHm2tiryARKdaMjcHv3UCBOA5f/oGIctqxbdvtBLy9Wmt59vyXqYE1CT8sqqj6sOYlgJUf1H5gqdqv6oOVHxB+QPgB4QeEHxB+QPgB4Qfmds56o+vfz9Pnv38v6YPe29eR/baO8377I8eyt31kzK1zEhln1lxlnZfZ5qd1nJHtsz6TVn5A+IFg7R9ZUSLvkzXOSBXsfSmUNc6suerx2pFzlVXRW7e38gPCD0xY+2cw8leGIxWutVr3GHPWOFc4p+/42bbyA8IPvLD2v6pGZlXuyH5HvnbkvmY4pyuL3BBl5QeEH+hU+3tXlKxvqnuPM1KnZ6u7kbmKHGOP+Wn9BaT12Ge7gcfKDwg/8Mj/9oOVHxB+QPgB4QeEHxB+QPgB4QcmV+4fuOEHPluttVj5Qe0Hlq/9LgHgs6u+lR8QfljVP9Eqv3CR+x/VAAAAAElFTkSuQmCC";

        /**
         * Alt base64 image logo for loader. Placed in bottom center of loader.
         * @type {String}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LOADER_LOGO_SRC_ALT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QUGFCwN01BpQgAAACZpVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVAgb24gYSBNYWOV5F9bAAADT0lEQVR42u3du27UQBiG4VlkUSCuIRU9QhuKpMpFUFOkTcl1bElLTcFFUCUFsai4EwqEEFAkGwkL4zE+zeF5qxw2m43z/+98Y896dmGA/X7/KyBb2rbd/ev7jxyiulEACgA1szPm150JGMAQAAWAejOAMZ8BoACgACZwe9aG27PW0WQAVB0CuxY4vdk7wgyA6qaBTMAAyIRmjV/CCAyAmjJAX+d3YQIGQMkGiDUBIzAASjYAEzAAFMA4U7i6yAAoLQOMzQKyAQOgRAMwwbjjseTfywCV05TQKbIBAyDHDDA1C+SeDVLIQAxgCCgrRad8BvH6cBmuD5cKAGYBRc8Sjl1+/ubdH1/vfs4AqGMWkMq4nPos4Xicvr96G0II4fGHq8VfNwMwQHorglI3Qt8Yv9TxYQCUYYDSTFACDMAA+a0HKNUES2ULBkCaBkjVBDVlAwaoHAUwYKbS35+gAGSAdG4Vm0u3zZUNtkj9DIB0DVCrCWQAMAATMAA2oHEI5jdVnxFSSP0MgHwyQG5ZIMdswAAMkM+mUUuZ4OuPuz64+PRi1M99fPk5hBDC0+ZntiZgAAbIb9u4uU0wtUP7Xs+a6/sZAPUYYC4TzN2R759/CSGE8OzJt2yyAANUThZnAuc+g7ZUJ568Ptx9cD/m9xkrJRMwgAyQ/+bRY7PA0h2Y004pDFA5RRTA6c1+k65K8Z4/DIB8ZwFT0/7RAmtdPUzxnj8MgHwNkGpHpbiShwHgPEBq8/Ecd0VjAAbYzgBrja2xJvjf15PzfogMwADlZoDYDl16TSADgAFiOnKtq3TdtXpL4X0BSJ6q3hv4cK0gXPnPMwBWywBb7Y4VO69P7X0GDAAZYA5iz+hNXUfgDiFggC2Z65pCjfsGMIBZQHpnAvs6uuSVOQwABqh57x4GQD0GAANAAUABQAFAAUABQAFAAaCiAsj19iol3BaGAfBAMqeCh7qq79Lw0OPGPr77uOP3x/780OtI5ZI2A1ROs3XHdzuh23F9n8d24NDiktjOnPp8Y38fA6BsA5RGrKlkADDAkrOHoc6L7eDY5xvKJLGzFAZA3ecB5ppFgAGgAKAAEJcBul+wTLxs2rbdMQAUABQA/pYBZIKyx3wGgAKAAsA9vwE+PY+Xd5MPtQAAAABJRU5ErkJggg==";

        /**
         * Color to clear screen with.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CLEAR_COLOR = "#000000";

        /**
         * Performance level where entities never move.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.STATIC = "static";

        /**
         * Performance level where entities move and collide only with other entities, but have no physics step such as velocity, accel, and collision map.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.MOVABLE = "movable";

        /**
         * Performance level where entities move and have full physics / collisions.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DYNAMIC = "dynamic";

        /**
         * Whether game should autospawn player when a new level is loaded.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.AUTO_SPAWN_PLAYER = true;

        /**
         * Z index for sorting entities below anything else.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_BELOW_ALL = -1;

        /**
         * Z index for sorting entities below player.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_BELOW_PLAYER = 0;

        /**
         * Z index for player, ideally above most other entities.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_PLAYER = 100;

        /**
         * Z index for sorting entities above player.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_ABOVE_PLAYER = 200;

        /**
         * Z index for sorting entities above all others.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_ABOVE_ALL = 9999;

        /**
         * Whether game should fade transition between levels.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.TRANSITION_LEVELS = true;

        /**
         * Color of level transitioner overlay.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.TRANSITIONER_COLOR = "#333333";

        /**
         * Red between 0 and 1 of transitioner.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.TRANSITIONER_R = 51;

        /**
         * Green between 0 and 1 of transitioner.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.TRANSITIONER_G = 51;

        /**
         * Blue between 0 and 1 of transitioner.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.TRANSITIONER_B = 51;

        /**
         * Layer to add level transitioner overlay to.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.TRANSITIONER_LAYER = 'ui';

        /**
         * Z index of level transitioner.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_TRANSITIONER = ig.CONFIG.Z_INDEX_ABOVE_PLAYER;

        /**
         * Whether game should dim on pause via overlay.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DIMMED_PAUSE = true;

        /**
         * Color of pause dimmer overlay.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DIMMER_COLOR = "#333333";

        /**
         * Red between 0 and 1 of dimmer overlay.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DIMMER_R = 51;

        /**
         * Green between 0 and 1 of dimmer overlay.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DIMMER_G = 51;

        /**
         * Blue between 0 and 1 of dimmer overlay.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DIMMER_B = 51;

        /**
         * Alpha of pause dimmer overlay.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DIMMER_ALPHA = 0.75;

        /**
         * Custom layers to be added to game.
         * @type {Object}
         * @memberof ig.CONFIG
         * @example
         * // adds a new layer with the name of 'foo' and sorted to top
         * LAYERS_CUSTOM = {
         *      foo: {
         *          zIndex: 3
         *      }
         * };
         */
        ig.CONFIG.LAYERS_CUSTOM = {};

        /**
         * Max power / rank level in game. Be careful about going over 9000, as it may break things.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.LEVEL_MAX = 4;

        /**
         * Map of ranks based on max level.
         * @type {Object}
         * @memberof ig.CONFIG
         * @property {Number} NONE - 0
         * @property {Number} EASY - max level * 0.25
         * @property {Number} MEDIUM - max level * 0.5
         * @property {Number} HARD - max level * 0.75
         * @property {Number} IMPOSSIBLE - max level
         */
        ig.CONFIG.RANKS_MAP = {
            NONE: 0,
            EASY: Math.round(ig.CONFIG.LEVEL_MAX * 0.25),
            MEDIUM: Math.round(ig.CONFIG.LEVEL_MAX * 0.5),
            HARD: Math.round(ig.CONFIG.LEVEL_MAX * 0.75),
            IMPOSSIBLE: ig.CONFIG.LEVEL_MAX
        };

        /**
         * Precision when checking if numbers are close enough to zero.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRECISION_ZERO = 0.01;

        /**
         * Precision when checking if numbers are close enough to zero during a tween.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRECISION_ZERO_TWEEN = 0.1;

        /**
         * Precision when checking collision of one sided entities.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRECISION_PCT_ONE_SIDED = 0.01;

        /**
         * Font base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.FONT
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.FONT = {};

        /**
         * Name of main font. If empty, game will not use a font.
         * @type {String}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.MAIN_NAME = "font_04b03_white_8.png";

        /**
         * Name of alt font. If empty, game will use main font.
         * @type {String}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.ALT_NAME = "";

        /**
         * Name of alt font. If empty, game will use main font.
         * @type {String}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.CHAT_NAME = "";

        /**
         * Scale that overrides system scale when {@link ig.CONFIG.FONT.IGNORE_SYSTEM_SCALE} is true.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.SCALE = 1;

        /**
         * Scale of system scale.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.SCALE_OF_SYSTEM_SCALE = 1;

        /**
         * Minimum value of {@link ig.Font#scale}.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.SCALE_MIN = 1;

        /**
         * Maximum value of {@link ig.Font#scale}.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.SCALE_MAX = Infinity;

        /**
         * Whether fonts should ignore system scale.
         * <span class="alert"><strong>IMPORTANT:</strong> when true, fonts will not scale dynamically with view and instead will be fixed in size. This is usually ideal.</span>
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.FONT
         */
        ig.CONFIG.FONT.IGNORE_SYSTEM_SCALE = false;

        /**
         * User Interface base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.UI
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.UI = {};

        /**
         * Whether UI should get position as a percentage of screen size.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.POS_AS_PCT = true;

        /**
         * Scale that overrides system scale when {@link ig.CONFIG.UI.IGNORE_SYSTEM_SCALE} is true.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.SCALE = 1;

        /**
         * Scale of system scale.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.SCALE_OF_SYSTEM_SCALE = 1;

        /**
         * Minimum value of {@link ig.UIElement#scale}.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.SCALE_MIN = 1;

        /**
         * Maximum value of {@link ig.UIElement#scale}.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.SCALE_MAX = Infinity;

        /**
         * Whether user interface elements should ignore system scale.
         * <span class="alert"><strong>IMPORTANT:</strong> when true, ui elements will not scale dynamically with view and instead will be fixed in size. This is usually ideal.</span>
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.IGNORE_SYSTEM_SCALE = false;

        /**
         * Whether to get margin percentages from smallest dimension in screen size.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.MARGIN_AS_PCT_SMALLEST = true;

        /**
         * Whether margins should be calculated consistently at all scales. Ex: a button should be 15px away from the edge no matter the scale.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.MARGIN_SCALELESS = true;

        /**
         * Whether UI can flip horizontal.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.CAN_FLIP_X = true;

        /**
         * Whether UI can flip horizontal.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.UI
         */
        ig.CONFIG.UI.CAN_FLIP_Y = false;

        /**
         * Gesture configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.GESTURE
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.GESTURE = {

            /**
             * Time to wait before cleaning input point after release.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            RELEASE_DELAY: 0.3,

            /**
             * Min distance that needs to be crossed to trigger input to switch direction, as a percent of min screen dimension from 0 to 1.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            DIRECTION_SWITCH_PCT: 0.03,

            /**
             * Time in seconds before holding.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            HOLD_DELAY: 0.15,

            /**
             * Time in seconds before hold blocks tap
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            HOLD_DELAY_BLOCK_TAP: 0.3,

            /**
             * Time in seconds before hold activates.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            HOLD_DELAY_ACTIVATE: 0.5,

            /**
             * Max distance that can be crossed while holding down to do a hold activate, as a percent of min screen dimension from 0 to 1.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            HOLD_ACTIVATE_DISTANCE_PCT: 0.01,

            /**
             * Distance to move before considered swiping, as a percent of min screen dimension from 0 to 1.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            SWIPE_DISTANCE_PCT: 0.05,

            /**
             * Duration in seconds within which swipe distance must be crossed to be considered swiping.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            SWIPE_DURATION_TRY: 0.3,

            /**
             * Duration in seconds after which swipe try will be reset.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            SWIPE_DURATION_RESET: 0.1,

            /**
             * Max distance that can be crossed between taps to do a multi tap, as a percent of min screen dimension from 0 to 1.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            TAP_MULTI_DISTANCE_PCT: 0.05,

            /**
             * Input point should record targets whenever moved while input is up (mouse only).
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            TARGET_UP: false,

            /**
             * Input point should record targets whenever input moves while pressed down.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            TARGET_DOWN: false,

            /**
             * Input point should record targets on the first time input is pressed down.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            TARGET_DOWN_START: true,

            /**
             * Input point should record targets on tap.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            TARGET_TAP: true,

            /**
             * Extra radius to search for targets outside input point x/y.
             * @type Number
             * @default
             * @memberof ig.CONFIG.GESTURE
             */
            TARGET_SEARCH_RADIUS: 10

        };

        /**
         * Camera base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.CAMERA
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.CAMERA = {

            /**
             * Whether camera should auto-follow player on level load and after player dies.
             * @type Boolean
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            AUTO_FOLLOW_PLAYER: true,

            /**
             * Whether camera should snap, instead of transition, to first followed entity of a level.
             * @type Boolean
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            SNAP_FIRST_FOLLOW: true,

            /**
             * Whether camera should center first followed entity of a level.
             * @type Boolean
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            CENTER_FIRST_FOLLOW: true,

            /**
             * Whether to keep camera centered always and ignore bounds.
             * @type Boolean
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            KEEP_CENTERED: true,

            /**
             * Whether to keep camera inside the level, preventing black borders.
             * @type Boolean
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            KEEP_INSIDE_LEVEL: false,

            /**
             * How quickly to interpolate to target camera location, where 1 is instant.
             * @type Number
             * @default
             * @example
             * // set to 1 to snap camera
             * camera.lerp = 1;
             * // set to 0.025 to move slowly and smoothly
             * camera.lerp = 0.025;
             * @memberof ig.CONFIG.CAMERA
             */
            LERP: 1,

            /**
             * Whether to automatically calculate {@link ig.Camera#boundsTrap} from percentages in {@link ig.Camera#boundsTrapPct}.
             * @type Boolean
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_AS_PCT: false,

            /**
             * Min x bound of camera in pixels, relative to center.
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_MINX: 0,

            /**
             * Min y bound of camera in pixels, relative to center.
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_MINY: 0,

            /**
             * Max x bound of camera in pixels, relative to center.
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_MAXX: 0,

            /**
             * Max y bound of camera in pixels, relative to center.
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_MAXY: 0,

            /**
             * Min x bound of camera as a percent of screen size, relative to center (i.e. -0.5 to 0.5 ).
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_PCT_MINX: 0,

            /**
             * Min y bound of camera as a percent of screen size, relative to center (i.e. -0.5 to 0.5 ).
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_PCT_MINY: 0,

            /**
             * Max x bound of camera as a percent of screen size, relative to center (i.e. -0.5 to 0.5 ).
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_PCT_MAXX: 0,

            /**
             * Max y bound of camera as a percent of screen size, relative to center (i.e. -0.5 to 0.5 ).
             * @type Number
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            BOUNDS_TRAP_PCT_MAXY: 0,

            /**
             * Duration of transition when switching entities that camera is following.
             * @type {Number}
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            TRANSITION_DURATION: 1,

            /**
             * Duration of transition when switching entities that camera is following.
             * @type {Number}
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            TRANSITION_DURATION_MIN: 0.2,

            /**
             * Maximum duration of transition when switching entities that camera is following.
             * @type {Number}
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            TRANSITION_DURATION_MAX: 2,

            /**
             * Base distance to try to transition per duration.
             * <br>- when set to 0, will not affect transition duration
             * @type {Number}
             * @default
             * @memberof ig.CONFIG.CAMERA
             */
            TRANSITION_DISTANCE: 100

        };

        /**
         * Entity base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.ENTITY
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.ENTITY = {};

        /**
         * Base horizontal size of entities that can also affect many calculations, ex: melee ability distance.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_X = 16;

        /**
         * Base vertical size of entities that can also affect many calculations, ex: melee ability distance.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_Y = 16;

        /**
         * Horizontal offset of entities allows visual overlap with walls to give some depth.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_OFFSET_X = 0;

        /**
         * Vertical offset of entities allows visual overlap with floor / ceiling to give some depth.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_OFFSET_Y = 0;

        /**
         * Scale that overrides system scale when {@link ig.CONFIG.ENTITY.IGNORE_SYSTEM_SCALE} is true.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SCALE = 1;

        /**
         * Scale of system scale.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SCALE_OF_SYSTEM_SCALE = 1;

        /**
         * Minimum value of {@link ig.EntityExtended#scale}.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SCALE_MIN = 1;

        /**
         * Maximum value of {@link ig.EntityExtended#scale}.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SCALE_MAX = Infinity;

        /**
         * Whether entities elements should ignore system scale.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.IGNORE_SYSTEM_SCALE = false;

        /**
         * Whether to flip animations on the X-axis when moving horizontally.
         * <span class="alert alert-info"><strong>IMPORTANT</strong> in some cases, this may not have an effect unless game is in {@link ig.CONFIG.TOP_DOWN} mode!</span>
         * @type {boolean}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.CAN_FLIP_X = true;

        /**
         * Whether to flip animations on the Y-axis when moving vertically.
         * <span class="alert alert-info"><strong>IMPORTANT</strong> in some cases, this may not have an effect unless game is in {@link ig.CONFIG.TOP_DOWN} mode!</span>
         * @type {boolean}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.CAN_FLIP_Y = false;

        /**
         * Horizontal friction of entities.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.FRICTION_X = 0;

        /**
         * Vertical friction of entities.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.FRICTION_Y = 0;

        /**
         * Maximum horizontal velocity of entities.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.MAX_VEL_X = 100;

        /**
         * Maximum vertical velocity of entities.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.MAX_VEL_Y = 100;

        /**
         * Bounciness of entities.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.BOUNCINESS = 0;

        /**
         * Minimum velocity to bounce.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.MIN_BOUNCE_VEL = 40;

        /**
         * Whether to calculate bounds on change.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.NEEDS_BOUNDS = false;

        /**
         * Whether to calculate vertices on change.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.NEEDS_VERTICES = false;

        /**
         * Health statistic.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.HEALTH = 1;

        /**
         * Whether entities should stick to slopes instead of sliding down.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SLOPE_STICKING = false;

        /**
         * Modifier when entity moving on slope.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SLOPE_SPEED_MOD = 0.75;

        /**
         * Minimum angle, in degrees, for entity to be considered standing on a slope.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SLOPE_STANDING_MIN = -136;

        /**
         * Maximum angle, in degrees, for entity to be considered standing on a slope.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SLOPE_STANDING_MAX = -44;

        /**
         * Whether entities cast shadows.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.OPAQUE = false;

        /**
         * Size to offset from entity bounds for casting shadows when {@link ig.EntityExtended#opaque}.
         * <span class="alert alert-info"><strong>Tip:</strong> to set opaque offsets per animation, use {@link ig.AnimationExtended#opaqueOffset}</span>
         * @type Object
         * @property {Number} left 0
         * @property {Number} right 0
         * @property {Number} top 0
         * @property {Number} bottom 0
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.OPAQUE_OFFSET = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        /**
         * Size to offset from entity bounds for casting shadows when {@link ig.EntityExtended#opaque}.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.OPAQUE_OFFSET_RIGHT = 0;

        /**
         * Size to offset from entity bounds for casting shadows when {@link ig.EntityExtended#opaque}.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.OPAQUE_OFFSET_TOP = 0;

        /**
         * Size to offset from entity bounds for casting shadows when {@link ig.EntityExtended#opaque}.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.OPAQUE_OFFSET_BOTTOM = 0;

        /**
         * Whether opaque vertices should use vertices when present for casting shadows.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.OPAQUE_FROM_VERTICES = false;

        /**
         * How much of light is blocked by entities that are opaque.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.DIFFUSE = 0.8;

        /**
         * Light base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.LIGHT
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.LIGHT = {};

        /**
         * Whether light should be drawn and scaled pixel perfectly.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> pixel perfect scaling has a very high performance cost, use carefully!</span>
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.PIXEL_PERFECT = false;

        /**
         * Whether light should be gradient or flat shaded.
         * <br>- when false, this works well in combination with {@link ig.CONFIG.LIGHT#PIXEL_PERFECT}
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.GRADIENT = true;

        /**
         * Whether light should cast shadows on objects that are {@link ig.EntityExtended#opaque}.
         * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.CASTS_SHADOWS = false;

        /**
         * Whether light should cast shadows on movable objects that are {@link ig.EntityExtended#opaque}.
         * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.CASTS_SHADOWS_MOVABLE = false;

        /**
         * Red value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.R = 1;

        /**
         * Green value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.G = 1;

        /**
         * Blue value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.B = 1;

        /**
         * Alpha value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.ALPHA = 0.25;

        /**
         * How much light should get through objects that are {@link ig.EntityExtended#opaque}.
         * @type Number
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.DIFFUSE = 0.8;

        /**
         * Number of passes to make when casting shadows.
         * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
         * @type Number
         * @default
         * @memberof ig.CONFIG.LIGHT
         */
        ig.CONFIG.LIGHT.SAMPLES = 1;

        /**
         * Character base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.CHARACTER
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.CHARACTER = {};

        /**
         * Whether character is allowed to set own {@link ig.EntityExtended#currentAnim} automatically based on current state.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.ANIM_AUTOMATIC = true;

        /**
         * Base horizontal size of characters that can also affect many calculations, ex: melee ability distance.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.SIZE_X = 32;

        /**
         * Base vertical size of characters that can also affect many calculations, ex: melee ability distance.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.SIZE_Y = 32;

        /**
         * Horizontal offset of characters allows visual overlap with walls to give some depth.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.SIZE_OFFSET_X = 0;

        /**
         * Vertical offset of characters allows visual overlap with floor / ceiling to give some depth.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.SIZE_OFFSET_Y = 0;

        /**
         * Max x velocity while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_X = 100;

        /**
         * Max y velocity while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_Y = 200;

        /**
         * Max x velocity while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_X = 100;

        /**
         * Max y velocity while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_Y = 100;

        /**
         * Max x velocity while climbing.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_X = 75;

        /**
         * Max y velocity while climbing.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_Y = 75;

        /**
         * Horizontal friction while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_X = 0;

        /**
         * Vertical friction while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_Y = 0;

        /**
         * Horizontal friction while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.FRICTION_GROUNDED_X = 1600;

        /**
         * Vertical friction while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.FRICTION_GROUNDED_Y = 1600;

        /**
         * Movement speed applied to horizontal acceleration.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.SPEED_X = 750;

        /**
         * Movement speed applied to vertical acceleration.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.SPEED_Y = 750;

        /**
         * Whether character is able to jump.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.CAN_JUMP = true;

        /**
         * Number of update steps to apply jump force.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         * @example
         * // jump is short
         * character.jumpSteps = 1;
         * // jump is long
         * character.jumpSteps = 10;
         */
        ig.CONFIG.CHARACTER.JUMP_STEPS = 4;

        /**
         * Speed modifier to apply on each jump step.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         * @example
         * // jump is slow and not very high
         * character.jumpForce = 1;
         * // jump is faster and higher
         * character.jumpForce = 10;
         */
        ig.CONFIG.CHARACTER.JUMP_FORCE = 10;

        /**
         * Amount of acceleration control while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         * @example
         * // no control of direction while in air
         * character.jumpControl = 0;
         * // full control of direction while in air
         * character.jumpControl = 1;
         */
        ig.CONFIG.CHARACTER.JUMP_CONTROL = 0.75;

        /**
         * Whether character can do additional jumps while in air.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.CAN_JUMP_REPEATEDLY = false;

        /**
         * Whether character should stick to slopes instead of sliding down.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SLOPE_STICKING = true;

        /**
         * Duration after character leaves ground during which they can still jump.
         * <br>- this is intended to help players with slower reaction time
         * <br>- this does not allow another jump while jumping
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.UNGROUNDED_FOR_THRESHOLD = 0.1;

        /**
         * Duration after character leaves ground to start playing fall animation.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.UNGROUNDED_FOR_AND_FALLING_THRESHOLD = 0.25;

        /**
         * Whether character is able to climb.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.CAN_CLIMB = true;

        /**
         * Amount of acceleration control while climbing.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         * @example
         * // no control of direction while climbing
         * character.climbingControl = 0;
         * // full control of direction while climbing
         * character.climbingControl = 1;
         */
        ig.CONFIG.CHARACTER.CLIMBING_CONTROL = 1;

        /**
         * Whether character is able to pathfind.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.CAN_PATHFIND = true;

        /**
         * Delay in seconds between pathfinding when has no path.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> setting this to a low value may cause a high number of pathfinding requests, which can be performance intensive!</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.PATHFINDING_DELAY = 1;

        /**
         * Delay in seconds between pathfinding when following a path.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> setting this to a low value may cause a high number of pathfinding requests, which can be performance intensive!</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.PATHFINDING_UPDATE_DELAY = 0.2;

        /**
         * Delay in seconds between pathfinding when using simple pathfinding.
         * <span class="alert"><strong>Tip:</strong> the faster an entity is, the lower this value needs to be for smooth simple pathfinding. Currently it is tuned for the default Impact++ settings.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.PATHFINDING_SIMPLE_DELAY = 0.075;

        /**
         * Delay in seconds, after first becoming stuck, when character will throw path away.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> for best results, this should be less than {@link ig.Character#pathfindingUpdateDelay}.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.STUCK_DELAY = 0.1;

        /**
         * Health statistic.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.HEALTH = 1;

        /**
         * Energy statistic, by default used in abilities.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.ENERGY = 1;

        /**
         * Amount of health a character should regenerate per tick.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.REGEN_RATE_HEALTH = 0;

        /**
         * Amount of energy a character should regenerate per tick.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.REGEN_RATE_ENERGY = 0;

        /**
         * Whether characters should have a particle explosion when damaged.
         * <br>- explosions are created through an {@link ig.EntityExplosion}
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.EXPLODING_DAMAGE = true;

        /**
         * Number of particles to create for explosion when character damaged.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.EXPLODING_DAMAGE_PARTICLE_COUNT = 3;

        /**
         * Characters should have a particle explosion when killed.
         * <br>- explosions are created through an {@link ig.EntityExplosion}
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.EXPLODING_DEATH = true;

        /**
         * Number of particles to create for explosion when character killed.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CHARACTER
         */
        ig.CONFIG.CHARACTER.EXPLODING_DEATH_PARTICLE_COUNT = 10;

        /**
         * Player manager base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.PLAYER_MANAGER
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.PLAYER_MANAGER = {};

        /**
         * Whether to automatically manage player if within level.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.AUTO_MANAGE_PLAYER = true;

        /**
         * Whether to allow touch/click and hold to be interpreted as movement.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.HOLD_TO_MOVE = true;

        /**
         * Whether to allow swipe up to be interpreted as jump.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.SWIPE_TO_JUMP = true;

        /**
         * Whether to allow touch/click and hold to be interpreted as dpad input for movement.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_ENABLED = false;

        /**
         * The deadzone for the center of the touch dpad.
         * Too small of a deadzone will make it difficult for the player to move in a single direction.
         * @type Number
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_DEAD_ZONE_SIZE=6;

        /**
         * The size of the ui-dpad to display. (i.e. 16, 32, 64)
         * @type Number
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_SIZE=32;

        /**
         * Min x bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
         * @type Number
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MINX=0;

        /**
         * Min y bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
         * @type Number
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MINY=0;

        /**
         * Max x bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
         * @type Number
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MAXX=1;

        /**
         * Max y bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
         * @type Number
         * @default
         * @memberof ig.CONFIG.PLAYER_MANAGER
         */
        ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MAXY=1,

        /**
         * Creature base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.CREATURE
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.CREATURE = {};

        /**
         * How far creature should search for targets.
         * <span class="alert alert-info"><strong>Tip:</strong> for best results, reaction distance should be <= pathfinding distance!</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.REACTION_DISTANCE = 100;

        /**
         * Delay in seconds between updates of creature targets.
         * <span class="alert"><strong>IMPORTANT:</strong> be careful about setting this value too low, as it can cause large performance hits.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.REACTION_DELAY = 0.2;

        /**
         * Whether creature sets predator to anything that damages it below flee threshold.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.PREDATOR_FROM_DAMAGE = false;

        /**
         * Whether creature can learn about new predators based on what it takes damage from.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.CAN_LEARN_PREDATORS = false;

        /**
         * Whether needs line of sight for prey.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.NEEDS_LINE_OF_SIGHT_PREY = true;

        /**
         * Whether creature can detect hidden prey.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.DETECT_HIDDEN_PREY = false;

        /**
         * Settings for moving to prey.
         * @type Object
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.MOVE_TO_PREY_SETTINGS = {
            avoidEntities: true,
            searchDistance: ig.CONFIG.CREATURE.REACTION_DISTANCE
        };

        /**
         * Whether needs line of sight for predator.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.NEEDS_LINE_OF_SIGHT_PREDATOR = true;

        /**
         * Whether creature can detect hidden predators.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.DETECT_HIDDEN_PREDATOR = false;

        /**
         * Settings for moving to predator.
         * @type Object
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.MOVE_TO_PREDATOR_SETTINGS = {
            avoidEntities: true,
            searchDistance: ig.CONFIG.CREATURE.REACTION_DISTANCE
        };

        /**
         * Whether creatures flee from predators.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.CAN_FLEE = true;

        /**
         * Percentage of health, between 0 and 1, when creature begins to flee.
         * @type Number
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.FLEE_HEALTH_PCT = 0.15;

        /**
         * Whether creatures can break tether range to follow a prey or flee from a predator.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.CAN_BREAK_TETHER = false;

        /**
         * Whether creatures should use spawner as tether.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.TETHER_TO_SPAWNER = false;

        /**
         * Distance creature can move around its tether.
         * <span class="alert alert-info"><strong>Tip:</strong> a spawned creature will use its spawner as a tether, unless {@link ig.Creature#tetherName} is set and matches a valid entity in the game.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.TETHER_DISTANCE = 100;

        /**
         * Settings for tethering.
         * @type Object
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.MOVE_TO_TETHER_SETTINGS = {
            avoidEntities: true
        };

        /**
         * Whether creature can wander in x direction.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.CAN_WANDER_X = true;

        /**
         * Whether creature can wander in y direction.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.CAN_WANDER_Y = false;

        /**
         * Chance as a percent between 0 and 1 that direction will switch while wandering.
         * <span class="alert alert-info"><strong>Tip:</strong> setting this above 0.005 will cause creature to switch direction often and this can look rather stupid!</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.WANDER_SWITCH_CHANCE = 0;

        /**
         * Chance as a percent between 0 and 1 that direction will switch while not wandering.
         * <span class="alert alert-info"><strong>Tip:</strong> setting this above 0.015 will cause creature to never really stop moving.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.WANDER_SWITCH_CHANCE_STOPPED = 0;

        /**
         * Settings for wandering.
         * @type Object
         * @default
         * @memberof ig.CONFIG.CREATURE
         */
        ig.CONFIG.CREATURE.MOVE_TO_WANDER_SETTINGS = {
            simple: true,
            avoidUngrounded: true,
            avoidSlopes: true
        };

        /**
         * Particle base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.PARTICLE
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.PARTICLE = {};

        /**
         * Whether entity is allowed to set own {@link ig.EntityExtended#currentAnim} automatically based on current state.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PARTICLE
         */
        ig.CONFIG.PARTICLE.ANIM_AUTOMATIC = true;

        /**
         * Collision base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.COLLISION
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.COLLISION = {};

        /**
         * Whether to allow two fixed entities to collide just like any other entities.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.ALLOW_FIXED = false;

        /**
         * Solid tile.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_SOLID = 1;

        /**
         * One way up tile.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_ONE_WAY_UP = 12;

        /**
         * One way down tile.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_ONE_WAY_DOWN = 23;

        /**
         * One way right tile.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_ONE_WAY_RIGHT = 34;

        /**
         * One way left tile.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_ONE_WAY_LEFT = 45;

        /**
         * Climbable tile with a top.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_CLIMBABLE_WITH_TOP = 46;

        /**
         * Climbable tile.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_CLIMBABLE = 47;

        /**
         * Stairs tile with a top.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP = 48;

        /**
         * Stairs tile.
         * @type {Number}
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS = 49;

        /**
         * Hash of one way collision map tiles.
         * @type Array
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILES_HASH_ONE_WAY = {};
        ig.CONFIG.COLLISION.TILES_HASH_ONE_WAY[ig.CONFIG.COLLISION.TILE_ONE_WAY_UP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_ONE_WAY[ig.CONFIG.COLLISION.TILE_ONE_WAY_DOWN] = true;
        ig.CONFIG.COLLISION.TILES_HASH_ONE_WAY[ig.CONFIG.COLLISION.TILE_ONE_WAY_RIGHT] = true;
        ig.CONFIG.COLLISION.TILES_HASH_ONE_WAY[ig.CONFIG.COLLISION.TILE_ONE_WAY_LEFT] = true;
        ig.CONFIG.COLLISION.TILES_HASH_ONE_WAY[ig.CONFIG.COLLISION.TILE_CLIMBABLE_WITH_TOP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_ONE_WAY[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP] = true;

        /**
         * Hash of climbable collision map tiles.
         * @type Array
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE = {};
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE_WITH_TOP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE] = true;
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS] = true;

        /**
         * Hash of climbable one way collision map tiles.
         * @type Array
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE_ONE_WAY = {};
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE_ONE_WAY[ig.CONFIG.COLLISION.TILE_CLIMBABLE_WITH_TOP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE_ONE_WAY[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP] = true;

        /**
         * Hash of climbable stairs collision map tiles.
         * @type Array
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE_STAIRS = {};
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE_STAIRS[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_CLIMBABLE_STAIRS[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS] = true;

        /**
         * Hash of walkable collision map tiles.
         * @type Array
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE = {
            0: true,
            50: true,
            51: true
        };
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_ONE_WAY_UP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_ONE_WAY_DOWN] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_ONE_WAY_RIGHT] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_ONE_WAY_LEFT] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE_WITH_TOP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS] = true;

        /**
         * Hash of strictly walkable, i.e. empty, collision map tiles.
         * @type Array
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE_STRICT = {
            0: true,
            50: true,
            51: true
        };
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE_STRICT[ig.CONFIG.COLLISION.TILE_CLIMBABLE] = true;
        ig.CONFIG.COLLISION.TILES_HASH_WALKABLE_STRICT[ig.CONFIG.COLLISION.TILE_CLIMBABLE_STAIRS] = true;

        /**
         * Hash of sloped collision map tiles.
         * @type Array
         * @memberof ig.CONFIG.COLLISION
         */
        ig.CONFIG.COLLISION.TILES_HASH_SLOPED = {
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            7: true,
            8: true,
            9: true,
            10: true,
            11: true,
            13: true,
            14: true,
            15: true,
            16: true,
            17: true,
            18: true,
            19: true,
            20: true,
            21: true,
            22: true,
            24: true,
            25: true,
            26: true,
            27: true,
            28: true,
            29: true,
            30: true,
            31: true,
            32: true,
            33: true,
            35: true,
            36: true,
            37: true,
            38: true,
            39: true,
            40: true,
            41: true,
            42: true,
            43: true,
            44: true,
            52: true,
            53: true,
            54: true,
            55: true
        };

        /**
         * Pathfinding base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.PATHFINDING
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.PATHFINDING = {};

        /**
         * Whether pathfinding is built with level. When disabled, will not build pathfinding grid, potentially saving on performance and memory footprint.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.BUILD_WITH_LEVEL = true;

        /**
         * Whether to use node weight in pathfinding.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.WEIGHTED = true;

        /**
         * Whether to allow diagonal movement.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.ALLOW_DIAGONAL = true;

        /**
         * Whether diagonal movement requires both direct movements to be walkable.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.DIAGONAL_REQUIRES_BOTH_DIRECT = true;

        /**
         * Whether to try to avoid entities in pathfinding.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.AVOID_ENTITIES = true;

        /**
         * Base weight to apply to a node.
         * <span class="alert alert-info"><strong>Tip:</strong> the higher this is, the more likely a path will follow the pathfinding map.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.WEIGHT = 10;

        /**
         * Base weight to apply to a node when fleeing and node would take us closer.
         * @type Number
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.WEIGHT_AWAY_FROM = 2;

        /**
         * How far of a distance to go when searching for flee path.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> it is not recommended to set this value very high, as it does not produce much better results and has a much higher performance hit.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.AWAY_FROM_DISTANCE = 100;

        /**
         * Minimum percent of search distance that path away from needs to go to be considered.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> set to 0 for no minimum.</span>
         * @type Number
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.AWAY_FROM_MIN_DISTANCE_PCT = 0.4;

        /**
         * Maximum number of nodes to check when searching for flee path.
         * @type Number
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.AWAY_FROM_MAX_NODES = 40;

        /**
         * Whether to do strict slope checking. This can sometimes help when pathfinding is getting stuck on strange slope layouts.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.PATHFINDING
         */
        ig.CONFIG.PATHFINDING.STRICT_SLOPE_CHECK = false;

        /**
         * Default pathfinding tile definitions.
         * <span class="alert alert-info"><strong>Tip:</strong> settings map directly to the properties of {@link ig.pathfinding.Node}.</span>
         * @type {Object}
         * @memberof ig.CONFIG.PATHFINDING
         * @property 0 worst walkable
         * @property 1 best walkable
         * @property 2 good walkable
         * @property 3 bad walkable
         * @property 4 unwalkable
         * @property 5 best jump
         * @property 6 worst jump
         * @example
         * // tile definitions are plain objects
         * // with a variety of properties
         * ig.CONFIG.PATHFINDING.TILE_DEF[ 2 ] {
         *     // walkable state
         *     // when not present, assumes true
         *     walkable: false,
         *     // positive weight value
         *     // where higher is harder to walk
         *     weight: 1,
         *     // percent of base weight to apply
         *     weightPct: 0.5
         * };
         */
        ig.CONFIG.PATHFINDING.TILE_DEF = {
            0: {
                weightPct: 1
            },
            1: {
                weightPct: 0,
                walkable: true
            },
            2: {
                weightPct: 0.25,
                walkable: true
            },
            3: {
                weightPct: 0.75,
                walkable: true
            },
            4: {
                walkable: false
            }
        };

        /**
         * Overlay base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.OVERLAY
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.OVERLAY = {};

        /**
         * Red value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.OVERLAY
         */
        ig.CONFIG.OVERLAY.R = 0;

        /**
         * Green value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.OVERLAY
         */
        ig.CONFIG.OVERLAY.G = 0;

        /**
         * Blue value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.OVERLAY
         */
        ig.CONFIG.OVERLAY.B = 0;

        /**
         * Alpha value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.OVERLAY
         */
        ig.CONFIG.OVERLAY.ALPHA = 0.8;

        /**
         * Whether overlay should be drawn and scaled pixel perfectly.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> pixel perfect scaling has a very high performance cost, use carefully!</span>
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.OVERLAY
         */
        ig.CONFIG.OVERLAY.PIXEL_PERFECT = false;

        /**
         * Text bubble base configuration settings.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> Don't modify config directly! (see example)</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus.config-user'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig.CONFIG
         * @namespace ig.CONFIG.TEXT_BUBBLE
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG.TEXT_BUBBLE = {};

        /**
         * Horizontal size.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.SIZE_X = 120;

        /**
         * Vertical size.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.SIZE_Y = 70;

        /**
         * Whether should size as a percent of screen.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.SIZE_AS_PCT = true;

        /**
         * Horizontal size in percent of screen.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.SIZE_PCT_X = 0.5;

        /**
         * Vertical size in percent of screen.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.SIZE_PCT_Y = 0.5;

        /**
         * Corner radius, i.e. roundness of box corners.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.CORNER_RADIUS = 5;

        /**
         * Whether to treat corner radius as a percentage of size between 0 and 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.CORNER_RADIUS_AS_PCT = false;

        /**
         * Whether text bubble should be drawn and scaled pixel perfectly.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> pixel perfect scaling has a very high performance cost, use carefully!</span>
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.PIXEL_PERFECT = false;

        /**
         * Red value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.R = 0.9;

        /**
         * Green value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.G = 0.9;

        /**
         * Blue value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.B = 0.9;

        /**
         * Alpha value from 0 to 1.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.ALPHA = 1;

        /**
         * Length of triangle extending from bubble.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.TRIANGLE_LENGTH = 10;

        /**
         * Width of triangle extending from bubble.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.TRIANGLE_WIDTH = 12;

        /**
         * Padding on the inside of text bubble to keep text spaced away from sides.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.PADDING_X = 6;

        /**
         * Padding on the inside of text bubble to keep text spaced away from sides.
         * @type Number
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.PADDING_Y = 6;

        /**
         * Whether to shrink to text size.
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.TEXT_BUBBLE
         */
        ig.CONFIG.TEXT_BUBBLE.SHRINK_TO_TEXT = true;

        // merge in user config over this config

        ig.merge(ig.CONFIG, ig.CONFIG_USER);

        // check for deprecated or moved config values

        ig.CONFIG.ENTITY.CAN_FLIP_Y = ig.CONFIG.ENTITY.CAN_FLIP_Y || ig.CONFIG.FLIP_Y;

        // finish calculating values that are based only on other config values

        /**
         * Path to main font. If empty, game will not use a font.
         * @type {String}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FONT.MAIN_PATH = ig.CONFIG.FONT.MAIN_NAME ? ig.CONFIG.PATH_TO_MEDIA + ig.CONFIG.FONT.MAIN_NAME : '';

        /**
         * Path to alt font. If empty, game will use main font.
         * @type {String}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FONT.ALT_PATH = ig.CONFIG.FONT.ALT_NAME ? ig.CONFIG.PATH_TO_MEDIA + ig.CONFIG.FONT.ALT_NAME : '';

        /**
         * Path to alt font. If empty, game will use main font.
         * @type {String}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FONT.CHAT_PATH = ig.CONFIG.FONT.CHAT_NAME ? ig.CONFIG.PATH_TO_MEDIA + ig.CONFIG.FONT.CHAT_NAME : '';

        /**
         * Ranks in an array for easy iteration.
         * @type Array
         * @memberof ig.CONFIG
         */
        ig.CONFIG.RANKS = (function() {

            var ranks = [];

            for (var rank in ig.CONFIG.RANKS_MAP) {

                ranks.push({
                    name: rank,
                    level: ig.CONFIG.RANKS_MAP[rank]
                });

            }

            ranks.sort(function(a, b) {
                return a.level - b.level;
            });

            return ranks;

        })();

        /**
         * Horizontal size of entities accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_EFFECTIVE_X = ig.CONFIG.ENTITY.SIZE_X - ig.CONFIG.ENTITY.SIZE_OFFSET_X * 2;

        /**
         * Vertical size of entities accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_EFFECTIVE_Y = ig.CONFIG.ENTITY.SIZE_Y - ig.CONFIG.ENTITY.SIZE_OFFSET_Y * 2;

        /**
         * Minimum size of entities accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_EFFECTIVE_MIN = Math.min(ig.CONFIG.ENTITY.SIZE_EFFECTIVE_X, ig.CONFIG.ENTITY.SIZE_EFFECTIVE_Y);

        /**
         * Maximum size of entities accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_EFFECTIVE_MAX = Math.max(ig.CONFIG.ENTITY.SIZE_EFFECTIVE_X, ig.CONFIG.ENTITY.SIZE_EFFECTIVE_Y);

        /**
         * Horizontal size of characters accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X = ig.CONFIG.CHARACTER.SIZE_X - ig.CONFIG.CHARACTER.SIZE_OFFSET_X * 2;

        /**
         * Vertical size of characters accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y = ig.CONFIG.CHARACTER.SIZE_Y - ig.CONFIG.CHARACTER.SIZE_OFFSET_Y * 2;

        /**
         * Minimum size of characters accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_MIN = Math.min(ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X, ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y);

        /**
         * Maximum size of characters accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_MAX = Math.max(ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X, ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y);

    });
