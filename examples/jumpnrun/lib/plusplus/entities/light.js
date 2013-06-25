ig.module(
        'plusplus.entities.light'
    )
    .requires(
        'plusplus.core.entity',
        'plusplus.core.config',
        'plusplus.core.image-drawing',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.utilscolor'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utm = ig.utilsmath;
        var _utv2 = ig.utilsvector2;
        var _uti = ig.utilsintersection;
        var _utc = ig.utilscolor;

        /**
         * Light with options for dynamic, following, shadow casting, and more.
         * <br>- inspired by illuminated.js.
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // creating lights is easy
         * // lets make one at the center of the world
         * var light = ig.game.spawnEntity( ig.EntityLight, 0, 0 );
         * // lights in Impact++ are not quite like 3D lights
         * // the difference being, you can actually see the light
         * // except our light is too small, so lets fix it
         * light.radius = 60;
         * // a light's appearance is controlled by r, g, b, and alpha
         * // so lets make it red
         * light.g = 0;
         * light.b = 0;
         * // for performance, lights are cached and static
         * // however, you can change its alpha dynamically
         * // but not its color, unless...
         * light.dynamicColor = true;
         * // one of the coolest features is shadow casting
         * light.castsShadows = true;
         * // but by default, all entities don't cast shadows
         * // unless we make them opaque
         * var dummy = ig.game.spawnEntity( ig.EntityDummy, 20, 0, {
         *      // it is important to note
         *      // that you should define opaque
         *      // when you create the entity
         *      // and not after
         *      // as Impact++ keeps a list
         *      // of all opaque entities
         *      // (to improve performance)
         *      // and this list only changes
         *      // when an entity is added or removed
         *      opaque: true
         * });
         * // now the above will work provided our light and dummy
         * // are added to the game at the same time
         * // because static lights only calculate shadows once
         * // but we can change this
         * light.performance = ig.CONFIG.DYNAMIC;
         * // however, if our dummy is not static
         * dummy.performance = ig.CONFIG.KINEMATIC;
         * // our light will ignore it, unless...
         * light.castsShadowsDynamic = true;
         * // also, to get shadows based on your level
         * // i.e. have your light cast shadows on the collision map
         * // you'll need to check out the game's "shapesPasses" property
         **/
        ig.EntityLight = ig.global.EntityLight = ig.EntityExtended.extend(/**@lends ig.EntityLight.prototype */{

            // editor properties

            _wmScalable: true,

            /**
             * Custom Weltmeister (editor) property.
             * @example
             * // to enable scalable entities to scale in both directions at once
             * // you'll need to edit the 'scaleSelectedEntity' method in weltmeister's 'edit-entities.js'
             * // add these two lines before the scaling
             * var _sizeLastX = this.selectedEntity.size.x;
             * var _sizeLastY = this.selectedEntity.size.y;
             * // and then add the following lines after the scaling
             * if ( this.selectedEntity._wmScalableLinked ) {
             *
             *      if ( this.selectedEntity.size.x !== _sizeLastX ) {
             *
             *          this.selectedEntity.size.y = this.selectedEntity.size.x;
             *
             *      }
             *      else if ( this.selectedEntity.size.y !== _sizeLastY ) {
             *
             *          this.selectedEntity.size.x = this.selectedEntity.size.y;
             *
             *      }
             *
             * }
             */
            _wmScalableLinked: true,

            /**
             * @override
             * @default
             */
            layerName: 'lights',

            /**
             * Size of light can be set either through {@link ig.EntityLight#size} or {@link ig.EntityLight#radius} property.
             * <br>- if size is used, larger of x and y will become size and radius
             * <br>- if radius is used, size will copy radius
             * @override
             * @default 10x10
             */
            size: _utv2.vector(10, 10),

            /**
             * Size of light can be set either through {@link ig.EntityLight#size} or {@link ig.EntityLight#radius} property.
             * <br>- if size is used, larger of x and y will become size and radius
             * <br>- if radius is used, size will copy radius
             * @override
             * @default
             */
            radius: 10,

            /**
             * Red value from 0 to 1.
             * @type Number
             * @default
             */
            r: 1,

            /**
             * Green value from 0 to 1.
             * @type Number
             * @default
             */
            g: 1,

            /**
             * Blue value from 0 to 1.
             * @type Number
             * @default
             */
            b: 1,

            /**
             * Alpha value from 0 to 1.
             * @type Number
             * @default
             */
            alpha: 0.25,

            /**
             * Whether color can change dynamically in addition to alpha.
             * <br>- be aware that this comes at a slightly higher performance cost
             * @type Boolean
             * @default
             */
            dynamicColor: false,

            /**
             * Whether light should be scaled pixel perfectly
             * <br>- <strong>IMPORTANT:</strong> pixel perfect scaling has a very high performance cost, use carefully!
             * <br>- this is useful when you need to keep the visual style consistently pixelated
             * @type Boolean
             * @default
             */
            pixelPerfect: false,

            /**
             * Whether light should be gradient or flat shaded.
             * <br>- this works well in combination with {@link ig.EntityLight#pixelPerfect}
             * @type Boolean
             * @default
             */
            gradient: true,

            /**
             * Whether light should cast shadows on objects that are {@link ig.EntityExtended#opaque}.
             * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
             * <br>- to cast shadows on dynamic entities, light {@link ig.EntityExtended#performance} must be dynamic and {@link ig.EntityLight#castsShadowsDynamic}
             * @type Boolean
             * @default
             */
            castsShadows: false,

            /**
             * Whether light should cast shadows on dynamic objects that are {@link ig.EntityExtended#opaque}.
             * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
             * <br>- to cast shadows, light must also {@link ig.EntityLight#castsShadows}
             * @type Boolean
             * @default
             */
            castsShadowsDynamic: false,

            /**
             * List of items to cast shadows with.
             * <br>- populated on update
             * @type Array
             * @readonly
             */
            items: [],

            /**
             * How much light should get through objects that are {@link ig.EntityExtended#opaque}.
             * @type Number
             * @default
             */
            diffuse: 0.9,

            /**
             * Number of passes to make when casting shadows.
             * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
             * @type Number
             * @default
             */
            samples: 1,

            /**
             * Off screen canvas to cache complete light to improve performance.
             * <br>- created on init
             * @type ig.ImageDrawing
             */
            image: null,

            /**
             * Off screen canvas to cache base light to improve performance.
             * <br>- created on init
             * @type ig.ImageDrawing
             */
            imageBase: null,

            /**
             * Off screen canvas to cache shadows to improve performance.
             * <br>- created on init
             * @type ig.ImageDrawing
             */
            imageCast: null,

            /**
             * Off screen canvas to cache light color to improve performance.
             * <br>- created on init
             * @type ig.ImageDrawing
             */
            imageColor: null,

            // internal properties, do not modify

            _shadowCastingInitialized: false,
            _changedSize: false,
            _rLast: 0,
            _gLast: 0,
            _bLast: 0,
            _alphaLast: 0,
            _sizeLast: _utv2.vector(),
            _radiusLast: 0,

            /**
             * Initializes light types.
             * <br>- adds {@link ig.EntityExtended.TYPE.LIGHT} to {@link ig.EntityExtended#type}
             * @overide
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "LIGHT");

            },

            /**
             * Resets light core and ensures that radius and size match.
             * @override
             **/
            resetCore: function (x, y, settings) {

                if (settings) {

                    if (settings.radius) {

                        this.size.x = this.size.y = settings.radius * 2;

                    }

                }

                this.parent(x, y, settings);

                // do not allow kinematic light

                if (this.performance === _c.KINEMATIC) {

                    this.performance = _c.DYNAMIC;

                }

            },

            /**
             * Calculates radius based on max size, used to find light bounds.
             * @returns radius.
             **/
            getRadius: function () {

                return Math.max(this.size.x, this.size.y) * 0.5;

            },

            /**
             * @override
             **/
            getBounds: function () {

                var diameter = this.radius * 2;

                return {
                    minX: this.pos.x,
                    minY: this.pos.y,
                    maxX: this.pos.x + diameter,
                    maxY: this.pos.y + diameter,
                    width: diameter,
                    height: diameter
                };

            },

            /**
             * @override
             **/
            getBoundsDraw: function () {

                var radius = this.radius;
                var diameter = radius * 2;
                var minX = this.pos.x - this.offset.x;
                var minY = this.pos.y - this.offset.y;

                return {
                    minX: minX,
                    minY: minY,
                    maxX: minX + diameter,
                    maxY: minY + diameter,
                    width: diameter,
                    height: diameter
                };

            },

            /**
             * @override
             */
            getTotalSizeX: function () {

                return this.radius * 2;

            },

            /**
             * @override
             */
            getTotalSizeY: function () {

                return this.radius * 2;

            },

            /**
             * Computes the light and casted shadows.
             **/
            compute: function () {

                // find all items to cast first, as can change

                if (this.castsShadows && ( this.performance === _c.DYNAMIC || this._changedAdd )) {

                    this.findItems();

                }

                if (this.changed || this._changedAdd) {
					
					if ( this.performance === _c.STATIC ) {
						
						this.changed = false;
						
					}
					
                    // redraw basic light if scale changed

                    if (this._changedSize || this.scaleComputedAt !== ig.system.scale) {
						
                        this._changedSize = false;
                        this.scaleComputedAt = ig.system.scale;

                        // new caches

                        this.createCache();

                        // create image of light

                        this.createLight();

                    }

                    if (this.castsShadows) {
						
                        // cast all shadows

                        this.castShadows();

                        // combine base with cast

                        var context = this.image.dataContext;
                        var compositeOperation = context.globalCompositeOperation;

                        context.clearRect(0, 0, this.image.dataWidth, this.image.dataHeight);

                        context.drawImage(this.imageBase.data, 0, 0);

                        context.globalCompositeOperation = "destination-out";

                        context.drawImage(this.imageCast.data, 0, 0);

                        context.globalCompositeOperation = compositeOperation;

                    }

                }

            },

            /**
             * Create cache images for drawing.
             **/
            createCache: function () {

                this.image = new ig.ImageDrawing({
                    width: this.boundsDraw.width,
                    height: this.boundsDraw.height
                });
                this.imageBase = new ig.ImageDrawing({
                    width: this.boundsDraw.width,
                    height: this.boundsDraw.height
                });

                if ( this.castsShadows ) {

                    this.imageCast = new ig.ImageDrawing({
                        width: this.boundsDraw.width,
                        height: this.boundsDraw.height
                    });

                }

                if ( this.dynamicColor ) {

                    this.imageColor = new ig.ImageDrawing({
                        width: this.boundsDraw.width,
                        height: this.boundsDraw.height
                    });

                }

            },

            /**
             * Draws base light.
             **/
            createLight: function () {

                var width = this.radius * 2;
                var height = width;
                var image = this.castsShadows ? this.imageBase : this.image;
                var context, base;
                var r, g, b;

                // if not dynamic color, draw color directly into final image

                if (!this.dynamicColor) {

                    r = this.r;
                    g = this.g;
                    b = this.b;

                }
                else {

                    r = 1;
                    g = 1;
                    b = 1;

                }

                // directly write the pixels or the light will not be pixel perfect when scaled to game scale

                if (this.pixelPerfect) {

                    context = image.context;
                    base = context.createImageData(width, height);

                    for (var x = 0; x < width; x++) {
                        for (var y = 0; y < height; y++) {

                            if (_uti.pointInCircle(x, y, this.radius, this.radius, this.radius)) {

                                var index = (x + y * width) * 4;

                                base.data[ index ] = ( r * 255 ) | 0;
                                base.data[ index + 1 ] = ( g * 255 ) | 0;
                                base.data[ index + 2 ] = ( b * 255 ) | 0;

                                if (this.gradient) {

                                    var dx = this.radius - x;
                                    var dy = this.radius - y;
                                    var invDistPct = 1 - ( Math.sqrt(dx * dx + dy * dy) / this.radius );

                                    base.data[ index + 3 ] = ( invDistPct * 255 ) | 0;

                                }
                                else {

                                    base.data[ index + 3 ] = 255;

                                }

                            }

                        }
                    }

                    context.putImageData(base, 0, 0);

                    // finalize the pixels from the unscaled to the scaled

                    image.finalize();

                }
                // when pixel perfect is not needed, it is much faster to use native methods
                else {

                    var radiusScaled = ig.system.getDrawPos(this.radius);

                    context = image.dataContext;

                    if (this.gradient) {

                        var diameterScaled = radiusScaled * 2;
                        var gradient = _utc.radialGradient(radiusScaled, [
                            { r: r, g: g, b: b },
                            { r: r, g: g, b: b, a: 0 }
                        ]);

                        context.fillStyle = gradient;
                        context.fillRect(0, 0, diameterScaled, diameterScaled);

                    }
                    else {

                        context.fillStyle = _utc.RGBToCSS(r, g, b);
                        context.arc(radiusScaled, radiusScaled, radiusScaled, 0, _utm.TWOPI);
                        context.fill();

                    }

                }

            },

            /**
             * Find all opaque items bounds that are {@link ig.EntityExtended#opaque}.
             **/
            findItems: function () {

                var bounds = this.bounds;
                var numItemsPrefind = this.items.length;

                // faster to reset items list each time we find than to cautious add/remove

                this.items = [];

                for (var i = 0, il = ig.game.layers.length; i < il; i++) {

                    var layer = ig.game.layers[i];

                    if (layer.numEntities) {

                        var itemsOpaque = layer.itemsOpaque;

                        for (var j = 0, jl = itemsOpaque.length; j < jl; j++) {

                            var item = itemsOpaque[ j ];
                            var itemBounds = item.bounds;

                            // under and within light

                            if (item._killed !== true && ( item.performance === _c.STATIC || this.castsShadowsDynamic ) && _uti.boundsIntersect(itemBounds, bounds)) {

                                this.items.push(item);
                                this.changed |= item.changed;

                            }

                        }

                    }

                }

                // items changed, light is changed
				
                this.changed |= numItemsPrefind !== this.items.length;

            },

            /**
             * Initializes light for shadow casting.
             * <br>- this is deferred until just before first shadow cast to save on memory
             * @private
             */
            _initShadowCasting: function () {

                if ( !this._shadowCastingInitialized ) {

                    this.utilVec2Samples1 = _utv2.vector();
                    this.utilVec2Samples2 = _utv2.vector();
                    this.utilVec2Samples3 = _utv2.vector();

                }

            },

            /**
             * Draw the shadows that are cast by items.
             **/
            castShadows: function () {

                // init shadow casting

                this._initShadowCasting();

                // draw shadows for each light sample and item

                var contextCast;

                // always faster to avoid pixel perfect

                if (this.pixelPerfect) {

                    contextCast = this.imageCast.context;
                    contextCast.clearRect(0, 0, this.imageCast.width, this.imageCast.height);

                    var bounds = this.bounds;
                    var items = this.items;
                    var i, il, item;
                    var me = this;

                    this.forEachSample(function (position) {

                        for (i = 0, il = items.length; i < il; i++) {

                            items[ i ].castShadows(me, contextCast, position, bounds);

                        }

                    });

                    // finalize the pixels from the unscaled to the scaled

                    this.imageCast.finalize();

                }
                else {

                    contextCast = this.imageCast.dataContext;
                    contextCast.clearRect(0, 0, this.imageCast.dataWidth, this.imageCast.dataHeight);

                    var bounds = this.bounds;
                    var items = this.items;
                    var i, il, item;
                    var me = this;

                    this.forEachSample(function (position) {

                        for (i = 0, il = items.length; i < il; i++) {
							
                            items[ i ].castShadows(me, contextCast, position, bounds);

                        }

                    });

                }

            },

            /**
             * Checks for base entity changes as well as alpha, color, and size changes.
             * @override
             **/
            recordChanges: function (force) {

                if (this.alpha === 0) {

                    this.visible = false;

                }
                else {

                    this._changedSize = this.radius - this._radiusLast !== 0 || this.size.x - this._sizeLast.x !== 0 || this.size.y - this._sizeLast.y !== 0;

                    if (this.alpha - this._alphaLast !== 0 || this._changedSize) {

                        force = true;

                    }

                    if (!force && this.dynamicColor) {

                        var rDelta = this.r - this._rLast;
                        var gDelta = this.g - this._gLast;
                        var bDelta = this.b - this._bLast;

                        if (rDelta !== 0 || gDelta !== 0 || bDelta !== 0) {

                            force = true;

                        }

                        this._rLast = this.r;
                        this._gLast = this.g;
                        this._bLast = this.b;

                    }

                    // record last here instead of in recordLast
                    // size, alpha, and color will likely never change in update

                    _utv2.copy(this._sizeLast, this.size);
                    this._radiusLast = this.radius;
                    this._alphaLast = this.alpha;

                }
				
                this.parent(force);

            },

            /**
             * @override
             **/
            updateBounds: function () {

                this.radius = this.getRadius();

                this.parent();

            },

            /**
             * @override
             **/
            updateVisible: function () {

                this.compute();

                this.parent();

            },

            /**
             * @override
             **/
            draw: function () {

                var image = this.image;

                // not in screen
                if (!this.visible || !image) {

                    return;

                }

                if (this.dynamicColor) {

                    var diameterScaled = ig.system.getDrawPos(this.radius * 2);

                    // create final light image by combining light with tint
                    // this allows dynamic changing of color, but slower performance

                    var contextColor = this.imageColor.dataContext;

                    contextColor.fillStyle = _utc.RGBToCSS(this.r, this.g, this.b);
                    contextColor.fillRect(0, 0, diameterScaled, diameterScaled);

                    contextColor.globalCompositeOperation = "destination-atop";
                    contextColor.drawImage(this.image.data, 0, 0);

                    image = this.imageColor;

                }

                var context = ig.system.context;

                if (this.alpha !== 1) {
                    context.globalAlpha = this.alpha;
                }

                image.draw(this.boundsDraw.minX - ig.game.screen.x, this.boundsDraw.minY - ig.game.screen.y);

                if (this.alpha !== 1) {
                    context.globalAlpha = 1;
                }

            },

            /**
             * Invoke a function for every sample generated by light using a spiral algorithm.
             * @param {Function} callback function to be called for every sample.
             **/
            forEachSample: function (callback) {

                var center = _utv2.set(this.utilVec2Samples1, this.boundsDraw.minX + this.boundsDraw.width * 0.5, this.boundsDraw.minY + this.boundsDraw.height * 0.5);

                if (this.samples === 1) {

                    callback(center);

                }
                else {

                    for (var s = 0; s < this.samples; ++s) {

                        var a = s * _utm.GOLDEN_ANGLE;
                        var r = Math.sqrt(s / this.samples) * this.radius;
                        var delta = _utv2.set(this.utilVec2Samples2, Math.cos(a) * r, Math.sin(a) * r);

                        _utv2.copy(this.utilVec2Samples3, center);
                        _utv2.add(this.utilVec2Samples3, delta);

                        callback(this.utilVec2Samples3);

                    }

                }

            }

        });

        // overrides and fixes for when in editor

        if (ig.global.wm) {

            ig.EntityLight.inject({

                dynamicColor: true,

                computeDrawCount: 5,
                computeDrawCountMax: 5,

                init: function (x, y, settings) {

                    this.parent(x, y, settings);

                    // force all lights to be dynamic

                    this.performance = _c.DYNAMIC;

                },

                findItems: function () {},
                castShadows: function () {},

                draw: function () {

                    // fully recompute every so often

                    if (this.computeDrawCount >= this.computeDrawCountMax) {

                        this.computeDrawCount = 0;

                        this.recordChanges(true);
                        this.compute();

                    }
                    else {

                        this.computeDrawCount++;

                    }

                    this.parent();

                }

            });

        }

    });