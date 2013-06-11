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
             * Whether camera is paused.
             * @type Boolean
             * @default
             */
            paused: false,

            /**
             * Whether camera has been changed since last update.
             * @type Boolean
             * @readonly
             */
            changed: false,

            /**
             * Entity camera is following.
             * @type ig.EntityExtended
             * @default
             */
            entity: null,

            /**
             * Entity camera will automatically follow when nothing else to follow.
             * @type ig.EntityExtended
             * @default
             */
            entityFallback: null,

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
             * @type Number
             * @default
             */
            transitionDuration: _c.CAMERA_TRANSITION_DURATION,

            /**
             * Minimum duration of transition when switching entities that camera is following.
             * @type Number
             * @default
             */
            transitionDurationMin: _c.CAMERA_TRANSITION_DURATION_MIN,

            /**
             * Maximum duration of transition when switching entities that camera is following.
             * @type Number
             * @default
             */
            transitionDurationMax: _c.CAMERA_TRANSITION_DURATION_MAX,

            /**
             * Base distance to try to transition per duration.
             * <br>- when set to -1, will not affect transition duration
             * @type Number
             * @default
             */
            transitionDistance: _c.CAMERA_TRANSITION_DISTANCE,

            /**
             * Whether camera is transitioning between entities to follow.
             * @type Boolean
             * @readonly
             */
            transitioning: false,

            /**
             * Percent progress of transition.
             * @type Number
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
             * <br>- created on first atmosphere add
             * @type Object
             * @readonly
             * @default
             */
            atmosphereOverlay: null,

            /**
             * Atmosphere overlay settings that map directly to (@link ig.UIOverlay} settings.
             * @type ig.EntityExtended
             */
            atmosphereSettings: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0.9
            },

            /**
             * Duration of atmosphere fade.
             * @type Number
             * @default
             */
            atmosphereFadeDuration: 1000,

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

            /**
             * Whether camera is shaking.
             * @type Boolean
             */
            shaking: false,

            /**
             * Camera shake strength.
             * @type Boolean
             * @default
             */
            shakeStrength: 8,

            /**
             * Camera shake duration in seconds.
             * @type Number
             * @default
             */
            shakeDuration: 2,

            /**
             * Camera shake value function.
             * @type Function
             */
            shakeFunction: false,

            /**
             * Camera shake value function.
             * <br>- created on first shake
             * @type Vector2|Object
             */
            shakeOffset: null,

            /**
             * Camera shake timer.
             * <br>- created on first shake
             * @type ig.TimerExtended
             */
            shakeTimer: null,

            // internal properties, do not modify

            // transition properties

            _transitionTime: 0,
            _transitionDuration: 0,
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
                this.unfollowFallback();
                this.shakeStop();

                this.onTransitioned.removeAll();
                this.onTransitioned.forget();

            },

            /**
             * Starts shaking camera to simulate an earthquake.
             **/
            shake: function ( duration, strength, fn ) {

                if ( !this.shaking ) {

                    this.shaking = true;
                    this.shakeDuration = duration || this.shakeDuration;
                    this.shakeStrength = strength || this.shakeStrength;
                    this.shakeFunction = fn || this.shakeFunction;

                    if ( !this.shakeOffset ) {

                        this.shakeOffset = _utv2.vector();

                    }
                    else {

                        _utv2.zero( this.shakeOffset );

                    }

                    if ( !this.shakeTimer ) {

                        this.shakeTimer = new ig.TimerExtended();

                    }

                    this.shakeTimer.set(this.shakeDuration);

                }

            },

            /**
             * Stops shaking camera.
             */
            shakeStop: function () {

                if ( this.shaking ) {

                    this.shaking = false;

                    ig.game.screen.x -= this.shakeOffset.x;
                    ig.game.screen.y -= this.shakeOffset.y;

                }

            },

            /**
             * Updates camera shake.
             */
            updateShake: function () {

                if ( this.shaking ) {

                    ig.game.screen.x -= this.shakeOffset.x;
                    ig.game.screen.y -= this.shakeOffset.y;

                    var delta = this.shakeTimer.delta();

                    if ( delta >= 0 ) {

                        this.shakeStop();

                    }
                    else {

                        var deltaPct = -delta / this.shakeDuration;
                        var value = this.shakeFunction ? this.shakeFunction() : ( this.shakeStrength * Math.pow(deltaPct, 2) );

                        if (value > 0.5) {

                            this.shakeOffset.x += Math.random().map(0, 1, -value, value);
                            this.shakeOffset.y += Math.random().map(0, 1, -value, value);

                        }

                        _utv2.multiplyScalar( this.shakeOffset, deltaPct );

                    }

                }

            },

            /**
             * Toggles atmosphere.
             * @param {Number} [duration] duration of fade.
             * @param {Object} [atmosphereSettings] settings for atmosphere.
             */
            toggleAtmosphere: function (duration, atmosphereSettings) {

                if (!this.atmosphere) {

                    this.addAtmosphere(duration, atmosphereSettings);

                }
                else {

                    this.removeAtmosphere(duration);

                }

            },

            /**
             * Creates and overlays atmosphere ontop of game world.
             * @param {Number} [duration] duration of fade.
             * @param {Object} [atmosphereSettings] settings for atmosphere.
             */
            addAtmosphere: function (duration, atmosphereSettings) {

                // has no atmosphere yet or settings were passed (assume they are different than current)

                if (!this.atmosphere || atmosphereSettings ) {

                    // remove previous

                    if (this.atmosphere) {

                        this.removeAtmosphere( duration );

                    }

                    this.atmosphere = true;
                    this.atmosphereFadeDuration = _ut.isNumber(duration) ? duration : this.atmosphereFadeDuration;
                    this.atmosphereOverlay = ig.game.spawnEntity(ig.UIOverlay, 0, 0, ( atmosphereSettings ? ig.merge( ig.merge( {}, this.atmosphereSettings ), atmosphereSettings ) : this.atmosphereSettings ) );

                    if ( this.atmosphereOverlay.added ) {

                        this._showAtmosphere();

                    }
                    else {

                        this.atmosphereOverlay.onAdded.addOnce( this._showAtmosphere, this );

                    }

                }

            },

            /**
             * Fades atmosphere in.
             * @private
             */
            _showAtmosphere: function () {

                if ( this.atmosphereOverlay ) {

                    this.atmosphereOverlay.alpha = 0;

                    this.resize();

                    this.atmosphereOverlay.fadeTo(this.atmosphereOverlay.resetState.alpha, {
                        duration: this.atmosphereFadeDuration
                    });

                }

            },

            /**
             * Fades and removes atmosphere.
             * @param {Number} [duration] duration of fade.
             */
            removeAtmosphere: function (duration) {

                this.atmosphere = false;

                if ( this.atmosphereOverlay ) {

                    if ( !this.atmosphereOverlay.added ) {

                        this.atmosphereOverlay.onAdded.remove( this._showAtmosphere, this );
                        ig.game.removeEntity(this.atmosphereOverlay);

                    }
                    else {

                        this.atmosphereOverlay.fadeToDeath({
                            duration: _ut.isNumber(duration) ? duration : this.atmosphereFadeDuration
                        });

                    }

                    this.atmosphereOverlay = undefined;

                }

            },

            /**
             * Updates atmosphere if camera changed or cutting lights out of atmosphere and lights changed.
             * <br>- called automatically by camera's update.
             */
            updateAtmosphere: function () {

                if (this.atmosphere) {

                    // redraw

                    if ( this.changed || ( this.lightsCutout && ( ig.game.dirtyLights || ig.game.changedLights ) ) ) {

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

                    if ( this.entity ) {

                        this.transitioning = !snap;
                        this._transitionTime = 0;
                        _utv2.copy(this._transitionFrom, ig.game.screen);

                    }

                }

                if ( this.transitioning !== true && this.entity ) {

                    this.onTransitioned.dispatch( this );

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
             * Sets a fallback follow entity and follows if not following any other.
             * @param {ig.EntityExtended} [entity] entity to follow.
             * @param {Boolean} [snap] whether to snap to entity instead of transitioning.
             **/
            followFallback: function (entity, snap) {

                if (this.entityFallback !== entity) {

                    this.entityFallback = entity;

                    if ( !this.entity ) {

                        this.follow( this.entityFallback, snap );

                    }

                }

            },

            /**
             * Unsets follow fallback entity.
             **/
            unfollowFallback: function () {

                if (this.entityFallback) {

                    if ( this.entityFallback === this.entity ) {

                        this.unfollow();

                    }

                    this.entityFallback = undefined;

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

                var screen = ig.game.screen;

                // fallback

                if ( !this.entity ) {

                    this.follow( this.entityFallback );

                }

                // follow

                if (this.entity) {

                    _utv2.copy(this.screenLast, screen);

                    var screenNextX = this.entity.boundsDraw.minX + this.entity.boundsDraw.width * 0.5 - ig.system.width * 0.5;
                    var screenNextY = this.entity.boundsDraw.minY + this.entity.boundsDraw.height * 0.5 - ig.system.height * 0.5;
                    var noteX, noteY;

                    if (this.transitioning) {

                        this.changed = true;

                        // set transitionDuration

                        if ( this._transitionTime === 0 ) {

                            if ( this.transitionDistance > 0 ) {

                                var dx = ( screenNextX - this._boundsScreen.minX );
                                var dy = ( screenNextY - this._boundsScreen.minY );
                                var distance = Math.sqrt( dx * dx + dy * dy );

                                this._transitionDuration = ( this.transitionDuration * ( distance / this.transitionDistance ) ).limit( this.transitionDurationMin, this.transitionDurationMax );

                            }
                            else {

                                this._transitionDuration = this.transitionDuration;

                            }

                        }

                        this._transitionTime += ig.system.tick;
                        this.transitionPct = this._transitionTime / this._transitionDuration;
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

                if ( this.shaking ) {

                    screen.x += this.shakeOffset.x;
                    screen.y += this.shakeOffset.y;

                }

            },

            /**
             * Updates camera.
             **/
            update: function () {

                this.changed = false;

                if ( !this.paused ) {

                    // shake

                    this.updateShake();

                    // follow

                    this.updateFollow();

                    // atmosphere

                    this.updateAtmosphere();

                }

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