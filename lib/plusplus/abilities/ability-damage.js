ig.module(
        'plusplus.abilities.ability-damage'
    )
    .requires(
        'plusplus.core.entity',
        'plusplus.abilities.ability',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Ability for damaging instantly. For projectile damage, use {@link ig.AbilityShoot} instead.
         * @class
         * @extends ig.Ability
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityDamage = ig.Ability.extend(/**@lends ig.AbilityDamage.prototype*/{

            /**
             * Damage done.
             * @type Number
             * @default
             */
            damage: 1,

            /**
             * Damage done in pct of target's health.
             * @type Boolean
             * @default
             */
            damageAsPct: false,

            /**
             * Force damage through all defenses.
             * @type Boolean
             * @default
             */
            damageUnblockable: false,

            /**
             * Damaging ability needs a target.
             * @type Boolean
             * @default
             */
            requiresTarget: true,

            /**
             * Damaging ability should not target self.
             * @type Boolean
             * @default
             */
            canTargetSelf: false,

            /**
             * Initializes damage types.
             * <br>- adds {@link ig.EntityExtended.TYPE.DAMAGEABLE} to {@link ig.Ability#typeTargetable}
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'typeTargetable', "DAMAGEABLE");

            },

            /**
             * @override
             **/
            activate: function () {

                var damage;

                if (this.damageAsPct) {

                    damage = this.entityTarget.health * this.damage;

                }
                else {

                    damage = this.damage;

                }

                this.entityTarget.receiveDamage(damage, this, this.damageUnblockable);

                this.parent();

            },

            /**
             * @override
             **/
            clone: function (c) {

                if (c instanceof ig.AbilityDamage !== true) {

                    c = new ig.AbilityDamage();

                }

                c.damage = this.damage;
                c.damageAsPct = this.damageAsPct;
                c.damageUnblockable = this.damageUnblockable;

                return this.parent(c);

            }

        });

    });