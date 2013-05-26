ig.module(
        'plusplus.core.camera'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-overlay',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.signals',
        'plusplus.helpers.tweens'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utm = ig.utilsmath;
        var _utv2 = ig.utilsvector2;
        var _uti = ig.utilsintersection;
        var _tw = ig.TWEEN;

        /**
         * Camera object for following objects and controlling screen.
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Camera = ig.Class.extend(/**@lends ig.Camera.prototype */{

            /**
             * Bounds within which to stay relative to entity camera is following.
             * @type Object
             * @see _ig.utilsintersection.bounds
             */
            bounds: _uti.boundsMinMax(0, 0, 0, 0),

            /**
             * Bounds, as a percentage of screen size, within which to stay relative to entity camera is following.
             * @type Object
             * @see _ig.utilsintersection.bounds
             */
            boundsPct: _uti.boundsMinMax(-0.2, -0.3, 0.2, 0.3),

            /**
             * Whether to always try to keep centered on entity camera is following.
             * @type Boolean
             * @default
             */
            keepCentered: false,

            /**
             * How quickly to interpolate to target camera location.
             * @type Number
             * @example
             * // set to 1 to snap camera
             * camera.lerp = 1;
             * // set to 0.025 to move slowly and smoothly
             * camera.lerp = 0.025;
             * @default
             */
            lerp: 0.025,

            /**
             * Duration of transition when switching entities that camera is following.
             * @type Boolean
             * @default
             */
            transitionDuration: 1,

            /**
             * Whether camera has been changed since last update.
             * @type Boolean
             * @readonly
             */
            changed: false,

            /**
             * Whether camera is transitioning between entities to follow.
             * @type Boolean
             * @readonly
             */
            transitioning: false,

            /**
             * Percent progress of transition.
             * @type Boolean
             * @readonly
             */
            transitionPct: 0,

            /**
             * Last position of screen.
             * @type Object
             * @readonly
             */
            screenLast: _utv2.vector(),

            /**
             * Whether camera is overlaying atmosphere ontop of game world.
             * @type Boolean
             * @readonly
             * @default
             */
            atmosphere: false,

            /**
             * Atmosphere overlay entity.
             * @type ig.EntityExtended
             * @readonly
             * @default
             */
            atmosphereOverlay: null,

            /**
             * Atmosphere red value from 0 to 1.
             * @type Number
             * @default
             */
            r: 0,

            /**
             * Atmosphere green value from 0 to 1.
             * @type Number
             * @default
             */
            g: 0,

            /**
             * Atmosphere blue value from 0 to 1.
             * @type Number
             * @default
             */
            b: 0,

            /**
             * Atmosphere alpha value from 0 to 1.
             * @type Number
             * @default
             */
            alpha: 0.9,

            /**
             * Duration of atmosphere fade.
             * @type Number
             * @default
             */
            alphaDuration: 1000,

            /**
             * Multiplier to amplify lights when cutting them out from atmosphere.
             * @type Number
             * @default
             */
            lightAmplification: 3,

            /**
             * Whether to draw light base shape (i.e. circle) or with shadows included, when cutting lights out of atmosphere.
             * <br>- be careful when using this with characters that cast shadows!
             * @type Boolean
             * @default
             */
            lightBaseOnly: false,

            /**
             * Whether to cut lights out of atmosphere.
             * @type Boolean
             * @default
             */
            lightsCutout: true,

            /**
             * Signal dispatched when camera finishes transitioning between entities to follow.
             * <br>- created on init.
             * @type ig.Signal
             */
            onTransitioned: null,

            // internal properties, do not modify

            // transition properties

            _transitionTime: 0,
            _transitionFrom: _utv2.vector(),

            _boundsScreen: _uti.boundsMinMax(0, 0, 0, 0),

            // records of last properties

            _rLast: 0,
            _gLast: 0,
            _bLast: 0,
            _alphaLast: 0,

            /**
             * Initializes camera.
             * @param {Object} settings settings for camera.
             */
            init: function (settings) {

                ig.merge(this, settings);

                this.onTransitioned = new ig.Signal();

            },

            /**
             * Resets camera and game screen, then unfollows current entity that camera is following.
             **/
            reset: function () {

                this.screenLast.x = ig.game.screen.x = 0;
                this.screenLast.y = ig.game.screen.y = 0;

                this.unfollow();

            },

            /**
             * Toggles atmosphere.
             * @param {Number} [duration] duration of fade.
             */
            toggleAtmosphere: function (duration) {

                if (!this.atmosphere) {

                    this.addAtmosphere(duration);

                }
                else {

                    this.removeAtmosphere(duration);

                }

            },

            /**
             * Creates and overlays atmosphere ontop of game world.
             * @param {Number} [duration] duration of fade.
             */
            addAtmosphere: function (duration) {

                if (!this.atmosphere) {

                    this.atmosphere = true;
                    this.atmosphereOverlay = ig.game.spawnEntity(ig.UIOverlay, 0, 0, {
                        r: this.r,
                        g: this.g,
                        b: this.b,
                        alpha: 0
                    });

                    this.resize();

                    this.atmosphereOverlay.fadeTo(this.alpha, {
                        duration: _ut.isNumber(duration) ? duration : this.alphaDuration
                    });

                }

            },

            /**
             * Fades and removes atmosphere.
             * @param {Number} [duration] duration of fade.
             */
            removeAtmosphere: function (duration) {

                var me = this;

                this.atmosphereOverlay.fadeOut({
                    duration: _ut.isNumber(duration) ? duration : this.alphaDuration,
                    onComplete: function () {

                        me._cleanAtmosphere();

                    }
                });

            },

            /**
             * Destroys atmosphere.
             * @private
             */
            _cleanAtmosphere: function () {

                this.atmosphere = false;

                if (this.atmosphereOverlay) {

                    ig.game.removeEntity(this.atmosphereOverlay);
                    this.atmosphereOverlay = undefined;

                }

            },

            /**
             * Updates atmosphere if camera changed or cutting lights out of atmosphere and lights changed.
             * <br>- called automatically by camera's update.
             */
            updateAtmosphere: function () {

                if (this.atmosphere) {

                    // check if changed

                    var alphaDelta = this.alpha - this._alphaLast;
                    var rDelta = this.r - this._rLast;
                    var gDelta = this.g - this._gLast;
                    var bDelta = this.b - this._bLast;

                    if (alphaDelta !== 0 || rDelta !== 0 || gDelta !== 0 || bDelta !== 0) {

                        this.changed = true;

                    }

                    // redraw

                    if (( this.changed || ( this.lightsCutout && ( ig.game.dirtyLights || ig.game.changedLights ) ) ) && this.alpha) {

                        // record screenLast

                        this._rLast = this.r;
                        this._gLast = this.g;
                        this._bLast = this.b;
                        this._alphaLast = this.alpha;

                        // fill in atmosphere

                        this.atmosphereOverlay.r = this.r;
                        this.atmosphereOverlay.g = this.g;
                        this.atmosphereOverlay.b = this.b;

                        this.atmosphereOverlay.resize(true);

                        // cut each light out of atmosphere

                        var context = this.atmosphereOverlay.fill.dataContext;

                        if (this.lightsCutout) {

                            context.globalCompositeOperation = "destination-out";

                            var lights = ig.game.lights;
                            var i, il;

                            for (i = 0, il = lights.length; i < il; i++) {

                                var light = lights[ i ];

                                if (light.visible && light.image) {

                                    context.globalAlpha = Math.min(1, light.alpha * this.lightAmplification);

                                    // generally we only cut out the light base, not the shadows

                                    context.drawImage(
                                        ( this.lightBaseOnly ? light.imageBase.data : light.image.data ),
                                        ig.system.getDrawPos(light.boundsDraw.minX - ig.game.screen.x),
                                        ig.system.getDrawPos(light.boundsDraw.minY - ig.game.screen.y)
                                    );

                                }

                            }

                            context.globalCompositeOperation = "source-over";

                        }

                    }

                }

            },

            /**
             * Starts following an entity.
             * @param {ig.EntityExtended} entity entity to follow.
             * @param {Boolean} [snap] whether to snap to entity instead of transitioning.
             **/
            follow: function (entity, snap) {

                if (this.entity !== entity || snap === true) {

                    this.unfollow();

                    this.entity = entity;

                    this.transitioning = snap ? false : true;
                    this._transitionTime = 0;
                    _utv2.copy(this._transitionFrom, ig.game.screen);

                }

            },

            /**
             * Stops following and/or transitioning to an entity.
             **/
            unfollow: function () {

                if (this.entity) {

                    this.entity = undefined;

                }

                if (this.transitioning) {

                    this.transitioning = false;

                    _uti.boundsCopy(this._boundsScreen, this.bounds, screen.x, screen.y);

                }

            },

            /**
             * Updates a follow in progress.
             * <br>- called automatically by camera's update.
             **/
            updateFollow: function () {

                if (this.entity) {

                    var screen = ig.game.screen;

                    _utv2.copy(this.screenLast, screen);

                    var screenNextX = this.entity.boundsDraw.minX + this.entity.boundsDraw.width * 0.5 - ig.system.width * 0.5;
                    var screenNextY = this.entity.boundsDraw.minY + this.entity.boundsDraw.height * 0.5 - ig.system.height * 0.5;
                    var noteX, noteY;

                    if (this.transitioning) {

                        this.changed = true;

                        this._transitionTime += ig.system.tick;
                        this.transitionPct = this._transitionTime / this.transitionDuration;
                        var value = _tw.Easing.Quadratic.InOut(this.transitionPct);

                        if (screenNextX < this._boundsScreen.minX) {

                            screen.x = this._transitionFrom.x + ( screenNextX - this._boundsScreen.minX ) * value;

                        }
                        else if (screenNextX > this._boundsScreen.maxX) {

                            screen.x = this._transitionFrom.x + ( screenNextX - this._boundsScreen.maxX ) * value;

                        }
                        else {

                            noteX = true;

                        }

                        if (screenNextY < this._boundsScreen.minY) {

                            screen.y = this._transitionFrom.y + ( screenNextY - this._boundsScreen.minY ) * value;

                        }
                        else if (screenNextY > this._boundsScreen.maxY) {

                            screen.y = this._transitionFrom.y + ( screenNextY - this._boundsScreen.maxY ) * value;

                        }
                        else {

                            noteY = true;

                        }

                        // while transitioning, check if done

                        if (this.transitionPct >= 1 || ( noteX && noteY )) {

                            this.transitioning = false;
                            _uti.boundsCopy(this._boundsScreen, this.bounds, screen.x, screen.y);

                            this.onTransitioned.dispatch();

                        }

                    }
                    else {

                        // get actual screen next position

                        if (screenNextX < this._boundsScreen.minX) {

                            screen.x += screenNextX - this._boundsScreen.minX;

                        }
                        else if (screenNextX > this._boundsScreen.maxX) {

                            screen.x += screenNextX - this._boundsScreen.maxX;

                        }
                        else if (this.keepCentered) {

                            screen.x += ( screenNextX - screen.x ) * this.lerp;

                        }

                        if (screenNextY < this._boundsScreen.minY) {

                            screen.y += screenNextY - this._boundsScreen.minY;

                        }
                        else if (screenNextY > this._boundsScreen.maxY) {

                            screen.y += screenNextY - this._boundsScreen.maxY;

                        }
                        else if (this.keepCentered) {

                            screen.y += ( screenNextY - screen.y ) * this.lerp;

                        }

                        // check if screenLast and next are not near equal

                        if (!_utm.almostEqual(screen.x, this.screenLast.x, _c.PRECISION_ZERO)) {

                            this.changed = true;
                            this.screenLast.x = screen.x;
                            _uti.boundsCopyX(this._boundsScreen, this.bounds, screen.x);

                        }

                        if (!_utm.almostEqual(screen.y, this.screenLast.y, _c.PRECISION_ZERO)) {

                            this.changed = true;
                            this.screenLast.y = screen.y;
                            _uti.boundsCopyY(this._boundsScreen, this.bounds, screen.y);

                        }

                    }

                }

            },

            /**
             * Updates camera.
             **/
            update: function () {

                this.changed = false;

                // follow

                this.updateFollow();

                // atmosphere

                this.updateAtmosphere();

            },

            /**
             * Resizes camera.
             **/
            resize: function () {

                this.changed = true;

                // bounds pct to bounds

                _uti.boundsCopy(this.bounds, this.boundsPct, 0, 0, ig.system.width * 0.5, ig.system.height * 0.5);
                _uti.boundsCopy(this._boundsScreen, this.bounds, ig.game.screen.x, ig.game.screen.y);

                // atmosphere

                this.updateAtmosphere();

            }

        });

    });