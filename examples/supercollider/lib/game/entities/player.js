ig.module(
    'game.entities.player'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.player',
        'game.abilities.mimic-casted',
        'game.abilities.laser-gun',
        'game.abilities.grenade-launcher',
        'plusplus.abilities.melee',
        'plusplus.ui.ui-meter',
        'plusplus.ui.ui-tracker',
        'plusplus.ui.ui-toggle-pause'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Player character entity.
         * @class
         * @extends ig.Player
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityPlayer = ig.global.EntityPlayer = ig.Player.extend({

            // animation

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'player.png', _c.CHARACTER.SIZE_X, _c.CHARACTER.SIZE_Y),

            // animation settings

            animInit: "idleX",

            animSettings: {
                idleX: {
                    sequence: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4
                    ],
                    frameTime: 0.1
                },
                deathX: {
                    sequence: [6, 7, 8],
                    frameTime: 0.05
                },
                spawnX: {
                    sequence: [11, 10, 9, 8, 7, 6],
                    frameTime: 0.1
                },
                moveX: {
                    sequence: [12, 13, 14, 15, 16, 17],
                    frameTime: 0.1
                },
                jumpX: {
                    sequence: [16, 18, 19],
                    frameTime: 0.05,
                    // animation specific shadow casting!
                    // i.e. when playing this animation
                    // shadows will be cast using the base size
                    // with these offsets
                    // (also used in other animations)
                    opaqueOffset: {
                        left: 6,
                        right: -6,
                        top: 0,
                        bottom: -5
                    }
                },
                fallX: {
                    sequence: [20, 21],
                    frameTime: 0.1
                },
                climbX: {
                    sequence: [24, 25, 26, 27, 28, 29],
                    frameTime: 0.1,
                    opaqueOffset: {
                        left: 6,
                        right: -6,
                        top: -3,
                        bottom: -9
                    }
                },
                stairsX: {
                    sequence: [22, 23],
                    frameTime: 0.15
                },
                talkX: {
                    sequence: [0],
                    frameTime: 1
                },
                listenX: {
                    sequence: [0],
                    frameTime: 1
                },
                meleeX: {
                    sequence: [30, 31],
                    frameTime: 0.1,
                    opaqueOffset: {
                        left: 6,
                        right: -6,
                        top: 2,
                        bottom: 3
                    }
                },
                shootX: {
                    sequence: [32, 33, 32],
                    frameTime: 0.1
                },
                mimicSetupX: {
                    sequence: [32, 33],
                    frameTime: 0.1
                },
                mimicPassX: {
                    sequence: [34, 35],
                    frameTime: 0.1
                },
                mimicFailX: {
                    sequence: [34, 35, 33, 33, 32],
                    frameTime: 0.1
                },
                mimicActivateX: {
                    sequence: [6, 7, 8, 7, 6],
                    frameTime: 0.1
                },
                mimicDeactivateX: {
                    sequence: [32, 33, 32],
                    frameTime: 0.1
                }
            },

            // player casts shadows

            opaque: true,

            // general shadow casting
            // i.e. when playing any animation
            // shadows will be cast using the base size
            // with these offsets

            opaqueOffset: {
                left: 6,
                right: -6,
                top: -1,
                bottom: 3
            },

            // player stats

            health: 10,
            energy: 10,

            // player regenerates energy

            regen: true,
            regenEnergy: true,
            regenRateEnergy: 0.1,

            // can also regenerate health
            // but many times you don't want this
            // except at checkpoints

            //regenHealth: true,
            //regenRateHealth: 0.1,

            // by default, the player is persistent
            // the first time the game encounters a persistent entity
            // it will store it for the rest of the game
            // any time that entity is spawned
            // whether by being placed in the editor or manually
            // the game will use the stored entity instead
            // (you don't need to set persistent for the player)
            // (it is only used here to explain the concept)

            persistent: true,

            // a simple object to store player UI

            ui: {},

            /**
             * @override
             */
            initProperties: function() {

                this.parent();

                // don't add abilities when in editor

                if (!ig.global.wm) {

                    // some basic fighting abilities

                    this.abilityMelee = new ig.AbilityMelee(this, {
                        // note the name, so we can reference it
                        // however, name is not the only way to reference
                        // you can also get an ability by type
                        name: 'melee',
                        // note disabled, we will enable them via triggers later
                        enabled: false
                    });
                    this.abilityLaserGun = new ig.AbilityLaserGun(this, {
                        name: 'laserGun',
                        enabled: false
                    });
                    this.abilityGrenadeLauncher = new ig.AbilityGrenadeLauncher(this, {
                        name: 'grenadeLauncher',
                        enabled: false
                    });

                    // a mimic ability that allows us copy
                    // the abilities of other characters

                    this.abilityMimic = new ig.AbilityMimicCasted(this, {
                        name: 'mimic',
                        enabled: false
                    });

                    // add to the player's abilities list
                    // you do not need to store them as above
                    // simply adding them to the abilities list is enough

                    this.abilities.addDescendants([
                        this.abilityMelee,
                        this.abilityLaserGun,
                        this.abilityGrenadeLauncher,
                        this.abilityMimic
                    ]);

                }

            },

            /**
             * Whenever the player is activated, create the UI if it does not exist.
             * @override
             **/
            activate: function() {

                this.parent();

                if (!this._activeUI) {

                    this._activatingUI = true;

                    // pause / unpause button

                    if (!this.ui.pauseToggle) {

                        this.ui.pauseToggle = ig.game.spawnEntity(ig.UITogglePause, 0, 0, {
                            posPct: {
                                x: 1,
                                y: 0
                            },
                            align: {
                                x: 1,
                                y: 0
                            },
                            // by default margins are assumed to be a percent
                            marginAsPct: false,
                            margin: {
                                x: 15,
                                y: 15
                            }
                        });

                        // only create a single ui element
                        // this is for the demo only
                        // DO NOT DO THIS IN A GAME!

                        return;

                    }

                    // stat meters for health and energy

                    if (!this.ui.healthMeter) {

                        this.ui.healthMeter = ig.game.spawnEntity(ig.UIMeter, 0, 0, {
                            animSheetPath: 'icons_stats.png',
                            animSettings: true,
                            fillStyle: 'rgb(255,54,90)',
                            size: {
                                x: 8,
                                y: 8
                            },
                            // by default margins are assumed to be a percent
                            marginAsPct: false,
                            margin: {
                                x: 15,
                                y: 15
                            }
                        });

                        // only create a single ui element
                        // this is for the demo only
                        // DO NOT DO THIS IN A GAME!

                        return;

                    }

                    if (!this.ui.energyMeter) {

                        this.ui.energyMeter = ig.game.spawnEntity(ig.UIMeter, 0, 0, {
                            animSheetPath: 'icons_stats.png',
                            animTileOffset: 1,
                            animSettings: true,
                            fillStyle: 'rgb(69,170,255)',
                            size: {
                                x: 8,
                                y: 8
                            },
                            linkedTo: this.ui.healthMeter,
                            linkAlign: {
                                x: 0,
                                y: 1
                            },
                            // by default margins are assumed to be a percent
                            marginAsPct: false,
                            margin: {
                                x: 0,
                                y: 10
                            }
                        });

                        // only create a single ui element
                        // this is for the demo only
                        // DO NOT DO THIS IN A GAME!

                        return;

                    }

                    // a simple objective tracker
                    // whenever the villain is in the level
                    // this tracker will light up
                    // and if clicked or tapped
                    // it will show an arrow pointing to villain

                    if (!this.ui.tracker) {

                        this.ui.tracker = ig.game.spawnEntity(ig.UITracker, 0, 0, {
                            animSheetPath: 'icons_trackers.png',
                            animSheetWidth: 16,
                            animSheetHeight: 16,
                            animSettings: {
                                idleX: {
                                    sequence: [0]
                                },
                                trackingX: {
                                    sequence: [1]
                                }
                            },
                            // track a specifically named villain first
                            entityName: 'villainTracked',
                            // but if no named villain, track any
                            entityClass: 'EntityVillain',
                            frozen: false,
                            size: {
                                x: 16,
                                y: 16
                            },
                            linkedTo: this.ui.pauseToggle,
                            linkAlign: {
                                x: -1,
                                y: 0
                            },
                            // by default margins are assumed to be a percent
                            marginAsPct: false,
                            margin: {
                                x: 10,
                                y: 0
                            }
                        });

                    }

                    // all UI are active

                    this._activeUI = true;
                    this._activatingUI = false;

                }

            },

            /**
             * Whenever the player is deactivated, destroy the UI if it does exist.
             * @override
             **/
            deactivate: function() {

                this.parent();

                if (this._activatingUI || this._activeUI) {

                    this._activeUI = this._activatingUI = false;

                    // remove UI from the game

                    if (this.ui.healthMeter) {

                        ig.game.removeEntity(this.ui.healthMeter);
                        this.ui.healthMeter = null;

                    }
                    if (this.ui.energyMeter) {

                        ig.game.removeEntity(this.ui.energyMeter);
                        this.ui.energyMeter = null;

                    }
                    if (this.ui.pauseToggle) {

                        ig.game.removeEntity(this.ui.pauseToggle);
                        this.ui.pauseToggle = null;

                    }
                    if (this.ui.tracker) {

                        ig.game.removeEntity(this.ui.tracker);
                        this.ui.tracker = null;

                    }

                }

            },

            /**
             * @override
             **/
            receiveDamage: function(amount, from, unblockable) {

                var killed = this._killed;
                var applied = this.parent(amount, from, unblockable);

                if (!killed && applied && this.ui.healthMeter) {

                    this.ui.healthMeter.setMeterValue(this.health / this.healthMax);

                }

                return applied;

            },

            /**
             * @override
             **/
            receiveHealing: function(amount, from) {

                this.parent(amount, from);

                if (!this._killed && this.ui.healthMeter) {

                    this.ui.healthMeter.setMeterValue(this.health / this.healthMax);

                }

            },

            /**
             * @override
             **/
            drainEnergy: function(amount, from, unblockable) {

                var killed = this._killed;
                var applied = this.parent(amount, from, unblockable);

                if (!killed && applied && this.ui.energyMeter) {

                    this.ui.energyMeter.setMeterValue(this.energy / this.energyMax);

                }

            },

            /**
             * @override
             **/
            receiveEnergy: function(amount, from) {

                this.parent(amount, from);

                if (!this._killed && this.ui.energyMeter) {

                    this.ui.energyMeter.setMeterValue(this.energy / this.energyMax);

                }

            },

            /**
             * Adds swipe handling to original player input response.
             * @override
             **/
            handleInput: function() {

                var i, il;
                var inputPoints;
                var inputPoint;

                // when tapping

                if (ig.input.released('tap')) {

                    // find and check all input points that are tapped

                    var abs = this.abilities.getDescendantsByType(ig.Ability.TYPE.SPAMMABLE);

                    if (abs.length > 0) {

                        inputPoints = ig.input.getInputPoints(['tapped'], [true]);

                        for (i = 0, il = inputPoints.length; i < il; i++) {

                            inputPoint = inputPoints[i];

                            if (inputPoint.targets) {

                                for (var j = 0, jl = abs.length; j < jl; j++) {

                                    var ab = abs[j];

                                    ab.setEntityTargetFirst(inputPoint.targets);
                                    ab.activate({
                                        x: inputPoint.worldX,
                                        y: inputPoint.worldY
                                    });

                                }

                            }

                        }

                    }

                }

                // when swiping

                if (ig.input.state('swipe')) {

                    // find and check all input points that are swiping

                    inputPoints = ig.input.getInputPoints(['swiping'], [true]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[i];

                        if (inputPoint.swipingUp) {

                            this.jump();

                        }

                    }

                }

                this.parent();

            },

            /**
             * When game is reset and player is cleared from persistent cache, we need to make sure we remove all persistent additions such as UI.
             * @override
             */
            cleanupPersistent: function() {

                this.deactivate();

            }

        });

    });
