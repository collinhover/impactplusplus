ig.module(
        'plusplus.abilities.interact'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abilities.ability',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Ability for interacting with interactive entities such as switches, levers, doors, etc, only when close enough.
         * <span class="alert"><strong>IMPORTANT:</strong> interaction only works on entities with {@link ig.EntityExtended#type} of {@link ig.EntityExtended.TYPE.INTERACTIVE}.</span>
         * @class
         * @extends ig.Ability
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityInteract = ig.Ability.extend(/**@lends ig.AbilityInteract.prototype */{

            /**
             * Range is based on effective size of the base character.
             * @type Number
             * @see ig.CONFIG.ENTITY
             */
            rangeX: _c.CHARACTER.SIZE_EFFECTIVE_X,

            /**
             * Range is based on effective size of the base character.
             * @type Number
             * @see ig.CONFIG.ENTITY
             */
            rangeY: _c.CHARACTER.SIZE_EFFECTIVE_Y * 0.5,

            /**
             * Ability needs target.
             * @type Boolean
             * @default
             */
            requiresTarget: true,

            /**
             * Ability can't find target automatically.
             * @type Boolean
             * @default
             */
            canFindTarget: false,

            /**
             * Ability can't target self.
             * @type Boolean
             * @default
             */
            canTargetSelf: false,

            /**
             * Initializes interact types.
             * <br>- adds {@link ig.Ability.TYPE.INTERACT} to {@link ig.Ability#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.INTERACTIVE} to {@link ig.Ability#typeTargetable}
             * @override
             **/
            initTypes: function () {

                this.parent();

                // type

                _ut.addType(ig.Ability, this, 'type', "INTERACT");

                // able to target interactive

                _ut.addType(ig.EntityExtended, this, 'typeTargetable', "INTERACTIVE");

            },

            /**
             * @override
             **/
            activate: function () {

                this.entityTarget.toggleActivate(this.entity);

                this.parent();

            }

        });

    });