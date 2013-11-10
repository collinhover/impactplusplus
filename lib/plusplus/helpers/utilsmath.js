ig.module(
        'plusplus.helpers.utilsmath'
    )
    .defines(function () {
        "use strict";

        /**
         * Static utilities for math.
         * @memberof ig
         * @namespace ig.utilsmath
         * @author Collin Hover - collinhover.com
         **/
        ig.utilsmath = {};

        /**
         * Constant: golden angle.
         * @type {number}
         */
        ig.utilsmath.GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

        /**
         * Constant: 2pi.
         * @type {number}
         */
        ig.utilsmath.TWOPI = Math.PI * 2;

        /**
         * Constant: half pi.
         * @type {number}
         */
        ig.utilsmath.HALFPI = Math.PI * 0.5;

        /**
         * Clamps a number between and min and max.
         * @param {Number} n number.
         * @param {Number} min min value.
         * @param {Number} max max value.
         * @returns {Number} limited number
         **/
        ig.utilsmath.clamp = function (n, min, max) {

            return Math.min( Math.max( n, min ), max );

        };

        /**
         * Maps an interval number to start and stop values.
         * @param {Number} n number.
         * @param {Number} istart interval start.
         * @param {Number} istop interval stop.
         * @param {Number} ostart start.
         * @param {Number} ostop stop.
         * @returns {Number} mapped number
         **/
        ig.utilsmath.map = function (n, istart, istop, ostart, ostop) {

            return ostart + (ostop - ostart) * ((n - istart) / (istop - istart));

        };

        /**
         * Converts degrees to radians,
         * @param {Number} n degress.
         * @returns {Number} radians
         **/
        ig.utilsmath.degreesToRadians = function (n) {

            return (n / 180) * Math.PI;

        };

        /**
         * Converts radians to degress,
         * @param {Number} n radians.
         * @returns {Number} degrees
         **/
        ig.utilsmath.radiansToDegrees = function (n) {

            return (n * 180) / Math.PI;

        };

        /**
         * Checks two numbers to see if almost equal.
         * <br>- this is particularly useful for physics systems that make small steps
         * @param {Number} a number a
         * @param {Number} b number b
         * @param {Number} threshold threshold beyond which numbers are not considered equal
         * @returns {Boolean} true if numbers are within threshold of each other
         **/
        ig.utilsmath.almostEqual = function (a, b, threshold) {

            if (a === b) return true;
            else {

                var d = b - a;

                return d > 0 ? d < threshold : d > -threshold;

            }
        };

        /**
         * Checks two numbers to see if on opposite sides of zero.
         * @param {Number} a number a.
         * @param {Number} b number b.
         * @returns {Boolean} true if numbers are on opposite sides of zero
         **/
        ig.utilsmath.oppositeSidesOfZero = function (a, b) {

            return ( a < 0 && b > 0 ) || ( a > 0 && b < 0 );

        };

        /**
         * Checks the direction of a number.
         * @param {Number} n number.
         * @returns {Number} -1, 0, or 1
         **/
        ig.utilsmath.direction = function (n) {

            return n === 0 ? 0 : ( n < 0 ? -1 : 1 );

        };

        /**
         * Checks two numbers to see if a change in direction has occured.
         * @param {Number} a number a.
         * @param {Number} b number b.
         * @returns {Boolean} true if numbers are on opposite sides of zero, or one is 0 and other is not
         **/
        ig.utilsmath.directionChange = function (a, b) {

            return ( a === 0 && b !== 0 ) || ( a !== 0 && b === 0 ) || ig.utilsmath.oppositeSidesOfZero(a, b);

        };


    });