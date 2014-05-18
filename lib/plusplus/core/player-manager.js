ig.module(
    'plusplus.core.player-manager'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsintersection',
        'plusplus.ui.ui-dpad'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utm = ig.utilsmath;
        var _uti = ig.utilsintersection;

        /**
         * Manager / controller that translates all input into actions for an entity.
         * <span class="alert"><strong>IMPORTANT:</strong> you should use the manager to control your player character, which is created automatically as the game's {@link ig.GameExtended#playerManager} property.</span>
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // the player manager will automatically manage the player character
         * // i.e. handle translating inputs into basic movements
         * // as long as the player character either:
         * // (a) extends the ig.Player abstract, or
         * // (b) can be found by the game's getPlayer method
         * // it is important to note that any managed entity
         * // should at least extend ig.Character, or define all the basic movement methods
         * // you can easily change the entity controlled by the player
         * ig.game.playerManager.manage( myOtherPlayerCharacter );
         * // you can swap back to the orignal player character easily
         * ig.game.playerManager.manage( myOriginalPlayerCharacter );
         * // you can stop managing a character just as easily
         * // (this method is called automatically when you manage a new character)
         * ig.game.playerManager.manageRelease( myOriginalPlayerCharacter );
         * // to have the camera automatically follow the managed entity
         * // set the user config's CAMERA.AUTO_FOLLOW_PLAYER
         * // or set the camera's autoFollowPlayer property directly
         * ig.game.camera.autoFollowPlayer = true;
         * // the player manager will check if it can control an entity before handling inputs
         * // which usually checks for paused and controllable states
         * // and these properties are usually handled automatically
         * // so unless you're doing something strange, you don't need to worry about them
         * // the player manager also allows the entity it manages to handle inputs
         * // to hook into this, either:
         * // (a) extend the ig.Player abstract and override the handleInputs method
         * myOriginalPlayerClass = ig.Player.extend({
         *      handleInput: function () {
         *          // special input handling here
         *          // then call parent
         *          this.parent():
         *      }
         * });
         * // (b) or make sure your entity has a handleInputs method
         * myOtherPlayerCharacter = ig.Character.extend({
         *      handleInput: function () {
         *          // special input handling here
         *      }
         * });
         */
        ig.PlayerManager = ig.global.PlayerManager = ig.Class.extend( /**@lends ig.PlayerManager.prototype */ {

            /**
             * Whether to automatically manage player if within level.
             * <span class="alert"><strong>IMPORTANT:</strong> this only checks once when the level is first created and on each {@link ig.Player#spawn}!</span>
             * @type Boolean
             * @see ig.CONFIG.PLAYER_MANAGER.AUTO_MANAGE_PLAYER
             */
            autoManagePlayer: _c.PLAYER_MANAGER.AUTO_MANAGE_PLAYER,

            /**
             * Entity to control / manage, ideally an entity that descends from {@link ig.Character} and not just a plain entity.
             * <span class="alert"><strong>IMPORTANT:</strong> do not set this property directly, use {@link ig.PlayerManager#manage} instead!</span>
             * @type ig.EntityExtended
             * @default
             * @readonly
             */
            entity: null,

            /**
             * Entity to fallback to control when {@link ig.PlayerManager#entity} does not exist.
             * <span class="alert"><strong>IMPORTANT:</strong> do not set this property directly, use {@link ig.PlayerManager#manageFallback} or {@link ig.PlayerManager#managePlayer} instead!</span>
             * @type ig.EntityExtended
             * @default
             * @readonly
             */
            entityFallback: null,

            /**
             * Z index to merge into managed entity's {@link ig.EntityExtended#zIndex}.
             * @type Number
             * @default
             */
            zIndex: 0,

            /**
             * Types to merge into managed entity's {@link ig.EntityExtended#type}.
             * @type Bitflag|Number|String
             * @default
             */
            type: "",

            /**
             * Groups to merge into managed entity's {@link ig.EntityExtended#group}.
             * @type Bitflag|Number|String
             * @default
             */
            group: "",

            /**
             * Whether to allow touch/click and hold to be interpreted as movement.
             * @type Boolean
             * @see ig.CONFIG.PLAYER_MANAGER.HOLD_TO_MOVE
             */
            holdToMove: _c.PLAYER_MANAGER.HOLD_TO_MOVE,

            /**
             * Whether to allow swipe up to be interpreted as jump.
             * @type Boolean
             * @see ig.CONFIG.PLAYER_MANAGER.SWIPE_TO_JUMP
             */
            swipeToJump: _c.PLAYER_MANAGER.SWIPE_TO_JUMP,

            /**
             * Whether to allow touch/click and hold to be interpreted as dpad input for movement.
             * @type Boolean
             * @see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_ENABLED
             * @note holdToMove must be false for the touchDpad to work.
             */
            touchDpadEnabled: _c.PLAYER_MANAGER.TOUCH_DPAD_ENABLED,

            /**
             * The deadzone for the center of the touch dpad.
             * Too small of a deadzone will make it difficult for the player to move in a single direction.
             * @type Number
             * @see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_DEAD_ZONE_SIZE
             */
            touchDpadDeadZoneSize: _c.PLAYER_MANAGER.TOUCH_DPAD_DEAD_ZONE_SIZE,

            /**
             * Min x bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
             * @type Number
             * @see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MINX
             */
            touchDpadBoundsPctMinX: _c.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MINX,

            /**
             * Min y bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
             * @type Number
             * @see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MINY
             */
            touchDpadBoundsPctMinY: _c.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MINY,

            /**
             * Max x bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
             * @type Number
             * @see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MAXX
             */
            touchDpadBoundsPctMaxX: _c.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MAXX,

            /**
             * Max y bound of screen as a percent of screen size that will enable the touchDpad (i.e. 0 to 1).
             * @type Number
             * @see ig.CONFIG.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MAXY
             */
            touchDpadBoundsPctMaxY: _c.PLAYER_MANAGER.TOUCH_DPAD_BOUNDS_PCT_MAXY,

            /**
             * The touch dpad object that the player manager will control.
             * @type ig.TouchDpad
             */
            touchDpad: null,

            /**
             * Signal dispatched whenever an entity becomes managed.
             * <br>- created on init.
             * @type ig.Signal
             */
            onManageStarted: null,

            /**
             * Signal dispatched whenever the managed entity is removed.
             * <br>- created on init.
             * @type ig.Signal
             */
            onManageStopped: null,

            // internal properties, do not modify

            _zIndex: 0,
            _type: ig.EntityExtended.TYPE.NONE,
            _group: ig.EntityExtended.GROUP.NONE,

            /**
             * Initializes manager.
             * @param {Object} settings settings that correspond to manager properties
             */
            init: function(settings) {

                ig.merge(this, settings);

                this.onManageStarted = new ig.Signal();
                this.onManageStopped = new ig.Signal();

            },

            /**
             * Sets manager as ready. Called automatically at end of {@link ig.GameExtended#buildLevel}.
             **/
            ready: function() {

                // start managing player

                if (this.autoManagePlayer) {

                    this.managePlayer();

                }

            },

            /**
             * Resets manager.
             */
            reset: function() {

                this.onManageStarted.removeAll();
                this.onManageStarted.forget();

                this.onManageStopped.removeAll();
                this.onManageStopped.forget();

                this.manageReleaseFallback();
                this.manageRelease();

            },

            /**
             * Manages an entity by calling {@link ig.PlayerManager#manageStart} if valid new entity, or {@link ig.PlayerManager#manageRelease} if no entity passed.
             * @param {ig.EntityExtended} [entity] entity to start managing, or none if should stop managing.
             */
            manage: function(entity) {

                if (this.entity !== entity) {

                    this.manageRelease();

                    if (entity instanceof ig.EntityExtended) {

                        this.manageStart(entity);

                    }

                }

            },

            /**
             * Sets a fallback entity to manage when no other entities to manage.
             * @param {ig.EntityExtended} [entity] entity to set as fallback
             */
            manageFallback: function(entity) {

                if (this.entityFallback !== entity) {

                    this.entityFallback = entity;

                    if (!this.entity) {

                        this.manage(entity);

                    }

                }

            },

            /**
             * Special case for managing player.
             */
            managePlayer: function() {

                var player = ig.game.getPlayer();

                if (player && this.entity !== player) {

                    this.manageRelease();
                    this.manageFallback(player);

                    player.onRemoved.add(this.manageReleaseFallback, this);
                    player.onAdded.add(this.managePlayer, this);

                }

            },

            /**
             * Starts managing entity, attempts to call entity's "manageStart" method, and dispatches {@link ig.PlayerManager#onManageStarted}.
             * <span class="alert"><strong>IMPORTANT:</strong> do not call this method directly, use {@link ig.PlayerManager#manage}. It is okay to override this method.</span>
             * @param {ig.EntityExtended} entity entity to manage.
             */
            manageStart: function(entity) {

                this.entity = entity;
                this.entity.onRemoved.addOnce(this.manageRelease, this);

                // handle settings

                if (this.zIndex && entity.zIndex !== this.zIndex) {

                    this._zIndex = entity.zIndex;
                    entity.zIndex = this.zIndex;
                    ig.game.sortEntitiesDeferred(entity.layerName);

                }

                if (this.type) {

                    this._type = entity.type;
                    _ut.addType(ig.EntityExtended, entity, 'type', this.type);

                }

                if (this.group) {

                    this._group = entity.group;
                    _ut.addType(ig.EntityExtended, entity, 'group', this.group, "GROUP");

                }

                if (ig.game.camera && ig.game.camera.autoFollowPlayer && ig.game.camera.entity !== entity) {

                    if (entity === ig.game.getPlayer()) {

                        ig.game.camera.followPlayer();

                    } else {

                        ig.game.camera.follow(entity);

                    }

                    ig.game.camera.onTransitioned.addOnce(this.highlightManaged, this);

                } else {

                    this.highlightManaged();

                }

                if (typeof entity.manageStart === 'function') {

                    entity.manageStart();

                }

                this.onManageStarted.dispatch(entity);

            },

            /**
             * Releases management by calling {@link ig.PlayerManager#manageStop} if currently managing an entity.
             * @param {ig.EntityExtended} [entity] entity to release, or if none passed releases currently managed entity.
             */
            manageRelease: function(entity) {

                if ((!entity && this.entity) || (entity && this.entity === entity)) {

                    this.manageStop();

                }

            },

            /**
             * Stops managing fallback entity.
             * @param {ig.EntityExtended} [entity] entity to release, or if none passed releases fallback entity.
             */
            manageReleaseFallback: function(entity) {

                if ((!entity && this.entityFallback) || (entity && this.entityFallback === entity)) {

                    if (this.entity === this.entityFallback) {

                        this.manageRelease();

                    }

                    this.entityFallback = null;

                }

            },

            /**
             * Stops managing entity, attempts to call entity's "manageStop" method, and dispatches {@link ig.PlayerManager#onManageStopped}.
             * <span class="alert"><strong>IMPORTANT:</strong> do not call this method directly, use {@link ig.PlayerManager#manageRelease}. It is okay to override this method.</span>
             */
            manageStop: function() {

                var entity = this.entity;

                if (ig.game.camera) {

                    ig.game.camera.onTransitioned.remove(this.highlightManaged, this);

                }

                entity.onRemoved.remove(this.manageRelease, this);

                if (this.zIndex && entity.zIndex !== this._zIndex) {

                    entity.zIndex = this._zIndex;
                    ig.game.sortEntitiesDeferred(entity.layerName);

                }

                if (this.type) {

                    entity.type = this._type;

                }

                if (this.group) {

                    entity.group = this._group;

                }

                this.entity = null;

                if (typeof entity.manageStop === 'function') {

                    entity.manageStop();

                }

                this.onManageStopped.dispatch(entity);

            },

            /**
             * Attempts to highlight managed entity if the entity has a "highlight" animation.
             */
            highlightManaged: function() {

                if (this.entity && !this.entity._killed && this.entity.currentAnim == this.entity.anims[this.entity.getDirectionalAnimName("idle")]) {

                    this.entity.animOverride(this.entity.getDirectionalAnimName("highlight"));

                }

            },

            /**
             * Updates and handles switching entities, inputs, etc.
             */
            update: function() {

                if (!this.entity && this.entityFallback) {

                    this.manage(this.entityFallback);

                }

                if (this.isManagedControllable()) {

                    this.handleInput();

                }

            },

            /**
             * Checks if an the currently managed entity can be controlled.
             * @returns {Boolean} whether entity can be controlled.
             */
            isManagedControllable: function() {

                return this.entity && !this.entity.paused && this.entity.controllable;

            },

            /**
             * Handles input translation to basic movement, jumping, and climbing, and tries to call controlled entity's handleInput method.
             */
            handleInput: function() {

                var i, il;
                var inputPoints;
                var inputPoint;

                if (!this.entity.movingTo) {

                    if (this.entity.jumping) {

                        this.entity.moveToHereHorizontal();

                    } else {

                        this.entity.moveToHere();

                    }

                }

                // let entity handle input first if possible

                if (this.entity.handleInput) {

                    this.entity.handleInput();

                }

                // horizontal movement

                if (ig.input.state('right')) {

                    this.entity.moveToRight();

                } else if (ig.input.state('left')) {

                    this.entity.moveToLeft();

                }

                // vertical movement

                if (ig.input.state('up')) {

                    if (!this.entity.hasGravity) {

                        this.entity.moveToUp();

                    } else {

                        this.entity.climbUp();

                    }

                } else if (ig.input.state('down')) {

                    if (!this.entity.hasGravity) {

                        this.entity.moveToDown();

                    } else {

                        this.entity.climbDown();

                    }

                }

                // holding based movement

                if (this.holdToMove && ig.input.state('hold')) {

                    inputPoints = ig.input.getInputPoints(['holding'], [true]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[i];

                        // move if input point has no targets from down start

                        if (!inputPoint.targetsDownStart.length) {

                            var halfWidth = this.entity.size.x * 0.5;
                            var halfHeight = this.entity.size.y * 0.5;
                            var dx = inputPoint.worldX - this.entity.pos.x + halfWidth;
                            var dy = inputPoint.worldY - this.entity.pos.y + halfHeight;

                            // move while holding

                            if (_utm.almostEqual(dx, 0, halfWidth) !== true) {

                                if (dx > 0) {

                                    this.entity.moveToRight();

                                } else {

                                    this.entity.moveToLeft();

                                }

                            }

                            if (_utm.almostEqual(dy, 0, halfHeight) !== true) {

                                if (dy > 0) {

                                    if (!this.entity.hasGravity) {

                                        this.entity.moveToDown();

                                    } else {

                                        this.entity.climbDown();

                                    }

                                } else {

                                    if (!this.entity.hasGravity) {

                                        this.entity.moveToUp();

                                    } else {

                                        this.entity.climbUp();

                                    }

                                }

                            }

                        }

                    }

                }

                // touch dpad movement

                if (!this.holdToMove && this.touchDpadEnabled && ig.input.state('hold')) {

                    inputPoints = ig.input.getInputPoints(['holding'], [true]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[i];

                        // move if input point has no targets from down start

                        if (!inputPoint.targetsDownStart.length) {

                            var inDpadBounds = _uti.pointInAABB(inputPoint.x, inputPoint.y, ig.system.width*this.touchDpadBoundsPctMinX, ig.system.height*this.touchDpadBoundsPctMinY, ig.system.width*this.touchDpadBoundsPctMaxX, ig.system.height*this.touchDpadBoundsPctMaxY);

                            // activate the dpad if touching within the touchDpadBounds and we have started moving in any direction.

                            // the movement check is to allow regular taps, and holds within the bounds to not cause the dpad to be shown.

                            if (inDpadBounds && !this.touchDpad && (inputPoint._downTotalDeltaX != 0 || inputPoint._downTotalDeltaY != 0)) {

                                this.touchDpad = ig.game.spawnEntity(ig.global.UIDpad, 0, 0, {pos: {x: inputPoint.x, y: inputPoint.y}});

                                this.touchDpad.inputPoint = inputPoint;

                            }

                        }

                    }

                    if (this.touchDpad && this.touchDpad.inputPoint) {

                        // move while holding onto the screen.

                        if (this.touchDpad.inputPoint.holding) {

                            this.touchDpad.setDirection();

                            if (inputPoint._downTotalDeltaX > this.touchDpadDeadZoneSize) {

                                this.entity.moveToRight();

                            } else if (inputPoint._downTotalDeltaX < -this.touchDpadDeadZoneSize) {

                                this.entity.moveToLeft();

                            }

                            if (inputPoint._downTotalDeltaY > this.touchDpadDeadZoneSize) {

                                if (!this.entity.hasGravity) {

                                    this.entity.moveToDown();

                                } else {

                                    this.entity.climbDown();

                                }

                            } else if (inputPoint._downTotalDeltaY < -this.touchDpadDeadZoneSize) {

                                if (!this.entity.hasGravity) {

                                    this.entity.moveToUp();

                                } else {

                                    this.entity.climbUp();

                                }

                            }

                        }

                    }

                }

                // jump

                if (ig.input.pressed('jump')) {

                    this.entity.jump();

                } else if (this.swipeToJump && ig.input.state('swipe')) {

                    inputPoints = ig.input.getInputPoints(['swiping'], [true]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        if (inputPoints[i].swipingUp) {

                            this.entity.jump();

                        }

                    }

                }

            }

        });

    });
