ig.module(
        'plusplus.abstractities.projectile'
    )
    .requires(
        'plusplus.abstractities.particle',
        'plusplus.helpers.utils'
    )
    .defines(function () {

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

            }

        });

    });