ig.module(
        'plusplus.core.timer'
    ).requires(
        'impact.timer'
    )
    .defines(function () {
        'use strict';

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

                    // clear previous

                    if (this.pauseSignaller && this.pauseSignaller.onPaused) {

                        this.pauseSignaller.onPaused.remove(this.pause, this);
                        this.pauseSignaller.onUnpaused.remove(this.unpause, this);

                    }

                    // store new

                    this.pauseSignaller = pauseSignaller;

                    // listen for pauseSignaller's pause / unpause signal
                    // this allows us to reliably pause timers by a signaller and/or layer

                    if (this.pauseSignaller && this.pauseSignaller.onPaused) {

                        this.pauseSignaller.onPaused.add(this.pause, this);
                        this.pauseSignaller.onUnpaused.add(this.unpause, this);

                    }

                }

            }

        });

    });