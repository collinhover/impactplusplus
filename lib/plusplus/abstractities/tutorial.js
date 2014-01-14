ig.module(
    'plusplus.abstractities.tutorial'
)
    .requires(
        'plusplus.core.input',
        'plusplus.abstractities.particle',
        'plusplus.abstractities.spawner'
)
    .defines(function() {
        "use strict";

        /**
         * Visual tutorial to help players learn what to do in game.
         * <br>- this entity spawns a {@link ig.Demo} entity to show what to do
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class Tutorial
         * @extends ig.Spawner
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // creating a tutorial is easy
         * // setup a demo class with a size and animation to show player what to do
         * var demoClass = ig.Demo.extend({
         *     size: {x: 64, y: 64},
         *     animSheet: new ig.AnimationSheet( 'media/demo.png', 64, 64 ),
         *		animSettings: {
         *			idleX: {
         *				sequence: [0],
         *				frameTime: 1
         *			}
         *		}
         * });
         * // create a new tutorial class
         * var tutorialClass = ig.Tutorial.extend({
         *      spawningEntity: demoClass,
         *      // if the tutorial should complete when player does a specific action
         *      actions: [ 'tap' ],
         *      // or the tutorial can also check the player for a truthy property
         *      properties: [ 'jumping' ]
         *      // and tutorials should probably also tell the player what to do
         *      // because your visual demo might not make sense to everyone
         *      textSettings: {
         *          text: 'do something!'
         *      },
         *      // optionally, you might also want an overlay to dim or block view of the game world
         *      // this can help a player focus on the tutorial and not feel overwhelmed
         *      overlayEntity: ig.UIOverlay
         *      // by default, tutorials will isolate the player and any other isolate by name entities
         *      // this just means these entities are moved to a new layer
         *      // they won't collide or interact with anything on their original layer
         *      // until the tutorial is completed or the player moves out of the tutorial area
         *      // but it is easy to stop this default behavior
         *      layerNameIsolation: ''
         * });
         * // then add the new tutorialClass to your level
         * // and it will trigger when the player collides with it
         **/
        ig.Tutorial = ig.Spawner.extend( /**@lends ig.Tutorial.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba( 0, 215, 255, 0.7)',


            /**
             * Tutorials don't die until learned.
             * @override
             * @default
             */
            suicidal: false,

            /**
             * Tutorials don't teardown until learned.
             * @override
             * @default
             */
            teardownWhenComplete: false,

            /**
             * Tutorials have infinite respawns until completed.
             * @override
             * @default
             */
            duration: -1,

            /**
             * Duration in seconds to delay looping of tutorial.
             * @type Number
             * @default
             */
            respawnDelay: 1,

            /**
             * Times to loop tutorial.
             * @type Number
             * @default
             * // a tutorial can be looped infinitely
             * tutorial.loops = -1;
             * // or just a few times
             * tutorial.loops = 2;
             */
            loops: -1,

            /**
             * List of input actions, that tell tutorial it has been completed.
             * @type Array
             */
            actions: [],

            /**
             * List of player properties to check for truthy that tell tutorial it has been completed.
             * @type Array
             */
            properties: [],

            /**
             * List of spawn target properties to check for truthy that tell tutorial it has been completed.
             * @type Array
             */
            propertiesTarget: [],

            /**
             * Whether player has completed tutorial and learned activity.
             * @type Boolean
             * @default
             * @readonly
             */
            learned: false,

            /**
             * Map of entity names to isolate when tutorial is active.
             * <br>- use this together with {@link ig.Tutorial#layerNameIsolation} and {@link ig.Tutorial#overlayEntity}
             * @type Object
             * @example
             * // sometimes, it is useful to isolate the player for a tutorial
             * // this may help them focus on what they need to do
             * // and the player has the 'player' name by default, so this is easy to do
             * tutorial.isolate.1 = 'player';
             */
            isolate: {},

            /**
             * Name of layer to isolate entities to.
             * <span class="alert"><strong>IMPORTANT:</strong> this property controls whether or not entities are isolated.</span>
             * @type String
             * @default
             * @example
             * // tutorial will isolate entities to overlay layer
             * tutorial.layerNameIsolation = 'overlay';
             * // tutorial won't isolate entities
             * tutorial.layerNameIsolation = '';
             */
            layerNameIsolation: 'overlay',

            /**
             * Overlay entity class to use to help player focus during tutorial.
             * <br>- this will overlay behind isolated entities but over anything else
             * @type ig.UIOverlay
             * @default
             */
            overlayEntity: null,

            /**
             * Settings object that is based directly on {@link ig.UIOverlay} settings.
             * <br>- this will overlay behind isolated entities but over anything else
             * @type ig.UIOverlay
             * @default
             */
            overlaySettings: null,

            /**
             * Text entity class to use to help player focus during tutorial.
             * <span class="alert"><strong>IMPORTANT:</strong> do not use this when using an overlay as overlay already handles text!</span>
             * @type ig.UIText
             * @default
             */
            textEntity: null,

            /**
             * Settings object that is based directly on {@link ig.UIText} settings.
             * <span class="alert"><strong>IMPORTANT:</strong> this property controls whether or not text is displayed during tutorial.</span>
             * @type Object
             * @default
             */
            textSettings: null,

            /**
             * Spawned entity used to help player focus and/or give instructions to player.
             * <br>- created on activation
             * @type ig.EntityExtended
             * @readonly
             */
            entity: null,

            /**
             * Tutorials should trigger through collision.
             * @override
             * @default
             */
            triggerable: true,

            /**
             * Tutorials should not trigger after delay.
             * @override
             * @default
             */
            triggerAfterDelay: false,

            /**
             * @override
             * @default
             */
            autoComplete: false,

            /**
             * Tutorials should be delayed slightly to allow players that already know how to do tutorial to skip naturally.
             * @override
             * @default
             */
            delay: 1,

            /**
             * Tutorials should automatically toggle back to default state.
             * <br>- this is useful for if player moves out of tutorial the tutorial will stop but be able to be restarted
             * @override
             * @default
             */
            autoToggle: true,

            /**
             * Anything tutorial spawns should die when tutorial dies.
             * @override
             * @default
             */
            spawnedDieWith: true,

            /**
             * @override
             * @property {String} layerName overlay
             */
            spawnSettings: {
                layerName: 'overlay'
            },

            /**
             * Tutorial demos should not spawn at a random position.
             * @override
             * @default
             */
            spawnAtRandomPosition: false,

            /**
             * Tutorial demos should usually spawn at first target in {@link ig.EntityTrigger#target}, then move to rest in sequence.
             * @override
             * @default
             */
            spawnAtFirstTarget: true,

            /**
             * Tutorial demos should move to each target in {@link ig.EntityTrigger#target}.
             * @override
             * @default
             */
            spawnAndMoveTo: true,

            /**
             * @override
             * @property {Boolean} tween true
             */
            spawnAndMoveToSettings: {
                tween: true
            },

            // internal properties, do not modify

            _loopCount: 0,

            /**
             * @override
             */
            resetExtras: function() {

                this.sortTargetsBy = this.sortTargetsBy || ig.Game.SORT.Z_INDEX;

                // check text settings

                if (this.textSettings) {

                    // default tutorial font to alt

                    this.textSettings.font = this.textSettings.font || ig.Font.FONTS.MAIN;

                    // check position and alignment

                    this.textSettings.posPct = this.textSettings.posPct || {
                        x: 0.5,
                        y: 0.4
                    };
                    this.textSettings.align = this.textSettings.align || {
                        x: 0.5,
                        y: 0.5
                    };
                    this.textSettings.linkAlign = this.textSettings.linkAlign || {
                        x: 0,
                        y: 0.4
                    };

                }

                this.parent();

            },

            /**
             * Tutorial will automatically complete if not looping.
             * @override
             */
            unspawn: function(entity) {

                if (this.spawnedCount === this.spawnCountMax) {

                    var looping = false;

                    if (this.loops !== 0) {

                        this._loopCount++;

                        if (this.loops === -1 || this._loopCount < this.loops) {

                            looping = true;

                        }

                    }

                    if (!looping) {

                        this.learn();

                    }

                }

                this.parent(entity);

            },

            /**
             * Setup tutorial.
             * <br>- overlay is added
             * <br>- isolates all isolate entities
             * <br>- starts loop
             * @param {ig.EntityExtended} [entity] entity to base loop on.
             */
            setup: function(entity) {

                this.learned = false;

                // remove delay so that tutorial will retrigger instantly
                // just in case player moves out of tutorial accidentally

                this.delay = 0;

                // create instruction entity

                if (!this.entity) {

                    var entityClass;
                    var entitySettings;

                    if (this.overlayEntity) {

                        entityClass = this.overlayEntity;
                        entitySettings = this.overlaySettings || {};
                        entitySettings.textSettings = entitySettings.textSettings || this.textSettings;

                    } else if (this.textEntity) {

                        entityClass = this.textEntity;
                        entitySettings = this.textSettings || {};

                    }

                    if (entityClass) {

                        entitySettings.alpha = entitySettings.alpha || 0;

                        this.entity = ig.game.spawnEntity(entityClass, 0, 0, entitySettings);
                        this.entity.fadeTo(entityClass.prototype && entityClass.prototype.alpha || 0.9);

                    }

                }

                // has isolate layer

                if (this.layerNameIsolation) {

                    // gather isolated

                    var isolating = [];

                    // include player when not killed

                    var player = ig.game.getPlayer();

                    if (player && !player._killed) {

                        isolating.push(player);

                    }

                    // include self when not killed

                    if (!this._killed) {

                        isolating.push(this);

                    }

                    var target;

                    for (var name in this.isolate) {

                        target = ig.game.namedEntities[this.isolate[name]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    for (var name in this.target) {

                        target = ig.game.namedEntities[this.target[name]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    // isolate

                    if (isolating.length > 0) {

                        // check isolating and move to overlay layer if not already

                        for (var i = 0, il = isolating.length; i < il; i++) {

                            ig.game.layerChangeItem(isolating[i], this.layerNameIsolation);

                        }

                    }

                }

                this.parent();

            },

            /**
             * Teardown tutorial.
             * <br>- overlay is removed
             * <br>- all isolate entities are returned to their original layers
             */
            teardown: function() {

                // destroy instructional entity

                if (this.entity) {

                    this.entity.fadeToDeath();
                    this.entity = null;

                }

                // has isolate layer

                if (this.layerNameIsolation) {

                    // gather isolated

                    var isolating = [];

                    // include player when not killed

                    var player = ig.game.getPlayer();

                    if (player && !player._killed) {

                        isolating.push(player);

                    }

                    // include self when not killed

                    if (!this._killed) {

                        isolating.push(this);

                    }

                    var target;

                    for (var name in this.isolate) {

                        target = ig.game.namedEntities[this.isolate[name]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    for (var name in this.target) {

                        target = ig.game.namedEntities[this.target[name]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    // undo isolate

                    if (isolating.length > 0) {

                        for (var i = 0, il = isolating.length; i < il; i++) {

                            ig.game.layerChangeItem(isolating[i]);

                        }

                    }

                }

                this.parent();

            },

            /**
             * Finishes tutorial.
             */
            learn: function() {

                this.learned = true;

                if (this.entity) {

                    this.entity.fadeToDeath({
                        onComplete: function() {

                            this.complete();
                            this.kill();

                        }.bind(this)
                    });

                    this.entity = null;

                } else {

                    this.complete();
                    this.kill();

                }

            },

            /**
             * Updates tutorial.
             * <br>- checks if complete via {@link ig.Tutorial#actions} {@link ig.Tutorial#properties}
             * <br>- checks if should loop
             * @see ig.Spawner.
             */
            update: function() {

                if (!this._killed && this.activated) {

                    var i, il;
                    var j, jl;

                    // check input state for action and kill tutorial

                    if (this.actions.length > 0) {

                        for (i = 0, il = this.actions.length; i < il; i++) {

                            var action = this.actions[i];

                            if (ig.input.pressed(action) || ig.input.released(action)) {

                                return this.learn();

                            }

                        }

                    }

                    // check player properties are truthy and kill tutorial

                    if (this.properties.length > 0) {

                        var player = ig.game.getPlayer();

                        if (player) {

                            for (i = 0, il = this.properties.length; i < il; i++) {

                                var property = this.properties[i];

                                if (player[property]) {

                                    return this.learn();

                                }

                            }

                        }

                    }

                    // check target properties are truthy and kill tutorial

                    if (this.propertiesTarget.length > 0 && this.spawnTargetSequence.length > 0) {

                        for (i = 0, il = this.propertiesTarget.length; i < il; i++) {

                            var property = this.propertiesTarget[i];

                            for (j = 0, jl = this.spawnTargetSequence.length; j < jl; j++) {

                                if (this.spawnTargetSequence[j][property]) {

                                    return this.learn();

                                }

                            }

                        }

                    }

                    // check for restart loop

                    if (this._loopDelayed && this.loopTimer.delta() >= 0) {

                        this.loopStart();

                    }

                }

                this.parent();

            }

        });

    });
