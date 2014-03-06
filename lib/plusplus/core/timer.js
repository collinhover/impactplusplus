ig.module(
    'plusplus.core.timer'
).requires(
    'impact.timer',
    'plusplus.core.config'
)
    .defines(function() {
        'use strict';

        var _c = ig.CONFIG;

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

            ig.Timer.overflow += Math.min((current - ig.Timer._last) / 1000, ig.Timer.maxStep);

            if (ig.Timer.overflow >= ig.Timer.minStep) {

                ig.Timer.overflow -= ig.Timer.minStep;
                ig.Timer.time += ig.Timer.minStep * ig.Timer.timeScale;
                ig.Timer.stepped = true;

            } else {

                ig.Timer.stepped = false;

            }

            ig.Timer._last = current;

        };

    });
