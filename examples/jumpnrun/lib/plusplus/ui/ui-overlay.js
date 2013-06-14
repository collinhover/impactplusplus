ig.module(
        'plusplus.ui.ui-overlay'
    )
    .requires(
        'impact.font',
        'plusplus.core.config',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-element',
        'plusplus.ui.ui-text',
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.utilscolor'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;
        var _utc = ig.utilscolor;

        /**
         * UI Element for overlaying areas.
         * @class
         * @extends ig.UIElement
         * @author Collin Hover - collinhover.com
         * @example
         * // we can use a dark overlay to dim the screen when we pause the game
         * dimmer = ig.game.spawnEntity(ig.UIOverlay, 0, 0, {
         *      // set its layer to ui so it doesn't get paused
         *      layerName: 'ui',
         *      fillStyle: '#000000',
         *      // start its alpha at 0
         *      alpha: 0
         *      // ui elements have a default position of top left
         * });
         * // alternatively, we can use a textured animation to fill overlay
         * dimmer = ig.game.spawnEntity(ig.UIOverlay, 0, 0, {
         *      // animation sheet with single tile for texture
         *      animSheet: new ig.AnimationSheet( "media/overlay_texture.png", 32, 32 ),
         *      // automatically make tile into idle animation
         *      animSettings: true,
         *      // tile the animation across the overlay to fill the overlay
         *      textured: true,
         *      ...previous settings...
         * });
         * // then we fade it in to 75% alpha
         * this.dimmer.fadeTo(0.75);
         * // the above methods can be mixed and matched as needed
         **/
        ig.UIOverlay = ig.global.UIOverlay = ig.UIElement.extend(/**@lends ig.UIOverlay.prototype */{

            /**
             * Overlays should be in overlay layer.
             * @override
             * @default
             */
            layerName: "overlay",

            /**
             * Overlays should be behind anything else on same layer.
             * @override
             * @default
             */
            zIndex: _c.Z_INDEX_OVERLAY,

            /**
             * Overlays should be slightly transparent.
             * @override
             * @default
             */
            alpha: 0.8,

            /**
             * Whether to treat size as a percentage of screen size in values from 0 to 1.
             * @type Boolean
             * @default
             */
            sizeAsPct: true,

            /**
             * Percentage of screen size to be converted to {@link ig.EntityExtended#size} in values from 0 to 1.
             * @override
             * @default 100%
             */
            sizePct: _utv2.vector(1, 1),

            /**
             * Overlay fill.
             * <br>- created on init
             * @type ig.ImageDrawing
             */
            fill: null,

            /**
             * Whether fill overlay with a color, pattern, etc.
             * @type Boolean
             * @default
             */
            filled: true,

            /**
             * Fill red value from 0 to 1.
             * <br>- overriden by {@link ig.UIOverlay#fillStyle}
             * @type Number
             * @default
             */
            r: 0,

            /**
             * Fill green value from 0 to 1.
             * <br>- overriden by {@link ig.UIOverlay#fillStyle}
             * @type Number
             * @default
             */
            g: 0,

            /**
             * Fill blue value from 0 to 1.
             * <br>- overriden by {@link ig.UIOverlay#fillStyle}
             * @type Number
             * @default
             */
            b: 0,

            /**
             * Fill style (color, pattern, etc).
             * <br>- overrides all other fill properties when present
             * @type String
             * @default
             */
            fillStyle: '',

            /**
             * List of string fill colors for gradient.
             * <br>- overrides r,g,b properties when present
             * <span class="alert"><strong>IMPORTANT:</strong> this property determines whether to fill as a gradient or not.</span>
             * @type Array
             * @default
             */
            fillColors: null,

            /**
             * Whether to fill gradient as a radial or linear.
             * @type Boolean
             * @default
             */
            radial: false,

            /**
             * Whether linear gradient should be horizontal or vertical.
             * <br>- does nothing to radial gradients
             * @type Boolean
             * @default
             */
            horizontal: false,

            /**
             * Whether radial gradient should cover, i.e. use max dimension, or contain, i.e. use min dimension.
             * <br>- does nothing to linear gradients
             * @type Boolean
             * @default
             */
            cover: false,

            /**
             * Text to show with overlay.
             * <br>- created on init
             * <br>- requires {@link ig.UIOverlay#textSettings}
             * @type ig.UIText
             * @default
             */
            message: null,

            /**
             * Settings object for message.
             * <br>- directly corresponds to properties of {@link ig.UIText}
             * @type Object
             * @default
             */
            textSettings: null,

            /**
             * Initializes animations and fill if needed.
             * @override
             **/
            initVisuals: function () {

                this.parent();

                // create fill

                if (this.filled) {

                    this.fill = new ig.ImageDrawing({
                        ignoreScale: true
                    });

                }

            },

            /**
             * Called just after entity added to game world and creates message if needed.
             * @override
             **/
            ready: function () {

                this.parent();

                // spawn message

                if (this.textSettings) {

                    this.textSettings.layerName = this.textSettings.layerName || this.layerName;

                    this.message = ig.game.spawnEntity(this.message || ig.UIText, 0, 0, this.textSettings);
                    this.message.alpha = this.alpha;

                }

            },

            /**
             * @override
             **/
            resize: function (force) {

                // size as a percentage of system

                if (this.sizeAsPct) {

                    var sizeX = ig.system.width * this.sizePct.x;
                    var sizeY = ig.system.height * this.sizePct.y;

                    if (this.size.x !== sizeX) {

                        this.size.x = sizeX;

                        // recalculate total size

                        this.totalSizeX = this.getTotalSizeX();
                        force = true;

                    }

                    if (this.size.y !== sizeY) {

                        this.size.y = sizeY;
                        this.totalSizeY = this.getTotalSizeY();
                        force = true;

                    }

                }

                // fill fallback

                if (this.fill && force) {

                    var scaledSizeX = this.size.x * ig.system.scale;
                    var scaledSizeY = this.size.y * ig.system.scale;

                    this.fill.setDimensions(scaledSizeX, scaledSizeY);

                    var context = this.fill.dataContext;
                    var fillStyle;

                    // fill with predefined style
                    if (this.fillStyle) {

                        fillStyle = this.fillStyle;

                    }
                    // fill with gradient
                    else if (this.fillColors) {

                        if (this.radial) {

                            fillStyle = _utc.radialGradient(this.cover ? Math.max(scaledSizeX, scaledSizeY) : Math.min(scaledSizeX, scaledSizeY), this.fillColors);

                        }
                        else {

                            if (this.horizontal) {

                                fillStyle = _utc.linearGradient(0, 0, scaledSizeX, 0, this.fillColors);

                            }
                            else {

                                fillStyle = _utc.linearGradient(0, 0, 0, scaledSizeY, this.fillColors);

                            }

                        }

                    }
                    // fallback to r,g,b
                    else {

                        fillStyle = _utc.RGBToCSS(this.r, this.g, this.b);

                    }

                    context.fillStyle = fillStyle;
                    context.fillRect(0, 0, scaledSizeX, scaledSizeY);

                }

                this.parent(force);

            },

            /**
             * @override
             **/
            cleanup: function () {

                if (this.message) {

                    ig.game.removeEntity(this.message);

                }

                this.parent();

            },

            /**
             * Draws ui element fill first if present, and animation last.
             * @override
             **/
            draw: function () {

                // set message alpha

                if (this.message) {

                    this.message.alpha = this.alpha;

                }

                if (this.visible) {

                    // fill first

                    if (this.fill) {

                        if (this.alpha !== 1) {

                            ig.system.context.globalAlpha = this.alpha;

                        }

                        this.fill.draw(0, 0);

                        if (this.alpha !== 1) {

                            ig.system.context.globalAlpha = 1;

                        }

                    }

                    // default draw

                    this.parent();

                }

            }

        });

    });