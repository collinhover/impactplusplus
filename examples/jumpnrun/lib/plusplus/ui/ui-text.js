ig.module(
        'plusplus.ui.ui-text'
    )
    .requires(
        'impact.font',
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
             * Display in center of screen.
             * @override
             */
            posPct: _utv2.vector(0.5, 0.5),

            /**
             * Align centered.
             * @override
             */
            align: _utv2.vector(0.5, 0.5),

            /**
             * @override
             **/
            resize: function (force) {

                if (this.text) {

                    var font = this.font || ig.game.font;

                    if (font) {

                        var sizeX = font.widthForString(this.text);
                        var sizeY = font.heightForString(this.text);

                        if (this.size.x !== sizeX) {

                            this.size.x = sizeX;
                            this.totalSizeX = this.getTotalSizeX();
                            force = true;

                        }

                        if (this.size.y !== sizeY) {

                            this.size.y = sizeY;
                            this.totalSizeY = this.getTotalSizeY();
                            force = true;

                        }

                    }

                }

                this.parent(force);

            },

            /**
             * @override
             **/
            draw: function () {

                this.parent();

                if (this.visible) {

                    var font = this.font || ig.game.font;

                    if (font && this.text) {

                        var fontAlpha = font.alpha;

                        font.alpha = this.alpha;

                        font.draw(this.text, this.boundsDraw.minX, this.boundsDraw.minY);

                        font.alpha = fontAlpha;

                    }

                }

            }

        });

    });