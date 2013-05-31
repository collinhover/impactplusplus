ig.module(
        'plusplus.abstractities.player'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.character',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utm = ig.utilsmath;

        /**
         * Base player entity.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Character
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Player = ig.Character.extend(/**@lends ig.Player.prototype */{

            /**
             * Player has player name by default for easier searches.
             * @override
             * @default
             */
            name: "player",

            /**
             * Player should be rendered above most other entities.
             * @override
             * @see ig.CONFIG.Z_INDEX_PLAYER
             */
            zIndex: _c.Z_INDEX_PLAYER,

            /**
             * Player should collide.
             * @type Bitflag
             * @default active
             * @see ig.Entity.COLLIDES
             */
            collides: ig.Entity.COLLIDES.ACTIVE,

            /**
             * Player has full performance.
             * @type String
             * @default kinematic
             */
            performance: _c.KINEMATIC,

            /**
             * Player has a slight delay when taking damage.
             * @override
             * @default
             */
            damageDelay: 1,

            /**
             * Player has a slight delay in milliseconds after death.
             * @type Number
             * @default
             */
            deathDelay: 1000,

            /**
             * Whether user has control of player.
             * @type Boolean
             * @default
             */
            controllable: true,

            /**
             * Initializes Player types.
             * <br>- adds {@link ig.EntityExtended.TYPE.PLAYER} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.DAMAGEABLE} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.MIMICABLE} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.PLAYER} to {@link ig.EntityExtended#group}
             * <br>- adds {@link ig.EntityExtended.TYPE.FRIEND} to {@link ig.EntityExtended#group}
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "PLAYER DAMAGEABLE MIMICABLE");
                _ut.addType(ig.EntityExtended, this, 'group', "PLAYER FRIEND", "GROUP");

            },

            /**
             * Initializes Player properties.
             * <br>- sets up camera to follow player after spawn and death
             * @override
             **/
            initProperties: function () {

                this.parent();

                if (!ig.global.wm) {

                    // add interact ability

                    this.abilityInteract = new ig.AbilityInteract(this);
                    this.abilities.addDescendant(this.abilityInteract);

                }

            },

            /**
             * Sets player ready and moves camera to follow player.
             * @override
             */
            ready: function () {

                this.parent();

                if ( ig.game.camera ) {

                    ig.game.camera.follow( this );

                }

            },

            /**
             * Spawns player and starts input.
             * @override
             **/
            spawn: function () {

                this.parent();

                this.inputStart();

            },

            /**
             * Starts player input.
             **/
            inputStart: function () {

                // touch

                ig.input.bind(ig.KEY.MOUSE1, 'touch');
                ig.input.bind(ig.KEY.MOUSE2, 'touch');
                ig.input.bind(ig.KEY.TAP, 'tap');
                ig.input.bind(ig.KEY.TAP_DOUBLE, 'tapDouble');
                ig.input.bind(ig.KEY.HOLD, 'hold');
                ig.input.bind(ig.KEY.HOLD_ACTIVATE, 'holdActivate');
                ig.input.bind(ig.KEY.SWIPE, 'swipe');
                ig.input.bind(ig.KEY.SWIPE_X, 'swipeX');
                ig.input.bind(ig.KEY.SWIPE_Y, 'swipeY');
                ig.input.bind(ig.KEY.SWIPE_LEFT, 'swipeLeft');
                ig.input.bind(ig.KEY.SWIPE_RIGHT, 'swipeRight');
                ig.input.bind(ig.KEY.SWIPE_UP, 'swipeUp');
                ig.input.bind(ig.KEY.SWIPE_DOWN, 'swipeDown');

                // arrows

                ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
                ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
                ig.input.bind(ig.KEY.UP_ARROW, 'up');
                ig.input.bind(ig.KEY.DOWN_ARROW, 'down');

                // wasd

                ig.input.bind(ig.KEY.A, 'left');
                ig.input.bind(ig.KEY.D, 'right');
                ig.input.bind(ig.KEY.W, 'up');
                ig.input.bind(ig.KEY.S, 'down');

                ig.input.bind(ig.KEY.SPACE, 'jump');

                // listen for input

                ig.input.onAddedInputPoint.add(this.hookInputPoint, this);
                ig.input.onRemovedInputPoint.add(this.unhookInputPoint, this);

                // hook any existing input points

                for (var i = 0, il = ig.input.inputPoints.length; i < il; i++) {

                    this.hookInputPoint( ig.input.inputPoints[ i ] );

                }

            },

            /**
             * Ends player input.
             **/
            inputEnd: function () {

                //touch

                ig.input.unbind(ig.KEY.MOUSE1, 'touch');
                ig.input.unbind(ig.KEY.MOUSE2, 'touch');
                ig.input.unbind(ig.KEY.TAP, 'tap');
                ig.input.unbind(ig.KEY.TAP_DOUBLE, 'tapDouble');
                ig.input.unbind(ig.KEY.HOLD, 'hold');
                ig.input.unbind(ig.KEY.HOLD_ACTIVATE, 'holdActivate');
                ig.input.unbind(ig.KEY.SWIPE, 'swipe');
                ig.input.unbind(ig.KEY.SWIPE_X, 'swipeX');
                ig.input.unbind(ig.KEY.SWIPE_Y, 'swipeY');
                ig.input.unbind(ig.KEY.SWIPE_LEFT, 'swipeLeft');
                ig.input.unbind(ig.KEY.SWIPE_RIGHT, 'swipeRight');
                ig.input.unbind(ig.KEY.SWIPE_UP, 'swipeUp');
                ig.input.unbind(ig.KEY.SWIPE_DOWN, 'swipeDown');

                // arrows

                ig.input.unbind(ig.KEY.LEFT_ARROW, 'left');
                ig.input.unbind(ig.KEY.RIGHT_ARROW, 'right');
                ig.input.unbind(ig.KEY.UP_ARROW, 'up');
                ig.input.unbind(ig.KEY.DOWN_ARROW, 'down');

                // wasd

                ig.input.unbind(ig.KEY.A, 'left');
                ig.input.unbind(ig.KEY.D, 'right');
                ig.input.unbind(ig.KEY.W, 'up');
                ig.input.unbind(ig.KEY.S, 'down');

                ig.input.unbind(ig.KEY.SPACE, 'jump');

                // stop listening for input

                ig.input.onAddedInputPoint.remove(this.hookInputPoint, this);
                ig.input.onRemovedInputPoint.remove(this.unhookInputPoint, this);

                // unhook any existing input points

                for (var i = 0, il = ig.input.inputPoints.length; i < il; i++) {

                    this.unhookInputPoint( ig.input.inputPoints[ i ] );

                }

            },

            /**
             * Hooks into the signals of an input point.
             * <br>- hooks input signal {@link ig.InputPoint#onTapped} to respond with {@link ig.Player#respondTapped}
             * <br>- hooks input signal {@link ig.InputPoint#onHoldActivated} to respond with {@link ig.Player#respondHoldActivated}
             * <span class="alert alert-info"><strong>Tip:</strong> override this function to define different/no responses to input.</span>
             **/
            hookInputPoint: function (inputPoint) {

                inputPoint.onTapped.add(this.respondTapped, this);
                inputPoint.onHoldActivated.add(this.respondHoldActivated, this);

            },

            /**
             * Unhooks the signals of an input point.
             * <br>- unhooks input signal {@link ig.InputPoint#onTapped} to respond with {@link ig.Player#respondTapped}
             * <br>- unhooks input signal {@link ig.InputPoint#onHoldActivated} to respond with {@link ig.Player#respondHoldActivated}
             * <span class="alert alert-info"><strong>Tip:</strong> override this function to define different/no responses to input.</span>
             **/
            unhookInputPoint: function (inputPoint) {

                inputPoint.onTapped.remove(this.respondTapped, this);
                inputPoint.onHoldActivated.remove(this.respondHoldActivated, this);

            },

            /**
             * Responds to {@link ig.InputPoint#onTapped}.
             * <br>- tries to interact
             * <br>- if no interactive, tries to use abilities with type {@link ig.Ability.TYPE.SPAMMABLE}
             * @param {ig.InputPoint} inputPoint input point with targets.
             **/
            respondTapped: function (inputPoint) {

                // try to interact

                this.abilityInteract.setEntityTargetFirst(inputPoint.targets);

                // when paused

                if (this.paused) {

                    // only interact with UI

                    if (this.abilityInteract.entityTarget && this.abilityInteract.entityTarget.type & ig.EntityExtended.TYPE.UI) {

                        this.abilityInteract.execute();

                    }
                    // or clear target
                    else {

                        this.abilityInteract.setEntityTarget();

                    }

                }
                // otherwise interact with any interactive
                else if (this.abilityInteract.entityTarget) {

                    this.abilityInteract.execute();

                }
                // fallback to spammable ability
                else {

                    var abs = this.abilities.getDescendantsByType(ig.Ability.TYPE.SPAMMABLE);

                    if (abs.length) {

                        for (var i = 0, il = abs.length; i < il; i++) {

                            var ab = abs[ i ];
                            ab.setEntityTargetFirst(inputPoint.targets);
                            ab.execute({ x: inputPoint.worldX, y: inputPoint.worldY });

                        }

                    }

                }

            },

            /**
             * Responds to {@link ig.InputPoint#onHoldActivated}.
             * <br>- tries to use abilities with type {@link ig.Ability.TYPE.TOGGLEABLE}
             * @param {ig.InputPoint} inputPoint input point with targets.
             **/
            respondHoldActivated: function (inputPoint) {

                // because hold is used for running, only execute when has target

                if (inputPoint.targetsDownStart.length) {

                    // do togglable ability

                    var abs = this.abilities.getDescendantsByType(ig.Ability.TYPE.TOGGLEABLE);

                    if (abs.length) {

                        for (var i = 0, il = abs.length; i < il; i++) {

                            var ab = abs[ i ];

                            ab.setEntityTargetFirst(inputPoint.targetsDownStart);

                            // when paused, only interact with UI

                            if (!this.paused || ( ab.entityTarget && ab.entityTarget.type & ig.EntityExtended.TYPE.UI )) {

                                ab.execute({ x: inputPoint.worldX, y: inputPoint.worldY });

                            }
                            // or clear target
                            else {

                                ab.setEntityTarget();

                            }

                        }

                    }

                }

            },
            /**
             * @override
             **/
            die: function () {

                this.parent();

                // player has checkpoint to spawn at

                if (this.spawner) {

                    // attempt to respawn
                    // when camera exists, transition to spawn first

                    if (ig.game.camera) {

                        if (ig.game.camera.entity !== this.spawner) {

                            // transition camera to checkpoint and activate to respawn player

                            ig.global.setTimeout(function () {

                                ig.game.camera.onTransitioned.addOnce(function () {

                                    this.spawner.activate();

                                }, this);

                                ig.game.camera.follow(this.spawner);

                            }.bind(this), this.deathDelay);

                        }

                    }
                    else {

                        this.spawner.activate();

                    }

                }

            },

            /**
             * Cleanup player and end input.
             * @override
             */
            cleanup: function () {

                this.inputEnd();

                this.parent();

            },

            /**
             * Starts various actions such as move, jump, climb, etc, based on input states.
             * @override
             **/
            updateChanges: function () {

                // stop movement

                if (this.movingTo !== true) {

                    if (this.jumping) {

                        this.moveToStopHorizontal();

                    }
                    else {

                        this.moveToStop();

                    }

                }

                // controllable

                if (this.controllable) {

                    // holding

                    if (ig.input.state('hold')) {

                        var inputPoints = ig.input.getInputPoints([ 'holding' ], [ true ]);
                        var i, il;

                        for (i = 0, il = inputPoints.length; i < il; i++) {

                            var inputPoint = inputPoints[ i ];

                            // move if input point has no targets from down start

                            if (!inputPoint.targetsDownStart.length) {

                                var dx = inputPoint.worldX - this.bounds.minX + this.bounds.width * 0.5;
                                var dy = inputPoint.worldY - this.bounds.minY + this.bounds.height * 0.5;

                                // move while holding

                                if (_utm.almostEqual(dx, 0, this.totalSizeX * 0.5) !== true) {

                                    if (dx > 0) {

                                        this.moveToRight();

                                    }
                                    else {

                                        this.moveToLeft();

                                    }

                                }

                                if (_utm.almostEqual(dy, 0, this.totalSizeY * 0.5) !== true) {

                                    if (dy > 0) {

                                        this.climbDown();

                                    }
                                    else {

                                        this.climbUp();

                                    }

                                }

                            }

                        }

                    }

                    // horizontal movement

                    if (ig.input.state('right')) {

                        this.moveToRight();

                    }
                    else if (ig.input.state('left')) {

                        this.moveToLeft();

                    }

                    // vertical movement

                    if (ig.input.state('up')) {

                        this.climbUp();

                    }
                    else if (ig.input.state('down')) {

                        this.climbDown();

                    }

                    if (ig.input.state('jump')) {

                        this.jump();

                    }

                }

                this.parent();

            }
        });

    });