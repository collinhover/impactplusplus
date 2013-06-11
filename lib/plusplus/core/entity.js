ig.module(
        'plusplus.core.entity'
    )
    .requires(
        'impact.entity',
        'impact.timer',
        'plusplus.core.config',
        'plusplus.core.background-map',
        'plusplus.core.animation',
        'plusplus.helpers.signals',
        'plusplus.helpers.tweens',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.utilsdraw',
        'plusplus.helpers.utilstile'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _tw = ig.TWEEN;
        var _ut = ig.utils;
        var _utm = ig.utilsmath;
        var _utv2 = ig.utilsvector2;
        var _uti = ig.utilsintersection;
        var _utd = ig.utilsdraw;
        var _utt = ig.utilstile;

        /**
         * Enhanced entity that is the core of Impact++.
         * <br>- entity animations can be added dynamically and handle inheritance far more flexibly with {@link ig.EntityExtended#animSettings}
         * <br>- entities update is now opt-in using {@link ig.EntityExtended#performance} and {@link ig.EntityExtended#frozen}
         * <br>- added {@link ig.EntityExtended#bounds} and {@link ig.EntityExtended#boundsDraw} to speed up searches and allow entities be more flexible
         * <span class="alert alert-info"><strong>Tip:</strong> your entities should be a descendant of this to utilize Impact++ properly.</span>
         * @class
         * @extends ig.Entity
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityExtended = ig.Entity.extend(/**@lends ig.EntityExtended.prototype */{

            /**
             * Layer to be added to upon instantiation.
             * @type String
             * @default
             */
            layerName: 'entities',

            /**
             * Size of entity
             * @type Vector2|Object
             * @see ig.CONFIG.ENTITY.SIZE_EFFECTIVE_X
             * @see ig.CONFIG.ENTITY.SIZE_EFFECTIVE_Y
             */
            size: _utv2.vector( _c.ENTITY.SIZE_EFFECTIVE_X, _c.ENTITY.SIZE_EFFECTIVE_Y ),

            /**
             * Offset of entity, reflected on both sides.
             * @type Vector2|Object
             * @see ig.CONFIG.ENTITY.SIZE_OFFSET_X
             * @see ig.CONFIG.ENTITY.SIZE_OFFSET_Y
             */
            offset: _utv2.vector( _c.ENTITY.SIZE_OFFSET_X, _c.ENTITY.SIZE_OFFSET_Y ),

            /**
             * How entity should collide with other entities.
             * <br>- this does not affect whether entity collides with collision map, only how it collides with other entities
             * <span class="alert"><strong>IMPORTANT:</strong> for an entity to avoid being ignored in checks, it must either collide, checkAgainst, or have a type!</span>
             * @type Bitflag
             * @default none
             * @see ig.Entity
             */
            collides: ig.Entity.COLLIDES.NONE,

            /**
             * Entities to check against, expanded for more flexibility and specificity.
             * <span class="alert"><strong>IMPORTANT:</strong> for an entity to avoid being ignored in checks, it must either collide, checkAgainst, or have a type!</span>
             * @type Bitflag
             * @default none
             * @see ig.utils.getType
             */
            checkAgainst: ig.Entity.TYPE.NONE,

            /**
             * Entity type, expanded for more flexibility and specificity.
             * <span class="alert"><strong>IMPORTANT:</strong> for an entity to avoid being ignored in checks, it must either collide, checkAgainst, or have a type!</span>
             * @type Bitflag
             * @default none
             * @see ig.utils.getType
             */
            type: ig.Entity.TYPE.NONE,

            /**
             * Group of entities to avoid checking against and colliding with.
             * @type Bitflag
             * @default none
             * @see ig.utils.getType
             */
            group: 0,

            /**
             * Whether entity should skip updating.
             * @type Boolean
             * @default
             */
            frozen: false,

            /**
             * Whether entity has control of itself.
             * <span class="alert"><strong>IMPORTANT:</strong> uncontrollable entities update but do not move or change!</span>
             * @type Boolean
             * @default
             */
            controllable: true,

            /**
             * How entity should perform during update.
             * <br>- static will only update animation
             * <br>- dynamic can move but does not collide with collision map
             * <br>- kinematic does full update, including movement and collision map checks
             * <span class="alert"><strong>IMPORTANT:</strong> this directly correlates to the complexity of entity's update and whether it collides with collision map.</span>
             * @type String
             * @default static
             */
            performance: _c.STATIC,

            /**
             * Whether is fixed in screen vs inside world space.
             * <br>- this is particularly useful for UI elements
             * <span class="alert"><strong>IMPORTANT:</strong> fixed elements cannot have kinematic performance!</span>
             * @type Boolean
             * @default
             */
            fixed: false,

            /**
             * Friction of entity
             * @type Vector2|Object
             * @see ig.CONFIG.ENTITY.FRICTION_X
             * @see ig.CONFIG.ENTITY.FRICTION_Y
             */
            friction: _utv2.vector( _c.ENTITY.FRICTION_X, _c.ENTITY.FRICTION_Y ),

            /**
             * Max velocity of entity
             * @type Vector2|Object
             * @see ig.CONFIG.ENTITY.MAX_VEL_X
             * @see ig.CONFIG.ENTITY.MAX_VEL_Y
             */
            maxVel: _utv2.vector( _c.ENTITY.MAX_VEL_X, _c.ENTITY.MAX_VEL_Y ),

            /**
             * Angle of rotation.
             * @type Number
             * @default
             */
            angle: 0,

            /**
             * How bouncy entity is in collisions, between 0 and 1.
             * @type Number
             * @see ig.CONFIG.ENTITY.BOUNCINESS
             */
            bounciness: _c.ENTITY.BOUNCINESS,

            /**
             * Minimum velocity to bounce.
             * @type Number
             * @see ig.CONFIG.ENTITY.MIN_BOUNCE_VEL
             */
            minBounceVelocity: _c.ENTITY.MIN_BOUNCE_VEL,

            /**
             * Currently displaying animation.
             * <br>- defers to {@link ig.EntityExtended#overridingAnim}
             * @type ig.AnimationExtended
             * @default
             * @readonly
             */
            currentAnim: null,

            /**
             * Currently overriding animation.
             * <br>- if present, this displays instead of {@link ig.EntityExtended#currentAnim}
             * @type ig.AnimationExtended
             * @default
             * @readonly
             */
            overridingAnim: null,

            /**
             * Path to dynamic animation sheet.
             * <br>- created on init
             * <br>- automatically prepends shared base media directory from {@link ig.CONFIG.PATH_TO_MEDIA}
             * <span class="alert"><strong>IMPORTANT:</strong> use this for dynamically / run-time created entity types, not classes.</span>
             * @type String
             * @default
             */
            animSheetPath: '',

            /**
             * Tile width of dynamic animation sheet.
             * <span class="alert"><strong>IMPORTANT:</strong> use this for dynamically / run-time created entity types, not classes.</span>
             * @type Number
             * @default
             */
            animSheetWidth: 0,

            /**
             * Tile height of dynamic animation sheet.
             * <span class="alert"><strong>IMPORTANT:</strong> use this for dynamically / run-time created entity types, not classes.</span>
             * @type Number
             * @default
             */
            animSheetHeight: 0,

            /**
             * Animation settings used to automatically create and add animations on initialization.
             * <br>- use this instead of hardcoding animations into {@link ig.EntityExtended#init} or {@link ig.EntityExtended#initVisuals} for better inheritance!
             * @type Object|Boolean
             * @default
             * @example
             * // previous method of adding animations
             * // this would likely be hardcoded into the init method
             * this.addAnim( 'idle', 0.25, [0,1] );
             * // improved (?) method of adding animations
             * // this would be defined in the class properties
             * animSettings: {
             *      idle: {
             *          sequence: [0,1],
             *          frameTime: 0.25
             *      }
             * }
             * // and then to easily change the idle sequence in a descendant class
             * // while retaining the original frame time
             * animSettings: {
             *      idle: {
             *          sequence: [3,4,5,6]
             *      }
             * }
             * // and if we just need the default idle animation
             * animSettings: true
             */
            animSettings: null,

            /**
             * Type of animation from {@link ig.EntityExtended#animationTypes}.
             * <br>- used when creating animations from {@link ig.EntityExtended#animSettings}
             * @type Number
             * @default
             */
            animationType: 0,

            /**
             * Types of animation.
             * <br>- used when creating animations from {@link ig.EntityExtended#animSettings}
             * @type Array
             * @default
             */
            animationTypes: null,

            /**
             * Default sequence frame count for animations when not defined in {@link ig.EntityExtended#animSettings}.
             * <br>- used when creating animations from {@link ig.EntityExtended#animSettings}
             * @type Number
             * @default
             */
            animSequenceCount: 1,

            /**
             * Default tile offset, within animation sheet, to start animation when not defined in {@link ig.EntityExtended#animSettings}.
             * <br>- used when creating animations from {@link ig.EntityExtended#animSettings}
             * @type Number
             * @default
             */
            animTileOffset: 0,

            /**
             * Default frame time in seconds for animations when not defined in {@link ig.EntityExtended#animSettings}.
             * <br>- used when creating animations from {@link ig.EntityExtended#animSettings}
             * @type Number
             * @default
             */
            animFrameTime: 1,

            /**
             * Name of animation to play when entity is ready and after spawned.
             * @type String
             * @default
             */
            animInit: '',

            /**
             * Whether animations should be automatically textured across entity when added to entity.
             * <br>- textures can be animated, but be careful about adding high amounts of frames
             * <span class="alert alert-info"><strong>Tip:</strong> this is best applied to resizable entities.</span>
             * @type Boolean
             * @default
             */
            textured: false,

            /**
             * Whether entity should remain across levels.
             * <span class="alert alert-info"><strong>Tip:</strong> an entity will only be moved from one level to another if an entity is found with a matching name!</span>
             * <span class="alert"><strong>IMPORTANT:</strong> the game will keep the first of each uniquely named persistent entity it encounters and merge the editor position and settings of any others with the same name as it encounters them.</span>
             * @type Boolean
             * @default
             */
            persistent: false,

            /**
             * Whether entity can be targeted by an intersection search.
             * <span class="alert alert-info"><strong>IMPORTANT:</strong> for interactive entities, set this to true and add the {@link ig.EntityExtended.TYPE.INTERACTIVE} flag to its type.</span>
             * @type Boolean
             * @default
             */
            targetable: false,

            /**
             * Whether entity is climbable.
             * @type Boolean
             * @default
             */
            climbable: false,

            /**
             * Whether entity is one way
             * @type Boolean
             * @default
             */
            oneWay: false,

            /**
             * Direction from which entity will collide with another entity.
             * @type Vector2
             * @default
             * @example
             * // direction should be a 2d vector with a length of 1
             * // i.e. this is invalid
             * entity.oneWayFacing = { x: 0, y: 0 };
             * // while either of the following is okay
             * entity.oneWayFacing = { x: 1, y: 0 };
             * entity.oneWayFacing = ig.utilsvector2.vector( 1, 0 );
             * // to block from the left
             * entity.oneWayFacing = { x: -1, y: 0 };
             * // to block from the right
             * entity.oneWayFacing = { x: 1, y: 0 };
             * // to block from the top
             * entity.oneWayFacing = { x: 0, y: -1 };
             * // to block from the bottom
             * entity.oneWayFacing = { x: 0, y: 1 };
             */
            oneWayFacing: null,

            /**
             * Whether entity casts a shadow from lights.
             * @type Boolean
             * @default
             */
            opaque: _c.ENTITY.OPAQUE,

            /**
             * How much light is blocked when {@link ig.EntityExtended#opaque}.
             * @type Number
             * @default
             */
            diffuse: _c.ENTITY.DIFFUSE,

            /**
             * Whether entity only casts shadows from edges when {@link ig.EntityExtended#opaque}.
             * @type Boolean
             * @default
             */
            hollow: true,

            /**
             * Whether to calculate vertices.
             * <br>- will be overridden if a light requests shadows from this entity.
             * @type Boolean
             * @default
             */
            verticesNeeded: false,

            /**
             * Whether entity's activate has been triggered,
             * <br>- set to true to have an entity activate on init
             * @type Boolean
             * @default
             */
            activated: false,

            /**
             * Whether entity's activate should override deactivate.
             * @type Boolean
             * @default
             */
            alwaysToggleActivate: false,

            /**
             * Function called on activate.
             * <br>- do not use this for predefined entity classes, override activate instead
             * @type Function
             */
            activateCallback: null,

            /**
             * Context to execute activate callback function in.
             * <br>- do not use this for predefined entity classes, override activate instead
             * @type Object
             */
            activateContext: null,

            /**
             * Function called on deactivate.
             * <br>- do not use this for predefined entity classes, override activate instead
             * @type Function
             */
            deactivateCallback: false,

            /**
             * Context to execute deactivate callback function in.
             * <br>- do not use this for predefined entity classes, override activate instead
             * @type Object
             */
            deactivateContext: false,

            /**
             * Entity alpha.
             * <span class="alert"><strong>IMPORTANT:</strong> applied to animations automatically on draw.</span>
             * @type Number
             * @default
             */
            alpha: 1,

            /**
             * Health statistic.
             * <br>- someone once asked me how I died, so I told them that my health reached 0
             * @type Number
             * @default
             */
            health: _c.ENTITY.HEALTH,

            /**
             * Max health statistic.
             * @type Number
             * @default
             */
            healthMax: _c.ENTITY.HEALTH,

            /**
             * Whether entity blocks all incoming damage.
             * @type Boolean
             * @default
             */
            invulnerable: false,

            /**
             * Horizontal range at which this entity can be interacted with.
             * <br>- a range of 0 is considered infinite
             * <br>- abilities compare this to their own range and use the higher of the two
             * <span class="alert"><strong>IMPORTANT:</strong> only relevant if entity type includes {@link ig.EntityExtended.TYPE.INTERACTIVE}.</span>
             * @type Number
             * @default
             */
            rangeInteractableX: 0,

            /**
             * Vertical range at which this entity can be interacted with.
             * <br>- a range of 0 is considered infinite
             * <br>- abilities compare this to their own range and use the higher of the two
             * <span class="alert"><strong>IMPORTANT:</strong> only relevant if entity type includes {@link ig.EntityExtended.TYPE.INTERACTIVE}.</span>
             * @type Number
             * @default
             */
            rangeInteractableY: 0,

            /**
             * Total horizontal size, i.e. width, of entity, including size, offsets, etc.
             * @type Number
             * @default
             * @readonly
             */
            totalSizeX: 0,

            /**
             * Total vertical size, i.e. height, of entity, including size, offsets, etc.
             * @type Number
             * @default
             * @readonly
             */
            totalSizeY: 0,

            /**
             * Whether entity is paused.
             * @type Boolean
             * @default
             * @readonly
             */
            paused: false,

            /**
             * Whether entity is visible in screen.
             * @type Boolean
             * @default
             * @readonly
             */
            visible: false,

            /**
             * Whether entity has changed since last update.
             * @type Boolean
             * @default
             * @readonly
             */
            changed: false,

            /**
             * Whether entity is checking against another entity matching {@link ig.Entity#checkAgainst} flag.
             * @type Boolean
             * @default
             * @readonly
             */
            checking: false,

            /**
             * Whether entity has been added to game world.
             * @type Boolean
             * @default
             * @readonly
             */
            added: false,

            /**
             * Whether entity is in the process of dieing.
             * @type Boolean
             * @default
             * @readonly
             */
            dieing: false,

            /**
             * Whether entity is in the process of dieing without effects or animation.
             * @type Boolean
             * @default
             * @readonly
             */
            dieingSilently: false,

            /**
             * Whether entity is flipped horizontally to face left.
             * @type Boolean
             * @default
             */
            flip: false,

            /**
             * Whether entity is grounded.
             * <br>- type of number but functions as boolean
             * @type Number
             */
            grounded: 0,

            /**
             * Whether entity is on a slope, and if so, slope properties.
             * @type Boolean|Object
             */
            slope: false,

            /**
             * Speed multiplier on slopes
             * @type Number
             * @see ig.CONFIG.ENTITY.SLOPE_SPEED_MOD
             */
            slopeSpeedMod: _c.ENTITY.SLOPE_SPEED_MOD,

            /**
             * Slope angle range that entity can stand on.
             * @type Vector2
             * @see ig.CONFIG.ENTITY.SLOPE_STANDING_MIN
             * @see ig.CONFIG.ENTITY.SLOPE_STANDING_MAX
             */
            slopeStanding: {min: (ig.CONFIG.ENTITY.SLOPE_STANDING_MIN).toRad(), max: (ig.CONFIG.ENTITY.SLOPE_STANDING_MAX).toRad() },

            /**
             * Whether entity is moving.
             * @type Boolean
             * @default
             * @readonly
             */
            moving: false,

            /**
             * Whether entity is moving horizontally.
             * @type Boolean
             * @default
             * @readonly
             */
            movingX: false,

            /**
             * Whether entity is moving vertically.
             * @type Boolean
             * @default
             * @readonly
             */
            movingY: false,

            /**
             * Whether entity is moving to another entity.
             * @type Boolean
             * @default
             * @readonly
             */
            movingTo: false,

            /**
             * Whether entity has moved to currently moving to entity.
             * @type Boolean
             * @default
             * @readonly
             */
            movedTo: true,

            /**
             * Whether entity should move to another entity and stop moving.
             * @type Boolean
             * @default
             * @readonly
             */
            movingToOnce: false,

            /**
             * Whether entity is tweening to another entity.
             * <span class="alert"><strong>IMPORTANT:</strong> this is automatically disabled with kinematic entities!</span>
             * @type Boolean
             * @default
             * @readonly
             */
            movingToTweening: false,

            /**
             * Percent progress of tweening to another entity.
             * @type Number
             * @readonly
             */
            movingToTweenPct: 0,

            /**
             * All tweens affecting this entity that were initiated by {@link ig.EntityExtended#tween}.
             * <br>- these tweens are automatically deleted when complete
             * @type Object
             * @readonly
             */
            tweens: {},

            /**
             * Last recorded state taken during {@link ig.EntityExtended#recordResetState}.
             * <br>- automatically updated first time entity added to game world
             * <br>- reset state records only a limited set of properties
             * <br>- this can be useful for checkpoints, respawning, etc
             * @type Object
             */
            resetState: {},

            /**
             * Entity bounds, not including offsets.
             * <br>- bounds effectively replaces entity.size, and allows entities to vary the way they construct their sizes
             * <br>- generally, bounds is smaller than {@link ig.EntityExtended#boundsDraw}
             * @property {Number} minX min x value.
             * @property {Number} maxX max x value.
             * @property {Number} minY min y value.
             * @property {Number} maxY max y value.
             * @property {Number} width width.
             * @property {Number} height height.
             * @type Object
             * @see ig.utilsintersection.bounds
             */
            bounds: null,

            /**
             * Entity bounds, including offsets.
             * <br>- boundsDraw is used for animation
             * <br>- generally, boundsDraw is larger than {@link ig.EntityExtended#bounds}
             * @property {Number} minX min x value.
             * @property {Number} maxX max x value.
             * @property {Number} minY min y value.
             * @property {Number} maxY max y value.
             * @property {Number} width width.
             * @property {Number} height height.
             * @type Object
             * @see ig.utilsintersection.bounds
             */
            boundsDraw: null,

            /**
             * List of vertices based on bounds, relative to entity.
             * <br>- not calculated by default for performance reasons
             * <br>- will be calculated if entity casts shadows and entity is within a light
             * <br>- to manually enable, use {@link ig.EntityExtended#verticesNeeded}
             * @type Object
             */
            vertices: null,

            /**
             * List of vertices based on bounds, relative to world space.
             * <br>- not calculated by default for performance reasons
             * <br>- will be calculated if entity casts shadows and entity is within a light
             * <br>- to manually enable, use {@link ig.EntityExtended#verticesNeeded}
             * @type Object
             */
            verticesWorld: null,

            /**
             * Signal dispatched when entity added to game.
             * <br>- created on init.
             * @type ig.Signal
             */
            onAdded: null,

            /**
             * Signal dispatched when entity removed from game.
             * <br>- created on init.
             * @type ig.Signal
             */
            onRemoved: null,

            /**
             * Signal dispatched when entity paused.
             * <br>- created on init.
             * @type ig.Signal
             */
            onPaused: null,

            /**
             * Signal dispatched when entity unpaused.
             * <br>- created on init.
             * @type ig.Signal
             */
            onUnpaused: null,

            /**
             * Signal dispatched when entity completes moving to another entity.
             * <br>- created on init.
             * @type ig.Signal
             */
            onMovedTo: null,

            // internal properties, do not modify

            _angleLast: 0,

            _stopChecking: false,

            _changedAdd: false,

            _verticesFound: false,

            /**
             * Replaces new entity with current persistent entity of same name, if exists.
             * @param {Number} x x position.
             * @param {Number} y y position.
             * @param {Object} [settings] settings object.
             * @override
             **/
            staticInstantiate: function( x, y, settings ) {

                var entity;
                var name = this.name || (settings || {}).name;

                if ( name ) {

                    entity = ig.game.persistentEntities[ name ];

                    if ( entity ) {

                        entity.reset(x, y, settings);

                    }

                }

                return entity;

            },

            /**
             * Initializes entity.
             * <br>- resets entity and merges in new settings, via {@link ig.EntityExtended#reset}
             * <br>- initializes types for checks, via {@link ig.EntityExtended#initTypes}
             * <br>- initializes properties that are created at run-time, such as signals and timers, via {@link ig.EntityExtended#initProperties}
             * <br>- initializes animations and other visual properties, via {@link ig.EntityExtended#initVisuals}
             * @param {Number} x x position.
             * @param {Number} y y position.
             * @param {Object} [settings] settings object.
             * @override
             **/
            init: function (x, y, settings) {

                this.id = ++ig.Entity._lastId;

                // init reset

                this.reset(x, y, settings);

                // types and checks

                this.initTypes();

                // properties that should only be initialized once

                this.initProperties();

                // visual

                this.initVisuals();

            },

            /**
             * Adds this entity's types and checks.
             */
            initTypes: function () {
            },

            /**
             * Adds properties that should only be initialized once.
             */
            initProperties: function () {

                // signals

                this.onAdded = new ig.Signal();
                this.onRemoved = new ig.Signal();
                this.onPaused = new ig.Signal();
                this.onUnpaused = new ig.Signal();
                this.onMovedTo = new ig.Signal();

                // stats

                this.healthMax = this.health;

            },

            /**
             * Adds animation and sprites.
             */
            initVisuals: function () {

                // create anim sheet

                if (this.animSheetPath) {

                    this.animSheet = new ig.AnimationSheet(_c.PATH_TO_MEDIA + this.animSheetPath, this.animSheetWidth, this.animSheetHeight);

                }

                // automatically create animations

                if (this.animSettings) {

                    // create default

                    if (this.animSettings === true) {

                        this.createAnim();

                    }
                    // from property value pairs
                    else {

                        for (var animName in this.animSettings) {

                            this.createAnim(animName, this.animSettings[ animName ]);

                        }

                    }

                    // animations created, no need for settings or types

                    delete this.animationTypes;
                    delete this.animSettings;

                }

            },

            /**
             * Generates and adds an animation from {@link ig.EntityExtended#animSettings}. If no settings passed, creates default idle animation.
             * @param {Object} [name] name of animation.
             * @param {Object} [settings] settings for animation.
             **/
            createAnim: function (name, settings) {

                settings = settings || {};

                var sequence = settings.sequence;

                if (!sequence || !sequence.length) {

                    sequence = [];

                    var frameCount = settings.sequenceCount || this.animSequenceCount;
                    var startFrame = settings.tileOffset || this.animTileOffset;

                    // animation types are when a sprite sheet has a series of animations that are all the same length

                    var animationType = settings.type || this.animationType;

                    if (animationType && this.animationTypes) {

                        var orderIndex = _ut.indexOfValue(this.animationTypes, animationType);

                        if (orderIndex !== -1) {

                            startFrame += frameCount * orderIndex;

                        }

                    }

                    for (var j = 0; j < frameCount; j++) {

                        sequence[ j ] = startFrame + j;

                    }

                }

                this.addAnim(name || ( typeof this.animInit === 'string' ? this.animInit : 'idle' ), settings.frameTime || this.animFrameTime, sequence);

            },

            /**
             * Adds an animation to an entity.
             * <br>- uses {@link ig.AnimationExtended} instead of the original {@link ig.Animation}
             * @param {String} name name of animation
             * @param {Number} frameTime duration per frame
             * @param {Array} sequence indices of animation sheet tiles
             * @param {Boolean} [stop] don't play
             * @see ig.Entity.
             */
            addAnim: function (name, frameTime, sequence, stop) {

                if (!this.animSheet) {

                    throw( 'No animSheet to add the animation ' + name + ' to.' );

                }

                var animation = new ig.AnimationExtended(this.animSheet, frameTime, sequence, stop);

                this.anims[name] = animation;

                if (this.textured) {

                    animation.texturize(this);

                }

                if (!this.currentAnim) {

                    this.currentAnim = animation;

                }

                return animation;

            },

            /**
             * Resets an entity to last state.
             * @param {Number} x x position.
             * @param {Number} y y position.
             * @param {Object} [settings] settings object.
             **/
            reset: function (x, y, settings) {

                this.resetCore(x, y, settings);

                this.resetExtras();

            },

            /**
             * Resets settings and position of entity.
             * @param {Number} x x position.
             * @param {Number} y y position.
             * @param {Object} [settings] settings object.
             **/
            resetCore: function (x, y, settings) {

                // reset

                ig.merge(this, this.resetState);

                // position

                if (_ut.isNumber(x)) {

                    this.pos.x = x;

                }

                if (_ut.isNumber(y)) {

                    this.pos.y = y;

                }

                // settings

                if (settings) {

                    if (settings.type) {

                        _ut.addType(ig.EntityExtended, this, 'type', settings.type);
                        delete settings.type;

                    }

                    if (settings.checkAgainst) {

                        _ut.addType(ig.EntityExtended, this, 'checkAgainst', settings.checkAgainst);
                        delete settings.checkAgainst;

                    }

                    ig.merge(this, settings);

                }

                // misc core properties

                this._killed = this.dieing = this.dieingSilently = false;

            },

            /**
             * Resets extra properties after core.
             **/
            resetExtras: function () {

                // calculate final size

                this.totalSizeX = this.getTotalSizeX();
                this.totalSizeY = this.getTotalSizeY();

                // kinematic (i.e. uses physics) cannot be fixed

                if (this.performance === _c.KINEMATIC) {

                    this.fixed = false;

                }

                // fixed elements cannot collide

                if (this.fixed) {

                    this.collides = ig.Entity.COLLIDES.NEVER;

                }

                // do one update to ensure static elements have all required properties

                if (!this.frozen) {

                    this.changed = this._changedAdd = true;

                }

                this.recordLast();
                this.updateBounds();

            },

            /**
             * Records the state of an entity for later reset.
             * <br>- does not record all properties for performance reasons
             **/
            recordResetState: function () {

                this.resetState.pos = _utv2.vector();
                _utv2.copy(this.resetState.pos, this.pos);

                this.resetState.layerName = this.layerName;
                this.resetState.frozen = this.frozen;
                this.resetState.activated = this.activated;
                this.resetState.alpha = this.alpha;

                this.resetState.type = this.type;
                this.resetState.checkAgainst = this.checkAgainst;
                this.resetState.collides = this.collides;

                this.resetState.health = this.health;

            },

            /**
             * Called by game when entity added to game world.
             * <br>- records reset state, via {@link ig.EntityExtended#recordResetState}
             * <br>- plays spawn animation if present, via {@link ig.EntityExtended#animOverride}
             * @see ig.Entity.
             **/
            ready: function () {

                // initialize performance

                this.changePerformance();

                // update reset state

                this.recordResetState();

                // set added

                this.onAdded.dispatch(this);

                // play spawn animation

                if (this.anims.spawn) {

                    this.animOverride("spawn", {
                        callback: this.spawn
                    });

                }
                else {

                    this.spawn();

                }

            },

            /**
             * Called after {@link ig.EntityExtended#ready} when spawn animation is complete.
             * <br>- sets {@link ig.EntityExtended#currentAnim} to {@link ig.EntityExtended#animInit} if present
             * <br>- activates entity if {@link ig.EntityExtended#activated} is true
             **/
            spawn: function () {

                // set initial animation

                if (this.animInit instanceof ig.Animation) {

                    this.currentAnim = this.animInit;
                    this.currentAnim.playFromStart();

                }
                else if (this.animInit) {

                    if (this.anims[ this.animInit ]) {

                        this.currentAnim = this.anims[ this.animInit ];
                        this.currentAnim.playFromStart();

                    }
                    else {

                        this.currentAnim = undefined;

                    }

                }
                else {

                    this.currentAnim = this.anims[ 'idle' ] || this.currentAnim;

                    if ( this.currentAnim ) {

                        this.currentAnim.playFromStart();

                    }

                }

                // start activated when activated upon init

                if (this.activated) {

                    this.activate();

                }

            },

            /**
             * Sets this entity's performance level.
             **/
            setPerformance: function (level) {

                this.performance = level;

                if (this.performance !== this.performanceLast) {

                    this.changePerformance();

                }

            },

            /**
             * Makes changes based on this entity's performance level.
             * @returns {Boolean} whether changed or not.
             **/
            changePerformance: function () {

                this.performanceLast = this.performance;

                // dynamic
                if (this.performance === _c.DYNAMIC) {

                    this.changePerformanceDynamic();

                }
                // kinematic
                else if (this.performance === _c.KINEMATIC) {

                    this.changePerformanceKinematic();

                }
                // default to static
                else {

                    this.changePerformanceStatic();

                }

            },

            /**
             * Called when performance changed to static.
             **/
            changePerformanceStatic: function () {
            },

            /**
             * Called when performance changed to dynamic.
             **/
            changePerformanceDynamic: function () {
            },

            /**
             * Called when performance changed to kinematic.
             **/
            changePerformanceKinematic: function () {
            },

            /**
             * Sets whether entity can control self.
             * @param {Boolean} [controllable=true]
             **/
            setControllable: function ( controllable ) {

                if ( typeof controllable === 'undefined' ) {

                    controllable = true;

                }

                if ( !controllable ) {

                    this.removeControl();

                }
                else {

                    this.addControl();

                }

            },

            /**
             * Adds control to entity.
             * <span class="alert alert-info"><strong>Tip:</strong> this allows entity to call {@link ig.GameExtended#updateChanges} during update cycle.</span>
             **/
            addControl: function () {

                this.controllable = true;

            },

            /**
             * Removes control from entity.
             * <span class="alert alert-info"><strong>Tip:</strong> this blocks entity from calling {@link ig.GameExtended#updateChanges} during update cycle.</span>
             **/
            removeControl: function () {

                this.controllable = false;

                this.applyAntiVelocity();

            },

            /**
             * Gets entity layer based on {@link ig.EntityExtended#layerName}.
             * @returns {ig.Layer} layer this entity is on.
             **/
            getLayer: function () {

                return ig.game.layersMap[ this.layerName ];

            },

            /**
             * Calculates entity's bounds.
             * <br>- bounds are in world space and are not scaled to window
             * <br>- instead of calling this, use {@link ig.EntityExtended#bounds}
             * @returns {Object} entity's bounds.
             * @example
             * // this is a bad idea
             * var bounds = entity.getBounds();
             * // this is a good idea
             * var bounds = entity.bounds;
             **/
            getBounds: function () {

                if (this.angle !== 0) {

                    return _uti.boundsOfPoints(
                        _utv2.projectPoints(
                            this._verticesFound ? this.vertices : this.getVertices(),
                            this.getCenterX(), this.getCenterY(),
                            1, 1,
                            this.angle
                        )
                    );

                }
                else {

                    var sizeX = this.size.x;
                    var sizeY = this.size.y;

                    return {
                        minX: this.pos.x,
                        minY: this.pos.y,
                        maxX: this.pos.x + sizeX,
                        maxY: this.pos.y + sizeY,
                        width: sizeX,
                        height: sizeY
                    };

                }

            },

            /**
             * Calculates entity's bounds for drawing.
             * <br>- bounds are in world space and are not scaled to window
             * <br>- instead of calling this, use {@link ig.EntityExtended#boundsDraw}
             * @returns {Object} entity's drawing bounds.
             * @example
             * // this is a bad idea
             * var boundsDraw = entity.getBoundsDraw();
             * // this is a good idea
             * var boundsDraw = entity.boundsDraw;
             **/
            getBoundsDraw: function () {

                if (this.angle !== 0) {

                    return _uti.boundsOfPoints(this._verticesFound ? this.verticesWorld : this.getVerticesWorld());

                }
                else {

                    var minX = this.getTotalPosX();
                    var minY = this.getTotalPosY();

                    return {
                        minX: minX,
                        minY: minY,
                        maxX: minX + this.totalSizeX,
                        maxY: minY + this.totalSizeY,
                        width: this.totalSizeX,
                        height: this.totalSizeY
                    };

                }

            },

            /**
             * Calculates vertices based on entity's size.
             * <br>- vertices are relative to entity, not world space, and are not scaled to window
             * <br>- instead of calling this, use {@link ig.EntityExtended#vertices}
             * @returns {Array} vertices.
             * @example
             * // this is a bad idea
             * var vertices = entity.getVertices();
             * // this is a good idea
             * var vertices = entity.vertices;
             **/
            getVertices: function () {

                var sizeX = this.size.x * 0.5;
                var sizeY = this.size.y * 0.5;

                return [
                    _utv2.vector(-sizeX, -sizeY),
                    _utv2.vector(sizeX, -sizeY),
                    _utv2.vector(sizeX, sizeY),
                    _utv2.vector(-sizeX, sizeY)
                ];

            },

            /**
             * Calculates vertices in world space.
             * <br>- verticesWorld are in world space and are not scaled to window
             * <br>- instead of calling this, use {@link ig.EntityExtended#verticesWorld}
             * @returns {Array} vertices.
             * @example
             * // this is a bad idea
             * var verticesWorld = entity.getVerticesWorld();
             * // this is a good idea
             * var verticesWorld = entity.verticesWorld;
             **/
            getVerticesWorld: function () {

                // ensure vertices exist

                if (!this.vertices) {

                    this.vertices = this.getVertices();

                }

                return _utv2.projectPoints(
                    this.vertices,
                    this.getCenterX(), this.getCenterY(),
                    this.totalSizeX / this.size.x, this.totalSizeY / this.size.y,
                    this.angle
                );

            },

            /**
             * Calculates horizontal size, offset included.
             * <br>- instead of calling this, use (@link ig.EntityExtended#totalSizeX}
             * @returns {Number} total horizontal size.
             * @example
             * // this is a bad idea
             * var totalSizeX = entity.getTotalSizeX();
             * // this is a good idea
             * var totalSizeX = entity.totalSizeX;
             * // unless entity size has changed
             * // then this is the best idea
             * entity.totalSizeX = entity.getTotalSizeX();
             * var totalSizeX = entity.totalSizeX;
             **/
            getTotalSizeX: function () {

                return this.size.x + this.offset.x * 2;

            },

            /**
             * Calculates horizontal size, offset included.
             * <br>- instead of calling this, use (@link ig.EntityExtended#totalSizeY}
             * @returns {Number} total vertical size.
             * @example
             * // this is a bad idea
             * var totalSizeY = entity.getTotalSizeY();
             * // this is a good idea
             * var totalSizeY = entity.totalSizeY;
             * // unless entity size has changed
             * // then this is the best idea
             * entity.totalSizeY = entity.getTotalSizeY();
             * var totalSizeY = entity.totalSizeY;
             **/
            getTotalSizeY: function () {

                return this.size.y + this.offset.y * 2;

            },

            /**
             * Calculates entity's origin x position, offset included.
             * @returns {Number} position left.
             **/
            getTotalPosX: function () {

                return this.pos.x - this.offset.x;

            },

            /**
             * Calculates entity's origin y position, offset included.
             * @returns {Number} position top.
             **/
            getTotalPosY: function () {

                return this.pos.y - this.offset.y;

            },

            /**
             * Calculates entity's center x position.
             * <br>- instead of calling this, use (@link ig.EntityExtended#bounds}
             * @returns {Number} horizontal center.
             * @example
             * // this is a bad idea
             * var centerX = entity.getCenterX();
             * // this is a good idea
             * var centerX = entity.bounds.minX + entity.bounds.width * 0.5;
             **/
            getCenterX: function () {

                return this.getTotalPosX() + this.totalSizeX * 0.5;

            },

            /**
             * Calculates entity's center x position.
             * <br>- instead of calling this, use (@link ig.EntityExtended#bounds}
             * @returns {Number} vertical center.
             * @example
             * // this is a bad idea
             * var centerY = entity.getCenterY();
             * // this is a good idea
             * var centerY = entity.bounds.minY + entity.bounds.height * 0.5;
             **/
            getCenterY: function () {

                return this.getTotalPosY() + this.totalSizeY * 0.5;

            },

            /**
             * Calculates if entity bounds are within screen bounds.
             * <br>- instead of calling this, use (@link ig.EntityExtended#visible}
             * @returns {Boolean} if is in screen.
             * @example
             * // this is a bad idea
             * var visible = entity.getIsVisible();
             * // this is a good idea
             * var visible = entity.visible;
             **/
            getIsVisible: function () {

                if (this.alpha <= 0) return false;
                else {

                    if (this.fixed) {

                        return _uti.AABBIntersect(this.boundsDraw.minX, this.boundsDraw.minY, this.boundsDraw.maxX, this.boundsDraw.maxY, 0, 0, ig.system.width, ig.system.height);

                    }
                    else {

                        var minX = this.boundsDraw.minX - ig.game.screen.x;
                        var minY = this.boundsDraw.minY - ig.game.screen.y;

                        return _uti.AABBIntersect(minX, minY, minX + this.boundsDraw.width, minY + this.boundsDraw.height, 0, 0, ig.system.width, ig.system.height);

                    }

                }

            },

            /**
             * Calculates if entity is handling its own movement, i.e. kinematic, moving to, etc.
             * @returns {Boolean} if is handling own movement.
             **/
            getIsMovingSelf: function () {

                return this.performance === _c.KINEMATIC || this.movingTo;

            },

            /**
             * Approximate check of whether this entity is colliding with the one way blocking direction of another other entity.
             * <br>- checks for whether the touching edges are within a certain range based on {@link ig.CONFIG#PRECISION_PCT_ONE_SIDED}
             * <span class="alert"><strong>IMPORTANT:</strong> the non one way entity does this check to allow it to choose whether to ignore one way block.</span>
             * @param {ig.EntityExtended} entityOneWay one way entity to check against.
             * @returns {Boolean} true if this entity is coming from other entity's one way blocking direction.
             */
            getIsCollidingWithOneWay: function (entityOneWay) {

                // check x

                if (entityOneWay.oneWayFacing.x !== 0) {

                    if (entityOneWay.oneWayFacing.x < 0) {

                        if (this.bounds.maxX - entityOneWay.bounds.minX <= Math.max(entityOneWay.bounds.width, this.bounds.width) * _c.PRECISION_PCT_ONE_SIDED + ( this.vel.x > 0 ? this.vel.x * ig.system.tick : 0 )) {

                            return true;

                        }

                    }
                    else {

                        if (entityOneWay.bounds.maxX - this.bounds.minX <= Math.max(entityOneWay.bounds.width, this.bounds.width) * _c.PRECISION_PCT_ONE_SIDED + ( this.vel.x < 0 ? -this.vel.x * ig.system.tick : 0 )) {

                            return true;

                        }

                    }

                }

                // check y

                if (entityOneWay.oneWayFacing.y !== 0) {

                    if (entityOneWay.oneWayFacing.y < 0) {

                        if (this.bounds.maxY - entityOneWay.bounds.minY <= Math.max(entityOneWay.bounds.height, this.bounds.height) * _c.PRECISION_PCT_ONE_SIDED + ( this.vel.y > 0 ? this.vel.y * ig.system.tick : 0 )) {

                            return true;

                        }

                    }
                    else {

                        if (entityOneWay.bounds.maxY - this.bounds.minY <= Math.max(entityOneWay.bounds.height, this.bounds.height) * _c.PRECISION_PCT_ONE_SIDED + ( this.vel.y < 0 ? -this.vel.y * ig.system.tick : 0 )) {

                            return true;

                        }

                    }

                }

            },

            /**
             * Whether this entity touches another.
             * @param {ig.EntityExtended} entity entity to check against.
             * @returns {Boolean} if touches other.
             **/
            touches: function (entity) {

                return _uti.boundsIntersect(this.bounds, entity.bounds);

            },

            /**
             * Calculates distance from this entity to another.
             * @param {ig.EntityExtended} entity entity to find distance to.
             * @returns {Number} distance
             */
            distanceTo: function( entity ) {

                var distanceX = (this.bounds.minX + this.bounds.width * 0.5) - (entity.bounds.minX + entity.bounds.width * 0.5);
                var distanceY = (this.bounds.minY + this.bounds.height * 0.5) - (entity.bounds.minY + entity.bounds.height * 0.5);

                return Math.sqrt( distanceX * distanceX + distanceY * distanceY );

            },

            /**
             * Calculates angle from this entity to another.
             * @param {ig.EntityExtended} entity entity to find angle to.
             * @returns {Number} angle
             */
            angleTo: function( entity ) {
                return Math.atan2(
                    (this.bounds.minX + this.bounds.width * 0.5) - (entity.bounds.minX + entity.bounds.width * 0.5),
                    (this.bounds.minY + this.bounds.height * 0.5) - (entity.bounds.minY + entity.bounds.height * 0.5)
                );
            },

            /**
             * Determine if a point is inside this.
             * @param {Object} point point with x and y properties.
             * @returns {Boolean} true if this contains the given point.
             **/
            pointInside: function (point) {

                return _uti.pointInPolygon(point.x, point.y, this.verticesWorld);

            },

            /**
             * Zeroes out velocity.
             **/
            applyAntiVelocity: function () {

                _utv2.zero(this.vel);

            },

            /**
             * Zeroes out horizontal velocity.
             **/
            applyAntiVelocityX: function () {

                this.vel.x = 0;

            },

            /**
             * Zeroes out vertical velocity.
             **/
            applyAntiVelocityY: function () {

                this.vel.y = 0;

            },

            /**
             * Applies velocity to counteract gravity.
             **/
            applyAntiGravity: function () {

                if (this.gravityFactor !== 0) {

                    this.vel.y -= ig.game.gravity * ig.system.tick * this.gravityFactor;

                }

            },

            /**
             * Plays an animation and sets animation as override until complete to ensure that no other animations play.
             * @param {String} animName name of animation to play.
             * @param {Object} [settings] settings object.
             * @example
             * // settings is a plain object
             * settings = {};
             * // use an animation from another entity
             * settings.entity = otherEntity;
             * // loop overriding animation and don't auto release override
             * settings.loop = true;
             * // call a function when override completes
             * settings.callback = function () {...};
             * // call the callback in a context
             * settings.context = callbackContext;
             **/
            animOverride: function (animName, settings) {

                settings = settings || {};
                var entity = settings.entity || this;
                var loop = settings.loop;

                // entity has animation

                if (entity.anims[ animName ]) {

                    // start override

                    if (this.overridingAnimName !== animName) {

                        this.animRelease();

                        this.overridingAnimName = animName;
                        this.overridingAnimCallback = settings.callback;
                        this.overridingAnimContext = settings.context;
                        this.overridingAnimFrozen = this.frozen;

                        this.overridingAnim = entity.anims[ animName ];

                        // listen for complete of animation if not looping to automatically release override
                        // looping an override can be dangerous as it requires a manual release of override

                        if (!loop) {

                            this.overridingAnim.onCompleted.addOnce(this.animRelease, this);

                        }

                    }

                    // reset override

                    if (this.frozen) {

                        this.frozen = false;

                    }

                    // play from start and only play once

                    this.overridingAnim.playFromStart(!loop);

                }
                // release override
                else if (typeof settings.callback === 'function') {

                    this.animRelease(true);

                    settings.callback.call(settings.context || this);

                }

            },

            /**
             * Removes animation override, see ig.EntityExtended.animOverride.
             * @param {Boolean} [silent] whether to suppress callback.
             **/
            animRelease: function (silent) {

                // store callback/context and clear override

                var callback = this.overridingAnimCallback;
                var context = this.overridingAnimContext;

                if (this.overridingAnimFrozen) {

                    this.frozen = this.overridingAnimFrozen;

                }

                if (this.overridingAnim) {

                    this.overridingAnim.onCompleted.remove(this.animRelease, this);
                    this.overridingAnim.stop = true;

                    this.overridingAnimName = this.overridingAnim = this.overridingAnimCallback = this.overridingAnimContext = undefined;

                }

                // do callback

                if (!silent && callback) {

                    callback.call(context || this);

                }

            },

            /**
             * Initializes shadow casting properties when first needed, to save memory on entities that never castShadows.
             * @private
             **/
            _initShadowCasting: function () {

                if (!this.utilVec2Cast1) {

                    this.utilVec2Cast1 = _utv2.vector();
                    this.utilVec2Cast2 = _utv2.vector();
                    this.utilVec2Cast3 = _utv2.vector();
                    this.utilVec2Cast4 = _utv2.vector();

                    this.utilVec2Project1 = _utv2.vector();
                    this.utilVec2Project2 = _utv2.vector();
                    this.utilVec2Project3 = _utv2.vector();
                    this.utilVec2Project4 = _utv2.vector();

                }

            },

            /**
             * Fill context with the shadows projected by this polygon object from the origin point, constrained by the given bounds.
             * @param {ig.EntityLight} light to cast shadows from
             * @param {CanvasRenderingContext2D} context The canvas context onto which the shadows will be cast.
             * @param {Object} origin vector that represents the origin for the casted shadows.
             * @param {Object} contextBounds bounds of the casting area.
             **/
            castShadows: function (light, context, origin, contextBounds) {

                if (!this._verticesFound) {

                    this._verticesFound = true;
                    this.verticesWorld = this.getVerticesWorld();

                }

                // cast no shadows if light is within these bounds and this is not hollow

                if (!this.hollow && this.pointInside(origin)) {

                    return;

                }

                // ensure casting properties are ready

                this._initShadowCasting();

                var alpha = this.diffuse >= 1 || light.diffuse >= 1 ? 1 : this.diffuse * light.diffuse;
                var radius = ( contextBounds.width + contextBounds.height ) * 0.5;
                var verticesWorld = this.verticesWorld;
                var withinLight = false;
                var contourPool = [], contours = []
                var contour, contourVertices;
                var contourOther, contourOtherVertices;
                var oa, ob, oc, od, combined;
                var a = verticesWorld[ verticesWorld.length - 1 ], b, c, d;
                var i, il, j, jl, k, kl;

                // check each segment;

                for (i = 0, il = verticesWorld.length; i < il; i++) {

                    b = verticesWorld[ i ];

                    // check if line is within contextBounds

                    if (_uti.AABBIntersect(
                        Math.min(a.x, b.x), Math.min(a.y, b.y), Math.max(a.x, b.x), Math.max(a.y, b.y),
                        contextBounds.minX, contextBounds.minY, contextBounds.maxX, contextBounds.maxY
                    )) {

                        withinLight = true;

                        // check if line is facing away from origin
                        // dot gives us angle domain between normal of A to B and vector pointing from origin to A
                        // dot > 0 = angle < 90, so line would be facing away

                        var aToB = _utv2.copy(this.utilVec2Cast1, b);
                        _utv2.subtract(aToB, a);
                        var normal = _utv2.set(this.utilVec2Cast2, aToB.y, -aToB.x);
                        var originToA = _utv2.copy(this.utilVec2Cast3, a);
                        _utv2.subtract(originToA, origin);

                        if (_utv2.dot(normal, originToA) > 0) {

                            var originToB = _utv2.copy(this.utilVec2Cast4, b);
                            _utv2.subtract(originToB, origin);

                            // project a and b to edge of light and get shape

                            contourPool.push({
                                vertices: this.project( origin, radius, a, b, originToA, originToB, aToB),
                                verticesActual: [ a, b ],
                                verticesHollow: []
                            });

                        }

                    }

                    a = b;

                }

                // process contours and combine any touching

                for (i = 0, il = contourPool.length; i < il; i++) {

                    contour = contourPool[ i ];
                    contourVertices = contour.vertices;
                    combined = false;

                    a = contourVertices[ 0 ];
                    b = contourVertices[ 1 ];
                    c = contourVertices[ contourVertices.length - 2 ];
                    d = contourVertices[ contourVertices.length - 1 ];

                    // check every following contour for duplicate start or end

                    for (j = i + 1; j < il; j++) {

                        contourOther = contourPool[ j ];
                        contourOtherVertices = contourOther.vertices;
                        oa = contourOtherVertices[ 0 ];
                        ob = contourOtherVertices[ 1 ];
                        oc = contourOtherVertices[ contourOtherVertices.length - 2 ];
                        od = contourOtherVertices[ contourOtherVertices.length - 1 ];

                        // discard b, and od, and join contours [ contourOther, contour ] with a at end
                        if (_utv2.equal(a, od) && _utv2.equal(b, oc)) {

                            combined = true;

                            contourPool[ j ] = {
                                vertices: contourOtherVertices.slice(0, -1).concat(contourVertices.slice(2)),
                                verticesActual: contourOther.verticesActual.slice(0, -1).concat(contour.verticesActual),
                                verticesHollow: contour.verticesHollow.concat(a, contourOther.verticesHollow)
                            };

                            break;

                        }
                        // discard d, oa, and ob and join contours [ contour, contourOther ]
                        else if (_utv2.equal(c, ob) && _utv2.equal(d, oa)) {

                            combined = true;

                            contourPool[ j ] = {
                                vertices: contourVertices.slice(0, -1).concat(contourOtherVertices.slice(2)),
                                verticesActual: contour.verticesActual.slice(0, -1).concat(contourOther.verticesActual),
                                verticesHollow: contourOther.verticesHollow.concat(d, contour.verticesHollow)
                            };

                            break;

                        }

                    }

                    if (combined !== true) {

                        // compute contour bounds

                        contour.bounds = _uti.boundsOfPoints(contour.vertices);

                        contours.push(contour);

                    }

                }

                // fill in this shape
                // check all contours and for any with a matching vertex, combine into one contour

                if (this.hollow !== true && withinLight === true) {

                    var vertices = verticesWorld.slice(0);
                    var bounds = this.bounds;

                    var connections = {};
                    var connection = [];
                    var connected = false;

                    // walk self vertices
                    // check for any vertices in self that match contour's actual vertices
                    // create connections between contours from vertices that do not match

                    for (i = 0, il = vertices.length; i < il; i++) {

                        var vertex = vertices[ i ];
                        var matched = false;

                        for (j = 0, jl = contours.length; j < jl; j++) {

                            contour = contours[ j ];
                            var contourVerticesActual = contour.verticesActual;

                            for (k = 0, kl = contourVerticesActual.length; k < kl; k++) {

                                var vertexActual = contourVerticesActual[ k ];

                                if (vertex.x === vertexActual.x && vertex.y === vertexActual.y) {

                                    matched = true;

                                    if (connection) {

                                        connections[ j === 0 ? jl - 1 : j - 1 ] = connection;
                                        connection = undefined;
                                        connected = true;

                                    }

                                    break;

                                }

                            }

                            if (matched === true) {

                                break;

                            }

                        }

                        // not matched, put into last connection

                        if (matched === false) {

                            if (!connection) {

                                connection = [];

                            }

                            connection.push(vertex);

                        }


                    }

                    // handle last connection

                    if (connection) {

                        connections[ jl - 1 ] = connection !== connections[ jl - 1 ] ? connection.concat(connections[ jl - 1 ] || []) : connection;

                    }

                    // if at least one connection
                    // combine all contours and connections

                    if (connected) {

                        var contourConnected = {
                            vertices: []
                        };

                        for (i = 0, il = contours.length; i < il; i++) {

                            contour = contours[ i ];

                            // add contour and connection

                            contourConnected.vertices = contourConnected.vertices.concat(contour.vertices, connections[ i ] || []);

                        }

                        contourConnected.bounds = _uti.boundsOfPoints(contourConnected.vertices);

                        contours = [ contourConnected ];

                    }
                    // no connections so just add self
                    else {

                        contours.push({
                            vertices: vertices,
                            bounds: bounds
                        });

                    }

                }
                // add all hollow vertices to end of contours
                else {

                    for (i = 0, il = contours.length; i < il; i++) {

                        contour = contours[ i ];

                        contour.vertices = contour.vertices.concat(contour.verticesHollow);

                    }

                }

                // draw each contour

                for (i = 0, il = contours.length; i < il; i++) {

                    contour = contours[ i ];

                    if (light.pixelPerfect) {

                        _utd.pixelFillPolygon(context, contextBounds, contour.vertices, 1, 1, 1, alpha, true, contour.bounds);

                    }
                    else {

                        _utd.fillPolygon(context, contour.vertices, -contextBounds.minX, -contextBounds.minY, 1, 1, 1, alpha, ig.system.scale);

                    }

                }

            },

            /**
             * Projects an edge based on an origin point.
             * @param {Object} origin 2d origin point.
             * @param {Number} radius radius of origin.
             * @param {Object} a edge vertex a.
             * @param {Object} b edge vertex b.
             * @param {Object} originToA 2d vector from origin to vertex a.
             * @param {Object} originToB 2d vector from origin to vertex b.
             * @param {Object} aToB 2d vector from vertex a to vertex b.
             * @returns {Array} vertices of the shape cast by light from edge.
             **/
            project: function (origin, radius, a, b, originToA, originToB, aToB) {

                var originToAB = this.utilVec2Project1; // projected point of origin to [a, b]
                var invOriginToA = _utv2.copy(this.utilVec2Project2, originToA);
                _utv2.inverse(invOriginToA);

                var t = _utv2.dot(aToB, invOriginToA) / _utv2.lengthSquared(aToB);

                if (t < 0) {

                    _utv2.copy(originToAB, a);

                }
                else if (t > 1) {

                    _utv2.copy(originToAB, b);

                }
                else {

                    _utv2.copy(originToAB, a);

                    var n = _utv2.copy(this.utilVec2Project3, aToB);
                    _utv2.multiplyScalar(n, t)
                    _utv2.add(originToAB, n);

                }

                var originToM = _utv2.copy(this.utilVec2Project4, originToAB);
                _utv2.subtract(originToM, origin);

                // normalize to radius

                _utv2.normalize(originToM);
                _utv2.multiplyScalar(originToM, radius);

                _utv2.normalize(originToA);
                _utv2.multiplyScalar(originToA, radius);

                _utv2.normalize(originToB);
                _utv2.multiplyScalar(originToB, radius);

                // project points

                var ap = _utv2.clone(a);
                _utv2.add(ap, originToA);

                var bp = _utv2.clone(b);
                _utv2.add(bp, originToB);

                // return in clockwise order, with intermediary points to ensure full cover
                // if t < 0, ap === oam, so ignore intermediary oam
                // if t > 1, bp === obm, so ignore intermediary obm

                var oam, obm;

                if (t < 0) {

                    obm = _utv2.clone(b);
                    _utv2.add(obm, originToM);

                    return [ a, ap, obm, bp, b ];

                }
                else if (t > 1) {

                    oam = _utv2.clone(a);
                    _utv2.add(oam, originToM);

                    return [ a, ap, oam, bp, b ];

                }
                else {

                    oam = _utv2.clone(a);
                    _utv2.add(oam, originToM);

                    obm = _utv2.clone(b);
                    _utv2.add(obm, originToM);

                    return [ a, ap, oam, obm, bp, b ];

                }

            },

            /**
             * Do some activated behavior.
             * @param {Entity} [entity] causing activation.
             **/
            activate: function (entity) {

                this.activated = true;

                // do activate callback
                // useful for entities that are built dynamically
                // instead of predefined entity classes

                if (this.activateCallback) {

                    this.activateCallback.call(this.activateContext || this, entity);

                }

            },

            /**
             * Do some deactivated behavior.
             * @param {Entity} [entity] causing deactivation.
             **/
            deactivate: function (entity) {

                this.activated = false;

                // do deactivate callback
                // useful for entities that are built dynamically
                // instead of predefined entity classes

                if (this.deactivateCallback) {

                    this.deactivateCallback.call(this.deactivateContext || this, entity);

                }

            },

            /**
             * Toggles between activate and deactivate.
             * @param {Entity} [entity] causing deactivation.
             */
            toggleActivate: function (entity) {

                if (!this.alwaysToggleActivate && this.activated) {

                    this.deactivate(entity);

                }
                else {

                    this.activate(entity);

                }

            },

            /**
             * Convenience function for tween fade to max alpha.
             * @param {Object} [settings] settings for tween.
             * @returns {Tween} tween object.
             **/
            fadeIn: function (settings) {

                return this.fadeTo(1, settings);

            },

            /**
             * Convenience function for tween fade out.
             * @param {Object} [settings] settings for tween.
             * @returns {Tween} tween object.
             **/
            fadeOut: function (settings) {

                return this.fadeTo(0, settings);

            },

            /**
             * Simple fade to specified alpha.
             * @param {Number} alpha alpha value between 0 and 1.
             * @param {Object} [settings] settings for tween.
             * @returns {Tween} tween object.
             **/
            fadeTo: function (alpha, settings) {

                // default settings

                settings = ig.merge({
                    name: 'fade',
                    duration: _c.DURATION_FADE
                }, settings);

                return this.tween({ alpha: alpha || 0 }, settings);

            },

            /**
             * Convenience function for tween fade out and then kill.
             * @param {Object} [settings] settings for tween.
             * @returns {Tween} tween object.
             **/
            fadeToDeath: function (settings) {

                settings = settings || {};

                // insert complete callback to kill this entity

                var me = this;
                var onCompleteOriginal = settings.onComplete;

                settings.onComplete = function () {

                    ig.game.removeEntity(me);

                    if ( onCompleteOriginal ) {

                        onCompleteOriginal();

                    }

                };

                return this.fadeTo(0, settings);

            },

            /**
             * Simple tween of specified properties.
             * <span class="alert"><strong>IMPORTANT:</strong> make sure this entity has all tweening properties.</span>
             * @param {Object} properties property values on entity.
             * @param {Object} [settings] settings for tween, based on {@link ig.tweens.tween}.
             * @returns {Tween} tween object.
             **/
            tween: function (properties, settings) {

                var me = this;

                settings = settings || {};

                // stop previous tween

                var name = settings.name || 'tween';
                var tween = this.tweens[ name ];
                if (tween) {

                    tween.stop();

                }

                // set pause signaller

                settings.pauseSignaller = settings.pauseSignaller || this;

                // set up auto complete and delete

                if (!settings.noComplete) {

                    var onComplete = settings.onComplete;

                    settings.onComplete = function () {

                        delete me.tweens[ name ];

                        if (typeof onComplete === 'function') {

                            onComplete();

                        }

                    };

                }

                // tween

                return this.tweens[ name ] = _tw.tween(
                    this,
                    properties,
                    settings
                );

            },

            /**
             * Stops tweens on this entity.
             * <span class="alert"><strong>IMPORTANT:</strong> if no specific tween name passed, will stop all tweens.</span>
             * @param {String} [name] name of specific tween.
             **/
            tweenEnd: function (name) {

                // name of specific tween passed

                if (typeof name === 'string') {

                    var tween = this.tweens[ name ];

                    if (tween) {

                        tween.stop();
                        delete this.tweens[ name ];

                    }

                }
                // clear all tweens
                else {

                    for (name in this.tweens) {

                        this.tweenEnd(name);

                    }

                }

            },

            /**
             * Start following an entity by matching its position exactly.
             * @param {Entity|Array} entity entity or list of entities to follow.
             * @param {Object} [settings] follow settings.
             * @example
             * // settings is a plain object
             * settings = {};
             * // to ensure entity follows other properly
             * settings.matchPerformance = true;
             * // to move to only once
             * settings.once = true;
             * // to follow at the bottom right instead of center
             * settings.offsetPct = { x: 0.5, y: 0.5 };
             * // to follow at a random offset between -0.25 and 0.25 on both axes
             * settings.randomOffsetPct = { x: 0.25, y: 0.25 };
             * // a lerp between 0 and 1 will cause a smooth follow
             * settings.lerp = 0.1;
             * // a tweened follow with optional tween settings based on {@link ig.EntityExtended#tween}
             * settings.tween = true;
             * settings.tweenSettings = {...};
             **/
            moveToEntity: function (entity, settings) {

                settings = settings || {};

                // check if entity is sequence

                if (_ut.isArray(entity)) {

                    if (!entity.length) {

                        return;

                    }

                    // copy entity sequence

                    this.movingToSequence = entity.slice(0);

                    // move to first

                    entity = this.movingToSequence.shift();

                    // moveTo shouldn't be more than once

                    this.movingToOnce = true;

                }

                // not already moving to

                if (this.movingToEntity !== entity) {

                    // clear previous

                    this.moveToHere();

                    // check moving to once

                    if (typeof settings.once !== 'undefined') {

                        this.movingToOnce = settings.once;

                    }

                    // match performance of entity to follow
                    // this ensures static entities will be able to follow non static
                    // and that we don't waste performance constantly updating follow of static entities

                    if (settings.matchPerformance) {

                        var performance = entity.performance;

                        // kinematic to dynamic for proper follow

                        if (performance === _c.KINEMATIC) {

                            performance = _c.DYNAMIC;

                        }

                        this.setPerformance(performance);

                    }

                    // random offsets

                    if (settings.randomOffsetPct) {

                        // set base in case settings are reused

                        settings.baseOffsetPct = settings.baseOffsetPct || settings.offsetPct || _utv2.vector();

                        // ensure random offset has both x and y

                        var randomOffsetPct = settings.randomOffsetPct;

                        randomOffsetPct.x = randomOffsetPct.x || 0;
                        randomOffsetPct.y = randomOffsetPct.y || 0;

                        // combine base offset with random offset

                        settings.offsetPct = _utv2.vector(
                            settings.baseOffsetPct.x + ( Math.random() * 2 * randomOffsetPct.x - randomOffsetPct.x ),
                            settings.baseOffsetPct.y + ( Math.random() * 2 * randomOffsetPct.y - randomOffsetPct.y )
                        );

                    }

                    // no need to constantly follow if this entity is not dynamic or entity to follow is static, and not lerping or tweening

                    if (( this.performance !== _c.DYNAMIC || entity.performance === _c.STATIC ) && !settings.lerp && !settings.tween) {

                        this.moveToPosition(entity, settings);

                    }
                    else {

                        // make sure we are not frozen

                        this.frozen = false;

                        this.movingTo = true;
                        this.movedTo = false;
                        this.movingToSettings = settings;
                        this.movingToEntity = entity;

                        // moveTo is a tween

                        if (settings.tween) {

                            this.movingToTweening = true;
                            this.movingToTweenPct = 0;
                            this.movingToTweenX = this.pos.x;
                            this.movingToTweenY = this.pos.y;

                            // tween settings

                            var tweenSettings = settings.tweenSettings = settings.tweenSettings || {};
                            tweenSettings.name = "movingTo";
                            tweenSettings.onComplete = function () {

                                this.moveToUpdate();
                                this.moveToComplete();

                            }.bind(this);

                            // tween pct to 1

                            this.tween({ movingToTweenPct: 1 }, tweenSettings);

                        }

                    }

                }

            },

            /**
             * Moves to next in current sequence of moving to entities.
             **/
            moveToSequenceNext: function () {

                // moving to sequence

                if (this.movingToSequence) {

                    // another to move to

                    if (this.movingToSequence.length > 0) {

                        // disable moving to temporarily so moveTo doesn't reset properties

                        this.movingTo = false;

                        this.moveToEntity(this.movingToSequence.shift(), this.movingToSettings);

                    }
                    // none left, end sequence
                    else {

                        this.movingToSequence = undefined;
                        this.moveToComplete();
                        this.moveToHere();

                    }

                }

            },

            /**
             * Updates any moveTo in progress.
             **/
            moveToUpdate: function () {

                if (this.movingTo && this.movingToEntity && ( !this.movedTo || this.movingToEntity.changed )) {

                    this.moveToPosition(this.movingToEntity, this.movingToSettings);

                }

            },

            /**
             * Positions this entity relative to another entity based on settings.
             * @param {ig.EntityExtended} entity entity to move to.
             * @param {Object} [settings] settings object.
             **/
            moveToPosition: function (entity, settings) {

                var halfWidth = this.bounds.width * 0.5;
                var halfHeight = this.bounds.height * 0.5;
                var targetHalfWidth = entity.bounds.width * 0.5;
                var targetHalfHeight = entity.bounds.height * 0.5;

                var targetX;
                var targetY;

                if ( this.fixed ) {

                    if ( entity.fixed ) {

                        targetX = entity.bounds.minX + targetHalfWidth - halfWidth;
                        targetY = entity.bounds.minY + targetHalfHeight - halfHeight;

                    }
                    else {

                        targetX = entity.bounds.minX + targetHalfWidth - halfWidth - ig.game.screen.x;
                        targetY = entity.bounds.minY + targetHalfHeight - halfHeight - ig.game.screen.y;

                    }

                }
                else {

                    if ( entity.fixed ) {

                        targetX = ig.game.screen.x + entity.bounds.minX + targetHalfWidth - halfWidth;
                        targetY = ig.game.screen.y + entity.bounds.minY + targetHalfHeight - halfHeight;

                    }
                    else {

                        targetX = entity.bounds.minX + targetHalfWidth - halfWidth;
                        targetY = entity.bounds.minY + targetHalfHeight - halfHeight;

                    }

                }

                if (settings) {

                    // offsets

                    var offsetPctX;
                    var offsetPctY;

                    var offsetPct = settings.offsetPct;

                    if (offsetPct) {

                        offsetPctX = offsetPct.x || 0;
                        offsetPctY = offsetPct.y || 0;

                        targetX += ( offsetPctX * targetHalfWidth + offsetPctX * halfWidth ) * ( entity.flip ? -1 : 1 );
                        targetY += offsetPctY * targetHalfHeight + offsetPctY * halfHeight;

                        // flip with entity

                        this.flip = entity.flip;

                    }

                }

                var dx = targetX - this.pos.x;
                var dy = targetY - this.pos.y;

                // tween

                if (this.movingToTweening) {

                    this.pos.x = this.movingToTweenX + ( targetX - this.movingToTweenX ) * this.movingToTweenPct;
                    this.pos.y = this.movingToTweenY + ( targetY - this.movingToTweenY ) * this.movingToTweenPct;

                }
                // lerp
                else if (settings && settings.lerp) {

                    this.pos.x += dx * settings.lerp;
                    this.pos.y += dy * settings.lerp;

                }
                // instantly
                else {

                    this.pos.x = targetX;
                    this.pos.y = targetY;

                }

                // check if done

                if (this.movingTo
                    && _utm.almostEqual(dx, 0, _c.PRECISION_ZERO)
                    && _utm.almostEqual(dy, 0, _c.PRECISION_ZERO)) {

                    this.moveToComplete();

                }

            },

            /**
             * Called when moved to complete.
             **/
            moveToComplete: function () {

                // continue sequence

                if (this.movingToSequence) {

                    this.moveToSequenceNext();

                }
                // complete
                else {

                    this.movedTo = true;

                    // end move to if only moving to once

                    if (this.movingToOnce) {

                        this.moveToHere();
                        this.onMovedTo.dispatch(this);

                    }

                }

            },

            /**
             * Ends any moveTo in progress.
             **/
            moveToHere: function () {

                if (this.movingTo) {

                    if (this.movingToTweening) {

                        this.tweenEnd("movingTo");

                        this.movingToTweenPct = this.movingToTweenX = this.movingToTweenY = 0;

                    }

                    this.movingTo = this.movedTo = this.movingToTweening = this.movingToOnce = false;
                    this.movingToEntity = this.movingToSettings = this.movingToSequence = undefined;


                }

            },

            /**
             * Does damage to entity while checking if invulnerable.
             * @param {Number} amount amount of damage.
             * @param {ig.EntityExtended} [from] entity causing damage.
             * @param {Boolean} [unblockable] whether damage cannot be blocked.
             * @returns {Boolean} whether damage was applied.
             **/
            receiveDamage: function (amount, from, unblockable) {

                // check if invulnerable

                if (( !this.invulnerable || unblockable ) && amount) {

                    this.health -= amount;

                    if (this.health <= 0) {

                        this.kill();

                    }

                    return true;

                }

                // nothing happened

                return false;

            },

            /**
             * Pauses entity.
             */
            pause: function () {

                if (!this.paused) {

                    this.paused = true;

                    // animations

                    for (var animName in this.anims) {

                        var anim = this.anims[ animName ];

                        if (anim) {

                            anim.timer.pause();

                        }

                    }

                    this.onPaused.dispatch(this);

                }

            },

            /**
             * Unpauses entity.
             */
            unpause: function () {

                if (this.paused) {

                    this.paused = false;

                    // animations

                    for (var animName in this.anims) {

                        var anim = this.anims[ animName ];

                        if (anim) {

                            anim.timer.unpause();

                        }

                    }

                    // tweens


                    this.onUnpaused.dispatch(this);

                }

            },

            /**
             * Kills entity and shows optional effects, animation, etc.
             * <br>- this is not the same as {@link ig.GameExtended#removeEntity}
             * @param {Boolean} [silent] whether to die without effects or animation.
             * @see ig.Entity.
             */
            kill: function (silent) {

                if (!this.dieing) {

                    this.dieing = true;
                    this.dieingSilently = silent || false;

                    // show death

                    if (!silent && this.anims.death) {

                        // flag as killed

                        ig.game.flagAsKilled(this);

                        // clear velocity

                        _utv2.zero(this.vel);

                        // play death animation

                        this.animOverride("death", {
                            callback: this.die
                        });

                    }
                    else {

                        this.die();

                    }

                }

            },

            /**
             * Automatically called after entity finished being killed.
             * <span class="alert"><strong>IMPORTANT:</strong> for full animated death, use {@link ig.EntityExtended#kill} instead.</span>
             */
            die: function () {

                ig.game.removeEntity(this);

            },

            /**
             * Does cleanup on entity as it is added to deferred removal list.
             **/
            cleanup: function () {

                // tweens

                this.tweenEnd();

                // stop moving to

                this.moveToHere();

                // signals

                this.onRemoved.dispatch(this);

                // clean signals when game has no level

                if ( !ig.game.hasLevel ) {

                    this.onAdded.removeAll();
                    this.onAdded.forget();
                    this.onRemoved.removeAll();
                    this.onRemoved.forget();
                    this.onPaused.removeAll();
                    this.onPaused.forget();
                    this.onUnpaused.removeAll();
                    this.onUnpaused.forget();
                    this.onMovedTo.removeAll();
                    this.onMovedTo.forget();

                    for ( var animName in this.anims ) {

                        var anim = this.anims[ animName ];

                        anim.onCompleted.removeAll();
                        anim.onCompleted.forget();

                    }

                }

            },

            /**
             * Called when two entities intersect, regardless of collides and before checks or collisions.
             * @param {ig.EntityExtended} entity entity intersecting.
             **/
            intersectWith: function (entity) {
            },

            /**
             * Checks this entity against another entity that matches this entity's {@link ig.EntityExtended#type}.
             * @param {ig.EntityExtended} [entity] other entity.
             * @see ig.Entity.
             **/
            check: function (entity) {

                this.checking = true;
                this._stopChecking = false;

            },

            /**
             * Automatcially called on update after done checking against all entities to flag entity as no longer checking.
             **/
            checkStop: function () {

                this.checking = this._stopChecking = false;

            },

            /**
             * Collides with another entity along a specified axis.
             * @param {ig.EntityExtended} entity entity colliding with.
             * @param {String} axis name of axis (x or y)
             * @param {Boolean} [strong] whether this was strong in the collision and didn't move.
             */
            collideWith: function (entity, axis, strong) {

                // record changes and check bounds to account for collision if this was not strong in the collision
                // because collision will likely only change positions, check for position change here instead of in record changes
                // record changes tends to check more than just position, which in this case is unnecessary

                if (!strong && ( this.pos.x !== this.last.x || this.pos.y !== this.last.y )) {

                    this.recordChanges(true);

                }

            },

            /**
             * Enhanced handling of results of collision with collision map.
             * @override
             */
            handleMovementTrace: function( res ) {

                this.standing = 0;

                if (this.vel.y !== 0) {

                    this.grounded = 0;

                }

                // ignore climbable tiles
                // if we need them we should be using game's shapePasses

                if ( res.tile.x && _utt.isTileClimbable( res.tile.x ) ) {

                    res.pos.x = this.pos.x + this.vel.x * ig.system.tick;

                }
                if (res.collision.x) {

                    if (this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity) {
                        this.vel.x *= -this.bounciness;
                    }
                    else {
                        this.vel.x = 0;
                    }

                }

                // ignore climbable tiles
                // if we need them we should be using game's shapePasses

                if ( res.tile.y && _utt.isTileClimbable( res.tile.y ) ) {

                    res.pos.y = this.pos.y + this.vel.y * ig.system.tick;
                    res.collision.slope = false;

                }
                else if (res.collision.y) {

                    if (this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity) {
                        this.vel.y *= -this.bounciness;
                    }
                    else {
                        if (this.vel.y > 0) {
                            this.standing = this.grounded = 1;
                        }
                        this.vel.y = 0;

                    }

                }

                var s = res.collision.slope;

                if (s) {

                    this.slope = s;

                    s.angle = Math.atan2(s.ny, s.nx);

                    if (s.angle > this.slopeStanding.min && s.angle < this.slopeStanding.max ) {

                        this.standing = this.grounded = 1;

                        // add a bit of force upwards if moving up a slope, based on slope angle
                        // ideally we would just rotate the velocity itself to run with the slope but that breaks the collision tracing

                        if (s.nx * this.vel.x < 0) {

                            this.vel.y = -Math.abs(( s.angle + _utm.HALFPI ) * this.vel.x) * this.slopeSpeedMod;

                        }

                    }

                }
                else {

                    this.slope = false;

                }

                // check if can use result position

                if (!( this.slope && this.grounded && this.vel.x === 0 )) {

                    this.pos = res.pos;

                }

            },

            /**
             * Updates entity.
             * <br>- all update parts are now opt-in through (@link ig.EntityExtended#frozen} and (@link ig.EntityExtended#performance}
             * <br>- paused entities don't update at all
             * <br>- frozen entities don't update except to do (@link ig.EntityExtended#updateCleanup} (useful for triggers)
             * <br>- static performance entities only check if visible and do (@link ig.EntityExtended#updateVisible}
             * <br>- dynamic performance entities ignore collision map but do move and check for changes via (@link ig.EntityExtended#updateChanges} and (@link ig.EntityExtended#recordChanges}
             * <br>- kinematic performance entities move, check for changes, collide with collision map, and have physics forces via (@link ig.EntityExtended#updateVelocity}
             * <span class="alert"><strong>IMPORTANT:</strong> (@link ig.EntityExtended#performance} has nothing to do with entity to entity collisions, which is defined by (@link ig.EntityExtended#collides}.</span>
             **/
            update: function () {

                if (!this.paused) {

                    // unfrozen entities, i.e. do more on update than just checks

                    if (!this.frozen) {

                        // static entities, i.e. never moving

                        if (this.performance === _c.STATIC) {

                            if (this._changedAdd && this.changed) {

                                this.updateBounds();
                                this.changed = false;

                            }

                        }
                        // movable or moving entities
                        else {

                            if ( this.controllable ) {

                                this.updateChanges();

                            }

                            // physics entities

                            if (this.performance === _c.KINEMATIC && !this._killed) {

                                // gravity

                                this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;

                                // velocity

                                this.updateVelocity();

                                // movement & collision

                                var mx = this.vel.x * ig.system.tick;
                                var my = this.vel.y * ig.system.tick;
                                var res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y);
                                this.handleMovementTrace(res);

                            }

                            this.recordChanges();

                            this.recordLast();

                        }

                        // visibility

                        this.visible = this.getIsVisible();

                        if (this.visible) {

                            this.updateVisible();

                        }
                        // when dieing and not visible, die instantly
                        else if (this.dieing) {

                            this.die();

                        }

                    }

                    this.updateCleanup();

                }
                // check visible when paused but camera is not
                else if ( ig.game.camera && !ig.game.camera.paused ) {

                    this.visible = this.getIsVisible();

                }

            },

            /**
             * Handles clean up of update for entity including checking status.
             * <br>- called automatically by {@link ig.EntityExtended#update}
             * <br>- useful for setting / resetting properties that are set after update (i.e. during collision checks).
             */
            updateCleanup: function () {

                // checking, stop on next update

                if (this.checking && !this._layerChange) {

                    // attempt to stop checking

                    if (this._stopChecking) {

                        this.checkStop();

                    }
                    else {

                        this._stopChecking = true;

                    }

                }

            },

            /**
             * Records last transform.
             * <br>- called automatically by {@link ig.EntityExtended#update}
             **/
            recordLast: function () {

                _utv2.copy(this.last, this.pos);
                this._angleLast = this.angle;

            },

            /**
             * Records limited changes in transform and sets {@link ig.EntityExtended#changed} and {@link ig.EntityExtended#moving}.
             * <br>- called automatically by {@link ig.EntityExtended#update}
             * @param {Boolean} [force] forces changed.
             **/
            recordChanges: function (force) {

                if (force === true
                    || this.pos.x !== this.last.x
                    || this.pos.y !== this.last.y
                    || this.angle !== this._angleLast) {

                    this.changed = true;

                    this.movingX = this.vel.x !== 0;
                    this.movingY = this.vel.y !== 0;
                    this.moving = this.movingX || this.movingY;

                    this.updateBounds();

                }
                else {

                    this.changed = this.moving = this.movingX = this.movingY = false;

                }

            },

            /**
             * Updates bounds.
             * <br>- called automatically by {@link ig.EntityExtended#update}
             * <br>- this sets {@link ig.EntityExtended#bounds} and {@link ig.EntityExtended#boundsDraw}
             * <br>- when vertices needed, also sets {@link ig.EntityExtended#vertices} and {@link ig.EntityExtended#verticesWorld}
             **/
            updateBounds: function () {

                if (this.verticesNeeded) {

                    this._verticesFound = true;
                    this.verticesWorld = this.getVerticesWorld();

                }
                else {

                    this._verticesFound = false;

                }

                this.bounds = this.getBounds();
                this.boundsDraw = this.getBoundsDraw();

            },

            /**
             * Changes entity.
             * <br>- called automatically by {@link ig.EntityExtended#update}
             * <span class="alert alert-info"><strong>Tip:</strong> use this method to handle moving, acting, etc, instead of the main update method.</span>
             **/
            updateChanges: function () {

                this.moveToUpdate();

            },

            /**
             * Updates velocity based on acceleration and friction.
             * <br>- called automatically by {@link ig.EntityExtended#update}
             **/
            updateVelocity: function () {

                this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x, this.friction.x, this.maxVel.x);
                this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y, this.friction.y, this.maxVel.y);

            },

            /**
             * Called when visible to update animations.
             * <br>- called automatically by {@link ig.EntityExtended#update}
             **/
            updateVisible: function () {

                // animation

                if (this.overridingAnim && this.currentAnim !== this.overridingAnim) {

                    this.currentAnim = this.overridingAnim;

                }

                if (this.currentAnim) {

                    this.currentAnim.update();

                }

                // reset _changedAdd when visible only
                // this can help to avoid heavy start-up costs
                // as an entity will remain changed until it is visible

                if (this._changedAdd) {

                    this._changedAdd = false;
                    this.updateBounds();

                }


            },

            /**
             * Draws entity.
             **/
            draw: function () {

                if (this.currentAnim && this.visible) {

                    // account for alpha

                    var alpha = this.currentAnim.alpha;

                    this.currentAnim.alpha *= this.alpha;

                    // set flip

                    this.currentAnim.flip.x = this.flip;

                    // fixed in screen

                    if (this.fixed) {

                        this.currentAnim.draw(
                            this.boundsDraw.minX,
                            this.boundsDraw.minY
                        );

                    }
                    // default draw
                    else {

                        // original entity draw uses ig.game._rscreen, which seems to cause drawing to jitter
                        // ig.game.screen is much more accurate

                        this.currentAnim.draw(
                            this.boundsDraw.minX - ig.game.screen.x,
                            this.boundsDraw.minY - ig.game.screen.y
                        );

                    }

                    // undo alpha change

                    this.currentAnim.alpha = alpha;

                }

            }

        });

        /**
         * Bitwise flags for entities that check against other entities of a specific type.
         * <br>- this integrates the previous type system, so it can be used safely in its place
         * <br>- some flags are already defined for convenience
         * <br>- up to 32 flags can be defined
         * <span class="alert alert-info"><strong>Tip:</strong> any class can have it's own TYPE flags! Ex: Abilities have their own set of TYPE flags at {@link ig.Ability.TYPE}</span>
         * @static
         * @readonly
         * @memberof ig.EntityExtended
         * @namespace ig.EntityExtended.TYPE
         * @see ig.utils.getType
         * @see ig.utils.addType
         **/
        ig.EntityExtended.TYPE = ( function () {

            var types = [];
            var combinationTypes = [];
            var name;
            var flag;

            // get all existing types

            for ( name in ig.Entity.TYPE ) {

                types.push( {
                    name: name,
                    flag: ig.Entity.TYPE[ name ]
                } );

            }

            // sort types by lowest flag up

            types.sort( function ( a, b ) {

                return a.flag - b.flag;

            });

            // add types that are a power of 2

            for ( var i = 0, il = types.length; i < il; i++ ) {

                var type = types[ i ];
                name = type.name;
                flag = type.flag;

                // flag that is zero or not a power of 2 should be added manually at end

                if ( (flag === 0) || ( ( flag & ( flag - 1) ) !== 0) ) {

                    combinationTypes.push( type );

                }
                else {

                    _ut.getType(ig.EntityExtended, name);

                }

            }

            // add combination types

            for ( var i = 0, il = combinationTypes.length; i < il; i++ ) {

                var type = combinationTypes[ i ];
                name = type.name;
                flag = type.flag;

                ig.EntityExtended.TYPE[ name ] = flag;

            }

            return ig.EntityExtended.TYPE;

        })();

        // add some extra base types

        _ut.getType(ig.EntityExtended, "INTERACTIVE");
        _ut.getType(ig.EntityExtended, "DAMAGEABLE");

        /**
         * NONE type flag.
         * @memberof ig.EntityExtended.TYPE
         * @type Bitflag
         **/
        ig.EntityExtended.TYPE.NONE;

        /**
         * A type flag.
         * @memberof ig.EntityExtended.TYPE
         * @type Bitflag
         **/
        ig.EntityExtended.TYPE.A;

        /**
         * B type flag.
         * @memberof ig.EntityExtended.TYPE
         * @type Bitflag
         **/
        ig.EntityExtended.TYPE.B;

        /**
         * BOTH type flag for both A and B types.
         * @memberof ig.EntityExtended.TYPE
         * @type Bitflag
         **/
        ig.EntityExtended.TYPE.BOTH;

        /**
         * INTERACTIVE type flag.
         * @memberof ig.EntityExtended.TYPE
         * @type Bitflag
         **/
        ig.EntityExtended.TYPE.INTERACTIVE;

        /**
         * DAMAGEABLE type flag.
         * @memberof ig.EntityExtended.TYPE
         * @type Bitflag
         **/
        ig.EntityExtended.TYPE.DAMAGEABLE;

        /**
         * Bitwise flags for entities that do not collide or check against each other, via {@link ig.EntityExtended#group}.
         * <br>- some flags are already defined for convenience
         * <br>- up to 32 flags can be defined
         * <span class="alert alert-info"><strong>Tip:</strong> any class can have it's own GROUP flags!</span>
         * @static
         * @readonly
         * @memberof ig.EntityExtended
         * @namespace ig.EntityExtended.GROUP
         * @see ig.utils.getType
         * @see ig.utils.addType
         **/
        ig.EntityExtended.GROUP;

        // add some extra base groups

        _ut.getType(ig.EntityExtended, "FRIEND", "GROUP");
        _ut.getType(ig.EntityExtended, "ENEMY", "GROUP");

        /**
         * FRIEND group flag.
         * @memberof ig.EntityExtended.GROUP
         * @type Bitflag
         **/
        ig.EntityExtended.GROUP.FRIEND;

        /**
         * ENEMY type flag.
         * @memberof ig.EntityExtended.GROUP
         * @type Bitflag
         **/
        ig.EntityExtended.GROUP.ENEMY;

        /**
         * Fixes and enhancements for entity static methods.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> ig.Entity should not be used! Have your entities extend {@link ig.EntityExtended} instead.</span>
         * @class ig.Entity
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Entity;

        /**
         * Expanded pair checking to handle groups and one-way.
         * @static
         */
        ig.Entity.checkPair = function (a, b) {

            // always intersect

            a.intersectWith(b);
            b.intersectWith(a);

            // entities in same group never check or collide

            if (( a.group & b.group ) === 0) {

                // check entities against each other as needed

                if (a.checkAgainst & b.type) {

                    a.check(b);

                }

                if (b.checkAgainst & a.type) {

                    b.check(a);

                }

                // solve collision if at least one entity collides ACTIVE or FIXED and the other does not collide NEVER
                // also ensure neither entity is one way, or if they are that the other is colliding from one way blocking direction

                if (a.collides && b.collides
                    && a.collides + b.collides > ig.Entity.COLLIDES.ACTIVE
                    && ( !a.oneWay || b.getIsCollidingWithOneWay(a) )
                    && ( !b.oneWay || a.getIsCollidingWithOneWay(b) )) {

                    ig.Entity.solveCollision(a, b);

                }

            }

        };

        /**
         * Expanded collision solving to ensure stable entity bounds.
         * @static
         */
        ig.Entity.solveCollision = function (a, b) {

            // find weaker entity of the pair to move
            // FIXED > ALL and ACTIVE > LITE and ACTIVE = PASSIVE
            // PASSIVE can be used to allow entities to pass through each other
            // but PASSIVE is mostly unnecessary as groups (@see ig.Entity.checkPair) do the job much more precisely

            var weak = null;
            var strongA;
            var strongB;

            if (
                a.collides === ig.Entity.COLLIDES.LITE ||
                    b.collides === ig.Entity.COLLIDES.FIXED
                ) {
                weak = a;
                strongB = true;
            }
            else if (
                b.collides === ig.Entity.COLLIDES.LITE ||
                    a.collides === ig.Entity.COLLIDES.FIXED
                ) {
                weak = b;
                strongA = true;
            }

            // check overlap amount on each axis and do solve collisions on the axis with the lowest overlap
            // this changes the previous behavior which sometimes preferred vertical collisions incorrectly over horizontal collisions

            var top;
            var bottom;
            var left;
            var right;
            var overlapX;
            var overlapY;

            if (a.bounds.minX < b.bounds.minX) {

                left = a;
                right = b;
                overlapX = a.bounds.maxX - b.bounds.minX;

            }
            else {

                left = b;
                right = a;
                overlapX = b.bounds.maxX - a.bounds.minX;

            }

            if (a.bounds.minY < b.bounds.minY) {

                top = a;
                bottom = b;
                overlapY = a.bounds.maxY - b.bounds.minY;

            }
            else {

                top = b;
                bottom = a;
                overlapY = b.bounds.maxY - a.bounds.minY;

            }

            // higher overlap on y axis, i.e. horizontal collision
            if (overlapY > overlapX) {

                ig.Entity.seperateOnXAxis(left, right, weak);

                a.collideWith(b, 'x', strongA);
                b.collideWith(a, 'x', strongB);

            }
            // default to higher overlap on x axis, i.e. vertical collision
            else {

                ig.Entity.seperateOnYAxis(top, bottom, weak);

                a.collideWith(b, 'y', strongA);
                b.collideWith(a, 'y', strongB);

            }

        };

        /*
         * overrides and fixes for when in editor
         */
        if (ig.global.wm) {

            delete ig.EntityExtended.prototype.staticInstantiate;

            ig.EntityExtended.inject({

                visible: true,

                touches: function ( selector ) {

                    return _uti.pointInBounds(selector.pos.x, selector.pos.y, this.bounds);

                },

                draw: function () {

                    // force changed and recalculation of bounds

                    this.recordChanges(true);

                    // update visible no matter what

                    this.updateVisible();

                    this.parent();

                }

            })

        }

    });