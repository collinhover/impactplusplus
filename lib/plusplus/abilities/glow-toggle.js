ig.module(
    'plusplus.abilities.glow-toggle'
)
    .requires(
        'plusplus.abilities.glow',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;

        /**
         * Ability to glow with light that can be toggled instead of passively on all the time.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> always use abilities by calling the {@link ig.Ability#activate} method, and if the ability {@link ig.Ability#requiresTarget} make sure it {@link ig.Ability#canFindTarget} or you supply one via {@link ig.Ability#setEntityTarget} or {@link ig.Ability#setEntityTargetFirst}!</span>
         * @class
         * @extends ig.AbilityGlow
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityGlowToggle = ig.AbilityGlow.extend( /**@lends ig.AbilityGlowToggle.prototype */ {

            /**
             * @override
             **/
            initTypes: function() {

                _ut.addType(ig.Ability, this, 'type', "TOGGLEABLE");

            },

            /**
             * @override
             **/
            clone: function(c) {

                if (c instanceof ig.AbilityGlowToggle !== true) {

                    c = new ig.AbilityGlowToggle();

                }

                return this.parent(c);

            }

        });

    });
