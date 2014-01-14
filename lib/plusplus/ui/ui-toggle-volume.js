ig.module(
    'plusplus.ui.ui-toggle-volume'
)
    .requires(
        'plusplus.core.config',
        'plusplus.ui.ui-toggle'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Interactive ui element that toggles game sound volume between 1 and 0.
         * @class
         * @extends ig.UIToggle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.UIToggleVolume = ig.global.UIToggleVolume = ig.UIToggle.extend( /**@lends ig.UIToggleVolume.prototype */ {

            /**
             * @override
             * @default 12x12
             */
            size: {
                x: 12,
                y: 12
            },

            /**
             * @override
             * @default buttons_states.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'buttons_states.png', 12, 12),

            /**
             * @override
             **/
            animSettings: {
                idleX: {
                    sequence: [2],
                    frameTime: 1
                },
                onX: {
                    sequence: [3],
                    frameTime: 1
                }
            },

            /**
             * @override
             * @default
             **/
            autoDeactivate: false,

            /**
             * @override
             **/
            activateComplete: function(entity) {

                if (!this.activated) {

                    ig.soundManager.volume = 0;
                    ig.music.stop();

                }

                this.parent(entity);

            },

            /**
             * @override
             **/
            deactivateComplete: function(entity) {

                if (this.activated) {

                    ig.soundManager.volume = 1;
                    ig.music.play();

                }

                this.parent(entity);

            }

        });

    });
