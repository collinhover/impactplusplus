/**
 * Laser gun ability.
 **/
ig.module(
    'game.abilities.laser-gun'
)
    .requires(
        // require the shoot ability
        'plusplus.abilities.ability-shoot',
        // require the projectile
        'game.entities.laser',
        // if you want to use the config
        // don't forget to require it
        'plusplus.core.config',
        // and some utils
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        ig.LaserGun = ig.AbilityShoot.extend({

            // this ability spawns a laser beam

            spawningEntity: ig.EntityLaser,

            // velocity towards offset direction

            offsetVelX: 200,
            offsetVelY: _c.TOP_DOWN ? 200 : 0

            // laser ability has no special type, so it won't activate on tap or hold

        });

    });
