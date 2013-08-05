ig.module(
        'plusplus.ui.ui-text'
    )
    .requires(
        'plusplus.core.font',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-element',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

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
             * @default 0.5 x 0.5 (center)
             */
            linkAlign: _utv2.vector(0.5, 0.5),

            /**
             * Font to use in rendering text.
             * @type ig.Font
             * @default {@link ig.GameExtended#font}
             */
            font: null,

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
            ready: function () {

                this.font = this.font || ig.game.font;
                this.textDisplay = this.text;

                this.parent();

            },

            /**
             * @override
             **/
            resize: function (force) {

                if (this.textDisplay && this.font) {

                    var sizeX = this.font.widthForString(this.textDisplay);
                    var sizeY = this.font.heightForString(this.textDisplay);

                    if ( this.maxWidth > 0 && sizeX > this.maxWidth ) {

                        this.textDisplay = this.font.multilineForWidth( this.text, this.maxWidth );

                        sizeX = this.font.widthForString(this.textDisplay);
                        sizeY = this.font.heightForString(this.textDisplay);

                    }

                    if ( this.maxHeight > 0 && sizeY > this.maxHeight ) {

                        var textFormatted = this.font.overflowForHeight( this.textDisplay, this.maxHeight );

                        this.textDisplay = textFormatted.display;
                        this.textOverflow = textFormatted.overflow;

                        sizeX = this.font.widthForString(this.textDisplay);
                        sizeY = this.font.heightForString(this.textDisplay);

                    }

                    if (this.size.x !== sizeX) {

                        this.size.x = sizeX;
                        this.totalSizeX = this.getTotalSizeX();
                        force = this.dirtyBuild = true;

                    }

                    if (this.size.y !== sizeY) {

                        this.size.y = sizeY;
                        this.totalSizeY = this.getTotalSizeY();
                        force = this.dirtyBuild = true;

                    }

                }

                return this.parent( force );

            },

            /**
             * @override
             */
            rebuild: function () {

                this.parent();

                // cache text

                if ( this.textDisplay && this.font ) {

                    this.textImage = new ig.ImageDrawing( {
                        width: this.boundsDraw.width * ig.system.scale,
                        height: this.boundsDraw.height * ig.system.scale,
                        ignoreScale: true
                    } );

                    // account for alignment

                    var offsetX;

                    if ( this.textAlign === ig.Font.ALIGN.CENTER ) {

                        offsetX = this.boundsDraw.width * 0.5;

                    }
                    else if ( this.textAlign === ig.Font.ALIGN.CENTER ) {

                        offsetX = this.boundsDraw.width;

                    }
                    else {

                        offsetX = 0;

                    }

                    this.font.draw(
                        this.textDisplay,
                        offsetX, 0,
                        this.textAlign,
                        this.textImage.dataContext
                    );

                }

            },

            /**
             * @override
             **/
            draw: function () {

                this.parent();

                if (this.visible) {

                    if ( this.alpha !== 1 ) {

                        ig.system.context.globalAlpha = this.alpha;

                    }

                    // fixed in screen

                    if (this.fixed) {

                        this.textImage.draw(
                            this.boundsDraw.minX,
                            this.boundsDraw.minY
                        );

                    }
                    // default draw
                    else {

                        this.textImage.draw(
                            this.boundsDraw.minX - ig.game.screen.x,
                            this.boundsDraw.minY - ig.game.screen.y
                        );

                    }

                    if ( this.alpha !== 1 ) {

                        ig.system.context.globalAlpha = 1;

                    }

                }

            }

        });

    });