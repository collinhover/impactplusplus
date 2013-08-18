ig.module(
        'plusplus.core.image-drawing'
    )
    .requires(
        'plusplus.core.image'
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
             * Image drawing is always loaded.
             * @type Boolean
             * @override
             * @default
             */
            loaded: true,

            /**
             * Initializes drawing canvas.
             * @param {Object} settings settings object.
             **/
            init: function (settings) {

                ig.merge(this, settings);

                // base canvas for drawing on

                this.data = ig.$new('canvas');
                this.dataContext = this.data.getContext('2d');
                this.dataWidth = this.data.width = ( this.width * this.scale ) | 0;
                this.dataHeight = this.data.height = ( this.height * this.scale ) | 0;

                this.scaleCache = {};
                this.scaleCache.x1 = this.data;

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
             * Image drawing does not need on load callback.
             * @override
             */
            onload: function () {
            },

            /**
             * Set width of image.
             * @param {Number} width of original size.
             **/
            setWidth: function (width) {

                this.setDimensions(width, this.height);

            },

            /**
             * Set height of image.
             * @param {Number} height of original size.
             **/
            setHeight: function (height) {

                this.setDimensions(this.width, height);

            },

            /**
             * Set width and height of image.
             * @param {Number} width of original size.
             * @param {Number} height of original size.
             **/
            setDimensions: function (width, height) {

                this.width = this.dataWidth = this.data.width = width | 0;
                this.height = this.dataHeight = this.data.height = height | 0;

            },

            /**
             * Finalizes drawing and flag image to redraw sizes.
             * <span class='alert'><strong>IMPORTANT:</strong> finalizing at a scale other than 1 will disable dynamic resizing for the image!</span>
             * @param {Number} [scale=1] scale to finalize at
             */
            finalize: function ( scale ) {

                if ( !scale ) {

                    this._scale = scale = 1;

                }
                else {

                    this.scale = this._scale = scale;

                }

                // reset

                this.scaleCache = {};
                this.scaleCache[ "x" + scale ] = this.data;
                this.dataContext = this.data.getContext('2d');

                this.dataWidth = this.data.width;
                this.dataHeight = this.data.height;
                this.width = this.dataWidth / scale;
                this.height = this.dataHeight / scale;

            }

        });

    });