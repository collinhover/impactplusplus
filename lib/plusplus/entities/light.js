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
    .defines(function() {
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
         * light.performance = ig.EntityExtended.PERFORMANCE.MOVABLE;
         * // however, if our dummy is not static
         * dummy.performance = ig.EntityExtended.PERFORMANCE.DYNAMIC;
         * // our light will ignore it, unless...
         * light.castsShadowsMovable = true;
         * // also, to get shadows based on your level
         * // i.e. have your light cast shadows on the collision map
         * // you'll need to check out the game's "shapesPasses" property
         **/
        ig.EntityLight = ig.global.EntityLight = ig.EntityExtended.extend( /**@lends ig.EntityLight.prototype */ {

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
            size: {
                x: 10,
                y: 10
            },

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
            r: _c.LIGHT.R,

            /**
             * Green value from 0 to 1.
             * @type Number
             * @default
             */
            g: _c.LIGHT.G,

            /**
             * Blue value from 0 to 1.
             * @type Number
             * @default
             */
            b: _c.LIGHT.B,

            /**
             * Alpha value from 0 to 1.
             * @type Number
             * @default
             */
            alpha: _c.LIGHT.ALPHA,

            /**
             * Whether color can change dynamically in addition to alpha.
             * <br>- be aware that this comes at a slightly higher performance cost
             * @type Boolean
             * @default
             */
            dynamicColor: false,

            /**
             * Whether light should be drawn and scaled pixel perfectly.
             * <span class="alert alert-danger"><strong>IMPORTANT:</strong> pixel perfect scaling has a very high performance cost, use carefully!</span>
             * <br>- doesn't work in combination with {@link ig.EntityLight#castsShadowsMovable} due to performance reasons
             * @type Boolean
             * @default
             */
            pixelPerfect: _c.LIGHT.PIXEL_PERFECT,

            /**
             * Whether light should be gradient or flat shaded.
             * <br>- this works well in combination with {@link ig.EntityLight#pixelPerfect}
             * @type Boolean
             * @default
             */
            gradient: _c.LIGHT.GRADIENT,

            /**
             * Whether light should cast shadows on objects that are {@link ig.EntityExtended#opaque}.
             * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
             * <br>- to cast shadows on movable entities, light {@link ig.EntityExtended#performance} must be movable and {@link ig.EntityLight#castsShadowsMovable}
             * @type Boolean
             * @default
             */
            castsShadows: _c.LIGHT.CASTS_SHADOWS,

            /**
             * Whether light should cast shadows on movable objects that are {@link ig.EntityExtended#opaque}.
             * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
             * <br>- to cast shadows, light must also {@link ig.EntityLight#castsShadows}
             * <br>- doesn't work in combination with {@link ig.EntityLight#pixelPerfect} due to performance reasons
             * @type Boolean
             * @default
             */
            castsShadowsMovable: _c.LIGHT.CASTS_SHADOWS_MOVABLE,

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
            diffuse: _c.LIGHT.DIFFUSE,

            /**
             * Number of passes to make when casting shadows.
             * <br>- <strong>IMPORTANT:</strong> casting shadows can have a higher performance cost, use carefully!
             * @type Number
             * @default
             */
            samples: _c.LIGHT.SAMPLES,

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
            _dirtySize: false,
            _dirtyColor: false,
            _scaleComputedAt: 0,
            _rLast: 0,
            _gLast: 0,
            _bLast: 0,
            _alphaLast: 0,
            _sizeLast: {
                x: 0,
                y: 0
            },
            _radiusLast: 0,

            /**
             * Initializes light types.
             * <br>- adds {@link ig.EntityExtended.TYPE.LIGHT} to {@link ig.EntityExtended#type}
             * @overide
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "LIGHT");

            },

            /**
             * Initializes light caches.
             */
            initProperties: function() {

                this.image = new ig.ImageDrawing();
                this.imageBase = new ig.ImageDrawing();
                this.imageCast = new ig.ImageDrawing();
                this.imageColor = new ig.ImageDrawing();

                this.parent();

            },

            /**
             * Resets light core and ensures that radius and size match.
             * @override
             **/
            resetCore: function(x, y, settings) {

                if (settings) {

                    if (settings.radius) {

                        this.size.x = this.size.y = settings.radius * 2;

                    }

                }

                this.parent(x, y, settings);

                // do not allow dynamic light

                if (this.performance === ig.EntityExtended.PERFORMANCE.DYNAMIC) {

                    this.performance = ig.EntityExtended.PERFORMANCE.MOVABLE;

                }

            },

            /**
             * @override
             */
            resize: function(force) {

                this.recordChanges();

                if (this.changed) {

                    force = this.needsRebuild = true;

                }

                return force;

            },

            /**
             * @override
             */
            rebuild: function() {

                this.compute();

                this.parent();

            },

            /**
             * Sets light as ready and adds listener for system resize.
             * @override
             */
            ready: function() {

                ig.system.onResized.add(this.resize, this);

                this.parent();

            },

            /**
             * Calculates radius based on max size, used to find light bounds.
             * @returns radius.
             **/
            getRadius: function() {

                return Math.max(this.size.x, this.size.y) * 0.5;

            },

            /**
             * @override
             */
            getSizeDrawX: function() {

                return this.radius * 2;

            },

            /**
             * @override
             */
            getSizeDrawY: function() {

                return this.radius * 2;

            },

            /**
             * Computes the light and casted shadows.
             **/
            compute: function() {

                // find all items to cast first, as can change

                if (this.castsShadows && (this.performance === ig.EntityExtended.PERFORMANCE.MOVABLE || this._changedAdd)) {

                    this.findItems();

                }

                if (this.changed || this._changedAdd) {

                    if (this.performance === ig.EntityExtended.PERFORMANCE.STATIC) {

                        this.changed = false;

                    }

                    // redraw basic light

                    if (this._dirtySize || (this.castsShadows && !this.imageCast)) {

                        this._dirtySize = false;
                        this._scaleComputedAt = this.scale;

                        // resize caches

                        this.resizeCache();

                        // draw image of light

                        this.drawLight();

                    }

                    if (this.castsShadows) {

                        this.drawShadows();

                    }

                }

            },

            /**
             * Resize cache images for drawing.
             **/
            resizeCache: function() {

                var diameter = this.radius * 2;

                if (!this.pixelPerfect) {

                    diameter *= this.scale;

                }

                if (this.castsShadows) {

                    this.image.setDimensions(diameter, diameter);
                    this.imageBase.setDimensions(diameter, diameter);
                    this.imageCast.setDimensions(diameter, diameter);

                } else {

                    this.image.setDimensions(diameter, diameter);

                    if (this.imageBase.width !== 0 || this.imageBase.height !== 0) {

                        this.imageBase.setDimensions(0, 0);

                    }

                    if (this.imageCast.width !== 0 || this.imageCast.height !== 0) {

                        this.imageCast.setDimensions(0, 0);

                    }

                }

                if (this.dynamicColor) {

                    this.imageColor.setDimensions(diameter, diameter);
                    this._dirtyColor = true;

                }

            },

            /**
             * Draws base light.
             **/
            drawLight: function() {

                var image = this.castsShadows ? this.imageBase : this.image;
                var context, base;
                var r, g, b;

                // if not dynamic color, draw color directly into final image

                if (!this.dynamicColor) {

                    r = this.r;
                    g = this.g;
                    b = this.b;

                } else {

                    r = 1;
                    g = 1;
                    b = 1;

                }

                context = image.dataContext;

                // directly write the pixels or the light will not be pixel perfect when scaled to game scale

                if (this.pixelPerfect) {

                    var diameter = this.radius * 2;

                    base = context.createImageData(diameter, diameter);

                    for (var x = 0; x < diameter; x++) {
                        for (var y = 0; y < diameter; y++) {

                            if (_uti.pointInCircle(x, y, this.radius, this.radius, this.radius)) {

                                var index = (x + y * diameter) * 4;

                                base.data[index] = (r * 255) | 0;
                                base.data[index + 1] = (g * 255) | 0;
                                base.data[index + 2] = (b * 255) | 0;

                                if (this.gradient) {

                                    var dx = this.radius - x;
                                    var dy = this.radius - y;
                                    var invDistPct = 1 - (Math.sqrt(dx * dx + dy * dy) / this.radius);

                                    base.data[index + 3] = (invDistPct * 255) | 0;

                                } else {

                                    base.data[index + 3] = 255;

                                }

                            }

                        }
                    }

                    context.putImageData(base, 0, 0);

                    image.finalize(1);

                }
                // when pixel perfect is not needed, it is much faster to use native methods
                else {

                    var radiusScaled = this.radius * this.scale;

                    if (this.gradient) {

                        var diameterScaled = radiusScaled * 2;
                        var gradient = _utc.radialGradient(radiusScaled, [{
                            r: r,
                            g: g,
                            b: b
                        }, {
                            r: r,
                            g: g,
                            b: b,
                            a: 0
                        }]);

                        context.fillStyle = gradient;
                        context.fillRect(0, 0, diameterScaled, diameterScaled);

                    } else {

                        context.fillStyle = _utc.RGBToCSS(r, g, b);
                        context.arc(radiusScaled, radiusScaled, radiusScaled, 0, _utm.TWOPI, false);
                        context.fill();

                    }

                    image.finalize(this.scale);

                }

            },

            /**
             * Find all opaque items bounds that are {@link ig.EntityExtended#opaque}.
             **/
            findItems: function() {

                var minX = this.pos.x;
                var minY = this.pos.y;
                var maxX = minX + this.size.x;
                var maxY = minY + this.size.y;
                var numItemsPrefind = this.items.length;

                // faster to reset items list each time we find than to cautious add/remove

                this.items.length = 0;

                for (var i = 0, il = ig.game.layers.length; i < il; i++) {

                    var layer = ig.game.layers[i];

                    if (layer.numEntities) {

                        var itemsOpaque = layer.itemsOpaque;

                        for (var j = 0, jl = itemsOpaque.length; j < jl; j++) {

                            var item = itemsOpaque[j];

                            // under and within light

                            if (item._killed !== true && (item.performance === ig.EntityExtended.PERFORMANCE.STATIC || this.castsShadowsMovable && !this.pixelPerfect) && _uti.AABBIntersect(
                                minX, minY, maxX, maxY,
                                item.pos.x, item.pos.y, item.pos.x + item.size.x, item.pos.y + item.size.y
                            )) {

                                this.items.push(item);

                                var anim = item.currentAnim;

                                if (item.changed) {

                                    this.changed = true;

                                } else if (anim && ((anim !== item._animCastShadow && (anim.opaqueOffset || (item._animCastShadow && item._animCastShadow.opaqueOffset))) || (anim.changed && anim.opaqueOffset && anim.opaqueOffset.tiles))) {

                                    this.changed = true;

                                    // force opaque vertices to be recalculated in item

                                    if (!item.opaqueFromVertices) {

                                        item._verticesFound = false;

                                    }

                                }

                                item._animCastShadow = anim;

                            }

                        }

                    }

                }

                // items changed, light is changed

                if (numItemsPrefind !== this.items.length) {

                    this.changed = true;

                }

            },

            /**
             * Initializes light for shadow casting.
             * <br>- this is deferred until just before first shadow cast to save on memory
             * @private
             */
            _initShadowCasting: function() {

                if (!this._shadowCastingInitialized) {

                    this._utilVec2Samples1 = {
                        x: 0,
                        y: 0
                    };
                    this._utilVec2Samples2 = {
                        x: 0,
                        y: 0
                    };
                    this._utilVec2Samples3 = {
                        x: 0,
                        y: 0
                    };

                }

            },

            /**
             * Draw the shadows that are cast by items.
             **/
            drawShadows: function() {

                // init shadow casting

                this._initShadowCasting();

                // draw shadows for each light sample and item

                var contextCast = this.imageCast.dataContext;
                var diameter = this.radius * 2;

                // always faster to avoid pixel perfect

                if (this.pixelPerfect) {

                    contextCast.clearRect(0, 0, diameter, diameter);

                    this.castShadows();

                    this.imageCast.finalize(1);

                } else {

                    diameter *= this.scale;

                    contextCast.clearRect(0, 0, diameter, diameter);

                    this.castShadows();

                    this.imageCast.finalize(this.scale);

                }

                // combine base with shadows

                var context = this.image.dataContext;
                var compositeOperation = context.globalCompositeOperation;

                context.clearRect(0, 0, diameter, diameter);

                context.drawImage(this.imageBase.data, 0, 0);

                context.globalCompositeOperation = "destination-out";

                context.drawImage(this.imageCast.data, 0, 0);

                context.globalCompositeOperation = compositeOperation;

                this.image.finalize(this.pixelPerfect ? 1 : this.scale);

            },

            /**
             * Cast shadows of all {@link ig.EntityLight#items} for number of {@link ig.EntityLight#samples} using a spiral algorithm.
             **/
            castShadows: function() {

                var context = this.imageCast.dataContext;
                var minX = this.pos.x;
                var minY = this.pos.y;
                var radius = this.radius;
                var center = _utv2.set(this._utilVec2Samples1, minX + radius, minY + radius);
                var i, il;

                if (this.samples === 1) {

                    for (i = 0, il = this.items.length; i < il; i++) {

                        this.items[i].castShadow(this, context, center, minX, minY, radius);

                    }

                } else {

                    for (var s = 0; s < this.samples; ++s) {

                        var a = s * _utm.GOLDEN_ANGLE;
                        var r = Math.sqrt(s / this.samples) * this.radius;
                        var delta = _utv2.set(this._utilVec2Samples2, Math.cos(a) * r, Math.sin(a) * r);

                        _utv2.copy(this._utilVec2Samples3, center);
                        _utv2.add(this._utilVec2Samples3, delta);

                        for (i = 0, il = this.items.length; i < il; i++) {

                            this.items[i].castShadow(this, context, this._utilVec2Samples3, minX, minY, radius);

                        }

                    }

                }

            },

            /**
             * @override
             */
            cleanup: function() {

                ig.system.onResized.remove(this.resize, this);

                this.parent();

            },

            /**
             * Checks for base entity changes as well as alpha, color, and size changes.
             * @override
             **/
            recordChanges: function(force) {

                if (this.alpha === 0) {

                    this.visible = false;

                } else {

                    this._dirtySize = this._scaleComputedAt !== this.scale || this.radius - this._radiusLast !== 0 || this.size.x - this._sizeLast.x !== 0 | this.size.y - this._sizeLast.y !== 0;

                    if (this.alpha - this._alphaLast !== 0 || this._dirtySize) {

                        force = true;

                    }

                    if (this.dynamicColor) {

                        var rDelta = this.r - this._rLast;
                        var gDelta = this.g - this._gLast;
                        var bDelta = this.b - this._bLast;

                        if (rDelta !== 0 || gDelta !== 0 || bDelta !== 0) {

                            force = this._dirtyColor = true;

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
             * Lights update radius and draw pos is a copy of pos, but do not calculate bounds or vertices.
             * @override
             **/
            updateBounds: function() {

                this.radius = this.getRadius();

                this.posDraw.x = this.pos.x;
                this.posDraw.y = this.pos.y;

            },

            /**
             * @override
             **/
            updateVisible: function() {

                this.compute();

                this.parent();

            },

            /**
             * @override
             **/
            draw: function() {

                var image = this.image;

                // not in screen
                if (!this.visible || !image) {

                    return;

                }

                if (this.dynamicColor) {

                    if (this._dirtyColor) {

                        this._dirtyColor = false;

                        var diameter = this.radius * 2;

                        if (!this.pixelPerfect) {

                            diameter *= this.scale;

                        }

                        // create final light image by combining light with tint
                        // this allows dynamic changing of color, but slower performance

                        var contextColor = this.imageColor.dataContext;

                        contextColor.fillStyle = _utc.RGBToCSS(this.r, this.g, this.b);
                        contextColor.fillRect(0, 0, diameter, diameter);

                        contextColor.globalCompositeOperation = "destination-atop";
                        contextColor.drawImage(this.image.data, 0, 0);

                        this.imageColor.finalize(this.pixelPerfect ? 1 : this.scale);

                    }

                    image = this.imageColor;

                }

                var context = ig.system.context;

                if (this.alpha !== 1) {
                    context.globalAlpha = this.alpha;
                }

                // fixed in screen

                if (this.fixed) {

                    image.draw(
                        this.posDraw.x,
                        this.posDraw.y,
                        undefined, undefined, undefined, undefined,
                        this.scale
                    );

                }
                // default draw
                else {

                    image.draw(
                        this.posDraw.x - ig.game.screen.x,
                        this.posDraw.y - ig.game.screen.y,
                        undefined, undefined, undefined, undefined,
                        this.scale
                    );

                }

                if (this.alpha !== 1) {
                    context.globalAlpha = 1;
                }

            }

        });

        // overrides and fixes for when in editor

        if (ig.global.wm) {

            ig.EntityLight.inject({

                dynamicColor: true,

                init: function(x, y, settings) {

                    this.parent(x, y, settings);

                    // force all lights to be dynamic

                    this.performance = ig.EntityExtended.PERFORMANCE.MOVABLE;

                },

                findItems: function() {},

                resizeCache: function() {

                    var diameter = this.radius * 2;

                    if (!this.pixelPerfect) {

                        diameter *= this.scale;

                    }

                    this.imageBase = this.imageCast = this.image;
                    this.image.setDimensions(diameter, diameter);
                    this.imageColor.setDimensions(diameter, diameter);
                    this._dirtyColor = true;

                },

                drawShadows: function() {},

                draw: function() {

                    this.refresh();

                    this.parent();

                }

            });

        }

    });
