ig.module(
        'plusplus.abilities.ability-shoot'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.input',
        'plusplus.abilities.ability'
    )
    .defines(function () {
        "use strict";
		
		var _c = ig.CONFIG;

        /**
         * Ability to shoot projectiles. For instant damage, use {@link ig.AbilityDamage} instead.
         * @class
         * @extends ig.Ability
         * @author Collin Hover - collinhover.com
         * @example
         * // shooting things is easy
         * // each character already has an abilities list
         * // which is a special hierarchy object
         * // that has built in methods to facilitate ability use
         * character.abilities = new ig.Hierarchy();
         * // but this abilities list is empty
         * // so create a new shoot ability
         * // and don't forget to pass the entity
         * // so the ability has a reference to its user
         * character.shoot = new ig.AbilityShoot( character );
         * // unlike some other abilities
         * // the shoot ability won't work out of the box
         * // it needs a projectile entity class
         * // so lets make a new one
         * ig.EntityBullet = ig.global.EntityBullet = ig.Projectile.extend({
         *      size: { x: 10, y: 6 },
         *      animSheet: new ig.AnimationSheet( ig.CONFIG.PATH_TO_MEDIA + 'bullet.png', 10, 6),
         *      damage: 10
         * });
         * // and set it as our shoot ability's spawningEntity
         * character.shoot.spawningEntity = ig.EntityBullet;
         * // then, optionally, add the ability
         * // to the character's ability list
         * character.abilities.addDescendant( character.shoot );
         * // now when our character needs to get violent
         * // and really shoot something
         * character.shoot.execute();
         * // but we also want to control where the bullet fires
         * var shootSettings = { offsetX: -10, offsetY: 0 };
         * // it can accelerate towards our offset
         * character.shoot.offsetAccelX = 1;
         * character.shoot.offsetAccelY = 1;
         * // it can also start with a velocity towards our offset
         * character.shoot.offsetVelX = 1;
         * character.shoot.offsetVelY = 1;
         * // and now, when we shoot, the projectile
         * // should go towards the left
         * character.shoot.execute( shootSettings );
         * // or instead of defining the offset in the settings
         * // we can give the ability the player's tapping input
         * // and it will figure out the offset direction for us
         * // so lets get all input points that have tapped
         * var inputPoints = ig.input.getInputPoints([ 'tapped' ], [ true ]);
         * // for the example, use only the first
         * var inputPoint = inputPoints[ 0 ];
         * if ( inputPoint ) {
         *      // and give it to the shoot ability
         *      character.shoot.execute(inputPoint);
         * }
         **/
        ig.AbilityShoot = ig.Ability.extend(/**@lends ig.AbilityShoot.prototype */{

            /**
             * Type of projectile to spawn.
             * @type String|ig.EntityExtended
             */
            spawningEntity: '',

            /**
             * Minimum position on y axis, as a percent from 0 to 1, from left of entity that a projectile can be fired from.
             * @type Number
             * @default
             */
            shootLocationMinPctX: 0,

            /**
             * Maximum position on y axis, as a percent from 0 to 1, from left of entity that a projectile can be fired from.
             * @type Number
             * @default
             */
            shootLocationMaxPctX: 1,

            /**
             * Minimum position on x axis, as a percent from 0 to 1, from top of entity that a projectile can be fired from.
             * @type Number
             * @default
             */
            shootLocationMinPctY: _c.TOP_DOWN ? 0 : 0.5,

            /**
             * Maximum position on x axis, as a percent from 0 to 1, from top of entity that a projectile can be fired from.
             * @type Number
             * @default
             */
            shootLocationMaxPctY: _c.TOP_DOWN ? 1 : 0.5,

            /**
             * Horizontal acceleration of projectile in offset direction.
             * @type Number
             * @default
             */
            offsetAccelX: 0,

            /**
             * Vertical acceleration of projectile in offset direction.
             * @type Number
             * @default
             */
            offsetAccelY: 0,

            /**
             * Horizontal velocity of projectile in offset direction.
             * @type Number
             * @default
             */
            offsetVelX: 0,

            /**
             * Vertical velocity of projectile in offset direction.
             * @type Number
             * @default
             */
            offsetVelY: 0,

            /**
             * Percent user's horizontal velocity to add to projectile, where 1 = 100%.
             * @type Number
             * @default
             */
            relativeVelPctX: 0,

            /**
             * Percent user's vertical velocity to add to projectile, where 1 = 100%.
             * @type Number
             * @default
             */
            relativeVelPctY: 0,

            /**
             * Cast activate by animation 'shoot' while moving.
             * @override
             */
            activateCastSettings: {
                animName: 'shoot',
                moving: true
            },

            /**
             * Creates projectile and handles application of settings.
             * @param {Object} settings settings object.
             * @override
             **/
            activate: function (settings) {

                settings = settings || {};
				
				var minX = this.entity.pos.x;
				var minY = this.entity.pos.y;
				var width = this.entity.size.x;
				var height = this.entity.size.y;
				var centerX = minX + width * 0.5;
				var centerY = minY + height * 0.5;

                var entityOptions = this.entityOptions || this.entity;

                // add entity group to projectile settings so we don't hit own group with projectile

                var ps = {
                    group: this.entity.group
                };

                // merge settings

                if (entityOptions.projectileSettings) {

                    ig.merge(ps, entityOptions.projectileSettings);

                }

                if (settings.projectileSettings) {

                    ig.merge(ps, settings.projectileSettings);

                }
				
                var projectile = ig.game.spawnEntity(this.spawningEntity, centerX, centerY, ps);

                // reposition
				
				var shootX = centerX;
				var shootY = centerY;

                // offset

                if (settings) {

                    var offsetX = settings.offsetX || 0;
                    var offsetY = settings.offsetY || 0;
                    var length;
                    var normalX;
                    var normalY;

                    if (!offsetX && !offsetY) {

                        var x;
                        var y;

                        if (settings instanceof ig.InputPoint) {

                            x = settings.worldX || 0;
                            y = settings.worldY || 0;

                        }
                        else {

                            x = settings.x || 0;
                            y = settings.y || 0;

                        }

						var diffX = x - centerX;
						var diffY = y - centerY;
						length = Math.sqrt(diffX * diffX + diffY * diffY);
						normalX = diffX / length;
						normalY = diffY / length;

						offsetX = normalX * width * 0.5;
						offsetY = normalY * height * 0.5;
						
                    }

                    length = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

                    // offset x

                    if (offsetX) {

                        shootX += offsetX;
                        normalX = offsetX / length;
						
						// check velocity base
						
						if ( ( offsetX > 0 && projectile.vel.x < 0 ) || ( offsetX < 0 && projectile.vel.x > 0 ) ) {
							
							projectile.vel.x = -projectile.vel.x;
							
						}

                        // offset accel

                        if (this.offsetAccelX) {

                            projectile.accel.x += this.offsetAccelX * normalX;

                        }

                        // offset velocity

                        if (this.offsetVelX) {

                            projectile.vel.x += this.offsetVelX * normalX;

                        }

                    }

                    // offset y

                    if (offsetY) {

                        shootY += offsetY;
                        normalY = offsetY / length;
						
						// check velocity base
						
						if ( ( offsetY > 0 && projectile.vel.y < 0 ) || ( offsetY < 0 && projectile.vel.y > 0 ) ) {
							
							projectile.vel.x = -projectile.vel.y;
							
						}

                        // offset accel

                        if (this.offsetAccelX) {

                            projectile.accel.y += this.offsetAccelX * normalY;

                        }

                        // offset velocity

                        if (this.offsetVelY) {

                            projectile.vel.y += this.offsetVelY * normalY;

                        }

                    }

                }

                // add velocity of entity

                if (this.relativeVelPctX) {

                    projectile.vel.x += this.entity.vel.x * this.relativeVelPctX;

                }

                if (this.relativeVelPctY) {

                    projectile.vel.y += this.entity.vel.y * this.relativeVelPctY;

                }
				
				// constrain projectile location
				
				projectile.pos.x = shootX.limit( minX + width * this.shootLocationMinPctX, minX + width * this.shootLocationMaxPctX ) - projectile.size.x * 0.5;
				projectile.pos.y = shootY.limit( minY + height * this.shootLocationMinPctY, minY + height * this.shootLocationMaxPctY ) - projectile.size.y * 0.5;
				
                // flip entity to projectile

                this.entity.lookAt(projectile);

                this.parent();

                return projectile;

            },

            /**
             * @override
             **/
            clone: function (c) {

                if (c instanceof ig.AbilityShoot !== true) {

                    c = new ig.AbilityShoot();

                }

                c.spawningEntity = this.spawningEntity;

                return this.parent(c);

            }

        });

    });