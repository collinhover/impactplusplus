ig.module(
        'plusplus.core.animation'
    ).requires(
        'impact.animation',
        'plusplus.core.image-drawing',
        'plusplus.helpers.signals'
    )
    .defines(function () {
        'use strict';

        /**
         * Fixes and enhancements for animation sheets to intercept bad width/height initialization value.
         * @class ig.AnimationSheet
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AnimationSheet.inject({

            init: function (path, width, height) {

                // intercept bad width/height values

                if (!width || width < 0) {

                    width = this.width;

                }

                if (!height || height < 0) {

                    height = this.height;

                }

                this.parent(path, width, height);

            }

        });

        /**
         * Enhanced animations.
         * <br>- supports textures, i.e. tiling an animation tile across an entity
         * <br>- adds a signal for when animation completes for improved sequencing
         * @class
         * @extends ig.Animation
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AnimationExtended = ig.Animation.extend(/**@lends ig.AnimationExtended.prototype */{

            /**
             * Whether animation should only play once and then stop.
             * @type Boolean
             * @default
             */
            once: false,

            /**
             * Signal dispatched when animation completes.
             * <br>- created on init.
             * @type ig.Signal
             */
            onCompleted: null,

            /**
             * Initializes animation.
             * @param {ig.AnimationSheet} sheet
             * @param {Number} frameTime duration per frame.
             * @param {Array} sequence sequence of frame indices.
             * @param {Boolean} [stop] begin stopped.
             * @param {Boolean} [once] whether to play once.
             * @see ig.Animation.
             **/
            init: function (sheet, frameTime, sequence, stop, once) {

                this.parent(sheet, frameTime, sequence, stop);

                this.once = once || this.once;
                this.onCompleted = new ig.Signal();

            },

            /**
             * @returns total duration of animation.
             **/
            getDuration: function () {

                return this.frameTime * this.sequence.length;

            },

            /**
             * Creates textures from animation that cover entity size.
             * <br>- Adds 'textures' and 'texturedAnimCount' properties to textured entity.
             * <span class="alert"><strong>IMPORTANT:</strong> Textures are cached for performance using off-screen canvases.</span>
             * @param {ig.EntityExtended} entity entity base texture on.
             * @example
             * // entity is 64x64 size
             * entity.size.x = 64;
             * entity.size.y = 64;
             * // animation sheet tiles are 8x8 size
             * entity.animationSheet = new ig.AnimationSheet( "media/animation_sheet.png", 8, 8 );
             * // entity animations should be textured
             * entity.textured = true;
             * // add a new animation (which will be automatically textured across entity)
             * // this would tile the idle animation 8x8 times to create a 64x64 animation
             * entity.addAnim( 'idle', 1, [0] );
             * // or texture a specific animation
             * entity.textured = false;
             * entity.addAnim( 'idle2', 1, [0] );
             * entity.anims.idle2.texturize( entity );
             **/
            texturize: function (entity) {

                // ensure image is loaded

                if (!this.sheet.image.loaded) {

                    this.texturingDeferred = entity;

                    this.sheet.image.onLoaded.addOnce(this._texturizeDeferred, this);

                }
                else {

                    // animation sheet image should be loaded and image.data already resized to system scale
                    // but sheet w/h is unscaled so we need to account for scale

                    var sheetData = this.sheet.image.data;
                    var textureWidth = entity.boundsDraw.width;
                    var textureHeight = entity.boundsDraw.height;
                    var tileWidth = this.sheet.width;
                    var tileHeight = this.sheet.height;

                    // only texture when entity bounds are larger than tile

                    if (tileWidth < textureWidth || tileHeight < textureHeight) {

                        var textureWidthScaled = textureWidth * ig.system.scale;
                        var textureHeightScaled = textureHeight * ig.system.scale;
                        var tileWidthScaled = tileWidth * ig.system.scale;
                        var tileHeightScaled = tileHeight * ig.system.scale;

                        // store texture data in entity because entity animations may reuse frames

                        this.texturing = entity;
                        this.texturing.textures = this.texturing.textures || {};

                        // increment counter to record number of anims using textures

                        this.texturing.texturedAnimsCount = ( this.texturing.texturedAnimsCount || 0 ) + 1;

                        // create pattern for each frame in animation sequence

                        for (var i = 0, il = this.sequence.length; i < il; i++) {

                            var tile = this.sequence[ i ];
                            var texture = this.texturing.textures[ tile ];
                            var sizeMismatch = this.textureWidthScaled !== textureWidthScaled || this.textureHeightScaled !== textureHeightScaled;
                            var recreate;

                            // init texture

                            if (!texture) {

                                texture = this.texturing.textures[ tile ] = new ig.ImageDrawing({
                                    width: textureWidthScaled,
                                    height: textureHeightScaled,
                                    ignoreScale: true
                                });

                                recreate = true;

                            }
                            // resize existing texture
                            else if (sizeMismatch) {

                                texture.setDimensions(textureWidthScaled, textureHeightScaled);

                                recreate = true;

                            }

                            // create texture

                            if (recreate) {

                                // isolate specific frame from sheet

                                var frame = ig.$new('canvas');
                                frame.width = tileWidthScaled;
                                frame.height = tileHeightScaled;
                                var frameContext = frame.getContext('2d');
                                frameContext.drawImage(
                                    sheetData,
                                    -Math.floor(tile * tileWidthScaled) % sheetData.width,
                                    -Math.floor(tile * tileWidthScaled / sheetData.width) * tileHeightScaled
                                );

                                // fill texture with pattern from frame

                                texture.dataContext.fillStyle = texture.dataContext.createPattern(frame, 'repeat');
                                texture.dataContext.fillRect(0, 0, textureWidthScaled, textureHeightScaled);

                            }

                        }

                        this.textureWidth = textureWidth;
                        this.textureHeight = textureHeight;
                        this.textureWidthScaled = textureWidthScaled;
                        this.textureHeightScaled = textureHeightScaled;

                    }

                }

            },

            /**
             * Automatically called when an animation sheet is not yet loaded and an animation attempts to texturize.
             * @private
             */
            _texturizeDeferred: function () {

                this.texturize(this.texturingDeferred);

                this.texturingDeferred = undefined;

            },

            /**
             * Removes textures, clearing all cached textures of this animation.
             */
            detexturize: function () {

                if (this.texturing) {

                    // decrement counter

                    this.texturing.texturedAnimsCount = Math.max(0, this.texturing.texturedAnimsCount - 1);

                    if (!this.texturing.texturedAnimsCount) {

                        this.texturing.textures = undefined;

                    }

                    // clear properties

                    this.sheet.image.onLoaded.remove(this._texturizeDeferred, this);

                    this.texturing = this.textureWidth = this.textureHeight = this.textureWidthScaled = this.textureHeightScaled = this.texturingDeferred = undefined;

                }

            },

            /**
             * Unstops and rewinds animation.
             * @param {Boolean} [once] whether should play only once.
             **/
            playFromStart: function (once) {

                this.stop = false;
                this.rewind(once);

            },

            /**
             * Rewinds animation to start.
             * @param {Boolean} [once] whether should play only once.
             * @see ig.Animation.
             **/
            rewind: function (once) {

                this.once = once;

                return this.parent();

            },

            /**
             * Updates animation.
             * @see ig.Animation.
             **/
            update: function () {

                var loopCountLast = this.loopCount;

                var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
                this.loopCount = Math.floor(frameTotal / this.sequence.length);
                if (this.stop && this.loopCount > 0) {
                    this.frame = this.sequence.length - 1;
                }
                else {
                    this.frame = frameTotal % this.sequence.length;
                }

                // check if completed

                if (this.loopCount > loopCountLast) {

                    if (this.once) {

                        this.once = false;
                        this.stop = true;

                        this.frame = this.sequence.length - 1;

                    }

                    this.onCompleted.dispatch();

                }

                this.tile = this.sequence[ this.frame ];

            },

            /**
             * Draws animation.
             * @see ig.Animation.
             **/
            draw: function (targetX, targetY) {

                // no need to check if animation is on screen
                // entity handles visible check

                if (this.alpha !== 1) {
                    ig.system.context.globalAlpha = this.alpha;
                }

                // texture draw

                if (this.texturing) {

                    var texture = this.texturing.textures[ this.tile ];

                    texture.draw(targetX, targetY);

                }
                // default draw
                else {

                    if (this.angle === 0) {
                        this.sheet.image.drawTile(
                            targetX, targetY,
                            this.tile, this.sheet.width, this.sheet.height,
                            this.flip.x, this.flip.y
                        );
                    }
                    else {
                        ig.system.context.save();
                        ig.system.context.translate(
                            ig.system.getDrawPos(targetX + this.pivot.x),
                            ig.system.getDrawPos(targetY + this.pivot.y)
                        );
                        ig.system.context.rotate(this.angle);
                        this.sheet.image.drawTile(
                            -this.pivot.x, -this.pivot.y,
                            this.tile, this.sheet.width, this.sheet.height,
                            this.flip.x, this.flip.y
                        );
                        ig.system.context.restore();
                    }

                }

                if (this.alpha !== 1) {
                    ig.system.context.globalAlpha = 1;
                }

            }

        });

        /*
         * Overrides and fixes for when in editor.
         */
        if (ig.global.wm) {

            ig.AnimationExtended.inject({

                computeDrawCount: 5,
                computeDrawCountMax: 5,

                draw: function (targetX, targetY) {

                    // recompute textures when size changed

                    if (this.texturing) {

                        if (this.computeDrawCount >= this.computeDrawCountMax) {

                            this.computeDrawCount = 0;
                            this.texturing.recordChanges(true);

                            if (this.textureWidthScaled !== this.texturing.boundsDraw.width * ig.system.scale || this.textureHeightScaled !== this.texturing.boundsDraw.height * ig.system.scale) {

                                this.texturize(this.texturing);

                            }

                        }
                        else {

                            this.computeDrawCount++;

                        }

                    }

                    this.parent(targetX, targetY);

                }

            });

        }

    });