ig.module(
        'plusplus.debug.pathfinding-panel'
    )
    .requires(
        'plusplus.debug.menu',
        'plusplus.abstractities.character',
        'plusplus.helpers.utilsmath'
    )
    .defines(function() {
        "use strict";

        var _um = ig.utilsmath;

        ig.Character.inject({

            draw: function() {

                this.parent();

                if (ig.Character._debugShowPaths && this.path) {

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
                    context.moveTo( sys.getDrawPos( this.pos.x + this.size.x * 0.5 - screen.x), sys.getDrawPos(this.pos.y + this.size.y * 0.5 - screen.y) );

                    for (i = this.path.length - 1; i >= 0; i--) {

                        context.lineTo( sys.getDrawPos(this.path[i].x - screen.x), sys.getDrawPos(this.path[i].y - screen.y) );

                    }

                    context.stroke();
                    context.closePath();

                    // waypoints

                    if ( ig.Character._debugShowWaypoints ) {

                        for (i = this.path.length - 1; i >= 0; i--) {

                            context.fillStyle = color;

                            context.beginPath();
                            context.arc(
                                ig.system.getDrawPos( this.path[i].x - screen.x),
                                ig.system.getDrawPos( this.path[i].y - screen.y),
                                radius, 0, _um.TWOPI );
                            context.fill();

                        }

                    }

                }

            }

        });

        ig.Character._debugShowPaths = false;
        ig.Character._debugShowWaypoints = false;

        ig.debug.addPanel({
            type: ig.DebugPanel,
            name: 'pathfinding-debug',
            label: 'A*',

            options: [{
                name: 'Show paths',
                object: ig.Character,
                property: '_debugShowPaths'
            }, {
                name: 'Show waypoints',
                object: ig.Character,
                property: '_debugShowWaypoints'
            }]
        });
    });