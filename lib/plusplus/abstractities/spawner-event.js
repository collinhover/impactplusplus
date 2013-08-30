ig.module(
        'plusplus.abstractities.spawner-event'
    )
    .requires(
        'plusplus.abstractities.spawner-character',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Spawning Event where enemies are spawned and try to destroy entities, and the player must defend entities and/or destroy the spawned entities.
         * <span class="alert alert-info"><strong>Tip:</strong> for spawner events to properly reset after a loss, make sure they either (a) trigger themselves through collision, or (b) you have a reverse trigger in {@link ig.SpawnerEvent#loseTarget} that targets the trigger that triggered this event!</span>
         * @class
         * @extends ig.SpawnerCharacter
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // spawner events are spawners, and should be setup like one
         * // but for events to properly reset after a loss
         * // (a) easy method:
         * // make sure they either trigger via collision
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
        ig.SpawnerEvent = ig.global.SpawnerEvent = ig.SpawnerCharacter.extend(/**@lends ig.SpawnerEvent.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 0, 255, 0, 0.7)',

            /**
             * Map of names of entities that must remain alive until all spawned are dead to win.
             * @type Object
             * @see ig.EntityTrigger#target
             */
            defend: {},

            /**
             * List of entities to be defended, populated on activation.
             * @type Array
             * @readonly
             */
            defendEntities: [],

            /**
             * Map of names of entities that must be killed to win.
             * @type Object
             * @see ig.EntityTrigger#target
             */
            destroy: {},

            /**
             * List of entities to be destroyed, populated on activation.
             * @type Array
             * @readonly
             */
            destroyEntities: [],

            /**
             * Map of names of entities that should be triggered when sucessfully defended.
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
             * Events should be able to be triggered by collisions.
             * @override
             * @default
             */
            triggerable: true,

            /**
             * Anything the defense spawns should die when the defense dies or is removed.
             * @override
             * @default
             */
            spawnedDieWith: true,

            /**
             * @override
             */
            activate: function ( entity ) {

                this.parent( entity );

                if ( this.activated ) {

                    this.setup();

                }

            },

            /**
             * @override
             */
            deactivate: function ( entity ) {

                var activated = this.activated;

                this.parent( entity );

                if ( this.activated !== activated ) {

                    this.teardown();

                }

            },

            /**
             * Called on activate to setup defense event.
             */
            setup: function () {

                var entity;

                // get the defended entities

                this.defendEntities.length = 0;

                for (var name in this.defend) {

                    entity = ig.game.namedEntities[this.defend[ name ]];

                    if (entity && !entity._killed) {

                        this.defendEntities.push( entity );
                        entity.onRemoved.add( this.defendRegress, this );

                    }

                }

                // get the destroyed entities

                this.destroyEntities.length = 0;

                for (var name in this.destroy) {

                    entity = ig.game.namedEntities[this.destroy[ name ]];

                    if (entity && !entity._killed) {

                        this.destroyEntities.push( entity );
                        entity.onRemoved.add( this.destroyProgress, this );

                    }

                }

            },

            /**
             * Called on win, lose, and deactivate to tear down and cleanup the defense.
             */
            teardown: function () {

                var i, il;

                // remove listeners

                if ( this.defendEntities.length > 0 ) {

                    for ( i = 0, il = this.defendEntities.length; i < il; i++ ) {

                        this.defendEntities[ i ].onRemoved.remove( this.defendRegress, this );

                    }

                    this.defendEntities.length = 0;

                }

                if ( this.destroyEntities.length > 0 ) {

                    for ( i = 0, il = this.destroyEntities.length; i < il; i++ ) {

                        this.destroyEntities[ i ].onRemoved.remove( this.destroyProgress, this );

                    }

                    this.destroyEntities.length = 0;

                }

            },

            /**
             * When defending, each time an entity is unspawned (i.e. it dies), check if all have been unspawned. If so, we know the objectives have been defended!
             * @override
             */
            unspawn: function ( entity ) {

                this.parent( entity );

                if ( this.defendEntities.length > 0 && this.spawnCount === 0 && this.spawnedCount === this.spawnCountMax ) {

                    this.win();

                }

            },

            /**
             * When destroying, called automatically when an entity to destroy is destroyed, i.e. winning.
             * @param {ig.EntityExtended} entity
             */
            destroyProgress: function ( entity ) {

                _ut.arrayCautiousRemove( this.destroyEntities, entity );

                if ( this.destroyEntities.length === 0 ) {

                    this.win();

                }

            },

            /**
             * When defending, called automatically when an entity to defend is destroyed, i.e. losing.
             * @param {ig.EntityExtended} entity
             */
            defendRegress: function ( entity ) {

                _ut.arrayCautiousRemove( this.defendEntities, entity );

                if ( this.defendEntities.length === 0 ) {

                    this.lose();

                }

            },

            /**
             * Called automatically when defense is lost.
             */
            lose: function () {

                for (var name in this.loseTarget) {

                    var entity = ig.game.namedEntities[this.loseTarget[ name ]];

                    if (entity && !entity._killed) {

                        if ( !entity.added ) {

                            entity.activated = true;

                        }
                        else {

                            entity.activate( this );

                        }

                    }

                }

                this.deactivate();

            },

            /**
             * Called automatically when sucessfully defended.
             */
            win: function () {

                this.teardown();

                for (var name in this.winTarget) {

                    var entity = ig.game.namedEntities[this.winTarget[ name ]];

                    if (entity && !entity._killed) {

                        if ( !entity.added ) {

                            entity.activated = true;

                        }
                        else {

                            entity.activate( this );

                        }

                    }

                }

            },

            /**
             * @override
             */
            cleanup: function () {

                this.teardown();

                this.parent();

            }

        });

    });