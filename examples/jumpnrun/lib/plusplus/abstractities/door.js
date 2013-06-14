ig.module(
        'plusplus.abstractities.door'
    )
    .requires(
        'plusplus.entities.switch',
        'plusplus.helpers.utils'
    )
    .defines(function () {

        var _ut = ig.utils;

        /**
         * Entity that acts as an automatic door, opening and closing as an entity passes through.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntitySwitch
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Door = ig.EntitySwitch.extend(/**@lends ig.Door.prototype */{

            /**
             * @override
             * @default fixed
             */
            collides: ig.Entity.COLLIDES.FIXED,

            /**
             * Inits door types.
             * <br>- adds {@link ig.EntityExtended.TYPE.DOOR} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.CHARACTER} to {@link ig.EntityExtended#checkAgainst}
             * @override
             */
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "DOOR");
                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");

            },

            /**
             * Checks whether door can open and adds check for if door is {@link ig.EntityExtended#oneWay}.
             * @override
             */
            canOpen: function (entity) {

                return this.parent(entity) && ( !this.oneWay || ( entity && !entity.getIsCollidingWithOneWay(this) ) );

            },

            /**
             * Opens door and sets {@link ig.Door#collides} to {@link ig.Entity.COLLIDES.NONE}.
             * @override
             */
            open: function () {

                this.parent();

                this.collides = ig.Entity.COLLIDES.NONE;

            },

            /**
             * Closes door and resets {@link ig.Door#collides} to {@link ig.Entity.COLLIDES.FIXED}.
             * @override
             */
            close: function () {

                this.parent();

                this.collides = ig.Entity.COLLIDES.FIXED;

            }

        });

    });