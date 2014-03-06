ig.module(
    'plusplus.entities.event-defense'
)
    .requires(
        'plusplus.entities.trigger',
        'plusplus.abstractities.spawner',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Defense Event where enemies are spawned and try to destroy entities, and the player must defend entities and/or destroy the spawned entities.
         * <span class="alert alert-info"><strong>Tip:</strong> for events to properly reset after a loss, make sure they either (a) trigger themselves through collision, or (b) you have a reverse trigger in {@link ig.SpawnerEvent#loseTarget} that targets the trigger that triggered this event!</span>
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // defense events are triggers
         * // that coordinate one or more spawners
         * // you may want to add a spawner for entities to destroy
         * // i.e. you need to kill these entities to win the event
         * // remember, the destroy and defend properties are maps of names
         * // and work the same way as a trigger's target property
         * myEvent.destroy.1 = "spawner_enemy";
         * // you may want to add a spawner for entities to defend
         * // i.e. if these entities die, you lose the event
         * myEvent.defend.1 = "spawner_friendly";
         * // you can also add entities directly
         * // and skip using spawners
         * myEvent.defend.1 = "entity_friendly";
         * // and for events to properly reset after a loss
         * // (a) easy method:
         * // make sure they trigger via collision
         * // i.e. the player has to collide with the event box
         * // to start the event
         * myEvent.triggerable = true;
         * // (b) complex method:
         * // or if colliding with the event box is not possible
         * // you'll need to have a reverse trigger in loseTarget
         * // that targets the trigger that triggered this event
         * // so when player collides with myEventTrigger
         * myEventTrigger.target.1 = myEvent;
         * // (and myEventTrigger doesn't activate and die)
         * myEventTrigger.suicidal = false;
         * // it will activate the event
         * // and when the event is lost
         * myEvent.loseTarget.1 = myReverseTrigger;
         * // the event will activate the reverse trigger
         * myReverseTrigger.target.1 = myEventTrigger;
         * // which will unactivate the original trigger
         * // so that the player can collide with it
         * // to restart the event
         */
        ig.EntityEventDefense = ig.global.EntityEventDefense = ig.EntityTrigger.extend( /**@lends ig.EntityEventDefense.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba( 0, 255, 0, 0.7)',

            /**
             * @override
             * @default
             */
            autoComplete: false,

            /**
             * Map of names of spawners that spawn entities that must remain alive until all spawned are dead to win.
             * @type Object
             * @see ig.EntityTrigger#target
             */
            defend: {},

            /**
             * List of spawners that spawn entities to be defended, populated on activation.
             * @type Array
             * @readonly
             */
            defendSpawners: [],

            /**
             * List of entities to be defended, populated on activation.
             * @type Array
             * @readonly
             */
            defendEntities: [],

            /**
             * Map of names of spawners that spawn entities that must be killed to win.
             * @type Object
             * @see ig.EntityTrigger#target
             */
            destroy: {},

            /**
             * List of spawners that spawn entities to be destroyed, populated on activation.
             * @type Array
             * @readonly
             */
            destroySpawners: [],

            /**
             * List of entities to be destroyed, populated on activation.
             * @type Array
             * @readonly
             */
            destroyEntities: [],

            /**
             * Map of names of entities that should be triggered when sucessfully defended, i.e. win.
             * @type Object
             * @see ig.EntityTrigger#target
             */
            winTarget: {},

            /**
             * Map of names of entities that should be triggered when defense lost.
             * @type Object
             * @see ig.EntityTrigger#target
             */
            loseTarget: {},

            /**
             * Whether event has been won.
             * @type Boolean
             * @default
             */
            won: false,

            /**
             * Whether entities to be defended should be unspawned when event is won.
             * @type Boolean
             * @default
             */
            winUnspawnsDefend: false,

            /**
             * Whether entities to be defended should be unspawned when event is won.
             * @type Boolean
             * @default
             */
            loseUnspawnsDefend: true,

            /**
             * Whether entities to be destroyed should be unspawned when event is lost.
             * @type Boolean
             * @default
             */
            loseUnspawnsDestroy: true,

            /**
             * Called on activate to setup defense event.
             */
            setup: function() {

                // reset win state

                this.won = false;

                // activate defend and destroy entities
                // normally, these should be spawners

                var name;
                var entity;

                this.defendEntities.length = this.defendSpawners.length = 0;

                for (name in this.defend) {

                    entity = ig.game.namedEntities[this.defend[name]];

                    if (entity) {

                        this.linkDefendEntity(entity);

                        if (entity instanceof ig.EntityTrigger) {

                            entity.trigger();

                        } else {

                            entity.activate();

                        }

                    }

                }

                this.destroyEntities.length = this.destroySpawners.length = 0;

                for (name in this.destroy) {

                    entity = ig.game.namedEntities[this.destroy[name]];

                    if (entity) {

                        this.linkDestroyEntity(entity);

                        if (entity instanceof ig.EntityTrigger) {

                            entity.trigger();

                        } else {

                            entity.activate();

                        }

                    }

                }

                this.parent();

            },

            /**
             * Called on win, lose, and deactivate to tear down and cleanup the defense.
             */
            teardown: function() {

                var i;
                var entity;

                // unlink entities

                if (this.destroyEntities.length > 0) {

                    for (i = this.destroyEntities.length - 1; i >= 0; i--) {

                        this.unlinkDestroyEntity(this.destroyEntities[i]);

                    }

                    this.destroyEntities.length = 0;

                }

                if (this.defendEntities.length > 0) {

                    for (i = this.defendEntities.length - 1; i >= 0; i--) {

                        this.unlinkDefendEntity(this.defendEntities[i]);

                    }

                    this.defendEntities.length = 0;

                }

                // unlink and deactivate spawners

                if (this.destroySpawners.length > 0) {

                    for (i = this.destroySpawners.length - 1; i >= 0; i--) {

                        entity = this.destroySpawners[i];

                        this.unlinkDestroyEntity(entity);

                        if (this.won || this.loseUnspawnsDestroy) {

                            entity.deactivate(this, false);

                        }

                    }

                    this.destroySpawners.length = 0;

                }

                if (this.defendSpawners.length > 0) {

                    for (i = this.defendSpawners.length - 1; i >= 0; i--) {

                        entity = this.defendSpawners[i];

                        this.unlinkDefendEntity(entity);

                        if ((this.winUnspawnsDefend && this.won) || (this.loseUnspawnsDefend && !this.won)) {

                            entity.deactivate(this, false);

                        }

                    }

                    this.defendSpawners.length = 0;

                }

                this.parent();

            },

            /**
             * Links a defend entity by hooking a signal to watch for a change in the event.
             * @param ig.EntityExtended
             */
            linkDefendEntity: function(entity) {

                if (entity instanceof ig.Spawner) {

                    this._linkEntity(entity, this.defendSpawners, "onSpawned", this.linkDefendEntity);

                } else {

                    this._linkEntity(entity, this.defendEntities, "onRemoved", this.updateDefendStatus);

                }

            },

            /**
             * Unlinks a defend entity.
             * @param ig.EntityExtended
             */
            unlinkDefendEntity: function(entity) {

                if (entity instanceof ig.Spawner) {

                    this._unlinkEntity(entity, this.defendSpawners, "onSpawned", this.linkDefendEntity);

                } else {

                    this._unlinkEntity(entity, this.defendEntities, "onRemoved", this.updateDefendStatus);

                }

            },

            /**
             * Links a destroy entity by hooking a signal to watch for a change in the event.
             * @param ig.EntityExtended
             */
            linkDestroyEntity: function(entity) {

                if (entity instanceof ig.Spawner) {

                    this._linkEntity(entity, this.destroySpawners, "onSpawned", this.linkDestroyEntity);

                } else {

                    this._linkEntity(entity, this.destroyEntities, "onRemoved", this.updateDestroyStatus);

                }

            },

            /**
             * Unlinks a destroy entity.
             * @param ig.EntityExtended
             */
            unlinkDestroyEntity: function(entity) {

                if (entity instanceof ig.Spawner) {

                    this._unlinkEntity(entity, this.destroySpawners, "onSpawned", this.linkDestroyEntity);

                } else {

                    this._unlinkEntity(entity, this.destroyEntities, "onRemoved", this.updateDestroyStatus);

                }

            },

            /**
             * Links an event entity by hooking a signal to watch for a change in the event.
             * @param {ig.EntityExtended} entity
             * @param {Array} arr
             * @param {String} signalName
             * @param {Function} callback
             * @private
             */
            _linkEntity: function(entity, arr, signalName, callback) {

                this._unlinkEntity(entity, arr, signalName, callback);

                arr.push(entity);
                entity[signalName].add(callback, this);

            },

            /**
             * Unlinks an event entity.
             * @param {ig.EntityExtended} entity
             * @param {Array} arr
             * @param {String} signalName
             * @param {Function} callback
             * @private
             */
            _unlinkEntity: function(entity, arr, signalName, callback) {

                _ut.arrayCautiousRemove(arr, entity);
                entity[signalName].remove(callback, this);

            },

            /**
             * When defending, called automatically when an entity to defend is destroyed, i.e. losing.
             * @param {ig.EntityExtended} entity
             */
            updateDefendStatus: function(entity) {

                this.unlinkDefendEntity(entity);

                if (this.defendEntities.length === 0) {

                    // check each spawner to ensure it is not in the process of spawning

                    for (var i = 0, il = this.defendEntities.length; i < il; i++) {

                        if (this.defendEntities[i].spawning) {

                            return;

                        }

                    }

                    this.lose();

                }

            },

            /**
             * When destroying, called automatically when an entity to destroy is destroyed, i.e. winning.
             * @param {ig.EntityExtended} entity
             */
            updateDestroyStatus: function(entity) {

                this.unlinkDestroyEntity(entity);

                if (this.destroyEntities.length === 0) {

                    // check each spawner to ensure it is not in the process of spawning

                    for (var i = 0, il = this.destroySpawners.length; i < il; i++) {

                        if (this.destroySpawners[i].spawning) {

                            return;

                        }

                    }

                    this.win();

                }

            },

            /**
             * Called automatically when defense is lost.
             */
            lose: function() {

                this.won = false;

                for (var name in this.loseTarget) {

                    var entity = ig.game.namedEntities[this.loseTarget[name]];

                    if (entity && !entity._killed) {

                        if (!entity.added) {

                            entity.activated = true;

                        } else {

                            if (entity instanceof ig.EntityTrigger) {

                                entity.trigger();

                            } else {

                                entity.activate();

                            }

                        }

                    }

                }

                this.deactivate();

            },

            /**
             * Called automatically when sucessfully defended.
             */
            win: function() {

                this.won = true;

                for (var name in this.winTarget) {

                    var entity = ig.game.namedEntities[this.winTarget[name]];

                    if (entity && !entity._killed) {

                        if (!entity.added) {

                            entity.activated = true;

                        } else {

                            if (entity instanceof ig.EntityTrigger) {

                                entity.trigger();

                            } else {

                                entity.activate();

                            }

                        }

                    }

                }

                this.complete();

            }

        });

    });
