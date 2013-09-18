ig.module(
        'plusplus.core.timer'
    ).requires(
        'impact.timer',
        'plusplus.core.config'
    )
    .defines(function () {
        'use strict';

        var _c = ig.CONFIG;

        /**
         * Fixes and enhancements for timers.
         * <span class="alert"><strong>IMPORTANT:</strong> timers can now be setup to pause and unpause automatically with any entity (and by extension a layer and game) via {@link ig.TimerExtended#pauseSignaller}.</span>
         * @class
         * @extends ig.Timer
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.TimerExtended = ig.Timer.extend(/**@lends ig.TimerExtended.prototype */{

            /**
             * An object with pause/unpause signals that this timer uses as reference for when to pause and unpause.
             */
            pauseSignaller: null,

            /**
             * Initializes timer.
             * @param {Number} seconds time from now.
             * @param {*} [pauseSignaller] an object with pause/unpause signals that this timer uses as reference for when to pause and unpause.
             */
            init: function (seconds, pauseSignaller) {

                this.parent(seconds);

                this.setPauseSignaller(pauseSignaller);

            },

            /**
             * Stores an object with pause/unpause signals that this timer uses as reference for when to pause and unpause.
             * @param {*} [pauseSignaller] object to reference.
             */
            setPauseSignaller: function (pauseSignaller) {

                if (this.pauseSignaller !== pauseSignaller) {

                    this.clearPauseSignaller();

                    // store new

                    this.pauseSignaller = pauseSignaller;

                    // listen for pauseSignaller's pause / unpause signal
                    // this allows us to reliably pause timers by a signaller and/or layer

                    if (this.pauseSignaller && this.pauseSignaller.onPaused) {

                        this.pauseSignaller.onPaused.add(this.pause, this);
                        this.pauseSignaller.onUnpaused.add(this.unpause, this);

                    }

                }

            },

            /**
             * Clears pause signaller.
             */
            clearPauseSignaller: function () {

                if (this.pauseSignaller ) {

                    if ( this.pauseSignaller.onPaused) {

                        this.pauseSignaller.onPaused.remove(this.pause, this);
                        this.pauseSignaller.onUnpaused.remove(this.unpause, this);

                    }

                    this.pauseSignaller = null;

                }

            }

        });

        /*
         * Extra properties for ig.Timer.
         */

        ig.Timer.minStep = _c.MIN_TIME_STEP;
        ig.Timer.overflow = 0;
        ig.Timer.stepped = false;

        ig.Timer.step = function() {

            var current = Date.now();

            // add frame time to overflow
            // if overflow is above minimum step time
            // game should step forward
            // this way we can keep a maximum framerate

            ig.Timer.overflow += Math.min( ( current - ig.Timer._last) / 1000, ig.Timer.maxStep);

            if ( ig.Timer.overflow >= ig.Timer.minStep ) {

                ig.Timer.overflow -= ig.Timer.minStep;
                ig.Timer.time += ig.Timer.minStep * ig.Timer.timeScale;
                ig.Timer.stepped = true;

            }
            else {

                ig.Timer.stepped = false;

            }

            ig.Timer._last = current;

        };

    });