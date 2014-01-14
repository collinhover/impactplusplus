ig.module(
    'plusplus.abilities.ability-damage'
)
    .requires(
        'plusplus.core.entity',
        'plusplus.abilities.ability',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Ability for damaging instantly. For projectile damage, use {@link ig.AbilityShoot} instead.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> always use abilities by calling the {@link ig.Ability#activate} method, and if the ability {@link ig.Ability#requiresTarget} make sure it {@link ig.Ability#canFindTarget} or you supply one via {@link ig.Ability#setEntityTarget} or {@link ig.Ability#setEntityTargetFirst}!</span>
         * @class
         * @extends ig.Ability
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // please see ig.Ability for a full example
         **/
        ig.AbilityDamage = ig.Ability.extend( /**@lends ig.AbilityDamage.prototype*/ {

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
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'typeTargetable', "DAMAGEABLE");

            },

            /**
             * @override
             **/
            activateComplete: function() {

                var damage;

                if (this.damageAsPct) {

                    damage = this.entityTarget.health * this.damage;

                } else {

                    damage = this.damage;

                }

                this.entityTarget.receiveDamage(damage, this.entity, this.damageUnblockable);

                this.parent();

            },

            /**
             * @override
             **/
            clone: function(c) {

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
