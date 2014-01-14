ig.module(
    'plusplus.abstractities.spawner'
)
    .requires(
        'plusplus.core.timer',
        'plusplus.entities.trigger',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.signals'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;
        var _utm = ig.utilsmath;

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
        ig.Spawner = ig.EntityTrigger.extend( /**@lends ig.Spawner.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba( 0, 100, 255, 0.7)',

            /**
             * Spawners should usually not trigger on collision.
             * @override
             * @default
             */
            triggerable: false,

            /**
             * @override
             * @default
             */
            autoComplete: false,

            /**
             * Spawners should always trigger after delay.
             * @override
             * @default
             */
            triggerAfterDelay: true,

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
             * Number of spawned entities since first activated.
             * @type Number
             * @readonly
             */
            spawnedCount: 0,

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
             * Duration in seconds over which to spawn.
             * @type Number
             * @default
             * @example
             * // spawner that spawns all entities instantly
             * spawner.duration = 0;
             * // spawner that spawns all entities endlessly
             * // with an optional 1 second delay between respawning
             * spawner.duration = -1;
             * spawner.respawnDelay = 1;
             * // spawner that spawns all entities over 10 seconds
             * spawner.duration = 10;
             */
            duration: 0,

            /**
             * Timer for duration of spawning.
             * <br>- created on init
             * @type ig.Timer
             */
            durationTimer: null,

            /**
             * Respawn delay in seconds when duration of spawn is endless, i.e. -1.
             * @type Number
             * @default
             */
            respawnDelay: 0,

            /**
             * Timer for respawn delay.
             * <br>- created on init
             * @type ig.Timer
             */
            respawnTimer: null,

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
             */
            spawnAt: false,

            /**
             * Map of name of entities to spawn entities at.
             * @type Object
             * @example
             * // spawner will spawn entities within its own bounds
             * spawner.spawnTarget = {};
             * // spawner will spawn entities within the bounds of a void entity
             * var spawnLocation = ig.game.spawnEntity( ig.EntityVoid, 0, 0 );
             * spawner.spawnTarget.1 = spawnLocation;
             */
            spawnTarget: {},

            /**
             * List of entities to spawn entities at, populated on activate.
             * @type Array
             */
            spawnTargetSequence: [],

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
             * Whether to find {@link ig.Spawner#spawnAt} based on a random target from {@link ig.EntityTrigger#target}.
             * @type Boolean
             * @default
             */
            spawnAtRandomTarget: false,

            /**
             * Whether to always set {@link ig.Spawner#spawnAt} to first target from {@link ig.EntityTrigger#target}.
             * @type Boolean
             * @default
             */
            spawnAtFirstTarget: false,

            /**
             * Whether to spawn and move to {@link ig.Spawner#spawnAt}.
             * <br>- if there are multiple targets in {@link ig.EntityTrigger#target}, spawned will move to each in sequence
             * <span class="alert"><strong>IMPORTANT:</strong> this doesn't do anything unless spawner has multiple targets in {@link ig.EntityTrigger#target}.</span>
             * @type Boolean
             * @default
             */
            spawnAndMoveTo: false,

            /**
             * Settings for moving to {@link ig.Spawner#spawnAt}, based directly on settings for {@link ig.EntityExtended#moveTo}
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
             * Whether to force spawned entities to unspawn silently.
             * @type Boolean
             * @default
             */
            unspawnSilently: true,

            /**
             * Timer for delay between each spawn.
             * <br>- created on init
             * @type ig.Timer
             */
            spawnTimer: null,

            /**
             * Signal dispatched when spawner spawns an entity.
             * <br>- created on init.
             * @type ig.Signal
             */
            onSpawned: null,

            /**
             * Signal dispatched when spawner has finished spawning all entities.
             * <br>- created on init.
             * @type ig.Signal
             */
            onSpawnedAll: null,

            /**
             * Signal dispatched when spawner unspawns an entity.
             * <br>- created on init.
             * @type ig.Signal
             */
            onUnspawned: null,

            /**
             * Signal dispatched when spawner has unspawned all entities.
             * <br>- created on init.
             * @type ig.Signal
             */
            onUnspawnedAll: null,

            // internal properties, do not modify

            _spawnedAtTargetIndex: 0,
            _spawningComplete: false,
            _reactivate: false,

            /**
             * Initializes properties of spawner.
             * <br>- checks and sets default {@link ig.Spawner#spawnAt}
             * <br>- creates timers for spawning
             * @override
             **/
            initProperties: function() {

                this.parent();

                this.durationTimer = new ig.Timer();
                this.respawnTimer = new ig.Timer();
                this.spawnTimer = new ig.Timer();

                this.onSpawned = new ig.Signal();
                this.onSpawnedAll = new ig.Signal();
                this.onUnspawned = new ig.Signal();
                this.onUnspawnedAll = new ig.Signal();

            },

            /**
             * Resets spawner properties.
             * @override
             **/
            resetExtras: function() {

                this.spawnAt = this.spawnAt || this;

                // force non suicidal if endless
                if (this.duration === -1) {

                    this.suicidal = false;

                }

                this.parent();

            },

            /**
             * Begins spawning entities if not already spawning or not spawned up to max.
             * @override
             **/
            activate: function(entity) {

                this.parent(entity);

                if (!this.spawning && this.spawnedCount < this.spawnCountMax && (this.spawningEntity || this.pool.length > 0)) {

                    this._spawningComplete = false;
                    this.spawning = true;
                    this.spawnedCount = this.spawnCount;

                    // calculate delay if not set
                    if (this.spawnDelay < 0) {

                        this.spawnDelay = this.duration > 0 ? (this.duration / this.spawnCountMax) : 0;

                    }

                    // get spawn targets

                    this.spawnTargetSequence.length = 0;

                    for (var name in this.spawnTarget) {

                        var target = ig.game.namedEntities[this.spawnTarget[name]];

                        if (target) {

                            this.spawnTargetSequence.push(target);

                        }

                    }

                    // all instantly
                    if (this.duration === 0 || this.spawnDelay === 0) {

                        var entitySpawned = true;

                        while (this.spawnedCount < this.spawnCountMax && entitySpawned) {

                            entitySpawned = this.spawnNext();

                        }

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
             * @param {ig.EntityExtended} entity entity triggering deactivate.
             * @param {Boolean} [silent=ig.Spawner.unspawnSilently] whether to despawn all spawned silently (i.e. no death animations).
             * @override
             **/
            deactivate: function(entity, silent) {

                this.spawning = this._spawningComplete = this._reactivate = false;
                this.spawnedCount = this.spawnTargetSequence.length = this._spawnedAtTargetIndex = 0;

                this.parent(entity);

                // unspawn all entities

                for (var i = this.entities.length - 1; i >= 0; i--) {

                    var spawned = this.entities[i];

                    this.unspawn(spawned, silent);

                }

            },

            /**
             * Spawns next entity of spawning entity if possible.
             * @param {ig.EntityExtended} [entity] entity to force spawn (i.e. ignore pool and count)
             * @returns {ig.EntityExtended} entity spawned
             **/
            spawnNext: function(entity) {

                // get entity to spawn at

                if (this.spawnTargetSequence.length > 0) {

                    // spawn at random target

                    if (this.spawnAtRandomTarget) {

                        this.spawnAt = this.spawnTargetSequence[Math.round(Math.random() * (this.spawnTargetSequence.length - 1))];

                    } else if (this.spawnAtFirstTarget) {

                        this.spawnAt = this.spawnTargetSequence[0];

                    }
                    // spawn at next target
                    else {

                        this.spawnAt = this.spawnTargetSequence[this._spawnedAtTargetIndex];
                        this._spawnedAtTargetIndex = (this._spawnedAtTargetIndex + 1) % this.spawnTargetSequence.length;

                    }

                }
                // default to self
                else {

                    this.spawnAt = this;

                }

                // spawn directly

                if (entity) {

                    if (!entity.added || entity._killed) {

                        entity = ig.game.spawnEntity(entity, 0, 0, this.spawnSettings);

                    }

                    _ut.arrayCautiousRemove(this.pool, entity);
                    _ut.arrayCautiousAdd(this.entities, entity);

                }
                // attempt to use pool
                else if (this.pool.length > 0) {

                    entity = this.pool.pop();

                    if (entity) {

                        entity = ig.game.spawnEntity(entity, 0, 0, this.spawnSettings);

                        this.entities.push(entity);

                    }

                }
                // create new until reached entity count
                else if (this.spawningEntity && this.spawnedCount < this.spawnCountMax) {

                    entity = ig.game.spawnEntity(this.spawningEntity, 0, 0, this.spawnSettings);

                    this.entities.push(entity);

                }

                // after spawn handling

                if (entity) {

                    this.spawnCount = Math.min(this.spawnCountMax, this.spawnCount + 1);
                    this.spawnedCount = Math.min(this.spawnCountMax, this.spawnedCount + 1);

                    this.spawned(entity);

                    this.onSpawned.dispatch(entity);

                    if (this.spawnedCount === this.spawnCountMax) {

                        this.onSpawnedAll.dispatch(this);

                    }

                }

                return entity;

            },

            /**
             * Returns an entity to the spawning pool.
             * <span class="alert"><strong>IMPORTANT:</strong> if entity is not killed, will kill instead.</span>
             * @param {ig.EntityExtended} entity entity to kill and return to pool
             * @param {Boolean} [silent=ig.Spawner.unspawnSilently] whether to despawn silently (i.e. no death animation).
             **/
            unspawn: function(entity, silent) {

                // normally, entity will be automatically unspawned after killed and right before final removal
                // but if unspawned requested before killed, we should kill and wait for auto unspawn

                if (!entity._killed) {

                    entity.kill(typeof silent === 'boolean' ? silent : this.unspawnSilently);

                } else {

                    if (entity.spawner) {

                        entity.spawner.unlinkSpawned(entity);

                    }

                    this.spawnCount = Math.max(0, this.spawnCount - 1);

                    if (!this._killed) {

                        _ut.arrayCautiousRemove(this.entities, entity);
                        _ut.arrayCautiousAdd(this.pool, entity);

                        this.onUnspawned.dispatch(entity);

                        if (this.spawnCount === 0) {

                            this.onUnspawnedAll.dispatch(this);

                        }

                        // we need to reactivate, but it is best to defer until next update to make sure pooled entities are all properly removed

                        if (this.activated && this.duration === -1 && !this.spawning && (this.spawnDelay > 0 || this.spawnCount === 0)) {

                            this.spawnedCount = this.spawnCount;
                            this.respawnTimer.set(this.respawnDelay);
                            this._reactivate = true;

                        }

                    }

                }

            },

            /**
             * Handles entity after spawning, useful for positioning, starting behavior, etc.
             * <br>- links entity as a spawned entity to this spawner
             * <br>- repositions entity based on spawning properties of this spawner
             * @param {ig.EntityExtended} entity entity that has been spawned.
             **/
            spawned: function(entity) {

                this.linkSpawned(entity);

                var width = entity.size.x;
                var height = entity.size.y;
                var halfWidth = width * 0.5;
                var halfHeight = height * 0.5;
                var spawnAtWidth = this.spawnAt.size.x;
                var spawnAtHeight = this.spawnAt.size.y;
                var spawnAtMinX = this.spawnAt.pos.x;
                var spawnAtMinY = this.spawnAt.pos.y;
                var spawnAtMaxX = spawnAtMinX + spawnAtWidth;
                var spawnAtMaxY = spawnAtMinY + spawnAtHeight;

                if (this.spawnAtRandomPosition) {

                    entity.pos.x = _utm.map(Math.random(), 0, 1, spawnAtMinX + halfWidth, spawnAtMaxX - halfWidth);
                    entity.pos.y = _utm.map(Math.random(), 0, 1, spawnAtMinY + halfHeight, spawnAtMaxY - halfHeight);

                } else {

                    entity.pos.x = spawnAtMinX + spawnAtWidth * 0.5;
                    entity.pos.y = spawnAtMinY + spawnAtHeight * 0.5;

                }

                // center spawned based on size

                entity.pos.x -= halfWidth;
                entity.pos.y -= halfHeight;

                // snap to side of spawn

                if (this.spawnAtSide) {

                    if (this.spawnAtSide.x > 0) {

                        entity.pos.x = spawnAtMaxX - width - spawnAtWidth * 0.5 * (1 - this.spawnAtSide.x);

                    } else if (this.spawnAtSide.x < 0) {

                        entity.pos.x = spawnAtMinX + spawnAtWidth * 0.5 * (1 + this.spawnAtSide.x);

                    }

                    if (this.spawnAtSide.y > 0) {

                        entity.pos.y = spawnAtMaxY - height - spawnAtHeight * 0.5 * (1 - this.spawnAtSide.y);

                    } else if (this.spawnAtSide.y < 0) {

                        entity.pos.y = spawnAtMinY + spawnAtHeight * 0.5 * (1 + this.spawnAtSide.y);

                    }

                }

                // move to spawn at

                if (this.spawnAndMoveTo && this.spawnTargetSequence.length > 0) {

                    entity.moveTo(this.spawnTargetSequence, this.spawnAndMoveToSettings);

                }

            },

            /**
             * Adds attachments between spawner and spawned.
             * <br>- spawners hook the {@link ig.EntityExtended#onRemoved} signal of the entities they spawn to ensure they return to the pool automatically
             * <br>- adds a 'spawner' property to entity with a reference to this spawner
             **/
            linkSpawned: function(entity) {

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
            unlinkSpawned: function(entity) {

                // remove spawner from entity so it doesn't attempt to unspawn

                entity.onRemoved.remove(this.unspawn, this);

                entity.spawner = undefined;

            },

            /**
             * @override
             **/
            complete: function() {

                this._spawningComplete = true;
                this.spawning = false;

                this.parent();

            },

            /**
             * @override
             **/
            pause: function() {

                this.parent();

                this.respawnTimer.pause();
                this.spawnTimer.pause();
                this.durationTimer.pause();

            },

            /**
             * @override
             **/
            unpause: function() {

                this.parent();

                this.respawnTimer.unpause();
                this.spawnTimer.unpause();
                this.durationTimer.unpause();

            },

            /**
             * Cleans up spawner and, if {@link ig.Spawner#spawnedDieWith}, also kills all spawned entities.
             * @override
             **/
            cleanup: function() {

                if (!ig.game.hasLevel) {

                    this.onSpawned.removeAll();
                    this.onSpawned.forget();
                    this.onSpawnedAll.removeAll();
                    this.onSpawnedAll.forget();
                    this.onUnspawned.removeAll();
                    this.onUnspawned.forget();
                    this.onUnspawnedAll.removeAll();
                    this.onUnspawnedAll.forget();

                }

                // kill entity if needed

                if (this.spawnedDieWith) {

                    for (var i = this.entities.length - 1; i >= 0; i--) {

                        this.unspawn(this.entities[i]);

                    }

                }

                // unlink safely

                if (this.entities.length) {

                    for (var i = this.entities.length - 1; i >= 0; i--) {

                        this.unlinkSpawned(this.entities[i]);

                    }

                    this.entities.length = 0;

                }

                if (this.pool.length) {

                    for (var i = this.pool.length - 1; i >= 0; i--) {

                        this.unlinkSpawned(this.pool[i]);

                    }

                    this.pool.length = 0;

                }

                this.spawning = this._spawningComplete = this._reactivate = false;
                this.spawnCount = this.spawnedCount = this.spawnTargetSequence.length = this._spawnedAtTargetIndex = 0;

                this.parent();

            },

            /**
             * Updates spawner and handles spawning next if spawning over a duration.
             * @override
             **/
            update: function() {

                this.parent();

                if (this.spawning && !this._spawningComplete && this.spawnTimer.delta() >= 0) {

                    this.spawnTimer.set(this.spawnDelay);
                    var entitySpawned = this.spawnNext();

                    if (this.spawnedCount >= this.spawnCountMax || !entitySpawned) {

                        this.complete();

                    }

                } else if (this._reactivate === true && this.respawnTimer.delta() >= 0) {

                    this._reactivate = false;
                    this.activate();

                }

            }

        });

    });
