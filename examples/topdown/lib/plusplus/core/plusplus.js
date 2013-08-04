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

// modifications made, lets start it up

ig.module(
        'plusplus.core.plusplus'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.loader',
        'plusplus.core.game'
    )
    .defines(function () {
        "use strict";

        // empty module to require the appropriate files

    });