ig.module(
    'plusplus.debug.pathfinding-panel'
)
    .requires(
        'plusplus.debug.menu',
        'plusplus.abstractities.character',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.pathfinding'
)
    .defines(function() {
        "use strict";

        var _um = ig.utilsmath;
        var _pf = ig.pathfinding;

        ig.Character.inject({

            draw: function() {

                this.parent();

                if (ig.Character._debugShowPaths && this.path && this.path.length > 0) {

                    var i;
                    var sys = ig.system;
                    var screen = ig.game.screen;
                    var context = sys.context;
                    var mapTilesize = ig.game.collisionMap.tilesize;
                    var color = 'rgba( 255, 0, 0, 0.5 )';
                    var radius = 2 * ig.system.scale;

                    // path line

                    context.strokeStyle = color;
                    context.lineWidth = 1 * sys.scale;
                    context.beginPath();

                    var bounds = this._boundsPathfollow;

                    context.moveTo(sys.getDrawPos((bounds.minX + bounds.width * 0.5) - screen.x), sys.getDrawPos((bounds.minY + bounds.height * 0.5) - screen.y));

                    for (i = this.path.length - 1; i >= 0; i--) {

                        context.lineTo(sys.getDrawPos(this.path[i].x - screen.x), sys.getDrawPos(this.path[i].y - screen.y));

                    }

                    context.stroke();
                    context.closePath();

                    // waypoints

                    context.fillStyle = color;

                    context.beginPath();
                    context.arc(
                        sys.getDrawPos((bounds.minX + bounds.width * 0.5) - screen.x),
                        sys.getDrawPos((bounds.minY + bounds.height * 0.5) - screen.y),
                        radius, 0, _um.TWOPI);
                    context.fill();

                    for (i = this.path.length - 1; i >= 0; i--) {

                        context.beginPath();
                        context.arc(
                            sys.getDrawPos(this.path[i].x - screen.x),
                            sys.getDrawPos(this.path[i].y - screen.y),
                            radius, 0, _um.TWOPI);
                        context.fill();

                    }

                }

            }

        });

        ig.Character._debugShowPaths = false;

        ig.debug.addPanel({
            type: ig.DebugPanel,
            name: 'pathfinding-debug',
            label: 'A*',

            options: [{
                name: 'Show paths',
                object: ig.Character,
                property: '_debugShowPaths'
            }]
        });
    });
