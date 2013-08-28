ig.module(
    'plusplus.abstractities.creature'
)
.requires(
    'plusplus.core.config',
    'plusplus.abstractities.character',
    'plusplus.helpers.utils',
    'plusplus.helpers.utilsintersection'
)
.defines(function(){ 
    "use strict";

    var _c = ig.CONFIG;
    var _ut = ig.utils;
    var _uti = ig.utilsintersection;

    /**
     * Base creature entity, that adds some simple AI to {@link ig.Character} such as aggro and fleeing.
     * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
     * @class
     * @extends ig.Character
     * @memberof ig
     * @author Jakub Siemiatkowski - jsiemiatkowski@gmail.com
     * @author Collin Hover - collinhover.com
     **/
    ig.Creature = ig.Character.extend( {
        
        /**
         * Creature is dynamic.
         * @override
         * @default dynamic
         */  
        performance: _c.DYNAMIC,

        /**
         * Creature collides passively.
         * @override
         * @default passive
         */
        collides: ig.EntityExtended.COLLIDES.PASSIVE,

        /**
         * Distance at which creature reacts to other creatures in {@link ig.Creature#preyGroup} and {@link ig.Creature#predatorGroup}.
         * <span class="alert alert-info"><strong>Tip:</strong> for best results, reaction distance should be <= pathfinding distance!</span>
         * @type Number
         * @see ig.CONFIG.CREATURE.REACTION_DISTANCE
         */
        reactionDistance: _c.CREATURE.REACTION_DISTANCE,

        /**
         * Distance at which creature reacts to other creatures in {@link ig.Creature#preyGroup} and {@link ig.Creature#predatorGroup}.
         * <span class="alert alert-info"><strong>Tip:</strong> for best results, reaction distance should be <= pathfinding distance!</span>
         * @type Number
         * @see ig.CONFIG.CREATURE.REACTION_DELAY
         */
        reactionDelay: _c.CREATURE.REACTION_DELAY,

        /**
         * Timer for reaction ticks.
         * <br>- created on init
         * @type ig.TimerExtended
         * @readonly
         */
        reactionTimer: null,

        /**
         * Name of unique entity that this creature will prey on, i.e. creature will attack them.
         * <br>- priority 1 in finding prey, overrides type, group, and class.
         * @type String
         * @default
         */
        preyName: '',

        /**
         * Entity class that this creature will prey on, i.e. creature will attack them.
         * <br>- priority 2 in finding prey, overrides type and group but overriden by name.
         * @type ig.EntityExtended
         * @default
         */
        preyClass: null,

        /**
         * Entity type that this creature will prey on, i.e. creature will attack them.
         * <br>- priority 3 in finding predator, overrides group, overriden by name and class.
         * @type ig.EntityExtended
         * @default
         */
        preyType: ig.EntityExtended.TYPE.NONE,

        /**
         * Groups that this creature will prey on, i.e. creature will attack them.
         * <br>- priority 4 in finding prey, overrides none.
         * @type Bitflag
         * @default
         * @see ig.utils.getType
         */
        preyGroup: ig.EntityExtended.GROUP.NONE,

        /**
         * Target prey entity.
         * @type ig.EntityExtended
         * @default
         */
        prey: null,

        /**
         * Whether needs line of sight for prey.
         * @type Boolean
         * @default
         * @see ig.utils.getType
         */
        needsLineOfSightPrey: _c.CREATURE.NEEDS_LINE_OF_SIGHT_PREY,

        /**
         * Settings for moving to prey. For options, see {@link ig.Character#moveTo}.
         * @type Object
         * @default
         */
        moveToPreySettings: {
            avoidEntities: true,
            searchDistance: _c.CREATURE.REACTION_DISTANCE
        },

        /**
         * Name of unique entity that this creature is prey for, i.e. creature should run away from them.
         * <br>- priority 1 in finding predator, overrides group, type, and class.
         * @type String
         * @default
         */
        predatorName: '',

        /**
         * Entity class that this creature is prey for, i.e. creature should run away from them.
         * <br>- priority 2 in finding predator, overrides group and type, overriden by name.
         * @type ig.EntityExtended
         * @default
         */
        predatorClass: null,

        /**
         * Entity type that this creature is prey for, i.e. creature should run away from them.
         * <br>- priority 3 in finding predator, overrides group, overriden by name and class.
         * @type ig.EntityExtended
         * @default
         */
        predatorType: ig.EntityExtended.TYPE.NONE,

        /**
         * Groups that this creature is prey for, i.e. creature should run away from them.
         * <br>- priority 4 in finding predator, overrides none.
         * @type Bitflag
         * @default
         * @see ig.utils.getType
         */
        predatorGroup: ig.EntityExtended.GROUP.NONE,

        /**
         * Whether creature can learn about new predators based on what it takes damage from.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.CAN_LEARN_PREDATORS
         */
        canLearnPredators: _c.CREATURE.CAN_LEARN_PREDATORS,

        /**
         * Target predator entity.
         * @type ig.EntityExtended
         * @default
         */
        predator: null,

        /**
         * Whether needs line of sight for predator.
         * @type Boolean
         * @default
         * @see ig.utils.getType
         */
        needsLineOfSightPredator: _c.CREATURE.NEEDS_LINE_OF_SIGHT_PREDATOR,

        /**
         * Settings for moving to predator. For options, see {@link ig.Character#moveTo}.
         * @type Object
         * @default
         */
        moveToPredatorSettings: {
            avoidEntities: true,
            searchDistance: _c.CREATURE.REACTION_DISTANCE
        },

        /**
         * Whether creature can flee.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.CAN_FLEE
         */
        canFlee: _c.CREATURE.CAN_FLEE,

        /**
         * Percentage of health, between 0 and 1, when creature begins to flee.
         * @type Number
         * @see ig.CONFIG.CREATURE.FLEE_HEALTH_PCT
         */
        fleeHealthPct: _c.CREATURE.FLEE_HEALTH_PCT,

        /**
         * Whether creature is currently fleeing.
         * <span class="alert alert-info"><strong>Tip:</strong> creature can start with flee mode on.</span>
         * @type Boolean
         * @default
         * @readonly
         */
        fleeing: false,

        /**
         * Whether creature is currently fleeing due to low health.
         * @type Boolean
         * @default
         * @readonly
         */
        fleeingLowHealth: false,

        /**
         * Distance creature can move around its tether.
         * <span class="alert alert-info"><strong>Tip:</strong> a spawned creature will use its spawner as a tether, unless {@link ig.Creature#tetherName} is set and matches a valid entity in the game.</span>
         * @type Number
         * @see ig.CONFIG.CREATURE.TETHER_DISTANCE
         * @example
         * // a creature can have a tether by:
         * // 1. it was spawned by a spawner
         * // 2. it has a tether name that matches a entity
         * // otherwise, tethering will be skipped
         * // when tether distance is <= 0
         * // a creature can go as far as it wants
         * myCreature.tetherDistance = 0;
         * // when tether distance is > 0
         * // a creature will only go up to that distance
         * myCreature.tetherDistance = 100;
         * // unless it can break its tether
         * // to follow prey or flee from a predator
         * myCreature.canBreakTether = true;
         */
        tetherDistance: _c.CREATURE.TETHER_DISTANCE,

        /**
         * Whether creature can break tether range to follow a prey or flee from a predator.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.CAN_BREAK_TETHER
         */
        canBreakTether: _c.CREATURE.CAN_BREAK_TETHER,

        /**
         * Name of tether entity.
         * @type String
         */
        tetherName: '',

        /**
         * Try to use spawner as tether.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.TETHER_TO_SPAWNER
         */
        tetherToSpawner: _c.CREATURE.TETHER_TO_SPAWNER,

        /**
         * Whether creature is tethering, i.e. returning back to its tether.
         * @type Boolean
         * @default
         * @readonly
         */
        tethering: false,

        /**
         * Tether entity.
         * @type ig.EntityExtended
         * @default
         * @readonly
         */
        entityTether: null,

        /**
         * Settings for moving to tether. For options, see {@link ig.Character#moveTo}.
         * @type Object
         * @default
         */
        moveToTetherSettings: {
            avoidEntities: true
        },

        /**
         * Whether creature can wander. By default, wandering is the same as pacing, but it can be randomized.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.CAN_WANDER
         */
        canWander: _c.CREATURE.CAN_WANDER,

        /**
         * Whether creature can wander in x direction.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.CAN_WANDER_X
         */
        canWanderX: _c.CREATURE.CAN_WANDER_X,

        /**
         * Whether creature can wander in y direction.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.CAN_WANDER_Y
         */
        canWanderY: _c.CREATURE.CAN_WANDER_Y,

        /**
         * Chance as a percent between 0 and 1 that direction will switch while wandering.
         * <span class="alert alert-info"><strong>Tip:</strong> setting this above 0.005 will cause creature to switch direction often and this can look rather stupid!</span>
         * @type Number
         * @see ig.CONFIG.CREATURE.WANDER_SWITCH_CHANCE
         */
        wanderSwitchChance: _c.CREATURE.WANDER_SWITCH_CHANCE,

        /**
         * Chance as a percent between 0 and 1 that direction will switch while not wandering.
         * <span class="alert alert-info"><strong>Tip:</strong> setting this above 0.015 will cause creature to never really stop moving.</span>
         * @type Number
         * @see ig.CONFIG.CREATURE.WANDER_SWITCH_CHANCE_STOPPED
         */
        wanderSwitchChanceStopped: _c.CREATURE.WANDER_SWITCH_CHANCE_STOPPED,

        /**
         * Whether creature is currently wandering.
         * @type Boolean
         * @default
         * @readonly
         */
        wandering: false,

        /**
         * Direction of wander movement.
         * @type Vector2|Object
         * @default
         * @readonly
         */
        wanderDirection: { x: 0, y: 0 },

        /**
         * Target position of random movement.
         * @type Vector2|Object
         * @default
         * @readonly
         */
        wanderPos: { x: 0, y: 0 },

        /**
         * Settings for random move. For options, see {@link ig.Character#moveTo}.
         * @type Object
         * @default
         */
        moveToWanderSettings: {
            simple: true,
            avoidUngrounded: true
        },

        /**
         * @override
         **/
        initTypes: function () {
            
            this.parent();
            
            _ut.addType( ig.EntityExtended, this, 'type', "CREATURE DAMAGEABLE" );

        },

        /**
         * @override
         **/
        initProperties: function () {

            this.parent();

            // timers

            this.reactionTimer = new ig.TimerExtended( 0, this );

        },

		/**
		 * @override
		 **/
		resetCore: function (x, y, settings) {
			
			if ( settings && !ig.global.wm ) {
				
				if ( settings.preyType ) {
					
					_ut.addType(ig.EntityExtended, this, 'preyType', settings.preyType);
					delete settings.preyType;
					
				}

				if ( settings.preyGroup ) {

					_ut.addType(ig.EntityExtended, this, 'preyGroup', settings.preyGroup, "GROUP");
					delete settings.preyGroup;

				}

                if ( settings.predatorType ) {

                    _ut.addType(ig.EntityExtended, this, 'predatorType', settings.predatorType);
                    delete settings.predatorType;

                }
				
				if ( settings.predatorGroup ) {
					
					_ut.addType(ig.EntityExtended, this, 'predatorGroup', settings.predatorGroup, "GROUP");
					delete settings.predatorGroup;
					
				}
				
			}

			this.parent(x, y, settings);

		},

		/**
		 * @override
		 **/
		resetExtras: function () {
			
			// check wander
			
			if ( this.canWander ) {
				
				if ( this.canWanderX ) {
					
					this.wanderDirection.x = Math.random() < 0.5 ? -1 : 1;
					
				}
				else {
					
					this.wanderDirection.x = 0;
					
				}
				
				if ( this.canWanderY ) {
					
					this.wanderDirection.y = Math.random() < 0.5 ? -1 : 1;
					
				}
				else {
					
					this.wanderDirection.y = 0;
					
				}
				
			}

			this.parent();

		},

        /**
         * @override
         */
        spawn: function () {

            // get tether

            if ( this.tetherDistance > 0 && !this.entityTether ) {

                // try by name

                if ( this.tetherName ) {

                    this.entityTether = ig.game.getEntityByName( this.tetherName );

                }

                // try spawner

                if ( !this.entityTether && this.tetherToSpawner ) {

                    this.entityTether = this.spawner;

                }

            }

            this.parent();

        },

        /**
         * Finds and sets the closest predator and prey.
         * @param {Boolean} [force=false] whether to get new
        */
        findPredatorPrey: function ( force ) {

            // tethering and can't break it

            if ( this.tethering && !this.canBreakTether ) {

                return;

            }

            var needsPrey = force || !this.prey;
            var needsPredator = force || !this.predator;

            // only find a new target if we don't have one

            if ( needsPrey || needsPredator ) {

                var cX = this.pos.x + this.size.x * 0.5;
                var cY = this.pos.y + this.size.y * 0.5;
                var minX = cX - this.reactionDistance;
                var minY = cY - this.reactionDistance;
                var maxX = cX + this.reactionDistance;
                var maxY = cY + this.reactionDistance;

                if ( needsPrey ) {

                    if ( this.preyName ) {

                        var prey = ig.game.getEntityByName( this.preyName );

                        if ( prey
                            && _uti.AABBIntersect(
                                minX, minY, maxX, maxY,
                                prey.pos.x, prey.pos.y, prey.pos.x + prey.width, prey.pos.y + prey.height
                            )
                            && ( !this.needsLineOfSightPrey || this.lineOfSight( prey ) ) ) {

                            this.prey = prey;

                        }

                    }
                    else if ( this.preyClass ) {

                        this.prey = ig.game.getEntitiesByClass( this.preyClass, {
                            from: this,
                            layerName: this.layerName,
                            byDistance: true,
                            minX: minX,
                            minY: minY,
                            maxX: maxX,
                            maxY: maxY,
                            lineOfSight: this.needsLineOfSightPrey
                        } )[ 0 ];

                    }
                    else if ( this.preyType ) {

                        this.prey = ig.game.getEntitiesByType( this.preyType, {
                            from: this,
                            layerName: this.layerName,
                            byDistance: true,
                            minX: minX,
                            minY: minY,
                            maxX: maxX,
                            maxY: maxY,
                            lineOfSight: this.needsLineOfSightPrey
                        } )[ 0 ];

                    }
                    else if ( this.preyGroup ) {

                        this.prey = ig.game.getCharactersByGroup( this.preyGroup, {
                            from: this,
                            layerName: this.layerName,
                            byDistance: true,
                            minX: minX,
                            minY: minY,
                            maxX: maxX,
                            maxY: maxY,
                            lineOfSight: this.needsLineOfSightPrey
                        } )[0];

                    }

                }

                if ( needsPredator ) {

                    if ( this.predatorName ) {

                        var predator = ig.game.getEntityByName( this.predatorName );

                        if ( predator
                            && _uti.AABBIntersect(
                                minX, minY, maxX, maxY,
                                predator.pos.x, predator.pos.y, predator.pos.x + predator.width, predator.pos.y + predator.height
                            )
                            && ( !this.needsLineOfSightPredator || this.lineOfSight( predator ) ) ) {

                            this.predator = predator;

                        }

                    }
                    else if ( this.predatorClass ) {

                        this.predator = ig.game.getEntitiesByClass( this.predatorClass, {
                            from: this,
                            layerName: this.layerName,
                            byDistance: true,
                            minX: minX,
                            minY: minY,
                            maxX: maxX,
                            maxY: maxY,
                            lineOfSight: this.needsLineOfSightPredator
                        } )[ 0 ];

                    }
                    else if ( this.predatorType ) {

                        this.predator = ig.game.getEntitiesByType( this.predatorType, {
                            from: this,
                            layerName: this.layerName,
                            byDistance: true,
                            minX: minX,
                            minY: minY,
                            maxX: maxX,
                            maxY: maxY,
                            lineOfSight: this.needsLineOfSightPredator
                        } )[ 0 ];

                    }
                    else if ( this.predatorGroup ) {

                        this.predator = ig.game.getCharactersByGroup( this.predatorGroup, {
                            from: this,
                            layerName: this.layerName,
                            byDistance: true,
                            minX: minX,
                            minY: minY,
                            maxX: maxX,
                            maxY: maxY,
                            lineOfSight: this.needsLineOfSightPredator
                        } )[0];

                    }

                }

            }

        },

        /**
         * Attacks a target.
         * <span class="alert"><strong>IMPORTANT:</strong> override this with a class specific method!</span>
         * @param {ig.EntityExtended} entity target entity to attack
         * @returns {Boolean} whether creature is close enough to attack target
         */
        attack: function ( entity ) {

            return false;

        },

        /**
         * Flees from a target.
         * @param {ig.EntityExtended} target target entity to flee from
         * @param {Object} settings settings for move
         * @returns {Boolean} whether creature started fleeing (not if is fleeing)
         */
        flee: function ( entity, settings ) {

            this.fleeing = true;

            return this.moveFrom( entity, settings );

        },

        /**
         * Damages creature.
         * <br>- if {@link ig.Creature#canLearnPredators}, adds the from entity's group to creature's predator group.
         * <br>- if {@link ig.Creature#health} is below {@link ig.Creature#fleeHealthPct}, will force damaging entity as predator and flee.
         * @override
         **/
        receiveDamage : function( amount, from, unblockable ) {

            var res = this.parent(amount, from, unblockable);

            if ( from ) {

                // learn about new predators that are not prey

                if ( this.canLearnPredators ) {

                    this.predatorType |= from.type;
                    this.predatorGroup |= from.group;

                }

                // health is below flee percent
                // force from entity as predator

                if ( this.health < this.healthMax * this.fleeHealthPct ) {

                    this.fleeing = this.fleeingLowHealth = true;
                    this.predator = from;

                }

            }

            return res;

        },

        /**
         * Heals creature.
         * <br>- if {@link ig.Creature#health} is above {@link ig.Creature#fleeHealthPct}, will drop predator and stop fleeing.
         * @override
         **/
        receiveHealing: function (amount, from) {

            this.parent( amount, from );

            // health above flee amount and has a predator
            // when predator is in prey group or not in predator group

            if ( this.fleeing && this.health >= this.healthMax * this.fleeHealthPct ) {

                this.fleeing = this.fleeingLowHealth = false;
                this.predator = null;

            }

        },

        /**
         * Checks closest targets and reacts accordingly.
         * @override
         **/
        updateChanges: function () {

            // get closest target

            if ( this.reactionTimer.delta() >= 0 ) {

                this.reactionTimer.set( this.reactionDelay );

                this.findPredatorPrey();

            }

            // handle targets

            this.updatePrey();
            this.updatePredator();

            this.updateTether();
            this.updateWander();

            this.parent();

        },

        /**
         * Checks prey and reacts to it by moving closer and attacking.
         */
        updatePrey: function () {

            var prey = this.prey;

            if( prey ) {

                // prey is dead, victory!

                if ( prey._killed ) {

                    this.prey = null;

                    return this.moveToStop();

                }

                // check distance

                var distance = this.distanceSquaredTo( prey );
                
                // too far

                if ( distance > this.reactionDistance * this.reactionDistance ) {

                    this.prey = null;

                    return this.moveToStop();
                    
                }
                // get closer and attack when not fleeing and not in survival mode
                else if ( !this.fleeing && !this.fleeingLowHealth ) {

                    this.attacking = this.attack( prey );

                    // close enough to target
                    if ( this.attacking ) {

                        this.moveToStop();

                    }
                    // not close enough to attack
                    // or should get closer anyway
                    else {

                        this.moveTo( prey, this.moveToPreySettings );

                    }

                }

            }

        },

        /**
         * Checks predator and reacts to it.
         */
        updatePredator: function () {

            var predator = this.predator;

            if( predator ) {

                // predator is dead, phew!

                if ( predator._killed ) {

                    this.fleeing = false;
                    this.predator = null;

                    return this.moveToStop();

                }

                // too far and not fleeing with low health

                if ( !this.fleeingLowHealth && this.distanceSquaredTo( predator ) > this.reactionDistance * this.reactionDistance ) {

                    this.fleeing = this.fleeingLowHealth = true;
                    this.predator = null;

                    return this.moveToStop();

                }
                // run away!
                else if ( this.canFlee ) {

                    this.flee( predator, this.moveToPredatorSettings );

                }

            }

        },

        /**
         * Checks tether and moves back to it as necessary.
         */
        updateTether: function () {

            if ( this.tetherDistance > 0 ) {

                var tether = this.entityTether;

                if ( tether ) {

                    // tethering

                    if ( this.tethering ) {

                        if ( this.touches( tether ) ) {

                            this.tethering = false;
                            this.fleeing = this.fleeingLowHealth;

                            this.moveToStop();

                        }
                        else {

                            this.moveTo( tether, this.moveToTetherSettings );

                        }

                    }
                    else {

                        // has tether

                        if ( ( !this.canBreakTether || ( !this.prey && !this.predator ) )
                            && this.distanceSquaredEdgeTo( this.entityTether ) > this.tetherDistance * this.tetherDistance ) {

                            this.fleeing = false;
                            this.prey = this.predator = null;
                            this.moveToStop();

                            this.tethering = true;

                        }

                    }

                }

            }

        },

        /**
         * Moves around randomly.
         */
        updateWander: function () {

            if ( this.canWander && !this.tethering && !this.prey && !this.predator ) {

                this.wandering = true;

                var wanderSwitchChance = this.wanderDirection.x === 0 && this.wanderDirection.y === 0 ? this.wanderSwitchChanceStopped : this.wanderSwitchChance;
					
				// moved to an unsafe location
				// wander should switch
				
				if ( this.moveToUnsafe ) {
						
					this._wanderSwitchedHorizontal = false;
					
					if ( this.canWanderX && Math.random() < 0.5 ) {
						
						this._wanderSwitchedHorizontal = true;
						this.wanderDirection.x = -this.wanderDirection.x || 1;
						
					}
					
					if ( this.canWanderY && ( !this._wanderSwitchedHorizontal || Math.random() < 0.5 ) ) {
						
						this.wanderDirection.y = -this.wanderDirection.y || 1;
						
					}

				}
				// random switch chance
				else if ( wanderSwitchChance > 0 && Math.random() < wanderSwitchChance ) {
					
					var ran = Math.random();
					
					if ( this.canWanderX && ran > 0.5 ) {
						
						this.wanderDirection.x = Math.round( ran * 2 - 1 );
						
					}
					else if ( this.canWanderY ) {
						
						this.wanderDirection.y = Math.round( ran * 2 - 1 );
						
					}

				}
				// switch when at max tether distance
				else if ( this.tetherDistance > 0 && this.entityTether ) {
					
					if ( this.canWanderX ) {
						
						var tetherCenterX = this.entityTether.pos.x + this.entityTether.size.x * 0.5;

						if ( tetherCenterX - this.tetherDistance >= this.pos.x ) {

							this.wanderDirection.x = 1;

						}
						else if ( tetherCenterX + this.tetherDistance <= this.pos.x + this.size.x ) {

							this.wanderDirection.x = -1;

						}
						
					}
					
					if ( this.canWanderY ) {
						
						var tetherCenterY = this.entityTether.pos.y + this.entityTether.size.y * 0.5;

						if ( tetherCenterY - this.tetherDistance >= this.pos.y ) {

							this.wanderDirection.y = 1;

						}
						else if ( tetherCenterY + this.tetherDistance <= this.pos.y + this.size.y ) {

							this.wanderDirection.y = -1;

						}
						
					}

				}

                // no wander direction

                if ( this.wanderDirection.x === 0 && this.wanderDirection.y === 0 ) {

                    this.moveToStop();

                }
                // has direction
                else {

                    if ( this.wanderDirection.x !== 0 ) {
						
						if ( this.wanderDirection.x > 0 ) {
							
							this.wanderPos.x = this.pos.x + this.size.x;
							
						}
						else {
							
							this.wanderPos.x = this.pos.x;
							
						}

                    }
					else {
						
						this.wanderPos.x = this.pos.x + this.size.x * 0.5;
                        this.moveToHereHorizontal();
						
					}
					
					if ( this.wanderDirection.y !== 0 ) {
						
						if ( this.wanderDirection.y > 0 ) {
							
							this.wanderPos.y = this.pos.y + this.size.y;
							
						}
						else {
							
							this.wanderPos.y = this.pos.y;
							
						}

                    }
					else {
						
						this.wanderPos.y = this.pos.y + this.size.y * 0.5;
                        this.moveToHereVertical();
						
					}

                    this.moveTo( this.wanderPos, this.moveToWanderSettings );

                }

            }
            else {

                this.wandering = false;

            }

        }

    } );
});