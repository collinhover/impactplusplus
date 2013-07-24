ig.module(
    'plusplus.abstractities.creature'
)
.requires(
    'plusplus.core.config',
    'plusplus.abstractities.character',
    'plusplus.helpers.utils'
)
.defines(function(){ 
    "use strict";

    var _c = ig.CONFIG;
    var _ut = ig.utils;

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
        collides: ig.Entity.COLLIDES.PASSIVE,

        /**
         * Whether creature can learn about new predators based on what it takes damage from.
         * @type Boolean
         * @see ig.CONFIG.CREATURE.CAN_LEARN_PREDATORS
         */
        canLearnPredators: _c.CREATURE.CAN_LEARN_PREDATORS,

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
         * @default false
         */
        fleeing: false,

        /**
         * Distance at which creature reacts to other creatures in {@link ig.Creature#groupPrey} and {@link ig.Creature#groupPredator}.
         * <span class="alert alert-info"><strong>Tip:</strong> for best results, reaction distance should be <= pathfinding distance!</span>
         * @type Number
         * @default 200
         */
        reactionDistance: _c.CREATURE.REACTION_DISTANCE,

        /**
         * Distance at which creature reacts to other creatures in {@link ig.Creature#groupPrey} and {@link ig.Creature#groupPredator}.
         * <span class="alert alert-info"><strong>Tip:</strong> for best results, reaction distance should be <= pathfinding distance!</span>
         * @type Number
         * @default 200
         */
        reactionDelay: _c.CREATURE.REACTION_DELAY,

        /**
         * Bounds for reaction search.
         * <br>- calculated just before search
         * @type Object
         * @default
         */
        boundsReaction: {},

        /**
         * Timer for reaction ticks.
         * <br>- created on init
         * @type ig.TimerExtended
         */
        reactionTimer: null,

        /**
         * Groups that this creature will prey on, i.e. creature will attack them.
         * <span class="alert alert-info"><strong>Tip:</strong> as the group property is a bitflag, it can be any combination of groups!</span>
         * @type Bitflag
         * @default
         * @see ig.utils.getType
         */
        groupPrey: ig.EntityExtended.GROUP.NONE,

        /**
         * Groups that this creature is prey for, i.e. creature should run away from them.
         * <span class="alert alert-info"><strong>Tip:</strong> as the group property is a bitflag, it can be any combination of groups!</span>
         * @type Bitflag
         * @default
         * @see ig.utils.getType
         */
        groupPredator: ig.EntityExtended.GROUP.NONE,

        /**
         * Target predator entity.
         * @type ig.EntityExtended
         * @default
         */
        entityPredator: null,

        /**
         * Target prey entity.
         * @type ig.EntityExtended
         * @default
         */
        entityPrey: null,

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
         * Calculates entity's reaction bounds.
         * <br>- bounds are in world space and are not scaled to window
         * <br>- instead of calling this, use {@link ig.EntityExtended#boundsReaction}
         * @returns {Object} entity's reaction bounds.
         * @example
         * // this is a bad idea
         * var bounds = entity.getBoundsReaction();
         * // this is a good idea
         * var bounds = entity.boundsReaction;
         **/
        getBoundsReaction: function () {

            var bounds = this.boundsReaction;
            var reactionDistance = this.reactionDistance;
            var centerX = this.bounds.minX + this.bounds.width * 0.5;
            var centerY = this.bounds.minY + this.bounds.height * 0.5;

            bounds.minX = centerX - reactionDistance;
            bounds.minY = centerY - reactionDistance;
            bounds.maxX = centerX + reactionDistance;
            bounds.maxY = centerY + reactionDistance;
            bounds.width = bounds.maxX - bounds.minX;
            bounds.height = bounds.maxY - bounds.minY;

            return bounds;

        },

        /**
         * Gets the closest predator and prey.
         * @param {Boolean} [force=false] whether to get all new targets
        */
        setClosestEntityTarget: function ( force ) {

            var entities;
            var group;
            var needsPrey = force || !this.entityPrey;
            var needsPredator = force || !this.entityPredator;

            // only find a new target if we don't have one

            if ( needsPrey && needsPredator ) {

                group = this.groupPrey | this.groupPredator;

            }
            else if ( needsPrey ) {

                group = this.groupPrey;

            }
            else if ( needsPredator ) {

                group = this.groupPredator;

            }

            // get all entities of group within reaction distance

            if ( group ) {

                var bounds = this.boundsReaction;

                entities = ig.game.getEntitiesByGroup( group, {
                    layerName: this.layerName,
                    bounds: bounds,
                    byDistance: true,
                    x: bounds.minX + bounds.width * 0.5,
                    y: bounds.minY + bounds.height * 0.5
                } );

                // set targets

                for ( var i = 0, il = entities.length; i < il; i++ ) {

                    var entity = entities[ i ];

                    if ( needsPrey && ( entity.group & this.groupPrey ) ) {

                        this.entityPrey = entity;
                        needsPrey = false;

                        if ( !needsPrey && !needsPredator ) {

                            break;

                        }

                    }
                    else if ( needsPredator && ( entity.group & this.groupPredator ) ) {

                        this.entityPredator = entity;
                        needsPredator = false;

                        if ( !needsPrey && !needsPredator ) {

                            break;

                        }

                    }

                }

            }

        },

        /**
         * Drops prey target.
         **/
        dropEntityPrey: function () {

            this.entityPrey = null;

            this.moveToStop();

        },

        /**
         * Drops predator target.
         **/
        dropEntityPredator: function () {

            this.entityPredator = null;

            this.fleeStop();

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
         * @param {ig.EntityExtended} target target entity to attack
         * @returns {Boolean} whether creature started fleeing (not if is fleeing)
         */
        flee: function ( entity ) {

            this.fleeing = true;

            return this.moveFromEntity( entity );

        },

        /**
         * Stops fleeing.
         * @param {ig.EntityExtended} target target entity to attack
         * @returns {Boolean} whether creature is close enough to attack target
         */
        fleeStop: function () {

            this.fleeing = false;
            this.moveToStop();

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

                if ( this.canLearnPredators && !( this.groupPrey & from.group ) ) {

                    this.groupPredator |= from.group;

                }

                // health is below flee percent
                // force from entity as predator

                if ( this.health < this.healthMax * this.fleeHealthPct ) {

                    this.entityPredator = from;

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

            if ( this.health >= this.healthMax * this.fleeHealthPct && this.entityPredator
                && ( ( this.groupPrey & this.entityPredator.group ) || !( this.groupPredator & this.entityPredator.group ) ) ) {

                this.dropEntityPredator();

            }

        },

        /**
         * Updates creature bounds and reaction bounds.
         * @override
         **/
        updateBounds: function () {

            this.parent();

            this.boundsReaction = this.getBoundsReaction();

        },

        /**
         * Checks closest targets and reacts accordingly.
         * @override
         **/
        updateChanges: function () {

            // get closest target

            if ( this.reactionTimer.delta() >= 0 ) {

                this.reactionTimer.set( this.reactionDelay );

                this.setClosestEntityTarget();

            }

            // handle targets

            this.updatePrey();
            this.updatePredator();

            this.parent();

        },

        /**
         * Checks prey and reacts to it by moving closer and attacking.
         */
        updatePrey: function () {

            var prey = this.entityPrey;

            if( prey ) {

                // prey is dead, victory!

                if ( prey._killed ) {

                    return this.dropEntityPrey();

                }

                // check distance

                var distance = this.distanceSquaredTo( prey );
                
                // too far

                if ( distance > this.reactionDistance * this.reactionDistance ) {

                    return this.dropEntityPrey();
                    
                }
                // get closer and attack when not fleeing
                else if ( !this.fleeing ) {

                    this.attacking = this.attack( prey );

                    // close enough to target
                    if ( this.attacking ) {

                        this.moveToStop();

                    }
                    // not close enough to attack
                    // or should get closer anyway
                    else {

                        this.moveToEntity( prey );

                    }

                }

            }

        },

        /**
         * Checks predator and reacts to it.
         */
        updatePredator: function () {

            var predator = this.entityPredator;

            if( predator ) {

                // predator is dead, phew!

                if ( predator._killed ) {

                    return this.dropEntityPredator();

                }

                // check distance

                var distance = this.distanceSquaredTo( predator );

                // too far

                if ( distance > this.reactionDistance * this.reactionDistance ) {

                    return this.dropEntityPredator();

                }
                // run away!
                else if ( this.canFlee ) {

                    this.flee( predator );

                }

            }

        }

    } );
});