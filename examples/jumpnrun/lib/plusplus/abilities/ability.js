ig.module(
        'plusplus.abilities.ability'
    )
    .requires(
        'plusplus.core.timer',
        'plusplus.abstractities.particle',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.signals'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;
        var _uti = ig.utilsintersection;

        var count = 0;

        /**
         * Base class for Abilities.
         * <br>- abilities are great for when your characters need to do special actions such as shooting, interacting, etc
         * <span class="alert alert-info"><strong>Tip:</strong> abilities include a visual casting / using system, see {@link ig.Ability#activateCastSettings} for examples.</span>
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // using abilities is easy
         * // each character already has an abilities list
         * // which is a special hierarchy object
         * // that has built in methods to facilitate ability use
         * character.abilities = new ig.Hierarchy();
         * // but this abilities list is empty
         * // so create a new melee ability
         * // and don't forget to pass the entity
         * // so the ability has a reference to its user
         * character.melee = new ig.AbilityMelee( character );
         * // then, optionally, add the ability
         * // to the character's ability list
         * character.abilities.addDescendant( character.melee );
         * // now when our character needs to get violent
         * // and really punch something
         * character.melee.execute();
         * // the melee ability is a SPAMMABLE type
         * // so we can also find all SPAMMABLE abilities
         * // in the character's abilities list
         * var spammables = character.abilities.getDescendantsByType(ig.Ability.TYPE.SPAMMABLE);
         * // and execute each spammable ability
         * // which in this case is only the melee ability
         * for (var i = 0, il = spammables.length; i < il; i++) {
         *      spammables[ i ].execute();
         * }
         * // some abilities, such as melee
         * // will automatically find the closest target in range
         * // when executed, based on the canFindTarget property
         * // but lets say that you want to execute the ability
         * // when the player taps or clicks
         * // and use the player's target
         * // get all input points that have tapped
         * var inputPoints = ig.input.getInputPoints([ 'tapped' ], [ true ]);
         * // for the example, use only the first
         * var inputPoint = inputPoints[ 0 ];
         * if ( inputPoint ) {
         *      // give the ability a list of targets under the tap
         *      // and let the ability choose the best
         *      character.melee.setEntityTargetFirst(inputPoint.targets);
         *      // now punch again!
         *      character.melee.execute();
         * }
         **/
        ig.Ability = ig.Class.extend(/**@lends ig.Ability.prototype */{

            /**
             * Unique instance id.
             * @type String
             */
            id: count++,

            /**
             * Unique instance name.
             * <br>- usually names are used to map instances for faster searching.
             * @type String
             */
            name: '',

            /**
             * Flag for type of ability.
             * @type Number
             * @default
             * @see ig.utils#addType
             */
            type: 0,

            /**
             * Whether ability is able to execute.
             * @type Boolean
             * @default
             */
            enabled: true,

            /**
             * Entity that is using this ability.
             * @type ig.EntityExtended
             * @default
             */
            entity: null,

            /**
             * Entity that provides options / settings for ability use.
             * @type ig.EntityExtended
             * @default
             */
            entityOptions: null,

            /**
             * Entity that is the target of this ability
             * @type ig.EntityExtended
             * @default
             */
            entityTarget: null,

            /**
             * Whether ability should toggle activate / deactivate on execute instead of just activating.
             * @type Boolean
             * @default
             */
            executeToggle: false,

            /**
             * Whether ability is channelled after activated.
             * @type Boolean
             * @default
             */
            channelled: false,

            /**
             * Energy cost to activate.
             * @type Number
             * @default
             */
            costActivate: 0,

            /**
             * Energy cost to channel.
             * @type Number
             * @default
             */
            costChannel: 0,

            /**
             * Whether needs target to execute.
             * @type Boolean
             * @default
             */
            requiresTarget: false,

            /**
             * Whether can find a target in range when has none while executing.
             * @type Boolean
             * @default
             */
            canFindTarget: false,

            /**
             * Whether can target self.
             * @type Boolean
             * @default
             */
            canTargetSelf: true,

            /**
             * Whether can target others.
             * @type Boolean
             * @default
             */
            canTargetOthers: true,

            /**
             * Horizontal distance for finding targets from ability user, or to determine if ability user is close enough to target.
             * @example
             * // does not find targets and treats all targets as if within range
             * ability.rangeX = 0;
             * @default
             * @type Number
             */
            rangeX: 0,
            /**
             * Vertical distance for finding targets from ability user, or to determine if ability user is close enough to target.
             * @example
             * // does not find targets and treats all targets as if within range
             * ability.rangeY = 0;
             * @default
             * @type Number
             */
            rangeY: 0,

            /**
             * Flag for types of entities that can be targeted.
             * @example
             * // target nothing
             * ability.typeTargetable = 0;
             * // target characters
             * ig.utils.addType( ig.EntityExtended, ability, 'typeTargetable', 'CHARACTER' );
             * // also target destructables
             * ig.utils.addType( ig.EntityExtended, ability, 'typeTargetable', 'DESTRUCTABLE' );
             * @default
             * @type Number
             * @see ig.utils#addType
             * @see ig.EntityExtended
             */
            typeTargetable: 0,

            /**
             * Whether to face target.
             * @type Boolean
             * @default
             */
            faceTarget: true,

            //
            /**
             * Whether to retain target after execution.
             * @type Boolean
             * @default
             */
            retainTarget: false,

            /**
             * Whether to retain target while channelling.
             * @type Boolean
             * @default
             */
            retainTargetChannel: true,

            /**
             * Whether blocks user from regenerating while channelling.
             * @type Boolean
             * @default
             */
            regenBlocking: true,

            /**
             * Upgrade rank.
             * @type Number
             * @default
             */
            rank: 0,

            /**
             * Upgrades to apply, where each index corresponds to a rank.
             * @type Array
             */
            upgrades: [],

            /**
             * Activate cast settings.
             * <span class="alert"><strong>IMPORTANT:</strong> casting only works when ability is also updated.</span>
             * @example
             * // cast settings is a plain object
             * castSettings = {};
             * // casts based on 1 second delay
             * castSettings.delay = 1;
             * // add an animation to casting which will loop until delay complete
             * // if no delay is provided, cast will only last as long as animation
             * castSettings.animName = 'casting';
             * // casting is by default interrupted by any movement, but this can be changed
             * castSettings.moving = true;
             * // when casting is complete, we can call a function
             * castSettings.callback = function () { ... };
             * // in a context
             * castSettings.context = someObject;
             * // and pass a settings object to that callback
             * castSettings.settings = {...};
             * // while casting, we can also add a list of effects
             * castSettings.effects = [
             *      // where each effect is spawned by a plain object
             *      {
             *          // that consists of an entity class to spawn as the effect
             *          // which will be automatically killed when casting is ended
             *          entity: ig.EntityClass
             *          // and a settings object that will be merged into the spawned effect
             *          settings: {...}
             *      }
             *      // and we can create as many effects as needed (but don't be a jerk and overload)
             *      ...
             * ];
             * @type Object
             * @default
             */
            activateCastSettings: null,

            /**
             * Activate checks pass cast settings.
             * <br>- see {@link ig.Ability#activateCastSettings} for settings and example
             * <span class="alert"><strong>IMPORTANT:</strong> casting only works when ability is also updated.</span>
             * @type Object
             * @default
             */
            activatePassCastSettings: null,

            /**
             * Activate setup cast settings.
             * <br>- see {@link ig.Ability#activateCastSettings} for settings and example
             * <span class="alert"><strong>IMPORTANT:</strong> casting only works when ability is also updated.</span>
             * @type Object
             * @default
             */
            activateSetupCastSettings: null,

            /**
             * Deactivate cast settings.
             * <br>- see {@link ig.Ability#activateCastSettings} for settings and example
             * <span class="alert"><strong>IMPORTANT:</strong> casting only works when ability is also updated.</span>
             * @type Object
             * @default
             */
            deactivateCastSettings: null,

            /**
             * Deactivate setup cast settings.
             * <br>- see {@link ig.Ability#activateCastSettings} for settings and example
             * <span class="alert"><strong>IMPORTANT:</strong> casting only works when ability is also updated.</span>
             * @type Object
             * @default
             */
            deactivateSetupCastSettings: null,

            /**
             * Fail cast settings.
             * <br>- see {@link ig.Ability#activateCastSettings} for settings and example
             * <span class="alert"><strong>IMPORTANT:</strong> casting only works when ability is also updated.</span>
             * @type Object
             * @default
             */
            failCastSettings: null,

            /**
             * Reason for ability failure.
             * @type String
             */
            failReason: '',

            /**
             * Signal dispatched when ability activates.
             * <br>- created on init.
             * @type ig.Signal
             */
            onActivated: null,

            /**
             * Signal dispatched when ability deactivates.
             * <br>- created on init.
             * @type ig.Signal
             */
            onDeactivated: null,

            /**
             * Signal dispatched when ability fails a check.
             * <br>- created on init.
             * @type ig.Signal
             */
            onFailed: null,

            // internal properties, do not modify

            _activated: false,
            _channelling: false,
            _regenBlocked: false,
            _entityTargetRetained: false,
            _casting: false,

            /**
             * Initializes ability, called upon construction.
             * @param {ig.EntityExtended} entity entity using ability.
             * @param {Object} [settings] settings object.
             **/
            init: function (entity, settings) {

                this.id = count++;

                ig.merge(this, settings);

                this.initTypes();

                this.initProperties();

                this.initUpgrades();

                this.setEntity(entity);

            },

            /**
             * Initializes ability types.
             **/
            initTypes: function () {
            },

            /**
             * Initializes ability properties.
             **/
            initProperties: function () {

                // timers

                this.castTimer = new ig.TimerExtended();

                // signals

                this.onActivated = new ig.Signal();
                this.onDeactivated = new ig.Signal();
                this.onFailed = new ig.Signal();

            },

            /**
             * Initializes upgrades.
             **/
            initUpgrades: function () {
            },

            /**
             * Executes ability by starting activate process. Can also toggle between activate and deactivate using {@link ig.Ability#executeToggle} property.
             **/
            execute: function () {

                if (this.enabled) {

                    if (this.executeToggle && this._activated) {

                        return this.deactivateSetup(arguments);

                    }
                    else if (this.assert(this.hasTarget(), ig.Ability.FAIL.TARGET)) {

                        return this.activateSetup(arguments);

                    }

                }

            },

            /**
             * Execute without any parameters, used when setting entity to execute passive abilities.
             **/
            executePlain: function () {

                return this.execute();

            },

            /**
             * Cleans up ability by immediately and silently deactivating.
             **/
            cleanup: function () {

                // cleanup should be silent
                // temporarily replace deactivate cast settings

                var deactivateCastSettings = this.deactivateCastSettings;

                this.deactivateCastSettings = undefined;

                var result = this.deactivate.apply( this, arguments );

                this.deactivateCastSettings = deactivateCastSettings;

                // clean signals when game is changing levels

                if ( !ig.game.hasLevel ) {

                    this.onActivated.removeAll();
                    this.onActivated.forget();
                    this.onDeactivated.removeAll();
                    this.onDeactivated.forget();
                    this.onFailed.removeAll();
                    this.onFailed.forget();

                }

                return result;

            },

            /**
             * Cleanup without parameters.
             **/
            cleanupPlain: function () {

                return this.cleanup();

            },

            /**
             * Sets up ability to activate. Step 1 of activate process.
             * @param {Array} [args] arguments to pass through activate steps.
             **/
            activateSetup: function (args) {

                // try to look at target

                if (this.faceTarget) {

                    this.lookAt();

                }

                // cast first

                if (this.activateSetupCastSettings) {

                    this.cast(this.activateSetupCastSettings, this.activateTry, args);

                }
                else {

                    return this.activateTry(args);

                }

            },

            /**
             * Tries to activate by doing checks. Step 2 of activate process.
             * @param {Array} [args] arguments to pass through activate steps.
             **/
            activateTry: function (args) {

                // no cost, only check if close enough

                if (this.costActivate === 0) {

                    if (this.assert(this.hasValidTarget(), ig.Ability.FAIL.TARGET_INVALID)
                        && this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                        return this.activatePass(args);

                    }

                }
                // has cost
                else if (this.assert(this.canPayCost(this.costActivate), ig.Ability.FAIL.COST)
                    && this.assert(this.hasValidTarget(), ig.Ability.FAIL.TARGET_INVALID)
                    && this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                    this.extractCost(this.costActivate);

                    return this.activatePass(args);

                }

            },

            /**
             * Called when activate checks passed. Step 3 of activate process.
             * @param {Array} [args] arguments to pass through activate steps.
             **/
            activatePass: function (args) {

                if (this.activatePassCastSettings) {

                    this.cast(this.activatePassCastSettings, this.activate, args);

                }
                else {

                    return this.activate.apply(this, args);

                }

            },

            /**
             * Called on successful activate. Step 4 of activate process. NOTE: If overriding, always call this.parent() at the end of overriding method as target is dropped at the end of this method.
             **/
            activate: function () {

                this._activated = true;
                this.onActivated.dispatch(this);

                this.cast(this.activateCastSettings);

                // drop target

                this.dropEntityTarget();

            },

            /**
             * Sets up ability to deactivate. Step 1 of deactivate process.
             * @param {Array} [args] arguments.
             **/
            deactivateSetup: function (args) {

                // cast first

                if (this.deactivateSetupCastSettings) {

                    this.cast(this.deactivateSetupCastSettings, this.deactivate, args);

                }
                else {

                    return this.deactivate.apply(this, args);

                }

            },

            /**
             * Called on successful deactivate. Step 2 of deactivate process. NOTE: If overriding, always call this.parent() at the end of overriding method as target is dropped at the end of this method.
             **/
            deactivate: function () {

                if (this._channelling) {

                    this.unblockRegen(this.entity);

                }

                this._activated = false;
                this.onDeactivated.dispatch(this);

                this.cast(this.deactivateCastSettings);

                // drop target

                this.dropEntityTarget();

            },

            /**
             * Casts using delay and/or animation and then does callback.
             * @param {Object} settings settings for casting.
             * @param {Function} [internalCallback] internal callback.
             * @param {Array} [internalArgs] internal arguments.
             **/
            cast: function (settings, internalCallback, internalArgs) {

                // stop previous cast

                this.castEnd();

                // store settings

                settings = settings || {};

                // specific cast time

                if (settings.delay) {

                    this.castStart(settings, internalCallback, internalArgs);

                    this.castTimer.set(settings.delay);

                    if (settings.animName) {

                        this.entity.animOverride(settings.animName, {
                            loop: ( typeof settings.loop !== 'undefined' ? settings.loop : true )
                        });

                    }

                }
                // cast time based on animation
                else if (settings.animName) {

                    this.castStart(settings, internalCallback, internalArgs);

                    // auto complete cast at end of animation

                    this.entity.animOverride(settings.animName, {
                        callback: function () {

                            this.castComplete();

                        },
                        context: this,
                        loop: settings.loop
                    });

                }

            },

            /**
             * Starts casting.
             * @param {Object} settings settings object.
             * @param {Function} [internalCallback] internal callback.
             * @param {Array} [internalArgs] internal arguments.
             **/
            castStart: function (settings, internalCallback, internalArgs) {

                this._casting = true;
                this.castSettings = settings;
                this.castInternalCallback = internalCallback;
                this.castInternalArgs = internalArgs;

                var effects = settings.effects;

                if (effects) {

                    for (var i = 0, il = effects.length; i < il; i++) {

                        this.effectStart(effects[ i ]);

                    }

                }

            },

            /**
             * Updates casting.
             **/
            castUpdate: function () {

                if (this._casting) {

                    // specific cast time

                    if (this.castSettings.delay && this.castTimer.delta() >= 0) {

                        this.castComplete();

                    }
                    // not already failed
                    else if (!this.failReason) {

                        // interrupt when cannot move while casting and is moving

                        this.assert(this.castSettings.moving || !this.entity.moving, ig.Ability.FAIL.INTERRUPT);

                    }

                }

            },

            /**
             * Completes casting.
             **/
            castComplete: function () {

                var settings = this.castSettings;
                var internalCallback = this.castInternalCallback;
                var internalArgs = this.castInternalArgs;

                // end first, in case another cast is callback

                this.castEnd();

                // clear fail reason

                this.failReason = '';

                // do callbacks

                if (settings.callback) {

                    settings.callback.apply(settings.context || this, settings.settings);

                }

                if (internalCallback) {

                    internalCallback.apply(this, internalArgs);

                }

            },

            /**
             * Ends casting.
             **/
            castEnd: function () {

                if (this._casting) {

                    this._casting = false;

                    // kill effects if they are not particles

                    var effects = this.castSettings.effects;

                    if (effects) {

                        for (var i = 0, il = effects.length; i < il; i++) {

                            this.effectEnd(effects[ i ]);

                        }

                    }

                    // release animation

                    if (this.entity.overridingAnimName === this.castSettings.animName) {

                        this.entity.animRelease(true);

                    }

                    this.castSettings = this.castInternalCallback = this.castInternalArgs = undefined;

                }

            },

            /**
             * Creates an effect.
             * @param {ig.Effect} effect effect.
             **/
            effectStart: function (effect) {

                var es = effect.settings || {};

                // handle lifetime and fadetime

                if (!effect.ignoreDuration) {

                    if (this.castSettings) {

                        // set lifetime of effect to cast delay or animation length

                        if (this.castSettings.delay) {

                            es.lifeDuration = this.castSettings.delay;

                        }
                        else if (this.castSettings.animName) {

                            var anim = this.entity.anims[ this.castSettings.animName ];

                            if (anim) {

                                es.lifeDuration = anim.frameTime * anim.sequence.length;

                            }

                        }

                    }

                    // fade effect out over lifetime

                    if (effect.fade) {

                        es.fadeBeforeDeathDuration = es.fadeBeforeDeathDuration || 0;

                    }

                }

                // check if not following target or this has a target

                if (!effect.followTarget || this.entityTarget) {

                    // create entity

                    var entity = effect.entity = ig.game.spawnEntity(effect.entity, 0, 0, es);

                    // follow entity

                    if (effect.followSettings) {

                        if (effect.followTarget) {

                            if (this.entityTarget) {

                                entity.moveToEntity(this.entityTarget, effect.followSettings);

                            }

                        }
                        else {

                            entity.moveToEntity(this.entity, effect.followSettings);

                        }

                    }
                    // center entity by default
                    else if (effect.center !== false) {

                        entity.pos.x = this.entity.bounds.minX + this.entity.bounds.width * 0.5 - entity.size.x * 0.5;
                        entity.pos.y = this.entity.bounds.minY + this.entity.bounds.height * 0.5 - entity.size.y * 0.5;

                    }

                }

            },

            /**
             * Ends an effect.
             * @param {ig.Effect} effect effect.
             **/
            effectEnd: function (effect) {

                if (effect.entity && !effect.entity._killed && ( this.failReason === ig.Ability.FAIL.INTERRUPT || !( effect.entity instanceof ig.Particle ) )) {

                    effect.entity.kill();

                }

            },

            /**
             * Updates ability.
             **/
            update: function () {

                if (this.enabled === true) {

                    this.castUpdate();

                    if (this._activated) {

                        if (this.channelled) {

                            this.channelTry(arguments);

                        }

                    }

                }

            },

            /**
             * Trys to channel ability by doing checks. Step 1 of channel process.
             * @param {Array} [args] arguments to use in channel process.
             **/
            channelTry: function (args) {

                // take cost of update and check if target still close enough

                if (this.costChannel === 0) {

                    if (this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                        return this.channel.apply(this, args);

                    }

                }
                else if (this.assert(this.canPayCost(this.costChannel), ig.Ability.FAIL.COST)
                    && this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                    this.extractCost(this.costChannel);

                    return this.channel.apply(this, args);

                }

                // entity can't pay cost, deactivate ability

                return this.deactivateSetup(args);

            },

            /**
             * Channels ability. Step 2 of channel process.
             **/
            channel: function () {

                if (!this._channelling) {

                    this._channelling = true;

                    this.blockRegen(this.entity);

                }

                if (this.faceTarget) {

                    this.lookAt();

                }

            },

            /**
             * Blocks energy regeneration in entity.
             * @param {ig.EntityExtended} entity block regeneration in this entity.
             **/
            blockRegen: function (entity) {

                if (entity.regenEnergy) {

                    this._regenBlocked = true;
                    entity.regenEnergy = false;

                }

            },

            /**
             * Unblocks energy regeneration in entity.
             * @param {ig.EntityExtended} entity block regeneration in this entity.
             **/
            unblockRegen: function (entity) {

                if (this._regenBlocked) {

                    entity.regenEnergy = true;
                    this._regenBlocked = false;

                }

            },

            /**
             * Sets the entity that is using this ability.
             * @param {ig.EntityExtended} entity ability user.
             **/
            setEntity: function (entity) {

                // clean previous

                if (this.entity) {

                    this.entity.onRemoved.remove(this.cleanupPlain, this);
                    this.entity.onAdded.remove(this.executePlain, this);

                    this.cleanup();

                }

                // store new

                this.entity = entity;
                this.castTimer.setPauseSignaller(this.entity);

                if (this.entity) {

                    // auto cleanup when entity is removed from game

                    this.entity.onRemoved.add(this.cleanupPlain, this);

                    // passive abilities should be turned on as soon as entity is added to game

                    if (this.type & ig.Ability.TYPE.PASSIVE) {

                        if (this.entity.added) {

                            this.executePlain();

                        }
                        else {

                            this.entity.onAdded.addOnce(this.executePlain, this);

                        }

                    }

                }

            },

            /**
             * Sets the entity for passing to bindings as options. Normally the entity that the ability originated with.
             * @param {ig.EntityExtended} entity options provider.
             **/
            setEntityOptions: function (entity) {

                this.entityOptions = entity;

            },

            /**
             * Sets the entity for use as a target.
             * @param {ig.EntityExtended} entity entity target.
             **/
            setEntityTarget: function (entity) {

                // check type of entity against the types of entities this can target

                if (!entity || this.isEntityTargetable(entity)) {

                    this.entityTarget = entity;
                    this._entityTargetRetained = false;

                }

            },

            /**
             * @param {ig.EntityExtended} entity entity target.
             * @returns {Boolean} Whether entity can (or should) be targeted.
             **/
            isEntityTargetable: function (entity) {

                return ( entity.type & this.typeTargetable ) && ( ( this.canTargetOthers && this.entity !== entity ) || ( this.canTargetSelf && this.entity === entity ) );

            },

            /**
             * Sets first targetable entity from a list.
             * @param {Array} entities array of entities to test.
             **/
            setEntityTargetFirst: function (entities) {

                // try to set target until one set

                if (entities && entities.length) {

                    for (var i = 0, il = entities.length; i < il; i++) {

                        this.setEntityTarget(entities[ i ]);

                        if (this.entityTarget) {

                            break;

                        }

                    }

                }
                // set target to nothing
                else {

                    this.setEntityTarget();

                }

            },

            /**
             * Finds and sets closest targetable entity.
             **/
            setClosestEntityTarget: function () {

                // find all targetables

                if (this.rangeX > 0 || this.rangeY > 0) {

                    // clear current entity

                    if (this.entityTarget) {

                        this.setEntityTarget();

                    }

                    var entities = _uti.entitiesInAABB(
                        this.entity.bounds.minX - this.rangeX,
                        this.entity.bounds.minY - this.rangeY,
                        this.entity.bounds.maxX + this.rangeX,
                        this.entity.bounds.maxY + this.rangeY,
                        true
                    );

                    // try to set target until one set

                    this.setEntityTargetFirst(entities);

                }

            },

            /**
             * Retains or drops current entityTarget automatically.
             **/
            dropEntityTarget: function () {

                if (this.entityTarget) {

                    if (this.isEntityTargetDroppable()) {

                        this.setEntityTarget();

                    }
                    else {

                        this._entityTargetRetained = true;

                    }

                }

            },

            /**
             * @returns {Boolean} Whether current entityTarget can (or should) be dropped.
             **/
            isEntityTargetDroppable: function () {

                return !this.retainTarget || !( this._channelling && this.retainTargetChannel );

            },

            /**
             * @returns {Boolean} if this has entityTarget. May also attempt to find target if possible.
             **/
            hasTarget: function () {

                // target is required

                if (this.requiresTarget) {

                    // has no target but able to find a target in range

                    if (this.canFindTarget && !this.entityTarget) {

                        this.setClosestEntityTarget();

                    }

                    // has target

                    if (this.entityTarget) {

                        return true;

                    }

                    return false;

                }

                return true;

            },

            /**
             * Checks if entityTarget is a valid target, as opposed to if is targetable.
             **/
            hasValidTarget: function () {

                return !this.requiresTarget || this.entityTarget;

            },

            /**
             * @returns {Boolean} if entity is close enough to entityTarget
             **/
            closeEnough: function () {

                // target is required

                if (this.requiresTarget) {

                    // has target

                    if (this.entityTarget) {

                        var interactiveTarget = this.entityTarget.type & ig.EntityExtended.TYPE.INTERACTIVE;

                        // infinite range

                        if (( this.rangeX === 0 && this.rangeY === 0 )
                            || ( interactiveTarget && this.entityTarget.rangeInteractableX === 0 && this.entityTarget.rangeInteractableY === 0 )) {

                            return true;

                        }
                        // check range allowable vs target range
                        else {

                            var rangeX;
                            var rangeY;

                            if (interactiveTarget) {

                                rangeX = Math.max(this.rangeX, this.entityTarget.rangeInteractableX);
                                rangeY = Math.max(this.rangeY, this.entityTarget.rangeInteractableY);

                            }
                            else {

                                rangeX = this.rangeX;
                                rangeY = this.rangeY;

                            }

                            // expand entity bounds by activate distance and check if overlaps target bounds

                            var overlap = _uti.boundsAABBIntersect(
                                this.entityTarget.bounds,
                                this.entity.bounds.minX - rangeX,
                                this.entity.bounds.minY - rangeY,
                                this.entity.bounds.maxX + rangeX,
                                this.entity.bounds.maxY + rangeY
                            );

                            // flip entity to face target

                            if (this.faceTarget) {

                                this.lookAt();

                            }

                            return overlap;

                        }

                    }
                    // no target
                    else {

                        return false;

                    }

                }

                return true;

            },

            /**
             * Flips ability user to face target.
             * @param {Entity} [target=this.entityTarget] target to look at.
             **/
            lookAt: function (target) {

                target = target || this.entityTarget;

                // target is not self and not fixed

                if (target && this.entity !== target && !target.fixed) {
					
					var entityCenterX;
					var targetCenterX;
					
					if ( this.entity.added ) {
						
						entityCenterX = this.entity.bounds.minX + this.entity.bounds.width * 0.5;
						
					}
					else {
						
						entityCenterX = this.entity.pos.x + this.entity.size.x * 0.5;
						
					}
					
					if ( target.added ) {
						
						targetCenterX = target.bounds.minX + target.bounds.width * 0.5;
						
					}
					else {
						
						targetCenterX = target.pos.x + target.size.x * 0.5;
						
					}

                    if ( entityCenterX > targetCenterX ) {

                        this.entity.flip = true;

                    }
                    else {

                        this.entity.flip = false;

                    }

                }

            },

            /**
             * Evaluates a check result and triggers fail if a check is false.
             * @param {*} checkResult result of a check evaluated as truthy or falsy.
             * @param {String} failReason reason assert may fail.
             * @returns {Boolean} Whether a check is true.
             **/
            assert: function (checkResult, failReason) {

                if (!checkResult) {

                    this.failReason = failReason || ig.Ability.FAIL.UNKNOWN;

                    // only end cast if interrupting

                    if (this.failReason === ig.Ability.FAIL.INTERRUPT) {

                        this.castEnd();

                    }
                    else {

                        var fs = this.failCastSettings;

                        if (fs) {

                            // set fail reason as init anim of effects

                            if (fs.effects) {

                                for (var i = 0, il = fs.effects.length; i < il; i++) {

                                    var effect = fs.effects[ i ];

                                    effect.settings = effect.settings || {};
                                    effect.settings.animInit = this.failReason;

                                }

                            }

                            this.cast(this.failCastSettings);

                        }

                    }

                    this.onFailed.dispatch(this);

                    // drop target

                    this.dropEntityTarget();

                }
                else {

                    this.failReason = '';

                }

                return checkResult;

            },

            /**
             * @returns {Boolean} Whether entity can pay energy cost.
             **/
            canPayCost: function (amount) {

                return !this.entity.hasOwnProperty('energy') || this.entity.invulnerable || this.entity.energy >= amount;

            },

            /**
             * Makes entity pay energy cost.
             **/
            extractCost: function (amount) {

                if (this.entity.drainEnergy) {

                    this.entity.drainEnergy(amount, this);

                }

            },

            /**
             * Adds upgrades to the upgrades list, where each upgrade is mapped by index to a rank.
             * @param {Object|Function|Array} upgrades object with properties to merge into this, a function to execute upon upgrade, or an array of the previous.
             **/
            addUpgrades: function (upgrades) {

                _ut.arrayCautiousAddMulti(this.upgrades, upgrades);

            },

            /**
             * Upgrades ability to rank, or, if no rank passed, to next rank possible.
             * @param {Number|Boolean} [rank=this.rank+1] rank to upgrade to, where boolean true will upgrade to max rank.
             **/
            upgrade: function (rank) {

                if (rank === true) {

                    rank = this.upgrades.length;

                }
                else if (!_ut.isNumber(rank)) {

                    rank = this.rank + 1;

                }

                this.changegrade(rank);

            },

            /**
             * Downgrades ability to rank, or, if no rank passed, to previous rank possible. NOTE: Be cautious when using this on abilities that upgrade with a function and not properties.
             * @param {Number|Boolean} [rank=this.rank-1] rank to upgrade to, where boolean true downgrades to min rank.
             **/
            downgrade: function (rank) {

                if (rank === true) {

                    rank = 0;

                }
                else if (!_ut.isNumber(rank)) {

                    rank = this.rank - 1;

                }

                this.changegrade(rank);

            },

            /**
             * Shifts current upgrade rank up or down based on current vs passed.
             * @param {Number} rank rank to upgrade to.
             **/
            changegrade: function (rank) {

                var rankMax = this.upgrades.length;
                var direction = rank < this.rank ? -1 : 1;
                var rankNext = this.rank + direction;

                // clean up ability before upgrade

                if (this.rank !== rank) {

                    this.cleanup();

                }

                // do upgrades

                while (this.rank !== rank && rankNext < rankMax && rankNext >= 0) {

                    this.rank = rankNext;

                    var upgrade = this.upgrades[ rankNext ];
                    var entity = this.entity;
                    var entityOptions = this.entityOptions || entity;

                    if (typeof upgrade === 'function') {

                        upgrade.call(this, entity, entityOptions);

                    }
                    else {

                        ig.merge(this, upgrade);

                    }

                    rankNext += direction;

                }

            },

            /**
             * Clones this ability object.
             * <span class="alert alert-danger"><strong>IMPORTANT:</strong> any class that extends {@link ig.Ability} must define {@link ig.Ability#clone} and call parent last.</span>
             * @param {ig.Ability} [c] ability object to clone into.
             * @returns {ig.Ability} copy of this.
             **/
            clone: function (c) {

                if (c instanceof ig.Ability !== true) {

                    c = new ig.Ability();

                }

                c.name = this.name;
                c.type = this.type;
                c.enabled = this.enabled;

                c.costActivate = this.costActivate;
                c.costDeactivate = this.costDeactivate;
                c.costChannel = this.costChannel;

                c.requiresTarget = this.requiresTarget;
                c.canFindTarget = this.canFindTarget;
                c.canTargetSelf = this.canTargetSelf;
                c.canTargetOthers = this.canTargetOthers;
                c.typeTargetable = this.typeTargetable;
                c.rangeX = this.rangeX;
                c.rangeY = this.rangeY;
                c.retainTarget = this.retainTarget;

                c.rank = this.rank;
                c.upgrades = this.upgrades.slice(0);

                c.regenBlocking = this.regenBlocking;

                c.setEntityOptions(this.entityOptions);
                c.setEntity(this.entity);

                return c;

            }

        });

        /**
         * Bitwise flags for abilities to designate types, via {@link ig.Ability#type}.
         * <br>- some flags are already defined for convenience
         * <br>- up to 32 flags can be defined
         * @static
         * @readonly
         * @memberof ig.Ability
         * @see ig.utils.getType
         * @see ig.utils.addType
         * @property {Bitflag} PASSIVE passive type
         * @property {Bitflag} SPAMMABLE spoammable type
         * @property {Bitflag} TOGGLEABLE toggleable type
         **/
        ig.Ability.TYPE;

        // add some base types

        _ut.getType(ig.Ability, "PASSIVE");
        _ut.getType(ig.Ability, "SPAMMABLE");
        _ut.getType(ig.Ability, "TOGGLEABLE");

        /**
         * Failure reasons for when an ability fails.
         * @readonly
         * @property {String} UNKNOWN - unknown.
         * @property {String} COST - user can't pay cost.
         * @property {String} TARGET - no target.
         * @property {String} TARGET_INVALID - target is invalid.
         * @property {String} DISTANCE - target is too far away.
         * @property {String} COOLDOWN - ability on cooldown.
         * @property {String} INTERRUPT - casting interrupted.
         */
        ig.Ability.FAIL = {
            UNKNOWN: 'unknown',
            COST: "cost",
            TARGET: "target",
            TARGET_INVALID: "targetInvalid",
            DISTANCE: "distance",
            COOLDOWN: "cooldown",
            INTERRUPT: "interrupt"
        }

    });