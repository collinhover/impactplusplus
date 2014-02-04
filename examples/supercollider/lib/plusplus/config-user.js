ig.module(
    'plusplus.config-user'
)
    .defines(function() {

        /**
         * User configuration of Impact++.
         * <span class="alert alert-info"><strong>Tip:</strong> it is recommended to modify this configuration file!</span>
         * @example
         * // in order to add your own custom configuration to Impact++
         * // edit the file defining ig.CONFIG_USER, 'plusplus/config-user.js'
         * // ig.CONFIG_USER is never modified by Impact++ (it is strictly for your use)
         * // ig.CONFIG_USER is automatically merged over Impact++'s config
         * @static
         * @readonly
         * @memberof ig
         * @namespace ig.CONFIG_USER
         * @author Collin Hover - collinhover.com
         **/
        ig.CONFIG_USER = {

            // no need to do force entity extended checks, we won't mess it up
            // because we know to have our entities extend ig.EntityExtended
            FORCE_ENTITY_EXTENDED: false,

            // auto sort
            AUTO_SORT_LAYERS: true,

            // fullscreen!
            GAME_WIDTH_PCT: 1,
            GAME_HEIGHT_PCT: 1,

            // dynamic scaling based on dimensions in view (resolution independence)
            GAME_WIDTH_VIEW: 352,
            GAME_HEIGHT_VIEW: 208,

            // clamped scaling is still dynamic, but within a range
            // so we can't get too big or too small
            SCALE_MIN: 1,
            SCALE_MAX: 4,

            // camera flexibility and smoothness
            CAMERA: {
                // keep the camera within the level
                // (whenever possible)
                //KEEP_INSIDE_LEVEL: true,
                KEEP_CENTERED: false,
                LERP: 0.025,
                // trap helps with motion sickness
                BOUNDS_TRAP_AS_PCT: true,
                BOUNDS_TRAP_PCT_MINX: -0.2,
                BOUNDS_TRAP_PCT_MINY: -0.3,
                BOUNDS_TRAP_PCT_MAXX: 0.2,
                BOUNDS_TRAP_PCT_MAXY: 0.3
            },

            // font and text settings
            FONT: {
                MAIN_NAME: "font_helloplusplus_white_16.png",
                ALT_NAME: "font_helloplusplus_white_8.png",
                CHAT_NAME: "font_helloplusplus_black_8.png",
                // we can have the font be scaled relative to system
                SCALE_OF_SYSTEM_SCALE: 0.5,
                // and force a min / max
                SCALE_MIN: 1,
                SCALE_MAX: 2
            },

            // text bubble settings
            TEXT_BUBBLE: {
                // match the visual style
                PIXEL_PERFECT: true
            },

            UI: {
                // sometimes, we want to keep things at a static scale
                // for example, UI is a possible target
                SCALE: 3,
                IGNORE_SYSTEM_SCALE: true
            },

            /*
			// to try dynamic clamped UI scaling
			// uncomment below and delete the UI settings above
            UI: {
				SCALE_MIN: 2,
				SCALE_MAX: 4
			}
			*/

            // UI should persist across all levels
            UI_LAYER_CLEAR_ON_LOAD: false,

            CHARACTER: {
                // add some depth using offset
                SIZE_OFFSET_X: 8,
                SIZE_OFFSET_Y: 4
            }

        };

    });
