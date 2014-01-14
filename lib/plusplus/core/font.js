ig.module(
    'plusplus.core.font'
)
    .requires(
        'impact.font',
        'plusplus.core.config',
        'plusplus.core.image'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Improvements and enhancements for Fonts.
         * @class ig.Font
         * @extends ig.Image
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Font.inject({

            /**
             * Scale that overrides system scale when {@link ig.Font#ignoreSystemScale} is true.
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
             * Whether fonts should ignore system scale.
             * <span class="alert"><strong>IMPORTANT:</strong> when true, fonts will not scale dynamically with view and instead will be fixed in size. This is usually ideal.</span>
             * @type Boolean
             * @default ig.CONFIG.FONT.IGNORE_SYSTEM_SCALE
             */
            ignoreSystemScale: _c.FONT.IGNORE_SYSTEM_SCALE,

            /**
             * Inserts newlines (\n) into text where necessary to keep text within width.
             * <br>- this breaks by words at the last space, rather than breaking by char
             * @param {String} text
             * @param {Number} width
             * @returns {String} line from text
             */
            multilineForWidth: function(text, width) {

                text = "" + text;

                var formatted = "";
                var lineWidth = 0;
                var space = " ";
                var empty = "";
                var words = text.split(space);

                // strip out all newlines

                text.replace("\n", empty);

                for (var i = 0, il = words.length; i < il; i++) {

                    var word = words[i] + (i !== il - 1 ? space : empty);
                    var wordWidth = this._widthForLine(word);

                    if (lineWidth !== 0 && lineWidth + wordWidth > width) {

                        formatted += "\n";
                        lineWidth = 0;

                    }

                    formatted += word;
                    lineWidth += wordWidth;

                }

                return formatted;

            },

            /**
             * Splits text into display and overflow based on height.
             * @param {String} text
             * @param {Number} height
             * @returns {Object} object with showing and overflowing properties.
             */
            overflowForHeight: function(text, height) {

                text = "" + text;

                var display = text;
                var overflow = "";
                var lines = text.split('\n');
                var multilineHeight = lines.length * (this.height + this.lineSpacing);

                if (multilineHeight > height) {

                    var linesDisplay = Math.floor(lines.length * height / multilineHeight);

                    display = "";

                    for (var i = 0, il = lines.length; i < il; i++) {

                        var line = lines[i];

                        if (i < linesDisplay) {

                            display += line;

                            if (i < linesDisplay - 1) {

                                display += "\n";

                            }

                        } else {

                            overflow += line;

                            if (i < il - 1) {

                                overflow += "\n";

                            }

                        }

                    }

                }

                return {
                    display: display,
                    overflow: overflow
                };

            },

            /**
             * Draws char and accounts for variable scale. The last parameter is for internal use only!
             * @override
             * @private
             */
            draw: function(text, x, y, align, context, scale, scaleMod, forMultiline) {

                if (!this.loaded) return;

                text = "" + text;

                // small optimization for when drawing multiline

                if (!forMultiline) {

                    context = context || ig.system.context;

                    if (!scale) {

                        if (!this.ignoreSystemScale && this._scale !== ig.system.scale) {

                            this.resize(ig.system.scale);

                        } else if (this._scale !== this.scale) {

                            this.resize(this.scale);

                        }

                        scale = this._scale;

                    }
                    // temporary rescale
                    else {

                        var scaleLast = this.scale;

                        this.resize(scale);

                        this.scale = scaleLast;

                    }

                    if (context === ig.system.context) {

                        scaleMod = scale / ig.system.scale;

                    } else {

                        scaleMod = 1;

                    }

                    if (text.indexOf('\n') !== -1) {

                        var lines = text.split('\n');
                        var lineHeight = (this.height + this.lineSpacing) * scaleMod;

                        // draw each line

                        for (var i = 0, il = lines.length; i < il; i++) {

                            this.draw(lines[i], x, y + i * lineHeight, align, context, scale, scaleMod, true);

                        }

                        return;

                    }

                }

                if (align === ig.Font.ALIGN.CENTER) {

                    x -= this._widthForLine(text) * 0.5;

                } else if (align === ig.Font.ALIGN.RIGHT) {

                    x -= this._widthForLine(text);

                }

                if (this.alpha !== 1) {
                    context.globalAlpha = this.alpha;
                }

                for (var i = 0; i < text.length; i++) {

                    var c = text.charCodeAt(i) - this.firstChar;

                    x += this._drawChar(c, x, y, context, scale) * scaleMod;

                }

                if (this.alpha !== 1) {
                    context.globalAlpha = 1;
                }

                ig.Image.drawCount += text.length;

            },

            _drawChar: function(c, targetX, targetY, context, scale) {

                var width = this.widthMap[c];
                var height = this.height - 2;

                if (context === ig.system.context) {

                    context.drawImage(
                        this.data,
                        this.indices[c] * scale, 0,
                        width * scale, height * scale,
                        ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY),
                        width * scale, height * scale
                    );

                } else {

                    context.drawImage(
                        this.data,
                        this.indices[c] * scale, 0,
                        width * scale, height * scale,
                        targetX * scale, targetY * scale,
                        width * scale, height * scale
                    );

                }

                return width + this.letterSpacing;

            }

        });

        /**
         * Fonts from font paths.
         * @static
         * @readonly
         * @memberof ig.Font
         * @namespace ig.Font.FONTS
         */
        ig.Font.FONTS = {};

        /**
         * Main font.
         * @memberof ig.Font.FONTS
         * @type ig.Font
         **/
        ig.Font.FONTS.MAIN = (_c.FONT.MAIN_PATH ? new ig.Font(_c.FONT.MAIN_PATH) : null);

        /**
         * Alt font.
         * @memberof ig.Font.FONTS
         * @type ig.Font
         **/
        ig.Font.FONTS.ALT = (_c.FONT.ALT_PATH ? new ig.Font(_c.FONT.ALT_PATH) : ig.Font.FONTS.MAIN);

        /**
         * Chat font.
         * @memberof ig.Font.FONTS
         * @type ig.Font
         **/
        ig.Font.FONTS.CHAT = (_c.FONT.CHAT_PATH ? new ig.Font(_c.FONT.CHAT_PATH) : ig.Font.FONTS.MAIN);

    });
