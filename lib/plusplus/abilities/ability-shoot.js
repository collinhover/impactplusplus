ig.module(
    'plusplus.abilities.ability-shoot'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.input',
        'plusplus.abilities.ability',
        'plusplus.helpers.utilsmath'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _utm = ig.utilsmath;

        /**
         * Ability to shoot projectiles. For instant damage, use {@link ig.AbilityDamage} instead.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> always use abilities by calling the {@link ig.Ability#activate} method, and if the ability {@link ig.Ability#requiresTarget} make sure it {@link ig.Ability#canFindTarget} or you supply one via {@link ig.Ability#setEntityTarget} or {@link ig.Ability#setEntityTargetFirst}!</span>
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
         * character.shoot.activate();
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
         * character.shoot.activate( shootSettings );
         * // or instead of defining the offset in the settings
         * // we can give the ability the player's tapping input
         * // and it will figure out the offset direction for us
         * // so lets get all input points that have tapped
         * var inputPoints = ig.input.getInputPoints([ 'tapped' ], [ true ]);
         * // for the example, use only the first
         * var inputPoint = inputPoints[ 0 ];
         * if ( inputPoint ) {
         *      // and give it to the shoot ability
         *      character.shoot.activate(inputPoint);
         * }
         * // in the case of the player
         * // if you want the shoot to automatically work with tapping
         * // in other words, you won't need to bother with input points
         * // just set the ability type to spammable (don't forget to require ig.utils)
         * ig.AbilityShootThings = ig.AbilityShoot.extend({
         *      initTypes: function () {
         *          this.parent();
         *          ig.utils.addType(ig.Ability, this, 'type', "SPAMMABLE");
         *      }
         * });
         **/
        ig.AbilityShoot = ig.Ability.extend( /**@lends ig.AbilityShoot.prototype */ {

            /**
             * Type of projectile to spawn.
             * @type String|ig.EntityExtended
             */
            spawningEntity: '',

            /**
             * Ability can be done while moving.
             * @override
             * @default
             */
            movable: true,

            /**
             * Whether to spawn at entity or at target position.
             * @type Boolean
             * @default
             */
            spawnAtTarget: false,

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
                animName: 'shoot'
            },

            /**
             * Creates projectile and handles application of settings.
             * @param {Object} settings settings object.
             * @override
             **/
            activateComplete: function(settings) {

                var entityOptions = this.entityOptions || this.entity;

                // add entity group to projectile settings so we don't hit own group with projectile

                var ps = {
                    group: this.entity.group
                };

                // merge settings

                if (entityOptions.projectileSettings) {

                    ig.merge(ps, entityOptions.projectileSettings);

                }

                var minX;
                var minY;
                var width;
                var height;
                var x;
                var y;

                if (this.spawnAtTarget && this.entityTarget) {

                    minX = this.entityTarget.pos.x;
                    minY = this.entityTarget.pos.y;
                    width = this.entityTarget.size.x;
                    height = this.entityTarget.size.y;

                } else {

                    minX = this.entity.pos.x;
                    minY = this.entity.pos.y;
                    width = this.entity.size.x;
                    height = this.entity.size.y;

                }

                x = minX + width * 0.5;
                y = minY + height * 0.5;

                if (settings) {

                    if (settings.projectileSettings) {

                        ig.merge(ps, settings.projectileSettings);

                    }

                    var offsetX = settings.offsetX || 0;
                    var offsetY = settings.offsetY || 0;
                    var length;
                    var diffX;
                    var diffY;

                    if (!offsetX && !offsetY) {

                        var targetX;
                        var targetY;

                        if (settings instanceof ig.InputPoint) {

                            targetX = settings.worldX || 0;
                            targetY = settings.worldY || 0;

                        } else {

                            targetX = settings.x || 0;
                            targetY = settings.y || 0;

                        }

                        var diffX = targetX - x;
                        var diffY = targetY - y;
                        length = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
                        offsetX = (diffX / length) * width * 0.5;
                        offsetY = (diffY / length) * height * 0.5;

                    }

                    if (this.spawnAtTarget && !this.entityTarget) {

                        x = minX = targetX;
                        y = minY = targetY;
                        width = height = 0;

                    }

                    x += offsetX;
                    y += offsetY;

                    var offsetDiffX = targetX - x;
                    if (!diffX || (diffX < 0 && offsetDiffX < 0) || (diffX > 0 && offsetDiffX > 0)) {
                        diffX = offsetDiffX;
                    }
                    var offsetDiffY = targetY - y;
                    if (!diffY || (diffY < 0 && offsetDiffY < 0) || (diffY > 0 && offsetDiffY > 0)) {
                        diffY = offsetDiffY;
                    }

                    length = Math.sqrt(diffX * diffX + diffY * diffY) || 1;

                    var normalX = diffX / length;
                    var normalY = diffY / length;

                }

                x = _utm.clamp(x, minX + width * this.shootLocationMinPctX, minX + width * this.shootLocationMaxPctX);
                y = _utm.clamp(y, minY + height * this.shootLocationMinPctY, minY + height * this.shootLocationMaxPctY);

                var projectile = ig.game.spawnEntity(this.spawningEntity, x, y, ps);

                projectile.pos.x -= projectile.size.x * 0.5;
                projectile.pos.y -= projectile.size.y * 0.5;

                // offset x

                if (offsetX) {

                    // check velocity base

                    if ((offsetX > 0 && projectile.vel.x < 0) || (offsetX < 0 && projectile.vel.x > 0)) {

                        projectile.vel.x = -projectile.vel.x;

                    }

                    // offset accel

                    if (this.offsetAccelX) {

                        projectile.accel.x += this.offsetAccelX * (this.offsetAccelY ? normalX : (normalX < 0 ? -1 : 1));

                    }

                    // offset velocity

                    if (this.offsetVelX) {

                        projectile.vel.x += this.offsetVelX * (this.offsetVelY ? normalX : (normalX < 0 ? -1 : 1));

                    }

                }

                // offset y

                if (offsetY) {

                    // check velocity base

                    if ((offsetY > 0 && projectile.vel.y < 0) || (offsetY < 0 && projectile.vel.y > 0)) {

                        projectile.vel.y = -projectile.vel.y;

                    }

                    // offset accel

                    if (this.offsetAccelY) {

                        projectile.accel.y += this.offsetAccelY * (this.offsetAccelX ? normalY : (normalY < 0 ? -1 : 1));

                    }

                    // offset velocity

                    if (this.offsetVelY) {

                        projectile.vel.y += this.offsetVelY * (this.offsetVelX ? normalY : (normalY < 0 ? -1 : 1));

                    }

                }

                // add velocity of entity

                if (this.relativeVelPctX) {

                    projectile.vel.x += this.entity.vel.x * this.relativeVelPctX;

                }

                if (this.relativeVelPctY && !this.entity.grounded) {

                    projectile.vel.y += this.entity.vel.y * this.relativeVelPctY;

                }

                // flip entity to projectile

                if (this.faceTarget) {

                    this.entity.lookAt(projectile);

                }

                this.parent();

                return projectile;

            },

            /**
             * @override
             **/
            clone: function(c) {

                if (c instanceof ig.AbilityShoot !== true) {

                    c = new ig.AbilityShoot();

                }

                c.spawningEntity = this.spawningEntity;

                return this.parent(c);

            }

        });

    });
