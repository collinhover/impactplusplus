ig.module(
        'plusplus.abstractities.tutorial'
    )
    .requires(
        'plusplus.core.input',
        'plusplus.abstractities.particle',
        'plusplus.abstractities.spawner',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _utv2 = ig.utilsvector2;

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
         *     animSettings: true
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
        ig.Tutorial = ig.Spawner.extend(/**@lends ig.Tutorial.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 0, 150, 255, 0.7)',

            /**
             * Duration in seconds to delay looping of tutorial.
             * @type Number
             * @default
             */
            loopDelay: 1,

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
             * Timer for loops.
             * <br>- created on init
             * @type ig.TimerExtended
             */
            loopTimer: null,

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
             * Overlay to use to help player focus during tutorial.
             * <br>- this will overlay behind isolated entities but over anything else
             * @type ig.UIOverlay
             */
            overlayEntity: null,

            /**
             * Settings object that is based directly on {@link ig.UIOverlay} settings.
             * <br>- this will overlay behind isolated entities but over anything else
             * @type ig.UIOverlay
             */
            overlaySettings: null,

            /**
             * Settings object that is based directly on {@link ig.UIText} settings.
             * <span class="alert"><strong>IMPORTANT:</strong> this property controls whether or not text is displayed during tutorial.</span>
             * @type Object
             */
            textSettings: null,

            /**
             * Tutorials should trigger through collision.
             * @override
             * @default
             */
            triggerable: true,

            /**
             * Tutorials should not die on trigger.
             * <span class="alert"><strong>IMPORTANT:</strong> tutorials kill themselves when completed!.</span>
             * @override
             * @default
             */
            suicidal: false,

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
             * Tutorial demos should spawn at a first target in {@link ig.EntityTrigger#target}.
             * @override
             * @default
             */
            spawnAtTarget: true,

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
            _loopDelayed: false,

            /**
             * Initialize tutorial properties.
             * <br>- checks and sets some default text settings if tutorial has {@link ig.Tutorial#textSettings}
             * @override
             */
            initProperties: function () {

                this.sortTargetsBy = this.sortTargetsBy || ig.Game.SORT.Z_INDEX;
                this.loopTimer = new ig.TimerExtended(0, this);

                // check text settings

                if (this.textSettings) {

                    // default tutorial font to alt

                    this.textSettings.font = this.textSettings.font || ig.game.fontAlt;

                    // check position and alignment

                    this.textSettings.posPct = this.textSettings.posPct || _utv2.vector(0.5, 0.9);
                    this.textSettings.align = this.textSettings.align || _utv2.vector(0.5, 1);

                }

                this.parent();

            },

            /**
             * Deactivates tutorial and ends looping.
             * @override
             */
            deactivate: function (entity) {

                this.loopEnd();

                this.parent(entity);

            },

            /**
             * Handles spawned and does tutorial setup once last entity (usually a demo) has been spawned.
             * @override
             */
            spawned: function (entity) {

                this.parent(entity);

                // when last entity is spawned

                if (this.spawnCount === this.spawnCountMax) {

                    this.setup(entity);

                }

            },

            /**
             * Setup tutorial.
             * <br>- overlay is added
             * <br>- isolates all isolate entities
             * <br>- starts loop
             * @param {ig.EntityExtended} [entity] entity to base loop on.
             */
            setup: function (entity) {

                // remove delay so that tutorial will retrigger instantly
                // just in case player moves out of tutorial accidentally

                this.delay = 0;

                // has isolate layer

                if (this.layerNameIsolation) {

                    // dim

                    if (this.overlayEntity && !this.dimmer) {

                        this.dimmer = ig.game.spawnEntity(this.overlayEntity, 0, 0, ig.merge( {
                            alpha: 0,
                            textSettings: this.textSettings
                        }, this.overlaySettings ) );

                        this.dimmer.fadeTo(0.9);

                    }

                    // gather isolated

                    var isolating = [];

                    // include player when not killed

                    var player = ig.game.namedEntities['player'];

                    if ( player && !player._killed ) {

                        isolating.push( player );

                    }

                    // include self when not killed

                    if (!this._killed) {

                        isolating.push( this );

                    }

                    var target;

                    for (var name in this.isolate) {

                        target = ig.game.namedEntities[this.isolate[ name ]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    for (var name in this.target) {

                        target = ig.game.namedEntities[this.target[ name ]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    // isolate

                    if (isolating.length > 0) {

                        // check isolating and move to overlay layer if not already

                        for (var i = 0, il = isolating.length; i < il; i++) {

                            ig.game.layerChangeItem(isolating[ i ], this.layerNameIsolation);

                        }

                    }

                }

                // loop

                this.loopSetup(entity);

            },

            /**
             * Teardown tutorial.
             * <br>- overlay is removed
             * <br>- all isolate entities are returned to their original layers
             */
            teardown: function () {

                // has isolate layer

                if (this.layerNameIsolation) {

                    // undo dim

                    if (this.dimmer) {

                        this.dimmer.fadeToDeath();
                        this.dimmer = undefined;

                    }

                    // gather isolated

                    var isolating = [];

                    // include player when not killed

                    var player = ig.game.namedEntities['player'];

                    if ( player && !player._killed ) {

                        isolating.push( player );

                    }

                    // include self when not killed

                    if (!this._killed) {

                        isolating.push( this );

                    }

                    var target;

                    for (var name in this.isolate) {

                        target = ig.game.namedEntities[this.isolate[ name ]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    for (var name in this.target) {

                        target = ig.game.namedEntities[this.target[ name ]];

                        if (target && !target._killed) {

                            isolating.push(target);

                        }

                    }

                    // undo isolate

                    if (isolating.length > 0) {

                        for (var i = 0, il = isolating.length; i < il; i++) {

                            ig.game.layerChangeItem(isolating[ i ]);

                        }

                    }

                }

            },

            /**
             * Setup loop of tutorial.
             * @param {ig.EntityExtended} [entity] entity to base loop on.
             */
            loopSetup: function (entity) {

                // stop previous

                this.loopEnd();

                // store entity

                this.loopEntity = entity;

                // wait for delay if more than 1 spawned entity or no entities
                if (this.spawnCount !== 1 || !this.loopEntity) {

                    this.loop();

                }
                else {

                    // wait for entity to die when particle
                    if (this.loopEntity instanceof ig.Particle) {

                        this.loopEntity.onRemoved.addOnce(this.loop, this);

                    }
                    // wait for entity to move to, when moving to only once
                    else if (this.loopEntity.movingTo && this.loopEntity.movingToOnce) {

                        this.loopEntity.onMovedTo.addOnce(this.loop, this);

                    }
                    else {

                        // no loop delay, try to loop after animation

                        if (!this.loopDelay && this.loopEntity && this.loopEntity.currentAnim) {

                            this.loopEntityAnim = this.loopEntity.currentAnim;
                            this.loopEntityAnim.onCompleted.addOnce(this.loop, this);

                        }
                        // default loop
                        else {

                            this.loop();

                        }

                    }

                }

            },

            /**
             * Loops tutorial.
             */
            loop: function () {

                // loop after delay

                if (this.loopDelay) {

                    this._loopDelayed = true;
                    this.loopTimer.set(this.loopDelay);

                }
                else {

                    this.loopStart();

                }

            },

            /**
             * Starts loop of tutorial.
             */
            loopStart: function () {

                var looping = false;

                this.deactivate();

                // try to loop

                if (this.loops !== 0) {

                    this._loopCount++;

                    if (this.loops === -1 || this._loopCount < this.loops) {

                        if (this.loopEntity) {

                            looping = true;
                            this.loopEntity.onRemoved.addOnce(this.activate, this);

                        }
                        else {

                            looping = true;
                            this.activate();

                        }

                    }

                }

                // kill if done looping

                if (!looping) {

                    this.kill();

                }

            },

            /**
             * Ends loop of tutorial.
             */
            loopEnd: function () {

                this._loopDelayed = false;

                if (this.loopEntity) {

                    this.loopEntity.onRemoved.remove(this.activate, this);
                    this.loopEntity.onRemoved.remove(this.loop, this);
                    this.loopEntity.onMovedTo.remove(this.loop, this);

                    if (this.loopEntityAnim) {

                        this.loopEntityAnim.onCompleted.remove(this.loop, this);
                        this.loopEntityAnim = undefined;

                    }

                    this.loopEntity = undefined;

                }

            },

            /**
             * Kills and tearsdown tutorial.
             * @override
             */
            kill: function (silent) {

                this.parent(silent);

                this.teardown();

            },

            /**
             * Updates tutorial.
             * <br>- checks if complete via {@link ig.Tutorial#actions} {@link ig.Tutorial#properties}
             * <br>- checks if should loop
             * @see ig.Spawner.
             */
            update: function () {

                if (!this._killed && this.activated) {

                    var i, il;

                    // check input state for action and kill tutorial

                    if (this.actions.length > 0) {

                        for (i = 0, il = this.actions.length; i < il; i++) {

                            var action = this.actions[ i ];

                            if (ig.input.pressed(action) || ig.input.released(action)) {

                                this.kill();

                            }

                        }

                    }

                    // check player properties are truthy and kill tutorial

                    if (!this._killed && this.properties.length > 0) {

                        var player = ig.game.namedEntities['player'];

                        if (player) {

                            for (i = 0, il = this.properties.length; i < il; i++) {

                                var property = this.properties[ i ];

                                if (player[ property ]) {

                                    this.kill();

                                }

                            }

                        }

                    }

                    // check for restart loop

                    if (!this._killed && this._loopDelayed && this.loopTimer.delta() >= 0) {

                        this.loopStart();

                    }

                }

                this.parent();

            },

            /**
             * Stops checking and tearsdown when player no longer in tutorial area.
             * @override
             */
            checkStop: function () {

                if (this.autoToggle && this.activated) {

                    this.teardown();

                }

                this.parent();

            }

        });

    });