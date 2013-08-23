ig.module(
        'plusplus.ui.ui-text'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.font',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-element',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * UI element to be used for displaying text.
         * <span class="alert"><strong>IMPORTANT:</strong> to function properly, this requires that a font is defined by {@link ig.UIText#font} or {@link ig.GameExtended#font}.</span>
         * @class
         * @extends ig.UIElement
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.UIText = ig.global.UIText = ig.UIElement.extend(/**@lends ig.UIText.prototype */{

            /**
             * @override
             * @default 0.5 x 0.5 (center)
             */
            align: _utv2.vector(0.5, 0.5),

            /**
             * @override
             * @default 0 x 0 (center)
             */
            linkAlign: _utv2.vector(),

            /**
             * Font to use in rendering text.
             * @type ig.Font
             * @default {@link ig.GameExtended#font}
             */
            font: null,

            /**
             * Whether text scales as font scales instead of as UI scales.
             * @type Number
             * @default ig.CONFIG.UI.TEXT_SCALES_WITH_FONT
             */
            scale: _c.FONT.SCALE,

            /**
             * Text ignores system scale as font does.
             * <span class="alert"><strong>IMPORTANT:</strong> when true, text will not scale dynamically with view and instead will be fixed in size. This is usually ideal.</span>
             * @type Boolean
             * @default ig.CONFIG.FONT.IGNORE_SYSTEM_SCALE
             */
            ignoreSystemScale: _c.FONT.IGNORE_SYSTEM_SCALE,

            /**
             * Text to display.
             * @type String
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

            /**
             * @override
             */
            resetExtras: function () {

                this.font = this.font || ig.game.font;

                if ( this.text && this.font ) {

                    if ( !this.textImage ) {

                        this.textImage = new ig.ImageDrawing();

                    }

                }
                else {

                    this.textImage = null;

                }

                this.parent();

            },

            /**
             * @override
             **/
            resize: function (force) {

                if (this.text && this.font) {

                    var textDisplay = this.text;
                    var textOverflow = '';
                    var sizeX = this.font.widthForString(textDisplay);
                    var sizeY = this.font.heightForString(textDisplay);

                    if ( this.maxWidth > 0 && sizeX > this.maxWidth ) {

                        textDisplay = this.font.multilineForWidth( textDisplay, this.maxWidth );

                        sizeX = this.font.widthForString(textDisplay);
                        sizeY = this.font.heightForString(textDisplay);

                    }

                    if ( this.maxHeight > 0 && sizeY > this.maxHeight ) {

                        var textFormatted = this.font.overflowForHeight( textDisplay, this.maxHeight );

                        textDisplay = textFormatted.display;
                        textOverflow = textFormatted.overflow;

                        sizeX = this.font.widthForString(textDisplay);
                        sizeY = this.font.heightForString(textDisplay);

                    }

                    this.textDisplay = textDisplay;
                    this.textOverflow = textOverflow;

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
            rebuild: function () {

                this.parent();

                // cache text

                if ( this.textDisplay && this.font ) {

                    this.textImage.setDimensions( this.size.x, this.size.y );

                    // account for alignment

                    var offsetX;

                    if ( this.textAlign === ig.Font.ALIGN.CENTER ) {

                        offsetX = this.size.x * 0.5;

                    }
                    else if ( this.textAlign === ig.Font.ALIGN.RIGHT ) {

                        offsetX = this.size.x;

                    }
                    else {

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
            draw: function () {

                this.parent();

                if (this.visible && this.textImage) {

                    if ( this.alpha !== 1 ) {

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

                    if ( this.alpha !== 1 ) {

                        ig.system.context.globalAlpha = 1;

                    }

                }

            }

        });

    });