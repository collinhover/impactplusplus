ig.module(
        'plusplus.helpers.utilscolor'
    )
    .defines(function () {
        "use strict";

        /**
         * Static utilities for fill styles and color conversions.
         * @memberof ig
         * @namespace ig.utilscolor
         * @author Collin Hover - collinhover.com
         **/
        ig.utilscolor = {};

        /**
         * Converts between hex and RGBA values.
         * @param {Number} hex hex color value.
         **/
        ig.utilscolor.hexToRGBA = function (hex) {

            hex = Math.floor(hex);

            var rgba = {};

            rgba.r = ( hex >> 24 & 255 ) / 255;
            rgba.g = ( hex >> 16 & 255 ) / 255;
            rgba.b = ( hex >> 8 & 255 ) / 255;
            rgba.a = ( hex & 255 ) / 255;

            return rgba;

        };

        /**
         * Converts r,g,b,a values to hex color.
         * @param {Number} r red value from 0 to 1.
         * @param {Number} g green value from 0 to 1.
         * @param {Number} b blue value from 0 to 1.
         * @param {Number} a alpha value from 0 to 1.
         **/
        ig.utilscolor.RGBAToHex = function (r, g, b, a) {

            return ( r * 255 ) << 24 ^ ( g * 255 ) << 16 ^ ( b * 255 ) << 8 ^ ( a * 255 ) << 0;

        };

        /**
         * Converts r,g,b,a values to hex color.
         * @param {Number} r red value from 0 to 1.
         * @param {Number} g green value from 0 to 1.
         * @param {Number} b blue value from 0 to 1.
         **/
        ig.utilscolor.RGBToHex = function (r, g, b) {

            return ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;

        };

        /**
         * Converts between style, i.e. rgb()/rgba()/etc, and RGBA values.
         * <span class="alert"><strong>IMPORTANT:</strong> this method has a relatively higher performance cost, avoid when possible.</span>
         * @param {String} color css color style value.
         * @param {Number} alpha alpha value from 0 to 1.
         **/
        ig.utilscolor.CSSToRGBA = ( function () {

            var canvas = ig.$new("canvas");
            canvas.width = canvas.height = 1;
            var ctx = canvas.getContext("2d");

            return function (color, alpha) {

                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, 1, 1);

                var data = ctx.getImageData(0, 0, 1, 1).data;
                var rgba = {};

                rgba.r = data[0] / 255;
                rgba.g = data[1] / 255;
                rgba.b = data[2] / 255;
                rgba.a = alpha;

                return rgba;

            }

        }() );

        /**
         * Converts r,g,b,a values to rgba() CSS style.
         * @param {Number} r red value from 0 to 1.
         * @param {Number} g green value from 0 to 1.
         * @param {Number} b blue value from 0 to 1.
         * @param {Number} a alpha value from 0 to 1.
         **/
        ig.utilscolor.RGBAToCSS = function (r, g, b, a) {

            return 'rgba(' + ( ( r * 255 ) | 0 ) + ',' + ( ( g * 255 ) | 0 ) + ',' + ( ( b * 255 ) | 0 ) + ',' + a + ')';

        };

        /**
         * Converts r,g,b values to rgb() CSS style.
         * @param {Number} r red value from 0 to 1.
         * @param {Number} g green value from 0 to 1.
         * @param {Number} b blue value from 0 to 1.
         **/
        ig.utilscolor.RGBToCSS = function (r, g, b) {

            return 'rgb(' + ( ( r * 255 ) | 0 ) + ',' + ( ( g * 255 ) | 0 ) + ',' + ( ( b * 255 ) | 0 ) + ')';

        };

        /**
         * Creates canvas linear gradient fillStyle.
         * @param {Number} minX x position of start of gradient.
         * @param {Number} minY y position of start of gradient.
         * @param {Number} maxX x position of end of gradient.
         * @param {Number} maxY y position of end of gradient.
         * @param {Array} colors list of colors in CSS style #000000 / rgb() / rgba() or object {r:0,g:0,b:0,a:0} format.
         **/
        ig.utilscolor.linearGradient = function (minX, minY, maxX, maxY, colors) {

            var gradient = ig.system.context.createLinearGradient(minX, minY, maxX, maxY);
            var pctPerStop = 1 / ( colors.length - 1 );

            for (var i = 0, il = colors.length; i < il; i++) {

                var color = colors[ i ];
                var style;

                if (typeof color === 'object') {

                    if (typeof color.a !== 'undefined') {

                        style = ig.utilscolor.RGBAToCSS(color.r, color.g, color.b, color.a);

                    }
                    else {

                        style = ig.utilscolor.RGBToCSS(color.r, color.g, color.b);

                    }

                }
                else {

                    style = color;

                }

                gradient.addColorStop(i * pctPerStop, style);

            }

            return gradient;

        };

        /**
         * Creates canvas radial gradient fillStyle.
         * @param {Number} radius radius of gradient
         * @param {Array} colors list of colors in CSS style #000000 / rgb() / rgba() or object {r:0,g:0,b:0,a:0} format
         * @returns {Gradient} canvas 2d gradient
         **/
        ig.utilscolor.radialGradient = function (radius, colors) {

            var gradient = ig.system.context.createRadialGradient(radius, radius, 0, radius, radius, radius);
            var pctPerStop = 1 / ( colors.length - 1 );

            for (var i = 0, il = colors.length; i < il; i++) {

                var color = colors[ i ];
                var style;

                if (typeof color === 'object') {

                    if (typeof color.a !== 'undefined') {

                        style = ig.utilscolor.RGBAToCSS(color.r, color.g, color.b, color.a);

                    }
                    else {

                        style = ig.utilscolor.RGBToCSS(color.r, color.g, color.b);

                    }

                }
                else {

                    style = color;

                }

                gradient.addColorStop(i * pctPerStop, style);

            }

            return gradient;

        };

    });