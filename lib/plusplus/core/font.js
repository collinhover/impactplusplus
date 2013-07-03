ig.module(
        'plusplus.core.font'
    )
    .requires(
        'impact.font',
        'plusplus.core.config'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Improvements and enhancements for Fonts.
         * @class ig.Font
         * @extends ig.Image
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Font.inject( {

            /**
             * Font scale that overrides system scale.
             * <br>- will automatically copy system scale unless is ignoring system scale due to {@link ig.Font#ignoreScale}
             * @type Number
             * @default ig.CONFIG.FONT.SCALE
             */
            scale: _c.FONT.SCALE,

            /**
             * Whether fonts should ignore system scale.
             * @type Boolean
             * @default ig.CONFIG.FONT.IGNORE_SCALE
             */
            ignoreScale: _c.FONT.IGNORE_SCALE,

            /**
             * Inserts newlines (\n) into text where necessary to keep text within width.
             * <br>- this breaks by words at the last space, rather than breaking by char
             * @param text
             * @param width
             * @returns {String} line from text
             */
            multilineForWidth:function( text, width ) {

                var formatted = "";
                var lineWidth = 0;
                var space = " ";
                var empty = "";
                var words = text.split( space );

                // strip out all newlines

                text.replace( "\n", empty );

                for( var i = 0, il = words.length; i < il; i++ ) {

                    var word = words[ i ] + ( i !== il - 1 ? space : empty );
                    var wordWidth = this._widthForLine( word );

                    if ( lineWidth !== 0 && lineWidth + wordWidth > width ) {

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
             * @param text
             * @returns {Object} object with showing and overflowing properties.
             */
            overflowForHeight: function ( text, height ) {

                var display = text;
                var overflow = "";
                var lines = text.split('\n');
                var multilineHeight = lines.length * (this.height + this.lineSpacing);

                if ( this.ignoreScale && this.scale !== ig.system.scale ) {

                    multilineHeight = Math.ceil( multilineHeight * ( this.scale / ig.system.scale ) );

                }

                if ( multilineHeight > height ) {

                    var linesDisplay = Math.floor( lines.length * height / multilineHeight );

                    display = "";

                    for( var i = 0, il = lines.length; i < il; i++ ) {

                        var line = lines[ i ];

                        if ( i < linesDisplay ) {

                            display += line;

                            if ( i < linesDisplay - 1 ) {

                                display += "\n";

                            }

                        }
                        else {

                            overflow += line;

                            if ( i < il - 1 ) {

                                overflow += "\n";

                            }

                        }

                    }

                }

                return { display: display, overflow: overflow };

            },

            /**
             * Gets width in a line of text and accounts for font specific scale
             * @override
             * @private
             */
            _widthForLine: function( text ) {

                var width = this.parent( text );

                if ( this.ignoreScale && this.scale !== ig.system.scale ) {

                    width = Math.ceil( width * ( this.scale / ig.system.scale ) );

                }

                return width;

            },

            /**
             * Gets height in a line of text and accounts for font specific scale.
             * @override
             */
            heightForString: function( text ) {

                var height = this.parent( text );

                if ( this.ignoreScale && this.scale !== ig.system.scale ) {

                    height = Math.ceil( height * ( this.scale / ig.system.scale ) );

                }

                return height;

            },

            /**
             * Draws char and accounts for font specific scale.
             * @override
             * @private
             */
            draw: function( text, x, y, align, context, forMultiline, scaleSystem, scale, scaleMod ) {

                // small optimization for when drawing multiline

                if( !forMultiline ) {

                    if( !this.loaded ) return;

                    context = context || ig.system.context;

                    if( typeof(text) != 'string' ) {
                        text = text.toString();
                    }

                    scaleSystem = ig.system.scale;
                    scale = this.ignoreScale ? this.scale : scaleSystem;
                    scaleMod = scale / scaleSystem;

                    if( text.indexOf('\n') !== -1 ) {

                        var lines = text.split( '\n' );
                        var lineHeight = ( this.height + this.lineSpacing ) * scaleMod;

                        for( var i = 0; i < lines.length; i++ ) {
                            this.draw( lines[i], x, y + i * lineHeight, align, context, true, scaleSystem, scale, scaleMod );
                        }

                        return;

                    }

                }

                if( align == ig.Font.ALIGN.RIGHT || align == ig.Font.ALIGN.CENTER ) {
                    var width = this._widthForLine( text );
                    x -= align == ig.Font.ALIGN.CENTER ? width/2 : width;
                }

                if( this.alpha !== 1 ) {
                    context.globalAlpha = this.alpha;
                }

                for( var i = 0; i < text.length; i++ ) {

                    var c = text.charCodeAt(i) - this.firstChar;

                    x += this._drawChar( c, x, y, context, scaleSystem, scale ) * scaleMod;

                }

                if( this.alpha !== 1 ) {
                    context.globalAlpha = 1;
                }

                ig.Image.drawCount += text.length;

            },

            _drawChar: function( c, targetX, targetY, context, scaleSystem, scale ) {

                var width = this.widthMap[c];
                var height = this.height - 2;
                var drawX = ig.system.getDrawPos(targetX);

                context.drawImage(
                    this.data,
                    this.indices[c] * scaleSystem, 0,
                    width * scaleSystem, height * scaleSystem,
                    drawX, ig.system.getDrawPos(targetY),
                    width * scale, height * scale
                );

                return width + this.letterSpacing;

            }

        } )

    });