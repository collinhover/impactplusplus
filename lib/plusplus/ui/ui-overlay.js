ig.module(
    'plusplus.ui.ui-overlay'
)
    .requires(
        'plusplus.core.font',
        'plusplus.core.config',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-element',
        'plusplus.ui.ui-text',
        'plusplus.helpers.utilsdraw',
        'plusplus.helpers.utilscolor'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _utd = ig.utilsdraw;
        var _utc = ig.utilscolor;

        /**
         * UI Element for overlaying areas.
         * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
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
         * dimmer.fadeTo(0.75);
         * // the above methods can be mixed and matched as needed
         * // overlays can also create text
         * // it just requires the text settings to be set
         * overlay.textSettings = {};
         * // we can set the text content in several ways
         * overlay.text = "Hello World";
         * overlay.message = "Hello World";
         * overlay.textSettings.text = "Hello World";
         * // the last of these is the ideal way
         * // but the overlay will try to correct your mistake
         * // if you use either of the first two ways
         * // you can also set the font
         * // in this case, we'll set it to the main font
         * // defined by the path in the config (ig.CONFIG.FONT.MAIN_NAME)
         * overlay.textSettings.font = ig.Font.FONTS.MAIN;
         * // all the settings in the overlay's text settings
         * // correspond to properties of the UI text class
         **/
        ig.UIOverlay = ig.global.UIOverlay = ig.UIElement.extend( /**@lends ig.UIOverlay.prototype */ {

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
            zIndex: _c.Z_INDEX_BELOW_ALL,

            /**
             * Overlays should have entity max/min scaling.
             * @override
             * @default ig.CONFIG.ENTITY.SCALE_MIN
             */
            scaleMin: _c.ENTITY.SCALE_MIN,

            /**
             * Overlays should have entity max/min scaling.
             * @override
             * @default ig.CONFIG.ENTITY.SCALE_MAX
             */
            scaleMax: _c.ENTITY.SCALE_MAX,

            /**
             * Overlay should match entity scale of system scale.
             * @type Number
             * @default ig.CONFIG.ENTITY.SCALE_OF_SYSTEM_SCALE
             */
            scaleOfSystemScale: _c.ENTITY.SCALE_OF_SYSTEM_SCALE,

            /**
             * Overlays should match system scale, not UI scale.
             * @override
             * @default
             */
            ignoreSystemScale: false,

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
            sizePct: {
                x: 1,
                y: 1
            },

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
             * <br>- overriden by all other fill properties
             * @type Number
             * @default
             */
            r: _c.OVERLAY.R,

            /**
             * Fill green value from 0 to 1.
             * <br>- overriden by all other fill properties
             * @type Number
             * @default
             */
            g: _c.OVERLAY.G,

            /**
             * Fill blue value from 0 to 1.
             * <br>- overriden by all other fill properties
             * @type Number
             * @default
             */
            b: _c.OVERLAY.B,

            /**
             * Overlays should be slightly transparent.
             * @override
             * @default
             */
            alpha: _c.OVERLAY.ALPHA,

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
            gradientRadial: false,

            /**
             * Whether linear gradient should be horizontal or vertical.
             * <br>- does nothing to radial gradients
             * @type Boolean
             * @default
             */
            gradientHorizontal: false,

            /**
             * Whether radial gradient should cover, i.e. use max dimension, or contain, i.e. use min dimension.
             * <br>- does nothing to linear gradients
             * @type Boolean
             * @default
             */
            cover: false,

            /**
             * Corner radius, i.e. roundness of box corners
             * @type Number
             * @default
             */
            cornerRadius: 0,

            /**
             * Whether to treat corner radius as a percentage of size between 0 and 1.
             * @type Boolean
             * @default
             */
            cornerRadiusAsPct: false,

            /**
             * Whether overlay should be filled pixel perfectly.
             * <span class="alert"><strong>IMPORTANT:</strong> when true, only the r, g, b, and alpha properties are used to fill!</span>
             * @type Boolean
             * @default
             */
            pixelPerfect: _c.OVERLAY.PIXEL_PERFECT,

            /**
             * Text to show with overlay.
             * <br>- created on init
             * <br>- requires {@link ig.UIOverlay#textSettings}
             * @type ig.UIText
             * @default
             */
            message: null,

            /**
             * Message entity class.
             * @type ig.EntityExtended
             * @default
             */
            messageEntity: ig.UIText,

            /**
             * Settings object for message.
             * @type Object
             * @default
             */
            textSettings: null,

            /**
             * Settings object for message move to when overlay is moving to.
             * @type Object
             * @default
             */
            textMoveToSettings: {
                matchPerformance: true
            },

            /**
             * @override
             **/
            resetExtras: function() {

                // create fill

                if (this.filled) {

                    this.fill = new ig.ImageDrawing();

                } else {

                    this.fill = null;

                }

                // check if text/message is string and correct

                if (typeof this.text === 'string') {

                    this.textSettings = this.textSettings || {};
                    this.textSettings.text = this.text;
                    this.text = undefined;

                }

                if (typeof this.message === 'string') {

                    this.textSettings = this.textSettings || {};
                    this.textSettings.text = this.message;
                    this.message = undefined;

                }

                // create message, but don't spawn yet
                // we need message for calculating size
                // but we also want to add it only after overlay

                if (!this.message && this.textSettings && this.textSettings.text && this.textSettings.text.length > 0) {

                    this.message = new(this.messageEntity)(0, 0, ig.merge({
                        layerName: this.layerName,
                        fixed: this.fixed,
                        alpha: this.alpha,
                        linkedTo: this,
                        autoRefreshText: false
                    }, this.textSettings));

                }

                this.parent();

            },

            /**
             * @override
             **/
            resize: function(force) {

                // size as a percentage of system

                if (this.sizeAsPct) {

                    var sizeX = ig.system.width * this.sizePct.x;
                    var sizeY = ig.system.height * this.sizePct.y;

                    if (this.size.x !== sizeX) {

                        this.size.x = sizeX;
                        force = this.needsRebuild = true;

                    }

                    if (this.size.y !== sizeY) {

                        this.size.y = sizeY;
                        force = this.needsRebuild = true;

                    }

                }

                return force;

            },

            /**
             * @override
             */
            rebuild: function() {

                this.refill();

                // finalize fill after refill
                // to allow descendents to modify first

                if (this.fill) {

                    this.fill.finalize(this.pixelPerfect ? 1 : this.scale);

                }

                this.parent();

            },

            /**
             * Refreshes fill.
             * @param {Number} [width=sizeDraw.x] width to fill
             * @param {Number} [height=sizeDraw.y] height to fill
             */
            refill: function(width, height) {

                if (this.fill) {

                    if (typeof width === 'undefined') {

                        width = this.sizeDraw.x;

                    }

                    if (typeof height === 'undefined') {

                        height = this.sizeDraw.y;

                    }

                    var context = this.fill.dataContext;

                    if (this.pixelPerfect) {

                        this.fill.setDimensions(this.sizeDraw.x, this.sizeDraw.y);

                        if (this.cornerRadius > 0) {

                            _utd.pixelFillRoundedRect(
                                context,
                                0, 0, this.fill.width, this.fill.height,
                                0, 0, width, height,
                                this.cornerRadiusAsPct ? Math.min(width, height) * this.cornerRadius : this.cornerRadius,
                                this.r, this.g, this.b, 1
                            );

                        } else {

                            context.fillStyle = this.getFillStyle();
                            context.fillRect(0, 0, width, height);

                        }

                    } else {

                        this.fill.setDimensions(this.sizeDraw.x * this.scale, this.sizeDraw.y * this.scale);

                        context.fillStyle = this.getFillStyle();

                        width *= this.scale;
                        height *= this.scale;

                        if (this.cornerRadius > 0) {

                            _utd.fillRoundedRect(context, 0, 0, width, height, this.cornerRadiusAsPct ? Math.min(width, height) * this.cornerRadius : this.cornerRadius);

                        } else {

                            context.fillRect(0, 0, width, height);

                        }

                    }

                }

            },

            /**
             * Calculates fill style.
             * @returns {*} fill style
             */
            getFillStyle: function() {

                var fillStyle;

                if (!this.pixelPerfect) {

                    // fill with predefined style
                    if (this.fillStyle) {

                        fillStyle = this.fillStyle;

                    }
                    // fill with gradient
                    else if (this.fillColors) {

                        if (this.gradientRadial) {

                            fillStyle = _utc.radialGradient(this.cover ? Math.max(this.sizeDraw.x, this.sizeDraw.y) : Math.min(this.sizeDraw.x, this.sizeDraw.y), this.fillColors);

                        } else {

                            if (this.gradientHorizontal) {

                                fillStyle = _utc.linearGradient(0, 0, this.sizeDraw.x, 0, this.fillColors);

                            } else {

                                fillStyle = _utc.linearGradient(0, 0, 0, this.sizeDraw.y, this.fillColors);

                            }

                        }

                    }

                }

                // fallback to r,g,b

                if (!fillStyle) {

                    fillStyle = _utc.RGBToCSS(this.r, this.g, this.b);

                }

                return fillStyle;

            },

            /**
             * @override
             */
            ready: function() {

                if (this.message) {

                    ig.game.spawnEntity(this.message, this.message.pos.x, this.message.pos.y);

                }

                this.parent();

            },

            /**
             * @override
             */
            moveTo: function(item, settings) {

                var movingTo = this.parent(item, settings);

                if (this.message) {

                    this.message.moveTo(this, this.textMoveToSettings);

                }

                return movingTo;

            },

            /**
             * @override
             */
            moveToStop: function() {

                if (this.message) {

                    this.message.moveToStop();

                }

                this.parent();

            },

            /**
             * @override
             */
            pause: function() {

                this.parent();

                if (this.message) {

                    this.message.pause();

                }

            },

            /**
             * @override
             */
            unpause: function() {

                this.parent();

                if (this.message) {

                    this.message.unpause();

                }

            },

            /**
             * @override
             **/
            cleanup: function() {

                if (this.message) {

                    ig.game.removeEntity(this.message);

                }

                this.parent();

            },

            /**
             * @override
             **/
            update: function() {

                // force refresh when text has changed

                if (this.message) {

                    var text = (this.textSettings && this.textSettings.text) || this.text;

                    if (text && this.message.text !== text) {

                        this.message.text = text;

                    }

                    if (this.message._text !== this.message.text) {

                        this.refresh(true);

                    }

                }

                this.parent();

            },

            /**
             * Draws ui element fill first if present, and animation last.
             * @override
             **/
            draw: function() {

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

                        // fixed in screen

                        if (this.fixed) {

                            this.fill.draw(
                                this.posDraw.x,
                                this.posDraw.y,
                                undefined, undefined, undefined, undefined,
                                this.scale
                            );

                        }
                        // default draw
                        else {

                            this.fill.draw(
                                this.posDraw.x - ig.game.screen.x,
                                this.posDraw.y - ig.game.screen.y,
                                undefined, undefined, undefined, undefined,
                                this.scale
                            );

                        }

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
