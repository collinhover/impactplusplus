ig.module(
        'plusplus.entities.direction'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.particle',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * Entity particle that points in a direction.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityDirection = ig.global.EntityDirection = ig.Particle.extend(/**@lends ig.EntityDirection.prototype */{

            /**
             * Direction arrow should be stationary.
             * @override
             * @default static
             */
            performance: _c.STATIC,

            /**
             * @override
             * @default 32 x 32
             */
            size: _utv2.vector(32, 32),

            /**
             * @override
             * @default directions_32.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'directions_32.png', 32, 32),

            /**
             * @override
             * @default
             */
            randomFlip: false,

            /**
             * @override
             * @default
             */
            lifeDuration: 1.5,

            /**
             * @override
             * @default
             */
            fadeAfterSpawnDuration: 0.25,

            /**
             * @override
             * @default
             */
            fadeBeforeDeathDuration: 1,

            /**
             * @override
             * @default
             */
            alpha: 0.75,

            /**
             * Name of direction.
             * @type String
             */
            directionName: '',

            /**
             * Direction vector.
             * @type Vector2
             */
            direction: _utv2.vector(),

            /**
             * Direction default animations.
             * @type Object
             * @property {Object} none 0
             * @property {Object} left 1
             * @property {Object} right 2
             * @property {Object} up 3
             * @property {Object} down 4
             * @property {Object} upleft 5
             * @property {Object} upright 6
             * @property {Object} downleft 7
             * @property {Object} downright 8
             */
            animSettings: {
                none: {
                    sequence: [0]
                },
                left: {
                    sequence: [1]
                },
                right: {
                    sequence: [2]
                },
                up: {
                    sequence: [3]
                },
                down: {
                    sequence: [4]
                },
                upleft: {
                    sequence: [5]
                },
                upright: {
                    sequence: [6]
                },
                downleft: {
                    sequence: [7]
                },
                downright: {
                    sequence: [8]
                }
            },

            /**
             * Initializes direction visuals.
             * <br>- sets duration of all animations to match {@link ig.EntityDirection#lifeDuration}
             * <br>- sets initial direction from {@link ig.EntityDirection#directionName} or {@link ig.EntityDirection#direction}
             * @override
             **/
            initVisuals: function () {

                this.parent();

                for (var animName in this.anims) {

                    var anim = this.anims[ animName ];

                    anim.frameTime = anim.sequence.length / this.lifeDuration;

                }

                // set initial direction

                if (!this.directionName) {

                    this.setDirectionName(this.directionName);

                }
                else {

                    this.setDirection(this.direction);

                }

            },

            /**
             * Sets the direction from a vector object.
             * @param {Vector2|Object} [direction=none] vector direction
             */
            setDirection: function (direction) {

                if (typeof direction === "undefined") {

                    this.direction = _utv2.vector();

                }
                else {

                    this.direction = direction;

                }

                this.directionName = _utv2.directionToString(this.direction).toLowerCase();

                this.currentAnim = this.anims[ this.directionName ];

            },

            /**
             * Sets the direction from a name.
             * @param {String} [directionName=none] name of direction
             */
            setDirectionName: function (directionName) {

                this.directionName = directionName || 'NONE';

                this.direction = _utv2.copy(this.direction, _utv2.DIRECTION[ this.directionName.toUpperCase() ]);

                this.currentAnim = this.anims[ this.directionName ];

            }

        });

    });