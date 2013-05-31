ig.module(
        'plusplus.core.image-drawing'
    )
    .requires(
        'impact.image'
    )
    .defines(function () {
        "use strict";

        /**
         * Image for pixel perfect scaled dynamic drawing.
         * <br>- this class is intended for use of cached drawings to improve performance, i.e. don't redraw a lot
         * <span class="alert"><strong>IMPORTANT:</strong>do not use this for actual image files, instead use {@link ig.Image}.</span>
         * @class
         * @extends ig.Image
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.ImageDrawing = ig.Image.extend(/**@lends ig.ImageDrawing.prototype */{

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
             * Width of final drawing.
             * <br>- this value is set calculated based on {@link ig.ImageDrawing#width} and {@link ig.ImageDrawing#scale}
             * @type Number
             */
            dataWidth: 1,

            /**
             * Height of final drawing.
             * <br>- this value is set calculated based on {@link ig.ImageDrawing#height} and {@link ig.ImageDrawing#scale}
             * @type Number
             */
            dataHeight: 1,

            /**
             * Scale of final drawing.
             * <br>- will automatically copy system scale unless is ignoring system scale due to {@link ig.ImageDrawing#ignoreScale}
             * @type Number
             * @default
             */
            scale: 1,

            /**
             * If image should ignore system scale.
             * <span class="alert alert-info"><strong>Tip:</strong> because pixel perfect scaling is so performance intensive, try to ignore scale whenever possible.</span>
             * @type Boolean
             * @default
             */
            ignoreScale: false,

            /**
             * Whether image should automatically finalize (i.e. pixel perfect scale) on dimension change via {@link ig.ImageDrawing#setDimensions}.
             * @type Boolean
             * @default
             */
            autoFinalize: true,

            /**
             * Image drawing is always loaded.
             * @type Boolean
             * @override
             * @default
             */
            loaded: true,

            /**
             * Image unscaled off-screen canvas.
             * <br>- created on init
             * @type Canvas
             */
            canvas: null,

            /**
             * Image unscaled off-screen canvas context.
             * <br>- created on init
             * @type CanvasContext2D
             */
            context: null,

            /**
             * Image final off-screen canvas.
             * <br>- created on init
             * <span class="alert alert-info"><strong>Tip:</strong> when ignoring scale using {@link ig.ImageDrawing#ignoreScale} this is a reference to {@link ig.ImageDrawing#canvas}.</span>
             * @type Canvas
             */
            data: null,

            /**
             * Image final off-screen canvas context.
             * <br>- created on init
             * <span class="alert alert-info"><strong>Tip:</strong> when ignoring scale using {@link ig.ImageDrawing#ignoreScale} this is a reference to {@link ig.ImageDrawing#context}.</span>
             * @type CanvasContext2D
             */
            dataContext: null,

            /**
             * Creates cache canvases, one at original size and one scaled to system scale.
             * @param {Object} settings settings object.
             **/
            init: function (settings) {

                ig.merge(this, settings);

                // base canvas for drawing on

                this.canvas = ig.$new('canvas');
                this.context = this.canvas.getContext('2d');
                this.canvas.width = this.width | 0;
                this.canvas.height = this.height | 0;

                if (!this.ignoreScale) {

                    this.scale = ig.system.scale;

                }

                // final canvas

                if (this.scale === 1) {

                    this.data = this.canvas;
                    this.dataContext = this.context;
                    this.dataWidth = this.width;
                    this.dataHeight = this.height;

                }
                else {

                    this.data = ig.$new('canvas');
                    this.dataContext = this.data.getContext('2d');
                    this.dataWidth = this.data.width = ( this.width * this.scale ) | 0;
                    this.dataHeight = this.data.height = ( this.height * this.scale ) | 0;

                }

            },

            /**
             * Image drawing does not need to load.
             * @override
             */
            load: function () {
            },

            /**
             * Image drawing does not need to reload.
             * @override
             */
            reload: function () {
            },

            /**
             * Set width of image.
             * <span class="alert"><strong>IMPORTANT:</strong> use instead of directly modifying property so image is finalized correctly!.</span>
             * @param {Number} width of original size.
             **/
            setWidth: function (width) {

                this.setDimensions(width, this.canvas.height);

            },

            /**
             * Set height of image.
             * <span class="alert"><strong>IMPORTANT:</strong> use instead of directly modifying property so image is finalized correctly!.</span>
             * @param {Number} height of original size.
             **/
            setHeight: function (height) {

                this.setDimensions(this.canvas.width, height);

            },

            /**
             * Set width and height of image.
             * <span class="alert"><strong>IMPORTANT:</strong> use instead of directly modifying property so image is finalized correctly!.</span>
             * @param {Number} width of original size.
             * @param {Number} height of original size.
             **/
            setDimensions: function (width, height) {

                this.width = this.canvas.width = width | 0;
                this.height = this.canvas.height = height | 0;

                if (this.autoFinalize) {

                    this.finalize();

                }

            },

            /**
             * Draws the canvas into data at the requested scale ( usually the system scale ) to prepare for final drawing in the game.
             * <br>- does nothing if system scale is 1 or image drawing is ignoring scale due to {@link ig.ImageDrawing#ignoreScale}
             * <span class="alert alert-info"><strong>Tip:</strong> because pixel perfect scaling is so performance intensive, try to ignore scale whenever possible.</span>
             **/
            finalize: function () {

                var scale = this.scale = this.ignoreScale ? this.scale : ig.system.scale;

                // Nearest-Neighbor scaling

                // The original image is copied into another canvas with the new size.
                // The scaled offscreen canvas becomes the image (data) of this object.

                if (scale === 1) {

                    this.data = this.canvas;
                    this.dataContext = this.context;
                    this.dataWidth = this.width;
                    this.dataHeight = this.height;

                }
                else {

                    var origPixels = ig.getImagePixels(this.canvas, 0, 0, this.width, this.height);

                    var widthScaled = ( this.width * scale ) | 0;
                    var heightScaled = ( this.height * scale) | 0;

                    var scaled = this.data = ig.$new('canvas');
                    this.dataWidth = scaled.width = widthScaled;
                    this.dataHeight = scaled.height = heightScaled;
                    var scaledCtx = this.dataContext = this.data.getContext('2d');
                    var scaledPixels = scaledCtx.getImageData(0, 0, widthScaled, heightScaled);

                    for (var y = 0; y < heightScaled; y++) {
                        for (var x = 0; x < widthScaled; x++) {
                            var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
                            var indexScaled = (y * widthScaled + x) * 4;
                            scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
                            scaledPixels.data[ indexScaled + 1 ] = origPixels.data[ index + 1 ];
                            scaledPixels.data[ indexScaled + 2 ] = origPixels.data[ index + 2 ];
                            scaledPixels.data[ indexScaled + 3 ] = origPixels.data[ index + 3 ];
                        }
                    }
                    scaledCtx.putImageData(scaledPixels, 0, 0);

                }

            },

            /**
             * Draws image into system context.
             * @param {Number} targetX target x position, unscaled.
             * @param {Number} targetY target y position, unscaled.
             * @param {Number} [sourceX] source x position in drawing, unscaled.
             * @param {Number} [sourceY] source y position in drawing, unscaled.
             * @param {Number} [width] width of drawing to draw, unscaled.
             * @param {Number} [height] height of drawing to draw, unscaled.
             * @override
             **/
            draw: function (targetX, targetY, sourceX, sourceY, width, height) {

                var scale;

                if (!this.ignoreScale && this.scale !== ig.system.scale) {

                    scale = this.scale = ig.system.scale;
                    this.resize(scale);

                }
                else {

                    scale = this.scale;

                }

                width = ( ( typeof width !== 'undefined' ? width : this.width) * scale ) | 0;
                height = ( ( typeof height !== 'undefined' ? height : this.height) * scale ) | 0;

                // no sense in drawing when 0 width or height

                if (width === 0 || height === 0) {

                    return;

                }

                sourceX = sourceX ? ( sourceX * scale ) | 0 : 0;
                sourceY = sourceY ? ( sourceY * scale ) | 0 : 0;

                ig.system.context.drawImage(
                    this.data, sourceX, sourceY, width, height,
                    ig.system.getDrawPos(targetX),
                    ig.system.getDrawPos(targetY),
                    width, height
                );

                ig.Image.drawCount++;

            }

        });

    });