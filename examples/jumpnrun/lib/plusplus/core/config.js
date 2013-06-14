ig.module(
        'plusplus.core.config'
    )
    .requires(
        'plusplus.config-user'
    )
    .defines(function () {
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
         * Whether to debug, including debug draw and debug panel.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DEBUG = true;

        /**
         * Whether to force all entities to inherit or extend ig.EntityExtended.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FORCE_ENTITY_EXTENDED = true;

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
         * What percent of window width to fill.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CANVAS_WIDTH_PCT = 1;

        /**
         * What percent of window height to fill.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CANVAS_HEIGHT_PCT = 1;

        /**
         * Base width of game.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_WIDTH = 320;

        /**
         * Base height of game.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.GAME_HEIGHT = 240;

        /**
         * Base scale of game.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.SCALE = 1;

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
         * <span class="alert alert-info"><strong>Tip:</strong> set this to false if your UI should not be destroyed when changing levels.</span>
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.UI_LAYER_CLEAR_ON_LOAD = true;

        /**
         * Whether ui layer ignores game pause.
         * @type {Boolean}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.UI_LAYER_IGNORES_PAUSE = true;

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
        ig.CONFIG.LOADER_BG_COLOR = '#333333';

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
         * Name of main font. If empty, game will not use a font.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FONT_MAIN_NAME = "font_04b03_white_8.png";

        /**
         * Name of alt font. If empty, game will use main font.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FONT_ALT_NAME = "font_hellovetica_white_8.png";

        /**
         * Performance level where entities never move.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.STATIC = "static";

        /**
         * Performance level where entities move but have no physics / collisions.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.DYNAMIC = "dynamic";

        /**
         * Performance level where entities move and have full physics / collisions.
         * @type {String}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.KINEMATIC = "kinematic";

        /**
         * Z index overlays, which should be below everything else on their layer.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_OVERLAY = -1;

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
        ig.CONFIG.Z_INDEX_PLAYER = 1;

        /**
         * Z index for sorting entities above player.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.Z_INDEX_ABOVE_PLAYER = 2;

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
         * Duration of transition when switching entities that camera is following.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CAMERA_TRANSITION_DURATION = 1;

        /**
         * Duration of transition when switching entities that camera is following.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CAMERA_TRANSITION_DURATION_MIN = 0.2;

        /**
         * Maximum duration of transition when switching entities that camera is following.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CAMERA_TRANSITION_DURATION_MAX = 2;

        /**
         * Base distance to try to transition per duration.
         * <br>- when set to 0, will not affect transition duration
         * @type {Number}
         * @default
         * @memberof ig.CONFIG
         */
        ig.CONFIG.CAMERA_TRANSITION_DISTANCE = 100;

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
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRECISION_ZERO = 0.01;

        /**
         * Precision when checking if numbers are close enough to zero during a tween.
         * @type {Number}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRECISION_ZERO_TWEEN = 0.1;

        /**
         * Precision when checking collision of one sided entities.
         * @type {Number}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.PRECISION_PCT_ONE_SIDED = 0.01;

        /**
         * Scale of box2d physics relative to game world. NOTE: box2d physics is stable but no longer developed.
         * @type {Number}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.SCALE_PHYSICS = 0.1;

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
            TARGET_SEARCH_RADIUS: 15

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
         * Health statistic.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.HEALTH = 1;

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
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.OPAQUE = false;

        /**
         * How much of light is blocked by entities that are opaque.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.DIFFUSE = 1;

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
         * Base horizontal size of characters that can also affect many calculations, ex: melee ability distance.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_X = 32;

        /**
         * Base vertical size of characters that can also affect many calculations, ex: melee ability distance.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_Y = 32;

        /**
         * Horizontal offset of characters allows visual overlap with walls to give some depth.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_OFFSET_X = 0;

        /**
         * Vertical offset of characters allows visual overlap with floor / ceiling to give some depth.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_OFFSET_Y = 0;

        /**
         * Max x velocity while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_X = 100;

        /**
         * Max y velocity while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_Y = 200;

        /**
         * Max x velocity while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_X = 100;

        /**
         * Max y velocity while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_Y = 100;

        /**
         * Max x velocity while climbing.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_X = 75;

        /**
         * Max y velocity while climbing.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_Y = 75;

        /**
         * Horizontal friction while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_X = 0;

        /**
         * Vertical friction while in air.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_Y = 0;

        /**
         * Horizontal friction while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.FRICTION_GROUNDED_X = 1600;

        /**
         * Vertical friction while on ground.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.FRICTION_GROUNDED_Y = 1600;

        /**
         * Movement speed applied to horizontal acceleration.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SPEED_X = 750;

        /**
         * Movement speed applied to vertical acceleration.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SPEED_Y = 750;

        /**
         * Number of update steps to apply jump force.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
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
         * @memberof ig.CONFIG.ENTITY
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
         * @memberof ig.CONFIG.ENTITY
         * @example
         * // no control of direction while in air
         * character.jumpControl = 0;
         * // full control of direction while in air
         * character.jumpControl = 1;
         */
        ig.CONFIG.CHARACTER.JUMP_CONTROL = 0.75;

        /**
         * Duration after character leaves ground during which they can still jump.
         * <br>- this is intended to help players with slower reaction time
         * <br>- this does not allow another jump while jumping
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.UNGROUNDED_FOR_THRESHOLD = 0.1;

        /**
         * Amount of acceleration control while climbing.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         * @example
         * // no control of direction while climbing
         * character.climbingControl = 0;
         * // full control of direction while climbing
         * character.climbingControl = 1;
         */
        ig.CONFIG.CHARACTER.CLIMBING_CONTROL = 1;

        /**
         * How long character will continue to try to move to something while stuck.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.MOVE_TO_STUCK_FOR_THRESHOLD = 0.5;

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
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.ENERGY = 1;

        /**
         * Amount of health a character should regenerate per tick.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.REGEN_RATE_HEALTH = 0;

        /**
         * Amount of energy a character should regenerate per tick.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.REGEN_RATE_ENERGY = 0;

        /**
         * Whether characters should have a particle explosion when damaged.
         * <br>- explosions are created through an {@link ig.EntityExplosion}
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.EXPLODING_DAMAGE = true;

        /**
         * Number of particles to create for explosion when character damaged.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.EXPLODING_DAMAGE_PARTICLE_COUNT = 3;

        /**
         * Characters should have a particle explosion when killed.
         * <br>- explosions are created through an {@link ig.EntityExplosion}
         * @type Boolean
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.EXPLODING_DEATH = true;

        /**
         * Number of particles to create for explosion when character killed.
         * @type Number
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.EXPLODING_DEATH_PARTICLE_COUNT = 10;

        // merge in user config over this config

        ig.merge( ig.CONFIG, ig.CONFIG_USER );

        // finish calculating values that are based only on other config values

        /**
         * Path to main font. If empty, game will not use a font.
         * @type {String}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FONT_MAIN_PATH = ig.CONFIG.FONT_MAIN_NAME ? ig.CONFIG.PATH_TO_MEDIA + ig.CONFIG.FONT_MAIN_NAME : '';

        /**
         * Path to alt font. If empty, game will use main font.
         * @type {String}
         * @memberof ig.CONFIG
         */
        ig.CONFIG.FONT_ALT_PATH = ig.CONFIG.FONT_ALT_NAME ? ig.CONFIG.PATH_TO_MEDIA + ig.CONFIG.FONT_ALT_NAME : '';

        /**
         * Ranks in an array for easy iteration.
         * @type Array
         * @memberof ig.CONFIG
         */
        ig.CONFIG.RANKS = (function () {

            var ranks = [];

            for (var rank in ig.CONFIG.RANKS_MAP) {

                ranks.push({
                    name: rank,
                    level: ig.CONFIG.RANKS_MAP[ rank ]
                });

            }

            ranks.sort(function (a, b) {
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
        ig.CONFIG.ENTITY.SIZE_EFFECTIVE_MIN = Math.min( ig.CONFIG.ENTITY.SIZE_EFFECTIVE_X, ig.CONFIG.ENTITY.SIZE_EFFECTIVE_Y );

        /**
         * Maximum size of entities accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.ENTITY.SIZE_EFFECTIVE_MAX = Math.max( ig.CONFIG.ENTITY.SIZE_EFFECTIVE_X, ig.CONFIG.ENTITY.SIZE_EFFECTIVE_Y );

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
        ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_MIN = Math.min( ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X, ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y );

        /**
         * Maximum size of characters accounting for offsets, i.e. actual collision bounds.
         * @type {Number}
         * @default
         * @memberof ig.CONFIG.ENTITY
         */
        ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_MAX = Math.max( ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X, ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y );

    });