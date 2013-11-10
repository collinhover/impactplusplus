ig.module(
        'plusplus.ui.ui-toggle-pause'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.ui.ui-toggle'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Interactive ui element that toggles game pause.
         * @class
         * @extends ig.UIToggle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.UITogglePause = ig.global.UITogglePause = ig.UIToggle.extend(/**@lends ig.UITogglePause.prototype */{

            /**
             * @override
             * @default 12x12
             */
            size: { x: 12, y: 12 },

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
                    sequence: [0],
                    frameTime: 1
                },
                onX: {
                    sequence: [1],
                    frameTime: 1
                }
            },

            /**
             * @override
             **/
            ready: function () {

                // listen for game pause / unpause, so this will toggle if game is paused by another method

                ig.game.onPaused.add(this.activate, this);
                ig.game.onUnpaused.add(this.deactivate, this);

                this.parent();

            },

            /**
             * @override
             **/
            activateComplete: function (entity) {

                this.parent(entity);

                if (!ig.game.paused) {

                    ig.game.pause();

                }

            },

            /**
             * @override
             **/
            deactivateComplete: function (entity) {

                this.parent(entity);

                if (ig.game.paused) {

                    ig.game.unpause();

                }

            },

            /**
             * @override
             **/
            cleanup: function () {

                // stop listening for game pause / unpause

                ig.game.onPaused.remove(this.activate, this);
                ig.game.onUnpaused.remove(this.deactivate, this);

                this.parent();

            }

        });

    });