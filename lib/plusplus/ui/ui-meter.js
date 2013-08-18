ig.module(
        'plusplus.ui.ui-meter'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-element',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _utm = ig.utilsmath;
        var _utv2 = ig.utilsvector2;

        /**
         * UI element for recording the value of a property.
		 * <span class="alert alert-info"><strong>Tip:</strong> Impact++ UIElements are meant to be used for simple user interfaces. If you need something complex, it is recommended that you use the DOM!</span>
         * @class
         * @extends ig.UIElement
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // it is easy to create a basic health meter
         * ig.UIMeterHealth = ig.UIMeter.extend({
         *      // set the fill to a red color
         *      fillStyle: 'rgb(255,54,90)',
         *      // give it a 2% margin so it isn't smooshed against the screen edge
         *      // ui elements have a default position of top left
         *      margin: { x: 0.02, y: 0.02 },
         *      // we can also add animations to the meter
         *      animSheet: new ig.AnimationSheet( 'media/icons_stats.png', 8, 8 ),
         *      // set the base size of our animated area (not the bar)
         *      // the bar has a default size based on {@link ig.CONFIG.ENTITY.SIZE_X} and {@link ig.CONFIG.ENTITY.SIZE_Y}
         *      size: { x: 8, y: 8 },
         *      // and automatically create idle animation from the sheet
         *      animSettings: true
         * });
         * // then spawn an instance of the ig.UIMeterHealth when the player is added to the game
         * // and update the meter's value whenever the player takes damage or is healed
         */
        ig.UIMeter = ig.global.UIMeter = ig.UIElement.extend(/**@lends ig.UIMeter.prototype */{

            // editor properties

            _wmScalable: true,

            /**
             * Value of meter, between 0 and 1.
             * <span class="alert alert-info"><strong>Tip:</strong> value also affects the frame of current animation.</span>
             * @type Number
             * @default
             */
            value: 1,

            /**
             * Percent per frame with which to move current value to new value, between 0 and 1.
             * @type Number
             * @default
             */
            lerp: 0.1,

            /**
             * Whether bar is vertical instead of horizontal.
             * @type Boolean
             * @default
             */
            vertical: false,

            /**
             * Whether to draw a dynamic bar.
             * <br>- because animations are also drawn, this is sometimes unnecessary
             * @type Boolean
             * @default
             */
            bar: true,

            /**
             * Base size of bar, before scaling.
             * @type Vector2
             * @see ig.CONFIG.ENTITY.SIZE_X * 2
             * @see ig.CONFIG.ENTITY.SIZE_Y * 0.25
             */
            barSize: _utv2.vector( _c.ENTITY.SIZE_X * 2, Math.round( _c.ENTITY.SIZE_Y * 0.25 )),

            /**
             * Space between bar and animation.
             * @type Number
             * @default
             */
            barAnimSpacing: 1,

            /**
             * Bar fill style (color, pattern, etc).
             * @type String
             * @default
             */
            fillStyle: 'rgb(255,255,255)',

            /**
             * Bar background fill style (color, pattern, etc).
             * <br>- set value to '' (empty) for no background
             * @type String
             * @default
             */
            backgroundStyle: 'rgb(50,50,50)',

            /**
             * Bar border width.
             * <br>- set to 0 for no border
             * @type Number
             * @default
             */
            borderWidth: 1,

            /**
             * Space between bar border and fill.
             * @type Number
             * @default
             */
            borderSpacing: 1,

            /**
             * Bar border style (color, pattern, etc).
             * @type String
             * @default {@link ig.UIMeter#fillStyle}
             */
            borderStyle: '',

            /**
             * Total width of bar.
             * @type Number
             * @readonly
             */
            barTotalWidth: 0,

            /**
             * Total height of bar.
             * @type Number
             * @readonly
             */
            barTotalHeight: 0,

            // internal properties, do not modify

            _valueTarget: 1,
            _borderOffset: 0,
            _borderExtra: 0,

            /**
             * @override
             **/
            resetExtras: function () {

                // dynamic bar

                if (this.bar) {

                    if ( !this.fill ) {

                        this.fill = new ig.ImageDrawing();

                    }

                    if (this.backgroundStyle) {

                        if ( !this.background ) {

                            this.background = new ig.ImageDrawing();

                        }

                    }
                    else {

                        this.background = null;

                    }

                    if (this.borderWidth) {

                        if ( !this.border ) {

                            this.border = new ig.ImageDrawing();

                        }

                    }
                    else {

                        this.border = null;

                    }

                }
                else {

                    this.fill = this.background = this.border = null;

                }

                this._valueTarget = this.value;

                this.parent();

            },

            /**
             * @override
             **/
            recordResetState: function () {

                this.parent();

                this.resetState.size = this.resetState.size || _utv2.vector();
                _utv2.copy(this.resetState.size, this.size);

            },

            /**
             * @override
             */
            resize: function (force) {

                // create dynamic bar

                if (this.bar) {

                    var barTotalWidth = this.barTotalWidth;
                    var barTotalHeight = this.barTotalHeight;

                    this.barTotalWidth = this.barSize.x;
                    this.barTotalHeight = this.barSize.y;

                    if (this.borderWidth) {

                        this._borderExtra = this.borderWidth + this.borderSpacing;

                        this.barTotalWidth += this._borderExtra * 2;
                        this.barTotalHeight += this._borderExtra * 2;

                        // try to avoid subpixel blur

                        if (this.borderWidth % 2 === 0) {

                            this._borderOffset = 0.5;

                        }

                    }

                    if ( this.barTotalWidth !== barTotalWidth ) {

                        force = this.needsRebuild = true;

                    }

                    if ( this.barTotalHeight !== barTotalHeight ) {

                        force = this.needsRebuild = true;

                    }

                    // recalculate size

                    if ( this.vertical ) {

                        this.size.y = this.resetState.size.y + this.barTotalHeight;

                        if ( this.animSheet || this.animSheetPath ) {

                            this.size.y += this.barAnimSpacing;

                        }

                    }
                    else {

                        this.size.x = this.resetState.size.x + this.barTotalWidth;

                        if ( this.animSheet || this.animSheetPath ) {

                            this.size.x += this.barAnimSpacing;

                        }

                    }

                }

                return this.parent(force);

            },

            /**
             * @override
             */
            rebuild: function () {

                if (this.bar) {

                    this.fill.setDimensions( this.barSize.x, this.barSize.y );
                    this.fill.dataContext.fillStyle = this.fillStyle;
                    this.fill.dataContext.fillRect(0, 0, this.barSize.x, this.barSize.y);
                    this.fill.finalize();

                    if (this.background) {

                        this.background.setDimensions(this.barSize.x, this.barSize.y);
                        this.background.dataContext.fillStyle = this.backgroundStyle;
                        this.background.dataContext.fillRect(0, 0, this.barSize.x, this.barSize.y);
                        this.background.finalize();

                    }

                    if (this.border) {

                        this.border.setDimensions( this.barTotalWidth, this.barTotalHeight );
                        this.border.dataContext.strokeStyle = this.borderStyle || this.fillStyle;
                        this.border.dataContext.strokeRect(this.borderWidth * 0.5 + this._borderOffset, this.borderWidth * 0.5 + this._borderOffset, this.barTotalWidth - this.borderWidth - this._borderOffset * 2, this.barTotalHeight - this.borderWidth - this._borderOffset * 2);
                        this.border.finalize();

                    }

                }

                this.parent();

            },

            /**
             * Updates meter to match value.
             * @param value value of meter between 0 and 1
             **/
            setValue: function (value) {

                if (this._valueTarget !== value) {

                    this._valueTarget = value.limit(0, 1);

                }

            },

            /**
             * Draws meter animation and dynamic bar after updating value.
             * <span class="alert alert-info"><strong>Tip:</strong> value also affects the frame of current animation.</span>
             * @override
             **/
            draw: function () {

                if (this.visible) {

                    // shift value

                    if (this.value !== this._valueTarget) {

                        var dv = this._valueTarget - this.value;
                        this.value += dv * this.lerp;

                        // check if value is close enough to target

                        if (_utm.almostEqual(dv, 0, _c.PRECISION_ZERO)) {

                            this.value = this._valueTarget;

                        }

                        // update animation

                        if (this.currentAnim) {

                            var frame = Math.floor(this.currentAnim.sequence.length * this.value);

                            if (this.currentAnim.frame !== frame) {

                                this.currentAnim.gotoFrame(frame);

                            }

                        }

                    }

                    // default draw

                    this.parent();

                    // dynamic draw

                    if (this.bar) {

                        var barSizeX = this.barSize.x;
                        var barSizeY = this.barSize.y;
                        var extraX = 0;
                        var extraY = 0;
                        var valueSizeX;
                        var valueSizeY;
                        var offsetSizeX;
                        var offsetSizeY;
                        var invValueSizeX;
                        var invValueSizeY;
                        var srcOriginX;
                        var srcOriginY;

                        // vertical vs horizontal values

                        if (this.vertical) {

                            extraX += ( this.sizeDraw.x - this.barTotalWidth ) * 0.5;

                            valueSizeX = invValueSizeX = barSizeX;
                            valueSizeY = srcOriginY = offsetSizeY = barSizeY * this.value;
                            invValueSizeY = barSizeY - valueSizeY;
                            offsetSizeX = srcOriginX = 0;

                            offsetSizeY *= this.scaleMod;

                            if (this.animSheet) {

                                extraY += this.barAnimSpacing + this.animSheet.height;

                            }

                        }
                        else {

                            extraY += ( this.sizeDraw.y - this.barTotalHeight ) * 0.5;

                            valueSizeX = srcOriginX = offsetSizeX = barSizeX * this.value;
                            valueSizeY = invValueSizeY = barSizeY;
                            invValueSizeX = barSizeX - valueSizeX;
                            offsetSizeY = srcOriginY = 0;

                            offsetSizeX *= this.scaleMod;

                            if (this.animSheet) {

                                extraX += this.barAnimSpacing + this.animSheet.width;

                            }

                        }

                        extraX *= this.scaleMod;
                        extraY *= this.scaleMod;

                        // fixed in screen

                        if (this.fixed) {

                            // draw border

                            if (this.borderWidth > 0) {

                                this.border.draw(
                                    this.posDraw.x + extraX,
                                    this.posDraw.y + extraY,
                                    undefined, undefined, undefined, undefined,
                                    this.scale
                                );

                                // add border to extra

                                extraX += this._borderExtra * this.scaleMod;
                                extraY += this._borderExtra * this.scaleMod;

                            }

                            // draw portion of background that is showing

                            if (this.value < 1 && this.backgroundStyle) {

                                this.background.draw(
                                    this.posDraw.x + offsetSizeX + extraX,
                                    this.posDraw.y + offsetSizeY + extraY,
                                    srcOriginX, srcOriginY,
                                    invValueSizeX,
                                    invValueSizeY,
                                    this.scale
                                );

                            }

                            // draw fill

                            this.fill.draw(
                                this.posDraw.x + extraX,
                                this.posDraw.y + extraY,
                                0, 0,
                                valueSizeX,
                                valueSizeY,
                                this.scale
                            );

                        }
                        // default draw
                        else {

                            // draw border

                            if (this.borderWidth > 0) {

                                this.border.draw(
                                    this.posDraw.x + extraX - ig.game.screen.x,
                                    this.posDraw.y + extraY - ig.game.screen.y,
                                    undefined, undefined, undefined, undefined,
                                    this.scale
                                );

                                // add border to extra

                                extraX += this._borderExtra;
                                extraY += this._borderExtra;

                            }

                            // draw portion of background that is showing

                            if (this.value < 1 && this.backgroundStyle) {

                                this.background.draw(
                                    this.posDraw.x + offsetSizeX + extraX - ig.game.screen.x,
                                    this.posDraw.y + offsetSizeY + extraY - ig.game.screen.y,
                                    srcOriginX, srcOriginY,
                                    invValueSizeX,
                                    invValueSizeY,
                                    this.scale
                                );

                            }

                            // draw fill

                            this.fill.draw(
                                this.posDraw.x + extraX - ig.game.screen.x,
                                this.posDraw.y + extraY - ig.game.screen.y,
                                0, 0,
                                valueSizeX,
                                valueSizeY,
                                this.scale
                            );

                        }

                    }

                }

            }

        });

    });