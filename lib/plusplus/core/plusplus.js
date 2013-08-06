/**
 * Main Impact++ module that requires the primary modules and enhances ImpactJS's core.
 * @namespace ig
 * @author Collin Hover - collinhover.com
 * @example
 * // getting started is easy
 * ig.module(
 *      'game.main'
 * )
 * .requires(
 *      'plusplus.core.plusplus',
 *      // don't forget your levels
 * )
 * .defines(function () {
 *      // then have your game extend ig.GameExtended
 *      var myGame = ig.GameExtended.extend({...});
 *      // and start the game as usual
 * });
 */

// first, some modifications necessary before we start

/**
 * Enhancements and fixes to Impact's merge method.
 * <br>- ignores undefined values and copy null values
 * <br>- handles true / false values converted to string by weltmeister (editor)
 */
ig.merge = function (original, extended) {

    original = original || {};

    if (extended) {

        for (var key in extended) {
            var ext = extended[key];
            var extType = typeof ext;
            if (extType !== 'undefined') {
                if (
                    extType !== 'object' ||
                        ext instanceof HTMLElement ||
                        ext instanceof ig.Class
                    ) {

                    // ugly, perhaps there is a better way?

                    if (extType === 'string') {

                        if (ext === 'true') {

                            ext = true;

                        }
                        else if (ext === 'false') {

                            ext = false;

                        }

                    }

                    original[key] = ext;

                }
                else {
                    if (!original[key] || typeof(original[key]) !== 'object') {
                        original[key] = (ext instanceof Array) ? [] : {};
                    }
                    ig.merge(original[key], ext);
                }
            }
        }

    }

    return original;
};

// start Impact++

ig.module(
        'plusplus.core.plusplus'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.loader',
        'plusplus.core.game',
        'plusplus.helpers.signals'
    )
    .defines(function () {
        "use strict";

        /**
         * Modifications and enhancements to Impact's system.
         * @class ig.System
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.System.inject({

            /**
             * Size of system based on minimum of width and height.
             * @type Number
             * @default
             */
            size: 240,

            /**
             * Signal dispatched when system is resized.
             * <br>- created on init.
             * @type ig.Signal
             */
            onResized: null,

            /**
             * Initializes system and creates extra properties such as resize signal
             * @param {String} canvasId
             * @param {Number} fps
             * @param {Number} width
             * @param {Number} height
             * @param {Number} scale
             */
            init: function( canvasId, fps, width, height, scale ) {

                // setup resize

                this.onResized = new ig.Signal();

                this.parent( canvasId, fps, width, height, scale );

            },

            /**
             * Resizes system and dispatches resize signal.
             * @param {Number} width
             * @param {Number} height
             * @param {Number} scale
             */
            resize: function ( width, height, scale ) {

                this.parent( width, height, scale );

                this.size = Math.min(this.width, this.height);

                this.onResized.dispatch();

            }
        });

    });