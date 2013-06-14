ig.module(
        'plusplus.helpers.utilsdraw'
    )
    .requires(
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.utilscolor'
    )
    .defines(function () {
        "use strict";

        var _uti = ig.utilsintersection;
        var _utc = ig.utilscolor;

        /**
         * Static utilities for drawing.
         * @memberof ig
         * @namespace ig.utilsdraw
         * @author Collin Hover - collinhover.com
         **/
        ig.utilsdraw = {};

        /**
         * Pixel perfectly fills a polygon defined by vertices in context with r, g, b, a (optionally, add color instead of set color).
         * @param {CanvasContext2D} context context to draw into.
         * @param {Object} boundsContext bounds of context to draw into.
         * @param {Array} vertices polygon vertices.
         * @param {Number} r red.
         * @param {Number} g green.
         * @param {Number} b blue.
         * @param {Number} a alpha.
         * @param {Boolean} [add=false] add to existing color.
         * @param {Object} [boundsVertices=boundsContext] bounds of polygon.
         * @param {Boolean} [stabilize=false] whether to stabilize for rounding error.
         **/
        ig.utilsdraw.pixelFillPolygon = function (context, boundsContext, vertices, r, g, b, a, add, boundsVertices, stabilize) {

            // find bounding box of vertices

            var bminX = boundsContext.minX;
            var bminY = boundsContext.minY;

            var minX, minY, maxX, maxY;

            if (boundsVertices) {

                minX = Math.floor(boundsVertices.minX);
                minY = Math.floor(boundsVertices.minY);
                maxX = Math.ceil(boundsVertices.maxX);
                maxY = Math.ceil(boundsVertices.maxY);

            }
            else {

                minX = bminX;
                minY = bminY;
                maxX = boundsContext.maxX;
                maxY = boundsContext.maxY;

            }

            var imageX, imageY, width, height;

            // extra 1 is for stability with rounding

            if (stabilize) {

                imageX = minX - bminX - 1;
                imageY = minY - bminY - 1;
                width = maxX - minX + 1;
                height = maxY - minY + 1;

            }
            else {

                imageX = minX - bminX;
                imageY = minY - bminY;
                width = maxX - minX;
                height = maxY - minY;

            }

            var r255 = r * 255;
            var g255 = g * 255;
            var b255 = b * 255;
            var a255 = a * 255;

            // draw inside vertices

            var shape = context.getImageData(imageX, imageY, width, height);

            if (add === true) {

                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++) {

                        if (_uti.pointInPolygon(x + minX, y + minY, vertices)) {

                            var index = ( x + y * width ) * 4;

                            shape.data[ index ] += r255;
                            shape.data[ index + 1 ] += g255;
                            shape.data[ index + 2 ] += b255;
                            shape.data[ index + 3 ] += a255;

                        }

                    }
                }

            }
            else {

                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++) {

                        if (_uti.pointInPolygon(x + minX, y + minY, vertices)) {

                            var index = ( x + y * width ) * 4;

                            shape.data[ index ] = r255;
                            shape.data[ index + 1 ] = g255;
                            shape.data[ index + 2 ] = b255;
                            shape.data[ index + 3 ] = a255;

                        }

                    }
                }

            }

            context.putImageData(shape, imageX, imageY);

        };

        /**
         * Fills a polygon defined by vertices in context.
         * @param {CanvasContext2D} context context to draw into.
         * @param {Array} vertices polygon vertices.
         * @param {Number} offsetX x offset.
         * @param {Number} offsetY y offset.
         * @param {Number} r red.
         * @param {Number} g green.
         * @param {Number} b blue.
         * @param {Number} a alpha.
         * @param {Number} scale scale after offset.
         **/
        ig.utilsdraw.fillPolygon = function (context, vertices, offsetX, offsetY, r, g, b, a, scale) {

            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            scale = scale || 1;

            var vertex = vertices[ 0 ];

            context.fillStyle = _utc.RGBAToCSS(r, g, b, a);
            context.beginPath();
            context.moveTo(( vertex.x + offsetX ) * scale, ( vertex.y + offsetY ) * scale);

            for (var i = 1, il = vertices.length; i < il; i++) {
                vertex = vertices[ i ];
                context.lineTo(( vertex.x + offsetX ) * scale, ( vertex.y + offsetY ) * scale);
            }

            context.fill();

        };

    });