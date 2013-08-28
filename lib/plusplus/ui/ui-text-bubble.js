ig.module(
        'plusplus.ui.ui-text-bubble'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.ui.ui-overlay',
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.utilsdraw',
        'plusplus.helpers.utilsintersection'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;
        var _utd = ig.utilsdraw;

        /**
         * UI overlay to be used for displaying text in a decorative bubble.
         * @class
         * @extends ig.UIOverlay
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.UITextBubble = ig.global.UITextBubble = ig.UIOverlay.extend(/**@lends ig.UITextBubble.prototype */{

            /**
             * @override
             * @default see ig.CONFIG.TEXT_BUBBLE.SIZE
             */
            size: _utv2.vector( _c.TEXT_BUBBLE.SIZE_X, _c.TEXT_BUBBLE.SIZE_Y ),

            /**
             * @override
             * @default see ig.CONFIG.TEXT_BUBBLE.SIZE_AS_PCT
             */
            sizeAsPct: _c.TEXT_BUBBLE.SIZE_AS_PCT,

            /**
             * @override
             * @default see ig.CONFIG.TEXT_BUBBLE.SIZE_PCT
             */
            sizePct: _utv2.vector( _c.TEXT_BUBBLE.SIZE_PCT_X, _c.TEXT_BUBBLE.SIZE_PCT_Y ),

            /**
             * @override
             * @default see ig.CONFIG.TEXT_BUBBLE.CORNER_RADIUS
             */
            cornerRadius: _c.TEXT_BUBBLE.CORNER_RADIUS,

            /**
             * @override
             * @default see ig.CONFIG.TEXT_BUBBLE.CORNER_RADIUS_AS_PCT
             */
            cornerRadiusAsPct: _c.TEXT_BUBBLE.CORNER_RADIUS_AS_PCT,

            /**
             * @override
             * @default ig.CONFIG.TEXT_BUBBLE.R
             */
            r: _c.TEXT_BUBBLE.R,

            /**
             * @override
             * @default ig.CONFIG.TEXT_BUBBLE.G
             */
            g: _c.TEXT_BUBBLE.G,

            /**
             * @override
             * @default ig.CONFIG.TEXT_BUBBLE.B
             */
            b: _c.TEXT_BUBBLE.B,

            /**
             * @override
             * @default ig.CONFIG.TEXT_BUBBLE.ALPHA
             */
            alpha: _c.TEXT_BUBBLE.ALPHA,

            /**
             * @override
             * @default ig.CONFIG.TEXT_BUBBLE.PIXEL_PERFECT
             */
            pixelPerfect: _c.TEXT_BUBBLE.PIXEL_PERFECT,

            /**
             * Whether to shrink size if text is smaller than this.
             * <span class="alert"><strong>IMPORTANT:</strong> this will not allow the bubble to expand beyond its normal size!</span>
             * @type Boolean
             * @default see ig.CONFIG.TEXT_BUBBLE.SHRINK_TO_TEXT
             */
            shrinkToText: _c.TEXT_BUBBLE.SHRINK_TO_TEXT,

            /**
             * Length of triangle pointing from bubble to speaker in px.
             * @type Number
             * @default ig.CONFIG.TEXT_BUBBLE.TRIANGLE_LENGTH
             */
            triangleLength: _c.TEXT_BUBBLE.TRIANGLE_LENGTH,

            /**
             * Width of triangle pointing from bubble to speaker in px.
             * @type Number
             * @default ig.CONFIG.TEXT_BUBBLE.TRIANGLE_WIDTH
             */
            triangleWidth: _c.TEXT_BUBBLE.TRIANGLE_WIDTH,

            /**
             * Padding on the inside of text bubble to keep text spaced away from sides.
             * @type Vector2|Object
             * @default ig.CONFIG.TEXT_BUBBLE.PADDING
             */
            padding: _utv2.vector( _c.TEXT_BUBBLE.PADDING_X, _c.TEXT_BUBBLE.PADDING_Y ),

            /**
             * @override
             */
            resetExtras: function () {

                if ( this.textSettings ) {

                    this.textSettings.font = this.textSettings.font || ig.game.fontChat;

                    // align text based on padding

                    this.textSettings.margin = _utv2.vector( 0, this.padding.y - this.triangleLength );
                    this.textSettings.marginAsPct = false;

                }

                this.textMoveToSettings = ig.merge( this.textMoveToSettings, {
                    offset: _utv2.vector( 0, this.padding.y - this.triangleLength )
                });

                // record base size

                if ( !this.sizeAsPct ) {

                    this.resetState.size = this.resetState.size || _utv2.vector();
                    _utv2.copy(this.resetState.size, this.size);

                }

                this.parent();

            },

            /**
             * @override
             **/
            recordResetState: function () {

                this.parent();

                this.resetState.size = this.resetState.size || _utv2.vector();
                _utv2.copy(this.resetState.size, this.size);

                this.resetState.sizePct = this.resetState.sizePct || _utv2.vector();
                _utv2.copy(this.resetState.sizePct, this.sizePct);

            },

            /**
             * @override
             */
            refresh: function (force) {

                // reset size to base

                if ( !this.sizeAsPct ) {

                    _utv2.copy(this.size, this.resetState.size);

                }

                // refresh message

                if ( this.message && this.message.added && this.added ) {

                    this.message.maxWidth = this.message.maxHeight = 0;

                    this.message.resize( force );

                }

                this.parent( force );

            },

            /**
             * @override
             */
            resize: function ( force ) {

                var force = this.parent( force );

                // text resize and spacing

                if ( this.message ) {

                    var sizeX = this.getSizeDrawX() - this.padding.x * 2;
                    var sizeY = this.getSizeDrawY() - this.padding.y * 2 - this.triangleLength;
                    var scaleMod = this.message.scale / this.scale;
                    var messageSizeX = this.message.getSizeDrawX() * scaleMod;

                    // resize text to fit inside bubble

                    if ( messageSizeX > sizeX ) {

                        this.message.maxWidth = sizeX * ( 1 / scaleMod );

                        this.message.resize( true );
                        messageSizeX = this.message.getSizeDrawX() * scaleMod;

                    }

                    var messageSizeY = this.message.getSizeDrawY() * scaleMod;

                    // crop text if overflowing

                    if ( messageSizeY > sizeY ) {

                        this.message.maxHeight = sizeY * ( 1 / scaleMod );

                        this.message.resize( true );
                        messageSizeY = this.message.getSizeDrawY() * scaleMod;

                    }

                    // resize bubble to shrink around text

                    if ( this.shrinkToText ) {

                        if ( messageSizeX < sizeX ) {

                            this.size.x = messageSizeX + this.padding.x * 2;
                            force = this.needsRebuild = true;

                        }

                        if ( messageSizeY < sizeY ) {

                            this.size.y = messageSizeY + this.padding.y * 2 + this.triangleLength;
                            force = this.needsRebuild = true;

                        }

                    }

                }

                return force;

            },

            /**
             * @override
             */
            refill: function () {

                // triangle

                if ( this.fill && this.triangleLength > 0 ) {

                    // override size to account for triangle
					
					var triangleLength = this.triangleLength;
					var triangleWidth = this.triangleWidth;
                    var width = this.sizeDraw.x;
                    var height = this.sizeDraw.y - triangleLength;

                    this.parent( width, height );
					
					if ( !this.pixelPerfect ) {
						
						width *= this.scale;
						height *= this.scale;
						triangleLength *= this.scale;
						triangleWidth *= this.scale;
						
					}

                    // calculate triangle

                    var vertices = [
                        { x: width * 0.5 - triangleWidth * 0.5, y: height },
                        { x: width * 0.5 + triangleWidth * 0.5, y: height },
                        { x: width * 0.5, y: height + triangleLength }
                    ];

                    var context = this.fill.dataContext;
					
                    if ( this.pixelPerfect ) {

                        _utd.pixelFillPolygon(
                            context,
                            0, 0, this.fill.width, this.fill.height,
                            vertices,
                            this.r, this.g, this.b, this.alpha
                        );

                    }
                    else {

                        context.fillStyle = this.getFillStyle();
                        _utd.fillPolygon( context, vertices );

                    }

                }
                // default draw
                else {

                    this.parent();

                }

            }

        });

    });