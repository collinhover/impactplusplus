ig.module(
        'plusplus.ui.ui-tracker'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.timer',
        'plusplus.ui.ui-interactive',
        'plusplus.entities.direction',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utm = ig.utilsmath;
        var _utv2 = ig.utilsvector2;

        /**
         * Interactive ui element for tracking the closest entity of a type or name in a level.
         * @class
         * @extends ig.UIInteractive
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // to help your players find things in the game world, you might want a tracker
         * ig.UITrackerDummy = ig.UITracker.extend({
         *      // set the class of the entity to track
         *      entityClass: 'EntityDummy',
         *      // give it a 2% margin so it isn't smooshed against the screen edge
         *      // ui elements have a default position of top left
         *      margin: { x: 0.02, y: 0.02 },
         *      // we add an animation sheet
         *      animSheet: new ig.AnimationSheet( 'media/icons_trackers.png', 16, 16 ),
         *      // set the base size of our tracker
         *      size: { x: 16, y: 16 },
         *      // and set animations for when idle (not tracking) and tracking
         *      // these animations will be automatically swapped between
         *      animSettings: {
         *          idle: {
         *              sequence: [ 0 ]
         *          },
         *          tracking: {
         *              sequence: [ 1 ]
         *          }
         *      },
         *      // unfreeze tracker so we can animate it
         *      frozen: false,
         * });
         * // then spawn an instance of the ig.UITrackerDummy when the player is added to the game
         * // and player can click it to spawn an arrow pointing towards the tracked entity (if it exists)
         **/
        ig.UITracker = ig.global.UITracker = ig.UIInteractive.extend(/**@lends ig.UITracker.prototype */{

            /**
             * Entity class to track.
             * @type String|ig.Class
             * @default
             */
            entityClass: '',

            /**
             * Entity name to track.
             * <br>- when present overrides {@link ig.UITracker#entityClass}
             * @type String|ig.Class
             * @default
             */
            entityName: '',

            /**
             * Entity currently being tracked
             * <span class="alert"><strong>IMPORTANT:</strong> do not set this directly, instead use {@link ig.UITracker#track}.</span>
             * @type String|ig.Class
             * @default
             */
            entityTracking: '',

            /**
             * Entity class to show as directional indicator.
             * @type String|ig.Class
             * @default
             */
            entityDirectionClass: ig.EntityDirection,

            /**
             * Entity instance shown as directional indicator on tracked.
             * @type ig.EntityExtended
             */
            entityDirectionIndicator: null,

            /**
             * Delay in seconds between auto tracking.
             * <span class="alert"><strong>IMPORTANT:</strong> be careful when setting this value close to 0 as could affect performance.</span>
             * @type String|ig.Class
             * @default
             */
            autoTrackingDelay: 2,

            /**
             * Timer for auto tracking.
             * <br>- created on init
             * @type ig.TimerExtended
             */
            autoTrackingTimer: null,

            /**
             * Trackers should only ever activate.
             * @override
             */
            alwaysToggleActivate: true,

            /**
             * Threshold to make horizontal direction zero.
             * @type Number
             * @see ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X
             */
            directionThresholdX: _c.CHARACTER.SIZE_EFFECTIVE_X,

            /**
             * Threshold to make vertical direction zero.
             * @type Number
             * @see ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y
             */
            directionThresholdY: _c.CHARACTER.SIZE_EFFECTIVE_Y,

            /**
             * @override
             **/
            initProperties: function () {

                this.parent();

                this.autoTrackingTimer = new ig.TimerExtended(0, this);

            },

            /**
             * @override
             **/
            activate: function (entity) {

                this.track(true, entity);

                this.parent(entity);

            },

            /**
             * Tracks entity by name or class.
             * @param {Boolean} [show=true] whether to show tracking direction.
             * @param {Entity} [entity] entity to use to sort search by closest.
             **/
            track: function (show, entity) {

                // clear previous

                this.untrack();

                // get search position

                var x;
                var y;

                if ( show !== false ) {

                    // no entity passed, try to base it on player

                    if ( !entity ) {

                        entity = ig.game.namedEntities[ 'player' ];

                    }

                    // search from entity

                    if ( entity ) {

                        x = entity.bounds.minX + entity.bounds.width * 0.5;
                        y = entity.bounds.minY + entity.bounds.height * 0.5;

                    }
                    else {

                        x = ig.game.screen.x + ig.system.width * 0.5;
                        y = ig.game.screen.y + ig.system.height * 0.5;

                    }

                }

                // get by name

                if (this.entityName) {

                    this.entityTracking = ig.game.namedEntities[ this.entityName ];

                }
                // get by type
                else if (this.entityClass) {

                    this.entityTracking = ig.game.getEntitiesByType(this.entityClass, {
                        x: x,
                        y: y,
                        first: !show
                    })[ 0 ];

                }

                // when found

                if (this.entityTracking) {

                    // untrack when tracking is removed

                    this.entityTracking.onRemoved.add(this.untrack, this);

                    this.currentAnim = this.anims.tracking;

                    // show direction

                    if (show !== false) {

                        // create new
                        if (!this.entityDirectionIndicator) {

                            this.entityDirectionIndicator = ig.game.spawnEntity(this.entityDirectionClass, 0, 0);

                        }
                        // kill previous and respawn
                        else {

                            this.entityDirectionIndicator.kill(true);

                            ig.game.spawnEntity(this.entityDirectionIndicator, 0, 0);

                        }

                        // set direction

                        var diffX = this.entityTracking.bounds.minX + this.entityTracking.bounds.width * 0.5 - x;
                        var diffY = this.entityTracking.bounds.minY + this.entityTracking.bounds.height * 0.5 - y;
                        var direction = _utv2.directionThreshold(
                            _utv2.vector(diffX, diffY),
                            this.directionThresholdX, this.directionThresholdY
                        );

                        this.entityDirectionIndicator.setDirection(direction);

                        // normalize direction and offset

                        var dirX = _utm.direction(direction.x);
                        var dirY = _utm.direction(direction.y);
                        var length = Math.sqrt(dirX * dirX + dirY * dirY);
                        var normalX = dirX / length;
                        var normalY = dirY / length;

                        var offsetX = normalX * ( this.entityDirectionIndicator.totalSizeX * 0.5 + ( entity ? entity.bounds.width * 0.5 : 0 ) );
                        var offsetY = normalY * ( this.entityDirectionIndicator.totalSizeY * 0.5 + ( entity ? entity.bounds.height * 0.5 : 0 ) );

                        this.entityDirectionIndicator.pos.x = x + offsetX - this.entityDirectionIndicator.totalSizeX * 0.5;
                        this.entityDirectionIndicator.pos.y = y + offsetY - this.entityDirectionIndicator.totalSizeY * 0.5;

                    }

                }
                // try to auto track when nothing found
                // only works if this is not frozen
                else {

                    this.autoTrackingTimer.set(this.autoTrackingDelay);

                }

            },

            /**
             * Stops tracking entity.
             **/
            untrack: function () {

                if (this.entityTracking) {

                    this.entityTracking.onRemoved.remove(this.untrack, this);
                    this.entityTracking = undefined;

                }

                this.currentAnim = this.anims.idle;

            },

            /**
             * Updates when visible and does auto tracking.
             * @override
             **/
            updateVisible: function () {

                this.parent();

                if (!this.entityTracking && this.autoTrackingTimer.delta() >= 0) {

                    this.track( false );

                }

            }

        });

    });