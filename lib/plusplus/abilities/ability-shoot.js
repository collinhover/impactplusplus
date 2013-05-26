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

                var centerX = this.entity.getCenterX();
                var centerY = this.entity.getCenterY();

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