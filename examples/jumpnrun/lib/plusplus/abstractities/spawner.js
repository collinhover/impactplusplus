ig.module(
        'plusplus.abstractities.spawner'
    )
    .requires(
        'plusplus.core.timer',
        'plusplus.entities.trigger',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Entity that spawns other entities on activation.
         * <br>- this entity uses pooling to try to improve performance at the cost of memory
         * <br>- spawners hook the {@link ig.EntityExtended#onRemoved} signal of the entities they spawn to ensure they return to the pool automatically
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Jesse Freeman
         **/
        ig.Spawner = ig.EntityTrigger.extend(/**@lends ig.Spawner.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 0, 100, 255, 0.7)',

            /**
             * Spawners should usually not trigger on collision.
             * @override
             * @default
             */
            triggerable: false,

            /**
             * Duration in seconds over which to spawn.
             * @type Number
             * @default
             * @example
             * // spawner that spawns all entities instantly
             * spawner.duration = 0;
             * // spawner that spawns all entities endlessly
             * spawner.duration = -1;
             * // spawner that spawns all entities over 10 seconds
             * spawner.duration = 10;
             */
            duration: 0,

            /**
             * Entity to spawn.
             * <span class="alert"><strong>IMPORTANT:</strong> spawner does nothing if this is empty!.</span>
             * @type String|ig.EntityExtended
             */
            spawningEntity: '',

            /**
             * Settings object applied to each spawned entity, that directly corresponds to properties of spawned entity.
             * <span class="alert alert-info"><strong>Tip:</strong> this object is merged into the spawned entity through its init method.</span>
             * @type Object
             * @default
             */
            spawnSettings: null,

            /**
             * Total number of entities to spawn over duration.
             * @type Number
             * @default
             */
            spawnCountMax: 1,

            /**
             * Number of currently spawned entities.
             * @type Number
             * @readonly
             */
            spawnCount: 0,

            /**
             * Whether spawner is currently spawning entities.
             * @type Boolean
             * @readonly
             */
            spawning: false,

            /**
             * List of entities that have been spawned and returned to spawning pool.
             * @type Array
             * @readonly
             */
            pool: [],

            /**
             * List of entities that have been spawned and are still in game world.
             * @type Array
             * @readonly
             */
            entities: [],

            /**
             * Delay between individual spawns.
             * @type Number
             * @default
             * @example
             * // spawner that finds delay automatically based on duration
             * spawner.spawnDelay = -1;
             * // spawner that has a 1 second delay between each spawn
             * spawner.spawnDelay = 1;
             */
            spawnDelay: -1,

            /**
             * Entity to spawn entities at.
             * @type Boolean|ig.EntityExtended
             * @default self
             * // spawner will spawn entities within its own bounds
             * spawner.spawnAt = false;
             * // spawner will spawn entities within the bounds of a void entity
             * var spawnLocation = ig.game.spawnEntity( ig.EntityVoid, 0, 0 );
             * spawner.spawnAt = spawnLocation;
             */
            spawnAt: false,

            /**
             * Whether to spawn at a random position within the bounds of {@link ig.Spawner#spawnAt}.
             * @type Boolean
             * @default
             */
            spawnAtRandomPosition: true,

            /**
             * Which side of {@link ig.Spawner#spawnAt} to snap spawned entity position to.
             * @type Vector2|Object
             * @default
             * @example
             * // this snaps spawned entities to the bottom of a spawner
             * // which is very useful for creature spawners, which need to spawn on the ground
             * spawner.spawnAtSide = { x: 0, y: 1 };
             */
            spawnAtSide: null,

            /**
             * Whether to find {@link ig.Spawner#spawnAt} based on the first in {@link ig.EntityTrigger#target}.
             * @type Boolean
             * @default
             */
            spawnAtTarget: false,

            /**
             * Whether to find {@link ig.Spawner#spawnAt} based on a random target from {@link ig.EntityTrigger#target}.
             * @type Boolean
             * @default
             */
            spawnAtRandomTarget: false,

            /**
             * Whether to spawn and move to {@link ig.Spawner#spawnAt}.
             * <br>- if there are multiple targets in {@link ig.EntityTrigger#target}, spawned will move to each in sequence
             * <span class="alert"><strong>IMPORTANT:</strong> this doesn't do anything unless spawner has multiple targets in {@link ig.EntityTrigger#target}.</span>
             * @type Boolean
             * @default
             */
            spawnAndMoveTo: false,

            /**
             * Settings for moving to {@link ig.Spawner#spawnAt}, based directly on settings for {@link ig.EntityExtended#moveToEntity}
             * <span class="alert"><strong>IMPORTANT:</strong> this doesn't do anything unless {@link ig.Spawner#spawnAndMoveTo} is true.</span>
             * @type Object
             * @default
             */
            spawnAndMoveToSettings: null,

            /**
             * Whether to kill all spawned entities when spawner dies.
             * @type Boolean
             * @default
             */
            spawnedDieWith: false,

            /**
             * Timer for duration of spawning.
             * <br>- created on init
             * @type ig.TimerExtended
             */
            durationTimer: null,

            /**
             * Timer for delay between each spawn.
             * <br>- created on init
             * @type ig.TimerExtended
             */
            spawnTimer: null,

            // internal properties, do not modify

            _spawningComplete: false,
            _reactivate: false,

            /**
             * Initializes properties of spawner.
             * <br>- checks and sets default {@link ig.Spawner#spawnAt}
             * <br>- creates timers for spawning
             * @override
             **/
            initProperties: function () {

                this.parent();

                this.spawnAt = this.spawnAt || this;

                this.durationTimer = new ig.TimerExtended(0, this);
                this.spawnTimer = new ig.TimerExtended(0, this);

            },

            /**
             * Resets spawner properties.
             * @override
             **/
            resetExtras: function () {

                this.parent();

                // force non suicidal if endless
                if ( this.duration === -1 ) {

                    this.suicidal = false;

                }

            },

            /**
             * Begins spawning entities if not already spawning or not spawned up to max.
             * @override
             **/
            activate: function (entity) {

                if (!this.spawning && this.spawnCount < this.spawnCountMax && ( this.spawningEntity || this.pool.length > 0 )) {

                    this.parent(entity);

                    this.spawning = true;

                    // calculate delay if not set
                    if (this.spawnDelay < 0) {

                        this.spawnDelay = this.duration > 0 ? ( this.duration / this.spawnCountMax ) : 0;

                    }

                    // all instantly
                    if (this.duration === 0 || this.spawnDelay === 0) {

                        var entitySpawned = true;

                        while (this.spawnCount < this.spawnCountMax && entitySpawned) {

                            entitySpawned = this.spawnNext();

                        }

                        this._spawningComplete = true;

                        this.complete();

                    }
                    // over duration
                    else {

                        this.durationTimer.set(this.duration);
                        this.spawnTimer.set(0);

                    }

                }

            },

            /**
             * Stops spawning and unspawns all spawned entities.
             * <span class="alert"><strong>IMPORTANT:</strong> this kills all spawned and return them to spawning pool!</span>
             * @override
             **/
            deactivate: function (entity) {

                this.spawning = false;

                // unspawn all entities

                for (var i = 0, il = this.entities.length; i < il; i++) {

                    this.unspawn(this.entities[ i ]);

                }

                this.parent(entity);

            },

            /**
             * Spawns next entity of spawning entity if possible.
             * @param {ig.EntityExtended} [entity] entity to force spawn (i.e. ignore pool and count)
             * @returns {ig.EntityExtended} entity spawned
             **/
            spawnNext: function (entity) {

                // get entity to spawn at

                if (this.spawnAtTarget && this.targetSequence.length > 0) {

                    // spawn at random target

                    if (this.spawnAtRandomTarget) {

                        this.spawnAt = this.targetSequence[ Math.round(Math.random() * this.targetSequence.length - 1) ];

                    }
                    // spawn at first target
                    else {

                        this.spawnAt = this.targetSequence[ 0 ];

                    }

                }
                // default to self
                else {

                    this.spawnAt = this;

                }

                // base position of spawned

                var x = 0;
                var y = 0;

                // spawn directly

                if (entity) {

                    if ( !entity.added || entity._killed ) {

                        entity = ig.game.spawnEntity(entity, x, y, this.spawnSettings);

                    }

                }
                // attempt to use pool
                else if (this.pool.length > 0) {

                    entity = this.pool.pop();

                    if (entity) {

                        entity = ig.game.spawnEntity(entity, x, y, this.spawnSettings);

                    }

                }
                // create new until reached entity count
                else if (this.spawningEntity && this.entities.length < this.spawnCountMax) {

                    entity = ig.game.spawnEntity(this.spawningEntity, x, y, this.spawnSettings);

                    this.entities.push(entity);

                }

                // after spawn handling

                if (entity) {

                    this.spawned(entity);

                }

                return entity;

            },

            /**
             * Returns an entity to the spawning pool.
             * <span class="alert"><strong>IMPORTANT:</strong> if entity is not killed, will kill instead.</span>
             * @param {ig.EntityExtended} entity entity to kill and return to pool
             **/
            unspawn: function (entity) {

                // normally, entity will be automatically unspawned after killed and right before final removal
                // but if unspawned requested before killed, we should kill and wait for auto unspawn

                if (!entity._killed) {

                    entity.kill(true);

                }
                else if (_ut.indexOfValue(this.pool, entity) === -1) {

                    this.spawnCount = Math.max(0, this.spawnCount - 1);

                    this.pool.push(entity);

                    // we need to activate, but it is best to defer until next update to make sure pooled entities are all oroperly removed

                    if ( this.duration === -1 && !this.spawning && ( this.spawnDelay > 0 || this.spawnCount === 0 ) ) {

                        this._reactivate = true;

                    }

                }

            },

            /**
             * Handles entity after spawning, useful for positioning, starting behavior, etc.
             * <br>- links entity as a spawned entity to this spawner
             * <br>- repositions entity based on spawning properties of this spawner
             * @param {ig.EntityExtended} entity entity that has been spawned.
             **/
            spawned: function (entity) {

                this.spawnCount = Math.min(this.spawnCountMax, this.spawnCount + 1);

                this.linkSpawned(entity);

                if (this.spawnAtRandomPosition) {

                    entity.pos.x = Math.random().map(0, 1, this.spawnAt.bounds.minX, this.spawnAt.bounds.maxX);
                    entity.pos.y = Math.random().map(0, 1, this.spawnAt.bounds.minY, this.spawnAt.bounds.maxY);

                }
                else {

                    entity.pos.x = this.spawnAt.bounds.minX + this.spawnAt.bounds.width * 0.5;
                    entity.pos.y = this.spawnAt.bounds.minY + this.spawnAt.bounds.height * 0.5;

                }

                // center spawned based on size

                entity.pos.x -= entity.bounds.width * 0.5;
                entity.pos.y -= entity.bounds.height * 0.5;

                // snap to bottom of spawn

                if (this.spawnAtSide) {

                    if ( this.spawnAtSide.y > 0 ) {

                        entity.pos.y = this.spawnAt.bounds.maxY - entity.bounds.height - this.spawnAt.bounds.height * 0.5 * ( 1 - this.spawnAtSide.y );

                    }
                    else if ( this.spawnAtSide.y < 0 ) {

                        entity.pos.y = this.spawnAt.bounds.minY + this.spawnAt.bounds.height * 0.5 * ( 1 + this.spawnAtSide.y );

                    }

                }

                // move to spawn at

                if (this.spawnAndMoveTo) {

                    entity.moveToEntity(this.targetSequence.length > 0 ? this.targetSequence : this.spawnAt, this.spawnAndMoveToSettings);

                }

            },

            /**
             * Adds attachments between spawner and spawned.
             * <br>- spawners hook the {@link ig.EntityExtended#onRemoved} signal of the entities they spawn to ensure they return to the pool automatically
             * <br>- adds a 'spawner' property to entity with a reference to this spawner
             **/
            linkSpawned: function (entity) {

                // remove from previous

                if (entity.spawner) {

                    entity.spawner.unlinkSpawned(entity);

                }

                entity.onRemoved.add(this.unspawn, this);

                entity.spawner = this;

            },

            /**
             * Removes attachments between spawner and spawned.
             * <br>- removes hooks to {@link ig.EntityExtended#onRemoved} signal
             * <br>- removes 'spawner' property from entity
             **/
            unlinkSpawned: function (entity) {

                // remove spawner from entity so it doesn't attempt to unspawn

                entity.onRemoved.remove(this.unspawn, this);

                entity.spawner = undefined;

            },

            /**
             * @override
             **/
            complete: function () {

                if (this.spawning && this._spawningComplete) {

                    this.spawning = false;

                    this.parent();

                }

            },

            /**
             * Kills spawner and, if {@link ig.Spawner#spawnedDieWith}, also kills all spawned entities.
             * @override
             **/
            kill: function () {

                // update all entities

                for (var i = 0, il = this.entities.length; i < il; i++) {

                    var entity = this.entities[ i ];

                    this.unlinkSpawned(entity);

                    // kill entity if needed

                    if (this.spawnedDieWith) {

                        entity.kill(true);

                    }

                }

                this.entities.length = 0;

                this.parent();

            },

            /**
             * Updates spawner and handles spawning next if spawning over a duration.
             * @override
             **/
            update: function () {

                this.parent();

                if (this.spawning && this.spawnTimer.delta() >= 0) {

                    this.spawnTimer.set(this.spawnDelay);
                    var entitySpawned = this.spawnNext();

                    if ( this.spawnCount >= this.spawnCountMax || !entitySpawned) {

                        this._spawningComplete = true;

                        this.complete();

                    }

                }
                else if ( this._reactivate === true ) {

                    this._reactivate = false;
                    this.activate();

                }

            }

        });

    });

