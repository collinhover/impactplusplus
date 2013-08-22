ig.module(
        'plusplus.abstractities.player'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.character',
        'plusplus.abilities.interact',
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
             * Player performance is dynamic.
             * @override
             * @default dynamic
             */
            performance: _c.DYNAMIC,

            /**
             * @override
             * @default active
             */
            collides: ig.EntityExtended.COLLIDES.ACTIVE,

            /**
             * Player entity should be persistent across levels.
             * @override
             */
            persistent: true,

            /**
             * Player has a slight delay when taking damage.
             * @override
             * @default
             */
            damageDelay: 1,

            /**
             * Player has a slight delay in milliseconds after death before respawning.
             * @type Number
             * @default
             */
            deathDelay: 1000,

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

                    // set player as camera followFallback

                    ig.game.camera.followFallback( this );

                    // clear current camera follow

                    ig.game.camera.unfollow();


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

                                ig.game.camera.onTransitioned.addOnce( this.respawn, this);

                                ig.game.camera.follow(this.spawner);

                            }.bind(this), this.deathDelay);

                        }

                    }
                    else {

                        this.respawn();

                    }

                }

            },

            /**
             * Starts various actions such as move, jump, climb, etc, based on input states.
             * @override
             **/
            updateChanges: function () {

                // stop movement

                if (this.movingTo !== true) {

                    if (this.jumping) {

                        this.moveToHereHorizontal();

                    }
                    else {

                        this.moveToHere();

                    }

                }

                var i, il;
                var j, jl;
                var inputPoints;
                var inputPoint;
                var abs;
                var ab;

                // tapping

                if (ig.input.released('tap')) {

                    // find all inputs that are tapping

                    inputPoints = ig.input.getInputPoints([ 'tapped' ], [ true ]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[ i ];

                        // try to interact

                        this.abilityInteract.setEntityTargetFirst(inputPoint.targets);

                        // interact with any interactive that is not UI or is UI and not fixed

                        if (this.abilityInteract.entityTarget && ( !( this.abilityInteract.entityTarget.type & ig.EntityExtended.TYPE.UI ) || !this.abilityInteract.entityTarget.fixed ) ) {

                            this.abilityInteract.execute();

                        }
                        // fallback to spammable ability
                        else {

                            abs = this.abilities.getDescendantsByType(ig.Ability.TYPE.SPAMMABLE);
							
                            if (abs.length) {

                                for (j = 0, jl = abs.length; j < jl; j++) {

                                    ab = abs[ j ];
                                    ab.setEntityTargetFirst(inputPoint.targets);
                                    ab.execute({ x: inputPoint.worldX, y: inputPoint.worldY });

                                }

                            }

                        }

                    }

                }

                // holding based movement

                if (ig.input.state('hold')) {

                    inputPoints = ig.input.getInputPoints([ 'holding' ], [ true ]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[ i ];

                        // move if input point has no targets from down start

                        if (!inputPoint.targetsDownStart.length) {
						
							var halfWidth = this.size.x * 0.5;
							var halfHeight = this.size.y * 0.5;
                            var dx = inputPoint.worldX - this.pos.x + halfWidth;
                            var dy = inputPoint.worldY - this.pos.y + halfHeight;

                            // move while holding

                            if (_utm.almostEqual(dx, 0, halfWidth) !== true) {

                                if (dx > 0) {

                                    this.moveToRight();

                                }
                                else {

                                    this.moveToLeft();

                                }

                            }

                            if (_utm.almostEqual(dy, 0, halfHeight) !== true) {

                                if (dy > 0) {

                                    if (_c.TOP_DOWN) {

                                        this.moveToDown();

                                    }
                                    else {

                                        this.climbDown();

                                    }

                                }
                                else {

                                    if (_c.TOP_DOWN) {

                                        this.moveToUp();

                                    }
                                    else {

                                        this.climbUp();

                                    }

                                }

                            }

                        }

                    }

                }

                // hold activated

                if (ig.input.state('holdActivate')) {

                    inputPoints = ig.input.getInputPoints([ 'holdingActivate' ], [ true ]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[ i ];

                        // because hold is used for running, only execute when has target

                        if (inputPoint.targetsDownStart.length) {

                            // do togglable ability

                            abs = this.abilities.getDescendantsByType(ig.Ability.TYPE.TOGGLEABLE);

                            if (abs.length) {

                                for (j = 0, jl = abs.length; j < jl; j++) {

                                    ab = abs[ j ];

                                    ab.setEntityTargetFirst(inputPoint.targetsDownStart);
                                    ab.execute({ x: inputPoint.worldX, y: inputPoint.worldY });

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

                    if (_c.TOP_DOWN) {

                        this.moveToUp();

                    }
                    else {

                        this.climbUp();

                    }

                }
                else if (ig.input.state('down')) {

                    if (_c.TOP_DOWN) {

                        this.moveToDown();

                    }
                    else {

                        this.climbDown();

                    }

                }

                if (ig.input.pressed('jump')) {

                    this.jump();

                }

                this.parent();

            }
        });

    });
