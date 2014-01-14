ig.module(
    'plusplus.core.animation'
).requires(
    'impact.animation',
    'plusplus.core.config',
    'plusplus.core.image',
    'plusplus.core.image-drawing',
    'plusplus.helpers.signals'
)
    .defines(function() {
        'use strict';

        var _c = ig.CONFIG;

        /**
         * Fixes and enhancements for animation sheets to intercept bad width/height initialization value.
         * @class ig.AnimationSheet
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AnimationSheet.inject({

            init: function(path, width, height) {

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
        ig.AnimationExtended = ig.Animation.extend( /**@lends ig.AnimationExtended.prototype */ {

            /**
             * Time in seconds per frame of sequence.
             * @type Number
             * @default
             */
            frameTime: 1,

            /**
             * Sequence of frames.
             * <br>- created on init
             * @type Array
             * @default
             */
            sequence: [],

            /**
             * Pivot location, based on animation sheet.
             * <br>- created on init
             * @type Vector2|Object
             * @default
             */
            pivot: null,

            /**
             * Whether animation should be stopped initially.
             * @type Boolean
             * @default
             */
            stop: false,

            /**
             * Whether animation has changed tiles since last update.
             * @type Boolean
             * @default
             */
            changed: false,

            /**
             * Whether animation should only play once and then stop.
             * @type Boolean
             * @default
             */
            once: false,

            /**
             * Whether animation should play in reverse.
             * @type Boolean
             * @default
             */
            reverse: false,

            /**
             * Entity being textured.
             * @type ig.EntityExtended
             * @readonly
             */
            texturing: null,

            /**
             * Size of textures, usually matching {@link ig.AnimationExtended#texturing} size.
             * @type Number
             * @default
             */
            textureWidth: 0,

            /**
             * Size of textures, usually matching {@link ig.AnimationExtended#texturing} size.
             * @type Number
             * @default
             */
            textureHeight: 0,

            /**
             * Size to offset from entity bounds for casting shadows when {@link ig.EntityExtended#opaque}.
             * <span class="alert alert-info"><strong>Tip:</strong> to set opaque offsets per animation, use {@link ig.AnimationExtended#opaqueOffset}</span>
             * @type Object
             * @example
             * // by default, shadow casting uses
             * // entity's opaque offsets
             * entity.opaqueOffset = {
             *      left: 0,
             *      right: 0,
             *      top: 0,
             *      bottom: 0
             * };
             * // unless the entity's current animation
             * // has its own opaque offsets
             * entity.currentAnim.opaqueOffset = {
             *      left: 0,
             *      right: 0,
             *      top: 0,
             *      bottom: 0
             * };
             * // opaque offsets can also be done per tile
             * entity.currentAnim.opaqueOffset = {
             *      tiles: {
             *         1: {
             *              left: 0,
             *              right: 0,
             *              top: 0,
             *              bottom: 0
             *          },
             *          2: {...}
             *      }
             * };
             */
            opaqueOffset: null,

            /**
             * Signal dispatched when animation completes.
             * <br>- created on init.
             * @type ig.Signal
             */
            onCompleted: null,

            // internal properties, do not modify

            _texturingDeferred: false,

            /**
             * Initializes animation.
             * @param {ig.AnimationSheet} sheet
             * @param {Object} [settings] settings based on animation properties
             * @see ig.Animation.
             **/
            init: function(sheet, settings) {

                this.sheet = sheet;
                this.pivot = {
                    x: sheet.width * 0.5,
                    y: sheet.height * 0.5
                };

                ig.merge(this, settings);

                this.tile = this.sequence[0];

                this.timer = new ig.Timer();
                this.onCompleted = new ig.Signal();

            },

            /**
             * @returns {Number} total duration of animation.
             **/
            getDuration: function() {

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
             * // add some animations
             * entity.addAnim( 'idle', 1, [0] );
             * // entity animations should be textured
             * entity.textured = true;
             * // on next draw call
             * // textures will be created
             * // and cached
             **/
            texturize: function(entity) {

                // ensure image is loaded

                if (!this.sheet.image.loaded) {

                    this._texturingDeferred = entity;

                    this.sheet.image.onLoaded.remove(this._texturizeDeferred, this);
                    this.sheet.image.onLoaded.addOnce(this._texturizeDeferred, this);

                } else {

                    var sheetData = (this.sheet.image.scaleCache && this.sheet.image.scaleCache.x1) || this.sheet.image.data;
                    var textureWidth = entity.getSizeDrawX();
                    var textureHeight = entity.getSizeDrawY();
                    var tileWidth = this.sheet.width;
                    var tileHeight = this.sheet.height;
                    var sizeMismatch = this.textureWidth !== textureWidth || this.textureHeight !== textureHeight;

                    // only texture when entity bounds are larger than tile

                    if (tileWidth < textureWidth || tileHeight < textureHeight) {

                        // store texture data in entity because entity animations may reuse frames

                        this.texturing = entity;
                        this.texturing.textures = this.texturing.textures || {};

                        // increment counter to record number of anims using textures

                        this.texturing.texturedAnimsCount = (this.texturing.texturedAnimsCount || 0) + 1;

                        // create pattern for each frame in animation sequence

                        for (var i = 0, il = this.sequence.length; i < il; i++) {

                            var tile = this.sequence[i];
                            var texture = this.texturing.textures[tile];
                            var recreate;

                            // init texture

                            if (!texture) {

                                texture = this.texturing.textures[tile] = new ig.ImageDrawing({
                                    width: textureWidth,
                                    height: textureHeight
                                });

                                recreate = true;

                            }
                            // resize existing texture
                            else if (sizeMismatch) {

                                texture.setDimensions(textureWidth, textureHeight);

                                recreate = true;

                            }

                            // create texture

                            if (recreate) {

                                // isolate specific frame from sheet

                                var frame = ig.$new('canvas');
                                frame.width = tileWidth;
                                frame.height = tileHeight;
                                frame.style.width = tileWidth + "px";
                                frame.style.height = tileHeight + "px";
                                frame.retinaResolutionEnabled = false;
                                var frameContext = frame.getContext('2d');
                                ig.System.scaleMode(frame, frameContext);

                                frameContext.drawImage(
                                    sheetData, -Math.floor(tile * tileWidth) % sheetData.width, -Math.floor(tile * tileHeight / sheetData.width) * tileHeight
                                );

                                // fill texture with pattern from frame

                                texture.dataContext.fillStyle = texture.dataContext.createPattern(frame, 'repeat');
                                texture.dataContext.fillRect(0, 0, textureWidth, textureHeight);
                                texture.finalize();

                            }

                        }

                        this.textureWidth = textureWidth;
                        this.textureHeight = textureHeight;

                    }

                }

            },

            /**
             * Automatically called when an animation sheet is not yet loaded and an animation attempts to texturize.
             * @private
             */
            _texturizeDeferred: function() {

                this.texturize(this._texturingDeferred);

                this._texturingDeferred = undefined;

            },

            /**
             * Removes textures, clearing all cached textures of this animation.
             */
            detexturize: function() {

                if (this.texturing) {

                    // decrement counter

                    this.texturing.texturedAnimsCount = Math.max(0, this.texturing.texturedAnimsCount - 1);

                    if (!this.texturing.texturedAnimsCount) {

                        this.texturing.textures = undefined;

                    }

                    // clear properties

                    this.sheet.image.onLoaded.remove(this._texturizeDeferred, this);

                    this.texturing = this.textureWidth = this.textureHeight = this._texturingDeferred = undefined;

                }

            },

            /**
             * Unstops and rewinds animation.
             * @param {Boolean} [once] whether should play only once.
             * @param {Boolean} [reverse] whether should play in reverse.
             **/
            playFromStart: function(once, reverse) {

                this.stop = false;
                this.rewind(once, reverse);

            },

            /**
             * Rewinds animation to start.
             * @param {Boolean} [once] whether should play only once.
             * @param {Boolean} [reverse] whether should play in reverse.
             * @see ig.Animation.
             **/
            rewind: function(once, reverse) {

                this.once = typeof once !== 'undefined' ? once : this.once;
                this.reverse = typeof reverse !== 'undefined' ? reverse : this.reverse;

                return this.parent();

            },

            /**
             * Moves animation to a frame.
             * @param {Number} f frame number
             * @override
             */
            gotoFrame: function(f) {

                var stopped = this.stop;
                this.stop = false;

                this.parent(f);

                this.stop = stopped;

            },

            /**
             * Updates animation.
             * @see ig.Animation.
             **/
            update: function() {

                if (!this.stop) {

                    var loopCount = this.loopCount;
                    var numFrames = this.sequence.length;
                    var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
                    this.loopCount = Math.floor(frameTotal / numFrames);

                    if (this.reverse) {

                        this.frame = (this.sequence.length - 1) - (frameTotal % numFrames);

                    } else {

                        this.frame = frameTotal % numFrames;

                    }

                    // check if completed

                    if (this.loopCount > loopCount) {

                        if (this.once) {

                            this.once = false;
                            this.stop = true;

                            this.frame = numFrames - 1;

                        }

                        this.onCompleted.dispatch();

                    }

                    var tile = this.tile;
                    this.tile = this.sequence[this.frame];

                    if (numFrames > 1 && this.tile !== tile) {

                        this.changed = true;

                    } else {

                        this.changed = false;

                    }

                }

            },

            /**
             * Draws animation, accounting for scale and texturing target.
             * @param {Number} targetX
             * @param {Number} targetY
             * @param {Number} [scale=1] scale to draw at
             * @param {ig.EntityExtended} [texturing] optional entity to texture animation over.
             * @override
             */
            draw: function(targetX, targetY, scale, texturing) {

                // no need to check if animation is on screen
                // entity handles visible check

                if (this.alpha !== 1) {
                    ig.system.context.globalAlpha = this.alpha;
                }

                // texture draw

                texturing = texturing || this.texturing;

                if (texturing) {

                    if (this.texturing !== texturing || this.textureWidth !== this.texturing.sizeDraw.x || this.textureHeight !== this.texturing.sizeDraw.y) {

                        this.texturize(texturing);

                    }

                    var texture = this.texturing && this.texturing.textures && this.texturing.textures[this.tile];

                    if (texture) {

                        texture.draw(targetX, targetY, undefined, undefined, undefined, undefined, scale);

                    } else {

                        return this.draw(targetX, targetY, scale);

                    }

                }
                // default draw
                else {

                    if (this.angle === 0) {

                        this.sheet.image.drawTile(
                            targetX, targetY,
                            this.tile, this.sheet.width, this.sheet.height,
                            this.flip.x, this.flip.y, scale
                        );

                    } else {

                        ig.system.context.save();

                        ig.system.context.translate(
                            ig.system.getDrawPos(targetX + this.pivot.x),
                            ig.system.getDrawPos(targetY + this.pivot.y)
                        );

                        ig.system.context.rotate(this.angle);

                        this.sheet.image.drawTile(-this.pivot.x, -this.pivot.y,
                            this.tile, this.sheet.width, this.sheet.height,
                            this.flip.x, this.flip.y, scale
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

                draw: function(targetX, targetY) {

                    // recompute textures when size changed

                    if (this.texturing) {

                        if (this.computeDrawCount >= this.computeDrawCountMax) {

                            this.computeDrawCount = 0;
                            this.texturing.recordChanges(true);

                            if (this.textureWidth * ig.system.scale !== this.texturing.getSizeDrawX() * ig.system.scale || this.textureHeight * ig.system.scale !== this.texturing.getSizeDrawY() * ig.system.scale) {

                                this.texturize(this.texturing);

                            }

                        } else {

                            this.computeDrawCount++;

                        }

                    }

                    this.parent(targetX, targetY);

                }

            });

        }

    });
