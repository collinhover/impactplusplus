ig.module(
    'plusplus.abstractities.spawner-fast'
)
    .requires(
        'plusplus.abstractities.spawner',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath'
)
    .defines(function() {

        var _ut = ig.utils;
        var _utm = ig.utilsmath;

        /**
         * Spawner that removes some spawner functionality for speed, such as spawn targets.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Spawner
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.SpawnerFast = ig.global.SpawnerFast = ig.Spawner.extend( /**@lends ig.SpawnerFast.prototype */ {

            /**
             * Fast spawners remove some spawner functionality for speed, such direct spawning.
             * @override
             **/
            spawnNext: function(entity) {

                if (this.pool.length > 0) {

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

                    // only link on first create

                    this.linkSpawned(entity);

                }

                // after spawn handling

                if (entity) {

                    this.spawnCount = Math.min(this.spawnCountMax, this.spawnCount + 1);
                    this.spawnedCount = Math.min(this.spawnCountMax, this.spawnedCount + 1);
                    this.spawned(entity);

                }

                return entity;

            },

            /**
             * Fast spawners do not unlink spawned each unspawn and assume it is always safe to push entities back into pool.
             * @override
             **/
            unspawn: function(entity) {

                // normally, entity will be automatically unspawned after killed and right before final removal
                // but if unspawned requested before killed, we should kill and wait for auto unspawn

                if (!entity._killed) {

                    entity.kill(true);

                } else {

                    this.spawnCount = Math.max(0, this.spawnCount - 1);

                    _ut.arrayCautiousRemove(this.entities, entity);
                    this.pool.push(entity);

                    // we need to activate, but it is best to defer until next update to make sure pooled entities are all properly removed

                    if (this.activated && this.duration === -1 && !this.spawning && (this.spawnDelay > 0 || this.spawnCount === 0)) {

                        this.spawnedCount = this.spawnCount;
                        this.respawnTimer.set(this.respawnDelay);
                        this._reactivate = true;

                    }

                }

            },

            /**
             * Fast spawners only link spawned on first create and assume they will always return to spawner.
             * @override
             **/
            spawned: function(entity) {

                var width = entity.size.x;
                var height = entity.size.y;
                var spawnAtWidth = this.size.x;
                var spawnAtHeight = this.size.y;
                var spawnAtMinX = this.pos.x;
                var spawnAtMinY = this.pos.y;
                var spawnAtMaxX = spawnAtMinX + spawnAtWidth;
                var spawnAtMaxY = spawnAtMinY + spawnAtHeight;

                entity.pos.x = _utm.map(Math.random(), 0, 1, spawnAtMinX, spawnAtMaxX - width) - width * 0.5;
                entity.pos.y = _utm.map(Math.random(), 0, 1, spawnAtMinY, spawnAtMaxY - height) - height * 0.5;

            }

        });

    });
