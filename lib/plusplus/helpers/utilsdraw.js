ig.module(
    'plusplus.helpers.utilsdraw'
)
    .requires(
        'plusplus.helpers.utilsintersection'
)
    .defines(function() {
        "use strict";

        var _uti = ig.utilsintersection;

        /**
         * Static utilities for drawing.
         * @memberof ig
         * @namespace ig.utilsdraw
         * @author Collin Hover - collinhover.com
         **/
        ig.utilsdraw = {};

        /**
         * Pixel perfectly fills a polygon defined by vertices in context with r, g, b, a (optionally, add color instead of set color).
         * @param {CanvasRenderingContext2D} context context to draw into.
         * @param {Number} minX left position of bounds
         * @param {Number} minY top position of bounds
         * @param {Number} maxX right position of bounds
         * @param {Number} maxY bottom position of bounds
         * @param {Array} vertices polygon vertices, in absolute or relative coordinates.
         * @param {Number} r red.
         * @param {Number} g green.
         * @param {Number} b blue.
         * @param {Number} a alpha.
         * @param {Boolean} [add=false] add to existing color.
         * @param {Object} [boundsVertices=boundsContext] bounds of polygon.
         * @param {Boolean} [stabilize=true] whether to stabilize for rounding error.
         **/
        ig.utilsdraw.pixelFillPolygon = function(context, minX, minY, maxX, maxY, vertices, r, g, b, a, add, boundsVertices, stabilize) {

            minX |= 0;
            minY |= 0;

            // find bounding box of vertices

            var fminX, fminY, fmaxX, fmaxY;

            if (boundsVertices) {

                fminX = boundsVertices.minX | 0;
                fminY = boundsVertices.minY | 0;
                fmaxX = Math.ceil(boundsVertices.maxX);
                fmaxY = Math.ceil(boundsVertices.maxY);

            } else {

                fminX = minX;
                fminY = minY;
                fmaxX = Math.ceil(maxX);
                fmaxY = Math.ceil(maxY);

            }

            var imageX, imageY, width, height;

            // extra 1 is for stability with rounding

            if (stabilize !== false) {

                imageX = fminX - minX - 1;
                imageY = fminY - minY - 1;
                width = fmaxX - fminX + 1;
                height = fmaxY - fminY + 1;

            } else {

                imageX = fminX - minX;
                imageY = fminY - minY;
                width = fmaxX - fminX;
                height = fmaxY - fminY;

            }

            var r255 = r * 255 | 0;
            var g255 = g * 255 | 0;
            var b255 = b * 255 | 0;
            var a255 = a * 255 | 0;

            // draw inside vertices

            var shape = context.getImageData(imageX, imageY, width, height);

            if (add === true) {

                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++) {

                        if (_uti.pointInPolygon(x + fminX, y + fminY, vertices)) {

                            var index = (x + y * width) * 4;

                            shape.data[index] += r255;
                            shape.data[index + 1] += g255;
                            shape.data[index + 2] += b255;
                            shape.data[index + 3] += a255;

                        }

                    }
                }

            } else {

                for (var x = 0; x < width; x++) {
                    for (var y = 0; y < height; y++) {

                        if (_uti.pointInPolygon(x + fminX, y + fminY, vertices)) {

                            var index = (x + y * width) * 4;

                            shape.data[index] = r255;
                            shape.data[index + 1] = g255;
                            shape.data[index + 2] = b255;
                            shape.data[index + 3] = a255;

                        }

                    }
                }

            }

            context.putImageData(shape, imageX, imageY);

        };

        /**
         * Fills a polygon defined by vertices in context.
         * <span class="alert"><strong>IMPORTANT:</strong> this method assumes the context's fillStyle is already set!</span>
         * @param {CanvasRenderingContext2D} context context to draw into.
         * @param {Array} vertices polygon vertices.
         * @param {Number} [offsetX=0] x offset.
         * @param {Number} [offsetY=0] y offset.
         * @param {Number} [scale=1] scale after offset.
         **/
        ig.utilsdraw.fillPolygon = function(context, vertices, offsetX, offsetY, scale) {

            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            scale = scale || 1;

            var vertex = vertices[0];

            context.beginPath();
            context.moveTo((vertex.x + offsetX) * scale, (vertex.y + offsetY) * scale);

            for (var i = 1, il = vertices.length; i < il; i++) {
                vertex = vertices[i];
                context.lineTo((vertex.x + offsetX) * scale, (vertex.y + offsetY) * scale);

            }

            context.fill();

        };

        /**
         * Fills a rounded rectangle in context.
         * <span class="alert"><strong>IMPORTANT:</strong> this method assumes the context's fillStyle is already set!</span>
         * @param {CanvasRenderingContext2D} context
         * @param {Number} x top left x position
         * @param {Number} y top left y position
         * @param {Number} width rect width
         * @param {Number} height rect height
         * @param {Number} radius corner radius
         */
        ig.utilsdraw.fillRoundedRect = function(context, x, y, width, height, radius) {

            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();

            context.fill();

        };

        /**
         * Pixel perfectly fills a rounded rectangle in context.
         * @param {CanvasRenderingContext2D} context
         * @param {Object} boundsContext bounds of context to draw into.
         * @param {Number} minX left position of bounds
         * @param {Number} minY top position of bounds
         * @param {Number} maxX right position of bounds
         * @param {Number} maxY bottom position of bounds
         * @param {Number} x top left x position
         * @param {Number} y top left y position
         * @param {Number} width rect width
         * @param {Number} height rect height
         * @param {Number} radius corner radius
         * @param {Number} r red.
         * @param {Number} g green.
         * @param {Number} b blue.
         * @param {Number} a alpha.
         * @param {Number} [precision=dynamic] precision of curves in number of vertices.
         * @param {Boolean} [add=false] add to existing color.
         * @param {Boolean} [stabilize=true] whether to stabilize for rounding error.
         */
        ig.utilsdraw.pixelFillRoundedRect = function(context, minX, minY, maxX, maxY, x, y, width, height, radius, r, g, b, a, precision, add, stabilize) {

            if (typeof precision === 'undefined') {

                precision = Math.round(radius * 0.25);

            }

            var anglePerVertex = Math.PI * 0.5 / (precision + 1);
            var addCornerVertices = function(cx, cy, angle) {

                for (var i = 0; i < precision; i++) {

                    angle += anglePerVertex;

                    vertices.push({
                        x: cx + radius * Math.cos(angle),
                        y: cy + radius * Math.sin(angle)
                    });

                }

            }

            // define vertices to approximate shape

            var vertices = [];

            // top edge

            vertices.push({
                x: x + radius,
                y: y
            });
            vertices.push({
                x: x + width - radius,
                y: y
            });

            // top right corner

            if (precision > 0) {

                addCornerVertices(x + width - radius, y + radius, Math.PI * 1.5);

            }

            // right edge

            vertices.push({
                x: x + width,
                y: y + radius
            });
            vertices.push({
                x: x + width,
                y: y + height - radius
            });

            // bottom right corner

            if (precision > 0) {

                addCornerVertices(x + width - radius, y + height - radius, 0);

            }

            // bottom edge

            vertices.push({
                x: x + width - radius,
                y: y + height
            });
            vertices.push({
                x: x + radius,
                y: y + height
            });

            // bottom left corner

            if (precision > 0) {

                addCornerVertices(x + radius, y + height - radius, Math.PI * 0.5);

            }

            // left edge

            vertices.push({
                x: x,
                y: y + height - radius
            });
            vertices.push({
                x: x,
                y: y + radius
            });

            // top left corner

            if (precision > 0) {

                addCornerVertices(x + radius, y + radius, Math.PI);

            }

            ig.utilsdraw.pixelFillPolygon(context, minX, minY, maxX, maxY, vertices, r, g, b, a, add, ig.utilsintersection.bounds(x, y, width, height), stabilize);

        };

    });
