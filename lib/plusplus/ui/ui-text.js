ig.module(
    'plusplus.ui.ui-text'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.font',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-element'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * UI element to be used for displaying text.
         * <span class="alert"><strong>IMPORTANT:</strong> to function properly, this requires that a font is defined by {@link ig.UIText#font} or {@link ig.GameExtended#font}.</span>
         * @class
         * @extends ig.UIElement
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.UIText = ig.global.UIText = ig.UIElement.extend( /**@lends ig.UIText.prototype */ {

            /**
             * @override
             * @default 0 x 0 (topleft)
             */
            align: {
                x: 0,
                y: 0
            },

            /**
             * @override
             * @default 0 x 0 (center)
             */
            linkAlign: {
                x: 0,
                y: 0
            },

            /**
             * Font to use in rendering text.
             * @type ig.Font
             * @default {@link ig.GameExtended#font}
             */
            font: null,

            /**
             * Text scales as font does, not as entities do.
             * @type Number
             * @default ig.CONFIG.FONT.SCALE
             */
            scale: _c.FONT.SCALE,

            /**
             * Scale of system scale.
             * @type Number
             * @default
             */
            scaleOfSystemScale: _c.FONT.SCALE_OF_SYSTEM_SCALE,

            /**
             * Minimum value of {@link ig.Font#scale}.
             * @type Number
             * @default ig.CONFIG.FONT.SCALE_MIN
             */
            scaleMin: _c.FONT.SCALE_MIN,

            /**
             * Maximum value of {@link ig.Font#scale}.
             * @type Number
             * @default ig.CONFIG.FONT.SCALE_MAX
             */
            scaleMax: _c.FONT.SCALE_MAX,

            /**
             * Text ignores system scale as font does.
             * <span class="alert"><strong>IMPORTANT:</strong> when true, text will not scale dynamically with view and instead will be fixed in size. This is usually ideal.</span>
             * @type Boolean
             * @default ig.CONFIG.FONT.IGNORE_SYSTEM_SCALE
             */
            ignoreSystemScale: _c.FONT.IGNORE_SYSTEM_SCALE,

            /**
             * Text to display.
             * <span class="alert"><strong>IMPORTANT:</strong> if you change this value after the text entity is added to the game, it will automatically refresh the displayed text on the next update.</span>
             * @type String
             * @default
             */
            text: '',

            /**
             * Text displayed after formatting.
             * @type String
             */
            textDisplay: '',

            /**
             * Text overflowing, i.e. hidden, after formatting.
             * @type String
             */
            textOverflow: '',

            /**
             * Whether to automatically refresh the text element when {@link ig.UIText#text} has changed.
             * @type Boolean
             * @default
             */
            autoRefreshText: true,

            /**
             * Whether {@link ig.UIText#textDisplay} has changed.
             * @type Boolean
             * @readonly
             */
            changedText: false,

            /**
             * Text cache image.
             * @type ig.ImageDrawing
             */
            textImage: null,

            /**
             * Text align.
             * @type String
             * @default center
             */
            textAlign: ig.Font.ALIGN.CENTER,

            /**
             * Maximum width of text area.
             * <br>- set to 0 for infinite width
             * <span class="alert alert-info"><strong>Tip:</strong> this will reflow text into multiple lines as necessary.</span>
             * @type Number
             * @default
             */
            maxWidth: 0,

            /**
             * Maximum height of text area.
             * <br>- set to 0 for infinite height
             * <span class="alert alert-info"><strong>Tip:</strong> this will crop text and put the extra into {@link ig.UIText#overflow}.</span>
             * @type Number
             * @default
             */
            maxHeight: 0,

            // internal properties, do not modify

            _text: '',

            /**
             * @override
             */
            refresh: function(force) {

                this.font = this.font || ig.Font.FONTS.MAIN;

                if (this.text && this.font) {

                    if (!this.textImage) {

                        this.textImage = new ig.ImageDrawing();

                    }

                } else if (this.textImage) {

                    this.textImage = null;

                }

                this.parent(force);

            },

            /**
             * @override
             **/
            resize: function(force) {

                if (this._text !== this.text) {

                    this.changedText = true;
                    this._text = this.text;

                }

                if (this._text && this.font) {

                    var textDisplay = this._text;
                    var textOverflow = '';
                    var sizeX = this.font.widthForString(textDisplay);
                    var sizeY = this.font.heightForString(textDisplay);

                    if (this.maxWidth > 0 && sizeX > this.maxWidth) {

                        textDisplay = this.font.multilineForWidth(textDisplay, this.maxWidth);

                        sizeX = this.font.widthForString(textDisplay);
                        sizeY = this.font.heightForString(textDisplay);

                    }

                    if (this.maxHeight > 0 && sizeY > this.maxHeight) {

                        var textFormatted = this.font.overflowForHeight(textDisplay, this.maxHeight);

                        textDisplay = textFormatted.display;
                        textOverflow = textFormatted.overflow;

                        sizeX = this.font.widthForString(textDisplay);
                        sizeY = this.font.heightForString(textDisplay);

                    }

                    if (this.textDisplay !== textDisplay || this.textOverflow !== textOverflow) {

                        this.needsRebuild = this.changedText = true;
                        this.textDisplay = textDisplay;
                        this.textOverflow = textOverflow;

                    }

                    if (this.size.x !== sizeX) {

                        this.size.x = sizeX;

                        force = this.needsRebuild = this.changedText = true;

                    }

                    if (this.size.y !== sizeY) {

                        this.size.y = sizeY;

                        force = this.needsRebuild = this.changedText = true;

                    }

                }

                return force;

            },

            /**
             * @override
             */
            rebuild: function() {

                this.parent();

                // cache text

                if (this.textDisplay && this.font) {

                    this.textImage.setDimensions(this.size.x, this.size.y);

                    // account for alignment

                    var offsetX;

                    if (this.textAlign === ig.Font.ALIGN.CENTER) {

                        offsetX = this.size.x * 0.5;

                    } else if (this.textAlign === ig.Font.ALIGN.RIGHT) {

                        offsetX = this.size.x;

                    } else {

                        offsetX = 0;

                    }

                    this.font.draw(
                        this.textDisplay,
                        offsetX, 0,
                        this.textAlign,
                        this.textImage.dataContext,
                        1
                    );

                    this.textImage.finalize();

                }

            },

            /**
             * @override
             **/
            update: function() {

                // force refresh when text has changed

                if (this.autoRefreshText && this._text !== this.text) {

                    this.refresh(true);

                } else {

                    this.changedText = false;

                }

                this.parent();

            },

            /**
             * @override
             **/
            draw: function() {

                this.parent();

                if (this.visible && this.textImage) {

                    if (this.alpha !== 1) {

                        ig.system.context.globalAlpha = this.alpha;

                    }

                    // fixed in screen

                    if (this.fixed) {

                        this.textImage.draw(
                            this.posDraw.x,
                            this.posDraw.y,
                            undefined, undefined, undefined, undefined,
                            this.scale
                        );

                    }
                    // default draw
                    else {

                        this.textImage.draw(
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

            }

        });

    });
