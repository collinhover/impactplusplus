ig.module(
        'game.abilities.laser-gun'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abilities.ability-shoot',
        'game.entities.projectile-laser',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Laser gun ability.
         * @class
         * @extends ig.AbilityShoot
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityLaserGun = ig.AbilityShoot.extend( {

            // this ability spawns a laser beam

            spawningEntity: ig.EntityProjectileLaser,

            // velocity towards offset direction

            offsetVelX: 200,
            offsetVelY: _c.TOP_DOWN ? 200 : 0,

            // use this method to add types for checks
            // since we are using bitwise flags
            // we can take advantage of the fact that they can be added

            initTypes: function () {

                this.parent();

                _ut.addType(ig.Ability, this, 'type', "SPAMMABLE");

            }

        } );

    });