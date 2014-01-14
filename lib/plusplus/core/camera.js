ig.module(
    'plusplus.core.camera'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.timer',
        'plusplus.core.image-drawing',
        'plusplus.ui.ui-overlay',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.signals',
        'plusplus.helpers.tweens'
)
    .defines(function() {
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
        ig.Camera = ig.Class.extend( /**@lends ig.Camera.prototype */ {

            /**
             * Whether to automatically calculate {@link ig.Camera#boundsTrap} from percentages in {@link ig.Camera#boundsTrapPct}.
             * @type Boolean
             * @see ig.CONFIG.CAMERA.BOUNDS_TRAP_AS_PCT
             */
            boundsTrapAsPct: _c.CAMERA.BOUNDS_TRAP_AS_PCT,

            /**
             * Bounds within which to stay relative to entity camera is following.
             * <span class="alert alert-info"><strong>Tip:</strong> this is otherwise known as a camera trap.</span>
             * @type Object
             * @see ig.CONFIG.CAMERA
             */
            boundsTrap: _uti.boundsMinMax(
                _c.CAMERA.BOUNDS_TRAP_MINX,
                _c.CAMERA.BOUNDS_TRAP_MINY,
                _c.CAMERA.BOUNDS_TRAP_MAXX,
                _c.CAMERA.BOUNDS_TRAP_MAXY
            ),

            /**
             * Bounds, as a percentage of screen size between -0.5 and 0.5, within which to stay relative to entity camera is following.
             * <span class="alert alert-info"><strong>Tip:</strong> this is otherwise known as a camera trap.</span>
             * @type Object
             * @see ig.CONFIG.CAMERA
             */
            boundsTrapPct: _uti.boundsMinMax(
                _c.CAMERA.BOUNDS_TRAP_PCT_MINX,
                _c.CAMERA.BOUNDS_TRAP_PCT_MINY,
                _c.CAMERA.BOUNDS_TRAP_PCT_MAXX,
                _c.CAMERA.BOUNDS_TRAP_PCT_MAXY
            ),

            /**
             * Whether to always try to keep centered on entity camera is following.
             * <span class="alert"><strong>IMPORTANT:</strong> this will override {@link ig.Camera#boundsTrap} and {@link ig.Camera#boundsTrapPct}.</span>
             * @type Boolean
             * @default
             */
            keepCentered: _c.CAMERA.KEEP_CENTERED,

            /**
             * Whether to keep the camera locked inside the level, preventing black borders
             * @type Boolean
             * @default
             */
            keepInsideLevel: {
                x: _c.CAMERA.KEEP_INSIDE_LEVEL,
                y: _c.CAMERA.KEEP_INSIDE_LEVEL
            },

            /**
             * Level bounds within which camera should stay when locking camera within level.
             * <br>- calculated automatically on {@link ig.GameExtended#buildLevel} and {@link ig.GameExtended#resize}
             * @type Object
             * @see ig.CONFIG.CAMERA
             */
            boundsLevel: _uti.boundsMinMax(0, 0, 0, 0),

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
             * Whether camera should auto-follow player.
             * <span class="alert"><strong>IMPORTANT:</strong> this only checks once when the level is first created and on each {@link ig.Player#spawn}!</span>
             * @type Boolean
             * @see ig.CONFIG.CAMERA.AUTO_FOLLOW_PLAYER
             */
            autoFollowPlayer: _c.CAMERA.AUTO_FOLLOW_PLAYER,

            /**
             * Whether camera should snap, instead of transition, to first followed entity of a level.
             * @type Boolean
             * @see ig.CONFIG.CAMERA.SNAP_FIRST_FOLLOW
             */
            snapFirstFollow: _c.CAMERA.SNAP_FIRST_FOLLOW,

            /**
             * Whether camera should center first followed entity of a level.
             * @type Boolean
             * @see ig.CONFIG.CAMERA.CENTER_FIRST_FOLLOW
             */
            centerFirstFollow: _c.CAMERA.CENTER_FIRST_FOLLOW,

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
            lerp: _c.CAMERA.LERP,

            /**
             * Duration of transition when switching entities that camera is following.
             * @type Number
             * @default
             */
            transitionDuration: _c.CAMERA.TRANSITION_DURATION,

            /**
             * Minimum duration of transition when switching entities that camera is following.
             * @type Number
             * @default
             */
            transitionDurationMin: _c.CAMERA.TRANSITION_DURATION_MIN,

            /**
             * Maximum duration of transition when switching entities that camera is following.
             * @type Number
             * @default
             */
            transitionDurationMax: _c.CAMERA.TRANSITION_DURATION_MAX,

            /**
             * Base distance to try to transition per duration.
             * <br>- when set to -1, will not affect transition duration
             * @type Number
             * @default
             */
            transitionDistance: _c.CAMERA.TRANSITION_DISTANCE,

            /**
             * Whether camera is transitioning between entities to follow.
             * @type Boolean
             * @readonly
             */
            transitioning: false,

            /**
             * Whether camera is transitioning instantly.
             * @type Boolean
             * @readonly
             */
            transitioningInstantly: false,

            /**
             * Whether camera is transitioning to the center.
             * @type Boolean
             * @readonly
             */
            transitioningCenter: false,

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
            screenLast: {
                x: 0,
                y: 0
            },

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
             * Atmosphere overlay settings that map directly to {@link ig.UIOverlay} settings.
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
            lightBaseOnly: true,

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
             * @type ig.Timer
             */
            shakeTimer: null,

            // internal properties, do not modify

            // transition properties

            _transitionTime: 0,
            _transitionDuration: 0,
            _transitionFrom: {
                x: 0,
                y: 0
            },

            _snap: true,
            _center: true,

            _entityInvulnerable: false,
            _entityPaused: false,
            _entityAlpha: 1,

            // bounds of screen

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
            init: function(settings) {

                ig.merge(this, settings);

                this._snap = this.snapFirstFollow;
                this._center = this.centerFirstFollow;

                this.onTransitioned = new ig.Signal();

                this.shakeTimer = new ig.Timer();

                // add camera resize as the lowest priority

                ig.system.onResized.add(this.resize, this, -1);

            },

            /**
             * Resets camera and game screen, then unfollows current entity that camera is following.
             **/
            reset: function() {

                this.screenLast.x = ig.game.screen.x = 0;
                this.screenLast.y = ig.game.screen.y = 0;

                this.shakeStop();
                this.removeAtmosphere(0);
                this.unfollow();
                this.unfollowFallback();

                this.onTransitioned.removeAll();
                this.onTransitioned.forget();

                this._snap = this.snapFirstFollow;
                this._center = this.centerFirstFollow;

            },

            /**
             * Sets camera as ready. Called automatically at end of {@link ig.GameExtended#buildLevel}.
             **/
            ready: function() {

                // calculate maximum camera coordinates

                this.getBoundsLevel();

                // snap camera to center on player

                if (this.autoFollowPlayer) {

                    this.followPlayer();

                }

            },

            /**
             * Pauses camera.
             **/
            pause: function() {

                this.paused = true;

                this.shakeTimer.pause();

            },

            /**
             * Unpauses camera.
             **/
            unpause: function() {

                this.paused = false;

                this.shakeTimer.unpause();

            },

            /**
             * Calculates the bounds for the current level.
             * @param {ig.Map} [map=ig.game.collisionMap] map to use in defining boundaries
             */
            getBoundsLevel: function(map) {

                map = typeof map != 'undefined' ? map : ig.game.collisionMap;

                if ((this.keepInsideLevel.x || this.keepInsideLevel.y) && map && map.width && map.height && map.tilesize) {

                    this.boundsLevel = _uti.boundsMinMax(
                        0, 0,
                        map.width * map.tilesize - ig.system.width,
                        map.height * map.tilesize - ig.system.height,
                        this.boundsLevel
                    );

                    if (this.boundsLevel.maxX < 0) {

                        this.boundsLevel.minX = this.boundsLevel.maxX = this.boundsLevel.maxX * 0.5;

                    }

                    if (this.boundsLevel.maxY < 0) {

                        this.boundsLevel.minY = this.boundsLevel.maxY = this.boundsLevel.maxY * 0.5;

                    }

                }

            },

            /**
             * Starts shaking camera to simulate an earthquake.
             **/
            shake: function(duration, strength, fn) {

                if (!this.shaking) {

                    this.shaking = true;
                    this.shakeDuration = duration || this.shakeDuration;
                    this.shakeStrength = strength || this.shakeStrength;
                    this.shakeFunction = fn || this.shakeFunction;

                    if (!this.shakeOffset) {

                        this.shakeOffset = {
                            x: 0,
                            y: 0
                        };

                    } else {

                        _utv2.zero(this.shakeOffset);

                    }

                    this.shakeTimer.set(this.shakeDuration);

                }

            },

            /**
             * Stops shaking camera.
             */
            shakeStop: function() {

                if (this.shaking) {

                    this.shaking = false;

                    ig.game.screen.x -= this.shakeOffset.x;
                    ig.game.screen.y -= this.shakeOffset.y;

                }

            },

            /**
             * Updates camera shake.
             */
            updateShake: function() {

                if (this.shaking) {

                    ig.game.screen.x -= this.shakeOffset.x;
                    ig.game.screen.y -= this.shakeOffset.y;

                    var delta = this.shakeTimer.delta();

                    if (delta >= 0) {

                        this.shakeStop();

                    } else {

                        var deltaPct = -delta / this.shakeDuration;
                        var value = this.shakeFunction ? this.shakeFunction() : (this.shakeStrength * Math.pow(deltaPct, 2));

                        if (value > 0.5) {

                            this.shakeOffset.x += _utm.map(Math.random(), 0, 1, -value, value);
                            this.shakeOffset.y += _utm.map(Math.random(), 0, 1, -value, value);

                        }

                        _utv2.multiplyScalar(this.shakeOffset, deltaPct);

                    }

                }

            },

            /**
             * Toggles atmosphere.
             * @param {Number} [duration] duration of fade.
             * @param {Object} [atmosphereSettings] settings for atmosphere.
             */
            toggleAtmosphere: function(duration, atmosphereSettings) {

                if (!this.atmosphere) {

                    this.addAtmosphere(duration, atmosphereSettings);

                } else {

                    this.removeAtmosphere(duration);

                }

            },

            /**
             * Creates and overlays atmosphere ontop of game world.
             * @param {Number} [duration] duration of fade.
             * @param {Object} [atmosphereSettings] settings for atmosphere.
             */
            addAtmosphere: function(duration, atmosphereSettings) {

                // has no atmosphere yet or settings were passed (assume they are different than current)

                if (!this.atmosphere || atmosphereSettings) {

                    // remove previous

                    if (this.atmosphere) {

                        this.removeAtmosphere(duration);

                    }

                    this.atmosphere = true;
                    this.atmosphereFadeDuration = _ut.isNumber(duration) ? duration : this.atmosphereFadeDuration;
                    this.atmosphereOverlay = ig.game.spawnEntity(ig.UIOverlay, 0, 0, (atmosphereSettings ? ig.merge(ig.merge({}, this.atmosphereSettings), atmosphereSettings) : this.atmosphereSettings));

                    if (this.atmosphereOverlay.added) {

                        this._showAtmosphere();

                    } else {

                        this.atmosphereOverlay.onAdded.addOnce(this._showAtmosphere, this);

                    }

                }

            },

            /**
             * Fades atmosphere in.
             * @private
             */
            _showAtmosphere: function() {

                if (this.atmosphereOverlay) {

                    this.atmosphereOverlay.alpha = 0;
                    this.atmosphereOverlay.fadeTo(this.atmosphereOverlay.resetState.alpha, {
                        duration: this.atmosphereFadeDuration
                    });

                    this.changed = true;

                    this.updateAtmosphere();

                }

            },

            /**
             * Fades and removes atmosphere.
             * @param {Number} [duration] duration of fade.
             */
            removeAtmosphere: function(duration) {

                this.atmosphere = false;

                if (this.atmosphereOverlay) {

                    if (!this.atmosphereOverlay.added) {

                        this.atmosphereOverlay.onAdded.remove(this._showAtmosphere, this);
                        ig.game.removeEntity(this.atmosphereOverlay);

                    } else {

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
            updateAtmosphere: function() {

                if (this.atmosphere) {

                    // redraw

                    if (this.changed || (this.lightsCutout && (ig.game.dirtyLights || ig.game.changedLights))) {

                        this.atmosphereOverlay.refresh(true);

                        // cut each light out of atmosphere

                        var context = this.atmosphereOverlay.fill.dataContext;

                        if (this.lightsCutout) {

                            context.globalCompositeOperation = "destination-out";

                            var lights = ig.game.lights;
                            var i, il;

                            for (i = 0, il = lights.length; i < il; i++) {

                                var light = lights[i];

                                if (light.visible && light.image) {

                                    context.globalAlpha = Math.min(1, light.alpha * this.lightAmplification);

                                    // generally we only cut out the light base, not the shadows

                                    context.drawImage(
                                        (this.lightBaseOnly && light.castsShadows ? light.imageBase.data : light.image.data),
                                        ig.system.getDrawPos(light.posDraw.x - ig.game.screen.x),
                                        ig.system.getDrawPos(light.posDraw.y - ig.game.screen.y)
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
             * @param {Boolean} [center] whether to center on entity.
             **/
            follow: function(entity, snap, center) {

                snap = snap || this._snap;
                center = center || this._center;

                if (this.entity !== entity || snap || center) {

                    this._snap = this._center = false;

                    this.unfollow();

                    this.entity = entity;

                    if (this.entity) {

                        this.transitioning = true;
                        this.transitioningInstantly = snap;
                        this.transitioningCenter = center;
                        this._transitionTime = 0;
                        _utv2.copy(this._transitionFrom, ig.game.screen);

                        if (this.transitioningCenter) {

                            _uti.bounds(ig.game.screen.x, ig.game.screen.y, 0, 0, this._boundsScreen);

                        } else {

                            _uti.boundsCopy(this._boundsScreen, this.boundsTrap, ig.game.screen.x, ig.game.screen.y);

                        }

                    }

                }

                if (this.transitioning) {

                    if (this.transitioningInstantly) {

                        this.updateFollow();

                    }

                } else if (this.entity) {

                    this.transitionComplete();

                }

            },

            /**
             * Sets a fallback follow entity and follows if not following any other.
             * @param {ig.EntityExtended} [entity] entity to follow.
             * @param {Boolean} [snap] whether to snap to entity instead of transitioning.
             * @param {Boolean} [center] whether to center on entity.
             **/
            followFallback: function(entity, snap, center) {

                if (this.entityFallback !== entity) {

                    this.entityFallback = entity;

                    if (!this.entity) {

                        this.follow(this.entityFallback, snap, center);

                    }

                }

            },

            /**
             * Special follow case for use with respawned entity that pauses and makes entity invulnerable until transition is complete.
             * @param {ig.EntityExtended} [entity] entity to follow.
             **/
            followRespawnable: function(entity) {

                this.followFallback(entity);

                if (this.transitioning) {

                    if (!entity.invulnerable) {

                        entity.invulnerable = this._entityInvulnerable = true;

                    }

                    if (!entity.paused) {

                        this._entityPaused = true;

                        entity.pause();

                        // make entity invisible

                        this._entityAlpha = entity.alpha;

                        entity.alpha = 0;

                    }

                }

            },

            /**
             * Gets player entity and follow it as fallback.
             * @param {Boolean} [snap] whether to snap to entity instead of transitioning.
             * @param {Boolean} [center] whether to center on entity.
             **/
            followPlayer: function(snap, center) {

                var player = ig.game.getPlayer();

                if (player) {

                    this.unfollow();
                    this.followFallback(player, snap, center);

                    player.onRemoved.add(this.unfollowFallback, this);
                    player.onAdded.add(this.followRespawnable, this);

                }

            },

            /**
             * Stops following and/or transitioning to an entity.
             **/
            unfollow: function() {

                if (this.entity) {

                    this.entity = undefined;

                }

                if (this.transitioning) {

                    this.transitioning = false;
                    this._transitionTime = 0;

                    _uti.boundsCopy(this._boundsScreen, this.boundsTrap, ig.game.screen.x, ig.game.screen.y);

                }

            },

            /**
             * Unsets follow fallback entity.
             **/
            unfollowFallback: function() {

                if (this.entityFallback) {

                    if (this.entityFallback === this.entity) {

                        this.unfollow();

                    }

                    this.entityFallback = undefined;

                }

                if (this.transitioning) {

                    this.transitioning = false;

                    _uti.boundsCopy(this._boundsScreen, this.boundsTrap, ig.game.screen.x, ig.game.screen.y);

                }

            },

            /**
             * Called automatically when transition is completed.
             */
            transitionComplete: function() {

                this.transitioning = this.transitioningInstantly = this.transitioningCenter = false;

                if (this._entityInvulnerable && this.entity.invulnerable) {

                    this.entity.invulnerable = this._entityInvulnerable = false;

                }

                if (this._entityPaused && this.entity.paused) {

                    this._entityPaused = false;
                    this.entity.unpause();
                    this.entity.alpha = this._entityAlpha;

                }

                this.onTransitioned.dispatch();

            },

            /**
             * Updates a follow in progress.
             * <br>- called automatically by camera's update.
             **/
            updateFollow: function() {

                var screen = ig.game.screen;

                // fallback

                if (!this.entity && this.entityFallback) {

                    this.follow(this.entityFallback);

                }

                // follow

                if (this.entity) {

                    _utv2.copy(this.screenLast, screen);

                    var screenNextX = this.entity.pos.x + this.entity.size.x * 0.5 - ig.system.width * 0.5;
                    var screenNextY = this.entity.pos.y + this.entity.size.y * 0.5 - ig.system.height * 0.5;

                    var noteX, noteY;

                    if (this.transitioning) {

                        this.changed = true;

                        if (this.transitioningInstantly) {

                            this.transitionPct = 1;

                        } else {

                            // set transitionDuration

                            if (this._transitionTime === 0) {

                                if (this.transitionDistance > 0) {

                                    var dx = (screenNextX - this._boundsScreen.minX);
                                    var dy = (screenNextY - this._boundsScreen.minY);
                                    var distance = Math.sqrt(dx * dx + dy * dy);

                                    this._transitionDuration = _utm.clamp((this.transitionDuration * (distance / this.transitionDistance)), this.transitionDurationMin, this.transitionDurationMax);

                                } else {

                                    this._transitionDuration = this.transitionDuration;

                                }

                            }

                            this._transitionTime += ig.system.tick;
                            this.transitionPct = this._transitionTime / this._transitionDuration;

                        }

                        var value = _tw.Easing.Quadratic.InOut(this.transitionPct);

                        if (screenNextX < this._boundsScreen.minX) {

                            screen.x = this._transitionFrom.x + (screenNextX - (this._boundsScreen.minX + (this.transitioningCenter ? this._boundsScreen.width * 0.5 : 0))) * value;

                        } else if (screenNextX > this._boundsScreen.maxX) {

                            screen.x = this._transitionFrom.x + (screenNextX - (this._boundsScreen.maxX - (this.transitioningCenter ? this._boundsScreen.width * 0.5 : 0))) * value;

                        } else {

                            noteX = true;

                        }

                        if (screenNextY < this._boundsScreen.minY) {

                            screen.y = this._transitionFrom.y + (screenNextY - (this._boundsScreen.minY + (this.transitioningCenter ? this._boundsScreen.height * 0.5 : 0))) * value;

                        } else if (screenNextY > this._boundsScreen.maxY) {

                            screen.y = this._transitionFrom.y + (screenNextY - (this._boundsScreen.maxY - (this.transitioningCenter ? this._boundsScreen.height * 0.5 : 0))) * value;

                        } else {

                            noteY = true;

                        }

                        // while transitioning, check if done

                        if (this.transitionPct >= 1 || (noteX && noteY)) {

                            this.transitionComplete();

                        }

                    } else {

                        // get actual screen next position

                        if (this.keepCentered) {

                            screen.x += (screenNextX - screen.x) * this.lerp;
                            screen.y += (screenNextY - screen.y) * this.lerp;

                        } else {

                            if (screenNextX < this._boundsScreen.minX) {

                                screen.x += screenNextX - this._boundsScreen.minX;

                            } else if (screenNextX > this._boundsScreen.maxX) {

                                screen.x += screenNextX - this._boundsScreen.maxX;

                            }

                            if (screenNextY < this._boundsScreen.minY) {

                                screen.y += screenNextY - this._boundsScreen.minY;

                            } else if (screenNextY > this._boundsScreen.maxY) {

                                screen.y += screenNextY - this._boundsScreen.maxY;

                            }

                        }

                        if (screen.x - this.screenLast.x !== 0 || screen.y - this.screenLast.y !== 0) {

                            this.changed = true;

                        }

                    }

                }

                // record last and limit

                if (this.changed) {

                    if (this.keepInsideLevel.x) {

                        this.screenLast.x = screen.x = _utm.clamp(screen.x, this.boundsLevel.minX, this.boundsLevel.maxX);

                    } else {

                        this.screenLast.x = screen.x;

                    }

                    if (this.keepInsideLevel.y) {

                        this.screenLast.y = screen.y = _utm.clamp(screen.y, this.boundsLevel.minY, this.boundsLevel.maxY);

                    } else {

                        this.screenLast.y = screen.y;

                    }

                    // don't copy new bounds while transitioning
                    // as this will cause transition to move to wrong location

                    if (!this.transitioning) {

                        _uti.boundsCopy(this._boundsScreen, this.boundsTrap, screen.x, screen.y);

                    }

                }

                // apply shake

                if (this.shaking) {

                    screen.x += this.shakeOffset.x;
                    screen.y += this.shakeOffset.y;

                    this.changed = true;

                }

            },

            /**
             * Updates camera.
             **/
            update: function() {

                this.changed = false;

                if (!this.paused) {

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
            resize: function() {

                this.changed = true;

                // update level bounds

                this.getBoundsLevel();

                // boundsTrap pct to boundsTrap

                if (this.boundsTrapAsPct) {

                    _uti.boundsCopy(this.boundsTrap, this.boundsTrapPct, 0, 0, ig.system.width * 0.5, ig.system.height * 0.5);

                }

                // refollow

                if (this.entity) {

                    this.follow(this.entity, true, true);

                }

                // atmosphere

                this.updateAtmosphere();

            }

        });

    });
