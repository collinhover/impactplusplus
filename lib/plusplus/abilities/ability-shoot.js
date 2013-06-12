ig.module(
        'plusplus.abilities.ability-shoot'
    )
    .requires(
        'plusplus.core.input',
        'plusplus.abilities.ability'
    )
    .defines(function () {
        "use strict";

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
             * Creates projectile and handles application of settings.
             * @param {Object} settings settings object.
             * @override
             **/
            activate: function (settings) {

                settings = settings || {};

                var centerX = this.entity.bounds.minX + this.entity.bounds.width * 0.5;
                var centerY = this.entity.bounds.minY + this.entity.bounds.height * 0.5;

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

                // center

                projectile.pos.x -= projectile.size.x * 0.5;
                projectile.pos.y -= projectile.size.y * 0.5;

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

                            x = settings.worldX;
                            y = settings.worldY;

                        }
                        else {

                            x = settings.x || 0;
                            y = settings.y || 0;

                        }

                        if (x && y) {

                            var diffX = x - centerX;
                            var diffY = y - centerY;
                            length = Math.sqrt(diffX * diffX + diffY * diffY);
                            normalX = diffX / length;
                            normalY = diffY / length;

                            offsetX = normalX * this.entity.bounds.width * 0.5;
                            offsetY = normalY * this.entity.bounds.height * 0.5;

                        }

                    }

                    length = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

                    // offset x

                    if (offsetX) {

                        projectile.pos.x += offsetX;
                        normalX = offsetX / length;

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

                        projectile.pos.y += offsetY;
                        normalY = offsetY / length;

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

                // flip entity to projectile

                this.lookAt(projectile);

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