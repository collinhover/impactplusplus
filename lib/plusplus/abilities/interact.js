ig.module(
    'plusplus.abilities.interact'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abilities.ability',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Ability for interacting with interactive entities such as switches, levers, doors, etc, only when close enough.
         * <span class="alert alert-info"><strong>Tip:</strong> interaction only works on entities with {@link ig.EntityExtended#type} of {@link ig.EntityExtended.TYPE.INTERACTIVE}.</span>
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> always use abilities by calling the {@link ig.Ability#activate} method, and if the ability {@link ig.Ability#requiresTarget} make sure it {@link ig.Ability#canFindTarget} or you supply one via {@link ig.Ability#setEntityTarget} or {@link ig.Ability#setEntityTargetFirst}!</span>
         * @class
         * @extends ig.Ability
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // the interact ability requires a target
         * // which can be set in a variety of ways
         * // we can have the player's interact find the closest target
         * player.abilityInteract.canFindTarget = true;
         * player.abilityInteract.activate();
         * // ( but this is probably not a good idea )
         * // we can use the ability on a specific target
         * player.abilityInteract.setEntityTarget( mySpecificTarget );
         * player.abilityInteract.activate();
         * // or, how about using the player's tap or click target
         * // get all input points that have tapped
         * var inputPoints = ig.input.getInputPoints([ 'tapped' ], [ true ]);
         * // for the example, use only the first input point
         * var inputPoint = inputPoints[ 0 ];
         * if ( inputPoint ) {
         *      // give the ability a list of targets under the tap
         *      // and let the ability choose the best
         *      player.abilityInteract.setEntityTargetFirst(inputPoint.targets);
         *      player.abilityInteract.activate();
         * }
         **/
        ig.AbilityInteract = ig.Ability.extend( /**@lends ig.AbilityInteract.prototype */ {

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
            initTypes: function() {

                this.parent();

                // type

                _ut.addType(ig.Ability, this, 'type', "INTERACT");

                // able to target interactive

                _ut.addType(ig.EntityExtended, this, 'typeTargetable', "INTERACTIVE");

            },

            /**
             * @override
             **/
            activateComplete: function() {

                this.entityTarget.toggleActivate(this.entity);

                this.parent();

            }

        });

    });
