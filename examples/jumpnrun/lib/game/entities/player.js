/** 
 * Players might need some basic functionality
 * like input handling, camera following, etc
 * to take advantage of these extend ig.Player
 */
ig.module(
    'game.entities.player'
)
    .requires(
        // note that anything in abstractities
        // is an abstract entity that needs to be extended
        'plusplus.abstractities.player',
        // require the shooting abilities
        'game.abilities.grenade-launcher',
        'game.abilities.laser-gun',
        // require the glow ability
        // lets see some lights!
        'plusplus.abilities.glow',
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

        ig.EntityPlayer = ig.global.EntityPlayer = ig.Player.extend({

            size: _c.TOP_DOWN ? {
                x: 8,
                y: 8
            } : {
                x: 8,
                y: 14
            },
            offset: _c.TOP_DOWN ? {
                x: 4,
                y: 4
            } : {
                x: 4,
                y: 2
            },

            // animations the Impact++ way
            // note that these animations are for
            // both side scrolling and top down mode
            // you will likely only need one or the other
            // so your animSettings will be much simpler

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'player.png', 16, 16),

            animInit: _c.TOP_DOWN ? "moveX" : "idleX",

            // for example, a sidescroller's animSettings
            // will only use idleX, jumpX, fallX, moveX, shootX, and deathX
            // while a top down where entities can flip on X and Y
            // will use idleX/Y, moveX/Y, shootX/Y, and deathX/Y
            // but if the entities CANNOT flip on X and Y
            // will use idleLeft/Right/Up/Down, moveLeft/Right/Up/Down,
            // shootLeft/Right/Up/Down, and deathLeft/Right/Up/Down

            animSettings: {
                idleX: {
                    frameTime: 1,
                    sequence: _c.TOP_DOWN ? [21] : [0]
                },
                idleLeft: {
                    frameTime: 1,
                    sequence: [18]
                },
                idleRight: {
                    frameTime: 1,
                    sequence: [21]
                },
                idleY: {
                    frameTime: 1,
                    sequence: [12]
                },
                idleUp: {
                    frameTime: 1,
                    sequence: [15]
                },
                idleDown: {
                    frameTime: 1,
                    sequence: [12]
                },
                jumpX: {
                    frameTime: 0.1,
                    sequence: [8, 9]
                },
                fallX: {
                    frameTime: 0.4,
                    sequence: [6, 7]
                },
                moveX: {
                    frameTime: 0.07,
                    sequence: _c.TOP_DOWN ? [21, 22, 23, 22] : [0, 1, 2, 3, 4, 5]
                },
                moveLeft: {
                    frameTime: 0.07,
                    sequence: [18, 19, 20, 19]
                },
                moveRight: {
                    frameTime: 0.07,
                    sequence: [21, 22, 23, 22]
                },
                moveY: {
                    frameTime: 0.07,
                    sequence: [12, 13, 14, 13]
                },
                moveDown: {
                    frameTime: 0.07,
                    sequence: [12, 13, 14, 13]
                },
                moveUp: {
                    frameTime: 0.07,
                    sequence: [15, 16, 17, 16]
                },
                shootX: {
                    frameTime: 0.25,
                    sequence: _c.TOP_DOWN ? [26] : [2]
                },
                shootRight: {
                    frameTime: 0.25,
                    sequence: [26]
                },
                shootLeft: {
                    frameTime: 0.25,
                    sequence: [27]
                },
                shootY: {
                    frameTime: 0.25,
                    sequence: [24]
                },
                shootDown: {
                    frameTime: 0.25,
                    sequence: [24]
                },
                shootUp: {
                    frameTime: 0.25,
                    sequence: [25]
                },
                deathX: {
                    frameTime: 0.1,
                    sequence: _c.TOP_DOWN ? [29] : [10, 11]
                },
                deathLeft: {
                    frameTime: 0.1,
                    sequence: [29]
                },
                deathRight: {
                    frameTime: 0.1,
                    sequence: [29]
                },
                deathY: {
                    frameTime: 0.1,
                    sequence: [28]
                },
                deathDown: {
                    frameTime: 0.1,
                    sequence: [28]
                },
                deathUp: {
                    frameTime: 0.1,
                    sequence: [28]
                }
            },

            // stats

            health: 10,
            energy: 10,

            regen: true,
            regenHealth: false,
            regenRateEnergy: 0.1,

            // settings for glow

            glowSettings: {
                // these directly correlate
                // to ig.Entity light properties
                light: {
                    // the light should move with player
                    performance: ig.EntityExtended.PERFORMANCE.MOVABLE,
                    // cast shadows only on static entities
                    castsShadows: true
                }
            },

            // use this method to add properties
            // that need to be initialized one time
            // before the entity is added to the game

            initProperties: function() {

                this.parent();

                this.glow = new ig.AbilityGlow(this);
                this.shoot = new ig.LaserGun(this);
                this.grenade = new ig.GrenadeLauncher(this);

                this.abilities.addDescendants([
                    this.glow, this.shoot, this.grenade
                ]);

            },

            // use this method to handle inputs

            handleInput: function() {

                var shootX;
                var shootY;

                // check if shooting

                if (ig.input.pressed('shoot')) {

                    if (_c.TOP_DOWN) {

                        if (this.facing.x !== 0) {

                            shootX = this.facing.x > 0 ? this.pos.x + this.size.x : this.pos.x;

                        } else {

                            shootX = this.pos.x + this.size.x * 0.5;

                        }

                        if (this.facing.y !== 0) {

                            shootY = this.facing.y > 0 ? this.pos.y + this.size.y : this.pos.y;

                        } else {

                            shootY = this.pos.y + this.size.y * 0.5;

                        }

                    } else {

                        shootX = this.flip.x ? this.pos.x : this.pos.x + this.size.x;
                        shootY = this.pos.y + this.size.y * 0.5;

                    }

                    this.shoot.activate({
                        x: shootX,
                        y: shootY
                    });

                }

                // check if grenading

                if (ig.input.pressed('grenade') || ig.input.released('tap')) {

                    if (_c.TOP_DOWN) {

                        if (this.facing.x !== 0) {

                            shootX = this.facing.x > 0 ? this.pos.x + this.size.x : this.pos.x;

                        } else {

                            shootX = this.pos.x + this.size.x * 0.5;

                        }

                        if (this.facing.y !== 0) {

                            shootY = this.facing.y > 0 ? this.pos.y + this.size.y : this.pos.y;

                        } else {

                            shootY = this.pos.y + this.size.y * 0.5;

                        }

                    } else {

                        shootX = this.flip.x ? this.pos.x : this.pos.x + this.size.x;
                        shootY = this.pos.y + this.size.y * 0.5;

                    }

                    this.grenade.activate({
                        x: shootX,
                        y: shootY
                    });

                }

                // swipe to jump

                if (ig.input.state('swipe')) {

                    // find all inputs that are swiping

                    var inputPoints = ig.input.getInputPoints(['swiping'], [true]);

                    for (var i = 0, il = inputPoints.length; i < il; i++) {

                        var inputPoint = inputPoints[i];

                        if (inputPoint.swipingUp) {

                            this.jump();

                        }

                    }

                }

                this.parent();

            }

        });

    });
