ig.module(
        'plusplus.abstractities.projectile'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.particle',
        'plusplus.helpers.utils'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Base projectile entity.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Projectile = ig.Particle.extend(/**@lends ig.Projectile.prototype */{

            /**
             * Projectiles should not be affected by gravity so much.
             * @override
             * @default
             */
            gravityFactor: 0.1,

            /**
             * @override
             * @default
             */
            lifeDuration: 4,

            /**
             * @override
             * @default
             */
            fadeBeforeDeathDuration: 0,

            /**
             * @override
             * @default
             */
            randomVel: false,

            /**
             * @override
             * @default
             */
            randomDoubleVel: false,

            /**
             * @override
             * @default
             */
            randomFlip: false,

            /**
             * Damage done.
             * @type Number
             * @default
             */
            damage: 1,

            /**
             * Damage done is a percent of target's health.
             * @type Boolean
             * @default
             */
            damageAsPct: false,

            /**
             * Damage done cannot be blocked.
             * @type Boolean
             * @default
             */
            damageUnblockable: false,

            /**
             * Initializes projectile types.
             * <br>- adds {@link ig.EntityExtended.TYPE.DAMAGEABLE} to {@link ig.EntityExtended#checkAgainst}
             * @override
             */
            initProperties: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "DAMAGEABLE");

            },

            /**
             * @override
             **/
            resetExtras: function () {

                this.parent();
				
				// check all expected animations so we don't have to check while in game
				
				if ( !this._animsPlaceheld ) {
					
					this._animsPlaceheld = true;
					
					this.placeholdAnims();
					
				}
				
				// flip based on starting velocity
				
				if (_c.FLIP_Y) {
					
					this.flip.y = this.vel.y < 0 ? true : false;

				}
				
				this.flip.x = this.vel.x < 0 ? true : false;

            },
			
			/**
			 * Ensures all expected animations are present.
			 * <span class="alert"><strong>IMPORTANT:</strong> when an expected animation is missing, it is placeholded by the init anim or the current anim.</span>
			 **/
			placeholdAnims: function () {
				
				var anims = this.anims;
				var animPlaceholder;
				
				if (this.animInit instanceof ig.Animation ) {

                    animPlaceholder = animInit;

                }
                else if (this.animInit) {

                    animPlaceholder = anims[ this.animInit ];

                }
				else {
					
					animPlaceholder = anims[ 'idle' ] || this.currentAnim;
					
				}
				
				if ( animPlaceholder ) {
					
					if ( !anims.moveX ) {
						
						anims.moveX = animPlaceholder;
						
					}
					
					if ( !anims.moveY ) {
						
						anims.moveY = animPlaceholder;
						
					}
					
					if ( !anims.moveDown ) {
						
						anims.moveDown = animPlaceholder;
						
					}
					
					if ( !anims.moveUp ) {
						
						anims.moveUp = animPlaceholder;
						
					}
					
					if ( !anims.idle ) {
						
						anims.idle = animPlaceholder;
						
					}
					
				}
				
			},

            /**
             * Checks projectile to see if has hit an entity of type {@link ig.EntityExtended.TYPE.DAMAGEABLE}.
             * @override
             */
            check: function (entity) {

                this.parent(entity);

                // deal damage to colliding entity

                var damage;

                if (this.damageAsPct) {

                    damage = entity.health * this.damage;

                }
                else {

                    damage = this.damage;

                }

                entity.receiveDamage(damage, this, this.damageUnblockable);

                // kill self

                this.kill();

            },

            /**
             * Updates visible and current animation via {@link ig.Character#updateCurrentAnim}.
             * @override
             **/
            updateVisible: function () {

                if ( !this._killed ) {

                    this.updateCurrentAnim();

                }

                this.parent();

            },
			
            /**
             * Updates the current animation and flip based on the direction of travel.
             * @returns {Boolean} whether using non-idle animation
             **/
            updateCurrentAnim: function () {
				
				var anims = this.anims;

                if (this.performance === _c.DYNAMIC) {
					
					this.flip.x = this.vel.x < 0 ? true : false;
					
					// game in top down mode

                    if (_c.TOP_DOWN) {
						
						if (this.movingY) {
							
							// animations may be flipped vertical
							
                            if (_c.FLIP_Y) {
								
								this.currentAnim = anims.moveY;
								this.flip.y = this.vel.y < 0 ? true : false;

                            }
                            else if (this.vel.y > 0) {

								this.currentAnim = anims.moveDown;

							}
							else {

								this.currentAnim = anims.moveUp;

							}
							
							return;

                        }
                        else if (this.movingX) {
							
							this.currentAnim = anims.moveX;
							
							return;

                        }

                    }
                    else {
						
						if (_c.FLIP_Y) {
							
							this.flip.y = this.vel.y < 0 ? true : false;

						}
						
					}
					
				}

                if ( this.currentAnim !== anims.idle ) {

                    this.currentAnim = anims.idle;
                    this.currentAnim.playFromStart();

                }
				
			}

        });

    });