ig.module(
    'plusplus.core.image'
).requires(
    'impact.image',
    'plusplus.helpers.signals'
)
    .defines(function() {
        'use strict';

        /**
         * Fixes and enhancements for images.
         * @class ig.Image
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Image.inject( /**@lends ig.Image.prototype */ {

            /**
             * Width of unscaled drawing.
             * @type Number
             * @default
             */
            width: 1,

            /**
             * Height of unscaled drawing.
             * @type Number
             * @default
             */
            height: 1,

            /**
             * Current image data after resizing.
             * <br>- created on load and recreated on each resize
             * @type Canvas
             */
            data: null,

            /**
             * Context of Current image data after resizing.
             * <br>- created on load and recreated on each resize
             * @type CanvasRenderingContext2D
             */
            dataContext: null,

            /**
             * Width of current image.
             * <br>- this value is set calculated based on {@link ig.ImageDrawing#width} and {@link ig.ImageDrawing#scale}
             * @type Number
             */
            dataWidth: 1,

            /**
             * Height of current image.
             * <br>- this value is set calculated based on {@link ig.ImageDrawing#height} and {@link ig.ImageDrawing#scale}
             * @type Number
             */
            dataHeight: 1,

            /**
             * Scale of current image.
             * <br>- will automatically copy system scale unless is ignoring system scale due to {@link ig.ImageDrawing#ignoreSystemScale}
             * @type Number
             * @default
             */
            scale: 1,

            /**
             * Scale of system scale.
             * @type Number
             * @default
             */
            scaleOfSystemScale: 1,

            /**
             * Minimum value of {@link ig.Image#scale}.
             * @type Number
             * @default
             */
            scaleMin: 1,

            /**
             * Maximum value of {@link ig.Image#scale}.
             * @type Number
             * @default
             */
            scaleMax: Infinity,

            /**
             * If image should ignore system scale.
             * <span class="alert alert-info"><strong>Tip:</strong> because pixel perfect scaling is so performance intensive, try to ignore scale whenever possible.</span>
             * @type Boolean
             * @default
             */
            ignoreSystemScale: false,

            /**
             * Whether image should retain copies of data when scale is not 1.
             * <span class="alert alert-info"><strong>Tip:</strong> this is best used when an image is used by multiple entities requesting drawing at different scales.</span>
             * @type Boolean
             * @default
             */
            retainScaledData: true,

            /**
             * Copies of data at various scales.
             * <br>- created on init.
             * <span class="alert alert-info"><strong>Tip:</strong> data is mapped by scale, and 1 always refers to the original image data.</span>
             * @type Object
             * @default
             */
            scaleCache: null,

            /**
             * Signal dispatched when image finishes loading.
             * <br>- created on init.
             * @type ig.Signal
             */
            onLoaded: null,

            // internal properties, do not modify

            _scale: 0,

            /**
             * Initializes image and begins loading path.
             * @param {Object} settings settings object.
             * @override
             */
            init: function(path, settings) {

                ig.merge(this, settings);

                this.onLoaded = new ig.Signal();
                this.scaleCache = {};

                this.parent(path);

            },

            /**
             * @override
             */
            onload: function(event) {

                this.width = Math.max(this.data.width | 0, 1);
                this.height = Math.max(this.data.height | 0, 1);
                this.loaded = true;

                // store original image data at 1 scale
                // resize is skipped to save on performance
                // as resize will be done based on draw call

                var original = ig.$new('canvas');
                original.width = this.width;
                original.height = this.height;
                original.style.width = this.width + "px";
                original.style.height = this.height + "px";
                original.retinaResolutionEnabled = false;
                var originalContext = original.getContext('2d');
                ig.System.scaleMode(original, originalContext);
                originalContext.drawImage(this.data, 0, 0);

                this.data = original;
                this.dataContext = this.data.getContext('2d');
                this.dataWidth = this.data.width;
                this.dataHeight = this.data.height;

                if (!this.scaleCache) {

                    this.scaleCache = {};

                }

                this.scaleCache.x1 = this.data;

                if (this.loadCallback) {
                    this.loadCallback(this.path, true);
                }

                if (this.onLoaded) {

                    this.onLoaded.dispatch(this);
                    this.onLoaded.removeAll();
                    this.onLoaded.forget();

                }

                // image is loaded after game has started
                // force global resize on next update

                if (!ig.global.wm && ig.game && !ig.game._gameNeedsSetup) {

                    ig.game.resizeDeferred(true);
                }

            },

            /**
             * @override
             */
            resize: function(scale) {

                // the original image is copied into another canvas with the new size.
                // the scaled canvas becomes the image (data) of this object.

                var origData = this.scaleCache.x1;

                if (origData && scale) {

                    scale = Math.min(Math.max(Math.round(scale * this.scaleOfSystemScale), this.scaleMin), this.scaleMax);

                    if (this._scale !== scale) {

                        // store scale so we know when system was resized

                        this.scale = this._scale = scale;

                        // do we already have scaled data?

                        if (!this.scaleCache) {

                            this.scaleCache = {};

                        }

                        this.data = this.scaleCache["x" + scale];

                        if (this.data) {

                            this.dataContext = this.data.getContext('2d');
                            this.dataWidth = this.data.width;
                            this.dataHeight = this.data.height;

                        } else {

                            var origPixels = ig.getImagePixels(origData, 0, 0, this.width, this.height);
                            var widthScaled = (this.width * scale) | 0;
                            var heightScaled = (this.height * scale) | 0;
                            var scaled = this.data = ig.$new('canvas');
                            scaled.width = widthScaled;
                            scaled.height = heightScaled;
                            scaled.style.width = widthScaled + "px";
                            scaled.style.height = heightScaled + "px";
                            scaled.retinaResolutionEnabled = false;
                            this.dataWidth = widthScaled;
                            this.dataHeight = heightScaled;
                            var scaledCtx = this.dataContext = this.data.getContext('2d');

                            ig.System.scaleMode(scaled, scaledCtx);
                            var scaledPixels = scaledCtx.getImageData(0, 0, widthScaled, heightScaled);

                            for (var y = 0; y < heightScaled; y++) {
                                for (var x = 0; x < widthScaled; x++) {
                                    var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
                                    var indexScaled = (y * widthScaled + x) * 4;
                                    scaledPixels.data[indexScaled] = origPixels.data[index];
                                    scaledPixels.data[indexScaled + 1] = origPixels.data[index + 1];
                                    scaledPixels.data[indexScaled + 2] = origPixels.data[index + 2];
                                    scaledPixels.data[indexScaled + 3] = origPixels.data[index + 3];
                                }
                            }
                            scaledCtx.putImageData(scaledPixels, 0, 0);

                            // store for reuse

                            if (this.retainScaledData) {

                                this.scaleCache["x" + scale] = this.data;

                            }

                        }

                    }

                }

            },

            /**
             * Draws image into system context, accounting for system scale changes.
             * @param {Number} targetX
             * @param {Number} targetY
             * @param {Number} sourceX
             * @param {Number} sourceY
             * @param {Number} width
             * @param {Number} height
             * @param {Number} scale
             * @override
             **/
            draw: function(targetX, targetY, sourceX, sourceY, width, height, scale) {

                if (!this.data) {
                    return;
                }

                if (!scale) {

                    if (!this.ignoreSystemScale && this._scale !== ig.system.scale) {

                        this.resize(ig.system.scale);

                    } else if (this._scale !== this.scale) {

                        this.resize(this.scale);

                    }

                    scale = this._scale;

                } else {

                    this.resize(scale);

                }

                width = ((typeof width !== 'undefined' ? width : this.width) * scale) | 0;
                height = ((typeof height !== 'undefined' ? height : this.height) * scale) | 0;

                // no sense in drawing when 0 width or height

                if (width === 0 || height === 0) {

                    return;

                }

                sourceX = sourceX ? (sourceX * scale) | 0 : 0;
                sourceY = sourceY ? (sourceY * scale) | 0 : 0;

                ig.system.context.drawImage(
                    this.data, sourceX, sourceY, width, height,
                    ig.system.getDrawPos(targetX),
                    ig.system.getDrawPos(targetY),
                    width, height
                );

                ig.Image.drawCount++;

            },

            /**
             * Draws image tile into system.
             * @param {Number} targetX
             * @param {Number} targetY
             * @param {Number} tile
             * @param {Number} tileWidth
             * @param {Number} tileHeight
             * @param {Boolean} flipX
             * @param {Boolean} flipY
             * @param {Number} scale
             * @override
             */
            drawTile: function(targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY, scale) {

                tileHeight = tileHeight ? tileHeight : tileWidth;

                if (!this.data || tileWidth > this.width || tileHeight > this.height) {
                    return;
                }

                if (!scale) {

                    if (!this.ignoreSystemScale && this._scale !== ig.system.scale) {

                        this.resize(ig.system.scale);

                    } else if (this._scale !== this.scale) {

                        this.resize(this.scale);

                    }

                    scale = this._scale;

                } else {

                    this.resize(scale);

                }

                var tileWidthScaled = Math.floor(tileWidth * scale);
                var tileHeightScaled = Math.floor(tileHeight * scale);
                var dirX;
                var dirY;
                var offsetX;
                var offsetY;

                if (flipX) {

                    dirX = -1;
                    offsetX = tileWidthScaled;

                } else {

                    dirX = 1;
                    offsetX = 0;

                }

                if (flipY) {

                    dirY = -1;
                    offsetY = tileHeightScaled;

                } else {

                    dirY = 1;
                    offsetY = 0;

                }

                if (flipX || flipY) {

                    ig.system.context.save();
                    ig.system.context.scale(dirX, dirY);

                    ig.system.context.drawImage(
                        this.data, (Math.floor(tile * tileWidth) % this.width) * scale, (Math.floor(tile * tileWidth / this.width) * tileHeight) * scale,
                        tileWidthScaled,
                        tileHeightScaled,
                        ig.system.getDrawPos(targetX) * dirX - offsetX,
                        ig.system.getDrawPos(targetY) * dirY - offsetY,
                        tileWidthScaled,
                        tileHeightScaled
                    );

                    ig.system.context.restore();

                } else {

                    ig.system.context.drawImage(
                        this.data, (Math.floor(tile * tileWidth) % this.width) * scale, (Math.floor(tile * tileWidth / this.width) * tileHeight) * scale,
                        tileWidthScaled,
                        tileHeightScaled,
                        ig.system.getDrawPos(targetX) * dirX - offsetX,
                        ig.system.getDrawPos(targetY) * dirY - offsetY,
                        tileWidthScaled,
                        tileHeightScaled
                    );

                }

                ig.Image.drawCount++;

            }

        });

        /*
         * overrides and fixes for when in editor
         */
        if (ig.global.wm) {

            ig.Image.inject({

                resize: function(scale) {

                    if (scale && this._scale !== scale) {

                        var origData = this.scaleCache.x1;

                        if (!origData) {

                            this.scaleCache.x1 = this.data;

                        }

                        this.parent(scale);

                    }

                },

                draw: function(targetX, targetY, sourceX, sourceY, width, height, scale) {

                    if (!scale) {

                        scale = ig.system.scale;

                    }

                    this.parent(targetX, targetY, sourceX, sourceY, width, height, scale);

                },

                drawTile: function(targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY, scale) {

                    if (!scale) {

                        scale = ig.system.scale;

                    }

                    this.parent(targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY, scale);

                }

            });

        }

    });
