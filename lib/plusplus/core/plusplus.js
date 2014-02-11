/**
 * Impact++ core that requires the primary modules and enhances ImpactJS's core.
 * @namespace ig
 * @author Collin Hover - collinhover.com
 * @example
 * // getting started with Impact++ is easy!
 * // add the two basic scripts to the end of your game HTML file:
 * // first the ImpactJS main script
 * &lt;script type="text/javascript" src="lib/impact/impact.js"&gt;&lt;/script&gt;
 * // then your game's main script
 * &lt;script type="text/javascript" src="lib/game/main.js"&gt;&lt;/script&gt;
 * // now inside your game's main script file
 * // you'll set it up the same as when using ImpactJS
 * // define the main module (script)
 * ig.module(
 *      'game.main'
 * )
 * // then require the other modules
 * .requires(
 *      // to hook Impact++ into your game
 *      // all you need to do is require one module
 *      'plusplus.core.plusplus',
 *      // then don't forget your levels
 *      'game.levels.name'
 * )
 * // now define how your game starts up
 * .defines(function () {
 *
 *      // always use strict
 *      "use strict";
 *
 *      // store the config in a local variable
 *      // this is a good pattern to follow in general
 *      var _c = ig.CONFIG;
 *
 *      // now have your game extend ig.GameExtended
 *      var myGameClass = ig.GameExtended.extend({
 *          // game settings go here
 *      });
 *
 *      // (optionally, add custom settings in 'plusplus/config-user.js')
 *
 *      // then start the game as usual with your game and config
 *      ig.main(
 *          // you'll need a canvas element with an id of 'canvas'
 *           "#canvas",
 *           // your game class
 *           myGameClass,
 *           // this value does nothing
 *           60,
 *           // the width / height / scale of your game
 *           // don't forget that Impact++ can scale dynamically
 *           // and can be resolution independent (see config)
 *           _c.GAME_WIDTH,
 *           _c.GAME_HEIGHT,
 *           _c.SCALE,
 *           // and the Impact++ customizable loader
 *           // within which you can easily change the logos!
 *           ig.LoaderExtended
 *       );
 *
 *      // and whenever you create a new entity remember...
 *      // plain entities extend ig.EntityExtended
 *      var myEntityClass = ig.EntityExtended.extend({
 *          // entity settings go here
 *      });
 *      // and in a similar vein...
 *      // characters entities extend ig.Character
 *      // creature entities extend ig.Creature
 *      // particles entities extend ig.Particle
 *      // player entities extend ig.Player
 *      // and so on (we've got lots of abstracts)
 *
 * });
 * // for a basic tutorial
 * // check out the Jump n' Run example
 * // in the "examples/jumpnrun" directory
 * // or for a more advanced tutorial
 * // check out the SUPER COLLIDER! example
 * // in the "examples/supercollider" directory
 * // which includes almost every feature in Impact++!
 */

// first, some modifications necessary before we start

/**
 * Enhancements and fixes to Impact's merge method.
 * <br>- ignores undefined values and copy null values
 * <br>- handles true / false values converted to string by weltmeister (editor)
 * @private
 */
ig.merge = function(original, extended) {

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

                        } else if (ext === 'false') {

                            ext = false;

                        }

                    }

                    original[key] = ext;

                } else {
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
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

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
            init: function(canvasId, fps, width, height, scale) {

                this.onResized = new ig.Signal();

                this.fps = fps;
                this.clock = new ig.Timer();
                this.canvas = ig.$(canvasId);
                this.context = this.canvas.getContext('2d');

                this.getDrawPos = ig.System.drawMode;

                this.resize(width, height, scale);

            },

            /**
             * Runs system, accounting for maximum framerate.
             */
            run: function() {

                ig.Timer.step();

                // only do run if timer has stepped

                if (ig.Timer.stepped) {

                    this.tick = this.clock.tick();

                    this.delegate.run();
                    ig.input.clearPressed();

                    if (this.newGameClass) {
                        this.setGameNow(this.newGameClass);
                        this.newGameClass = null;
                    }

                }

            },

            /**
             * Resizes system and dispatches resize signal.
             * @param {Number} width
             * @param {Number} height
             * @param {Number} scale
             * @param {Boolean} [force=false] whether to force global resize (only do this when absolutely necessary).
             */
            resize: function(width, height, scale, force) {
                var modifier;

                if (ig.ua.pixelRatio > 1 && (!this.context.webkitBackingStorePixelRatio || this.context.webkitBackingStorePixelRatio > 1)) {
                    modifier = ig.ua.pixelRatio;
                } else {
                    modifier = 1;
                }

                this.width = width * modifier;
                this.height = height * modifier;

                if (typeof scale !== 'undefined' && scale !== null) {

                    this.scale = scale;

                }

                this.realWidth = this.width * this.scale;
                this.realHeight = this.height * this.scale;

                // retina support

                this.canvas.width = this.realWidth;
                this.canvas.height = this.realHeight;
                this.canvas.style.width = Math.round(this.realWidth / modifier) + "px";
                this.canvas.style.height = Math.round(this.realHeight / modifier) + "px";

                this.size = Math.min(this.width, this.height);

                // switch to crisp scaling when using a scale other than 1

                if (this.scale !== 1 && _c.AUTO_CRISP_SCALING) {

                    ig.System.scaleMode = ig.System.SCALE.CRISP;

                }

                ig.System.scaleMode(this.canvas, this.context);

                this.onResized.dispatch(force);

            }
        });

    });
