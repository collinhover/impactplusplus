ig.module(
    'plusplus.entities.camera-follow'
)
    .requires(
        'plusplus.core.timer',
        'plusplus.entities.trigger'
)
    .defines(function() {
        "use strict";

        /**
         * Trigger that causes camera to follow each target in {@link ig.Trigger#targetSequence}.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityCameraFollow = ig.global.EntityCameraFollow = ig.EntityTrigger.extend( /**@lends ig.EntityCameraFollow.prototype */ {

            _wmBoxColor: 'rgba(80, 130, 170, 0.7)',

            /**
             * @override
             * @default
             */
            autoComplete: false,

            /**
             * Targets to follow.
             * @type Array
             * @readonly
             */
            targetsToFollow: [],

            /**
             * Current following target in sequence.
             * @type ig.EntityExtended
             * @default
             * @readonly
             */
            following: null,

            /**
             * Whether should pause game while following.
             * @type Boolean
             * @default
             */
            pausing: true,

            /**
             * How long to pause after finished following each target.
             * @type Number
             * @default
             */
            followDelay: 1,

            /**
             * How long to pause after finished following each target.
             * @type ig.Timer
             * @default
             */
            followDelayTimer: null,

            // internal properties, do not modify

            _followed: false,

            /**
             * @override
             */
            initProperties: function() {

                this.parent();

                this.followDelayTimer = new ig.Timer();

            },

            /**
             * @override
             */
            setup: function(entity) {

                this.parent(entity);

                if (ig.game.camera && this.targetSequence.length > 0) {

                    this._followed = this._followDelaying = false;
                    this.targetsToFollow = this.targetSequence.slice(0);

                    ig.game.camera.onTransitioned.add(this.followNext, this);

                    if (this.pausing) {

                        ig.game.pause(true);

                        ig.game.camera.unpause();

                        this.unpause();

                    }

                    this.followNext(true);

                }

            },

            /**
             * @override
             */
            teardown: function(entity) {

                this.parent(entity);

                if (ig.game.camera) {

                    ig.game.camera.onTransitioned.remove(this.followNext, this);

                    if (ig.game.camera.entity === this.following) {

                        ig.game.camera.unfollow();

                    }

                    this.targetsToFollow.length = 0;
                    this._followDelaying = false;
                    this.following = null;

                    if (this.pausing) {

                        ig.game.unpause(true);

                    }

                }

            },

            /**
             * Follows next target.
             * @param {Boolean} [withoutDelay=false] whether to skip delay.
             */
            followNext: function(withoutDelay) {

                if (!withoutDelay && !this._followDelaying && this.followDelay) {

                    this._followDelaying = true;
                    this.followDelayTimer.set(this.followDelay);

                } else {

                    this._followDelaying = false;

                    if (ig.game.camera && this.targetsToFollow.length > 0) {

                        this.following = this.targetsToFollow.shift();

                        ig.game.camera.follow(this.following, false, true);

                    } else {

                        this._followed = true;
                        this.complete();

                    }

                }

            },

            /**
             * @override
             **/
            pause: function() {

                this.parent();

                this.followDelayTimer.pause();

            },

            /**
             * @override
             **/
            unpause: function() {

                this.parent();

                this.followDelayTimer.unpause();

            },

            /**
             * @override
             */
            update: function() {

                this.parent();

                if (!this._followed && this._followDelaying && this.followDelayTimer.delta() >= 0) {

                    this.followNext();

                }

            }

        });

    });
