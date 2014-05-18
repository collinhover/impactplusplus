ig.module(
    'plusplus.ui.ui-dpad'
)
    .requires(
        'plusplus.ui.ui-element',
        'plusplus.helpers.utilsvector2'
)
    .defines(function(){
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * UI dpad to display on the screen.
         * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
         * @class
         * @extends ig.UIElement
         * @memberof ig
         * @author John Lamphere
         * @example
         * // The dpad is used by ig.PlayerManager to display a holding click/touch
         * // directional pad. Instead of having a solid dpad displayed
         * // in a fixed position on the screen, this dpad is anchored
         * // where a click/touch happens on the screen. Then based off of
         * // the click/touch direction will move the player.
         * // When the click/touch is released the dpad is removed.
         * // This helps the user have greater control of the player
         * // while not blocking too much of the screen.
         * // To enable the touch dpad see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_ENABLED.
         * // ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_DEAD_ZONE_SIZE is used to
         * // controll the amount of deadzone in the center of the dpad.
         * // Deadzone is needed to give the player better control when
         * // moving in a single direction.
         * // You can also set a bounding box for using TOUCH_DPAD_BOUNDS_PCT
         * // to limit the directional pad to touch events in a specific
         * // quadrent or side of the screen.
         * // Finally be sure to declare TOUCH_DPAD_SIZE to load the right
         * // sized dpad for your game. 16, 32, and 64 are provided.
         */
        ig.UIDpad = ig.global.UIDpad = ig.UIElement.extend({

            /**
             * The size of the UI dpad is loaded from ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_SIZE
             * @override
             */
            size: {x:_c.PLAYER_MANAGER.TOUCH_DPAD_SIZE, y:_c.PLAYER_MANAGER.TOUCH_DPAD_SIZE},

            /**
             * Zindex of 5 so the Dpad appears over most overlay layers except for things like a pause screen.
             * @override
             */
            zIndex: 5,


            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'dpad_'+_c.PLAYER_MANAGER.TOUCH_DPAD_SIZE+'.png', _c.PLAYER_MANAGER.TOUCH_DPAD_SIZE, _c.PLAYER_MANAGER.TOUCH_DPAD_SIZE),

            /**
             * Center align the dpad by default
             * @override
             */
            align  : { x: 0.5, y: 0.5 },


            /**
             * ig.PlayerManager will be positioning the dpad bassed of of click/touch so we want to disable posAsPct.
             * @override
             */
            posAsPct: false,

            /**
             * ig.PlayerManager will be positioning the dpad bassed of of click/touch.
             * @override
             */
            pos  : { x: 0, y: 0 },

            /**
             * ig.InputPoint of this Ui dpad. ig.PlayerManager assigns this inputPoint.
             */
            inputPoint: null,

            /**
             * Direction of the ui dpad.
             * @type String
             */
            direction: null,

            /**
             * The deadzone for the center of the touch dpad.
             * Too small of a deadzone will make it difficult for the player to move in a single direction.
             * @type Number
             * @see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_DEAD_ZONE_SIZE
             */
            deadZoneSize: _c.PLAYER_MANAGER.TOUCH_DPAD_DEAD_ZONE_SIZE,

            animInit: "none",

            layerName: 'overlay',

            animSettings: {
                none: {
                    sequence: [0]
                },
                left: {
                    sequence: [1]
                },
                right: {
                    sequence: [2]
                },
                up: {
                    sequence: [3]
                },
                down: {
                    sequence: [4]
                },
                upleft: {
                    sequence: [5]
                },
                upright: {
                    sequence: [6]
                },
                downleft: {
                    sequence: [7]
                },
                downright: {
                    sequence: [8]
                }
            },

            /**
             * Sets the direction from a vector object.
             * @param {Vector2|Object} [direction=none] vector direction
             */
            setDirection: function() {

                if (null == this.inputPoint) {

                    this.direction = {
                        x: 0,
                        y: 0
                    };

                } else {

                    this.direction = {

                        x: ((this.inputPoint._downTotalDeltaX > this.deadZoneSize || this.inputPoint._downTotalDeltaX < -this.deadZoneSize) ? this.inputPoint._downTotalDeltaX: 0),

                        y: ((this.inputPoint._downTotalDeltaY > this.deadZoneSize || this.inputPoint._downTotalDeltaY < -this.deadZoneSize) ? this.inputPoint._downTotalDeltaY: 0)

                    }

                }

                this.directionName = _utv2.directionToString(this.direction).toLowerCase();

                this.currentAnim = this.anims[this.directionName];
            },

            update: function() {
                this.parent();

                if (this.inputPoint && !this.inputPoint.holding) {

                    // Remove the dpad if no longer holding onto the screen.

                    ig.game.playerManager.touchDpad = null;

                    this.kill();
                }
            }
    });

});
