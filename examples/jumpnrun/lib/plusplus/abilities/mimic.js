ig.module(
        'plusplus.abilities.mimic'
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
         * Ability to mimic other abilities.
         * @class
         * @extends ig.Ability
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.AbilityMimic = ig.Ability.extend(/**@lends ig.AbilityMimic.prototype */{

            /**
             * Range is based on effective size of the base character.
             * @type Number
             * @default
             */
            rangeX: _c.CHARACTER.SIZE_EFFECTIVE_MIN * 2,

            /**
             * Range is based on effective size of the base character.
             * @type Number
             * @default
             */
            rangeY: _c.CHARACTER.SIZE_EFFECTIVE_MIN * 2,

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
             * How high of a mimic level this can mimic.
             * @type Number
             * @default
             */
            power: _c.RANKS_MAP[ "NONE" ],

            // internal properties, do not modify

            _mimickedEffect: false,

            /**
             * Initializes mimic types.
             * <br>- adds {@link ig.Ability.TYPE.MIMIC} to {@link ig.Ability#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.MIMICABLE} to {@link ig.Ability#typeTargetable}
             * @override
             **/
            initTypes: function () {

                this.parent();

                // types

                _ut.addType(ig.Ability, this, 'type', "MIMIC");

                // able to target mimicable

                _ut.addType(ig.EntityExtended, this, 'typeTargetable', "MIMICABLE");

            },

            /**
             * Initializes mimic upgrades and sets up ranks based on {@link ig.CONFIG.RANKS}.
             * @override
             **/
            initUpgrades: function () {

                this.parent();

                // upgrades based on ranks possible

                var upgrades = [];

                for (var i = 0, il = _c.RANKS.length; i < il; i++) {

                    upgrades.push({
                        power: _c.RANKS[ i ].level
                    });

                }

                this.addUpgrades(upgrades);

            },

            /**
             * Checks if mimic power is high enough to mimic target mimic level.
             * @override
             **/
            hasValidTarget: function () {

                return this.parent() && this.entityTarget.abilities && this.power >= this.entityTarget.mimicLevel;

            },

            /**
             * Mimics new target abilities and shows mimic effect.
             * @override
             **/
            activate: function () {

                // end mimic in progress

                this.unmimic();

                // clone new

                this.entity.abilities = this.entityTarget.abilities.clone();

                // fallback allows for retrieval of original abilities
                // but is only used when nothing matching is found in cloned abilities first

                this.entity.abilities.fallback = this.entity.abilitiesOriginal;

                // set entity and options in clones
                // options first because setting entity may trigger passive abilities

                this.entity.abilities.entityMimicked = this.entityTarget;
                this.entity.abilities.forAllDescendantsWithCallback('setEntityOptions', this.entityTarget);
                this.entity.abilities.forAllDescendantsWithCallback('setEntity', this.entity);

                // handle mimic effect

                if (this.entityTarget.mimicEffect) {

                    this._mimickedEffect = true;

                    // new effect

                    if (this.mimicEffectTarget !== this.entityTarget.mimicEffect) {

                        // store effect

                        this.mimicEffectTarget = this.entityTarget.mimicEffect;

                        // copy effect

                        this.mimicEffect = ig.merge({}, this.mimicEffectTarget);

                    }

                    // show effect

                    this.effectStart(this.mimicEffect);

                }

                this.parent();

            },

            /**
             * Unmimics target.
             * @override
             **/
            deactivate: function () {

                this.unmimic();

                this.parent();

            },

            /**
             * Undoes current mimic.
             **/
            unmimic: function () {

                if (this.entity.abilities !== this.entity.abilitiesOriginal) {

                    // store current

                    var cloned = this.entity.abilities;

                    // revert to original first, so no infinite loop happens

                    this.entity.abilities = this.entity.abilitiesOriginal;

                    // clear effect

                    if (this._mimickedEffect) {

                        this._mimickedEffect = false;

                        this.effectEnd(this.mimicEffect);

                    }

                    // remove cloned fallback, again so no infinite loop happens
                    // then clean up cloned

                    cloned.setFallback();
                    cloned.cleanup();

                }

            },

            /**
             * @override
             **/
            clone: function (c) {

                if (c instanceof ig.AbilityMimic !== true) {

                    c = new ig.AbilityMimic();

                }

                c.power = this.power;

                return this.parent(c);

            }

        });

    });