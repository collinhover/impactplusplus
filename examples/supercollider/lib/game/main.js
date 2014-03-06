// starting with Impact++ is simple!
// setup a main game file, such as 'game/main.js'
// that you load right after ImpactJS
// and inside this file...
// setup the main module
ig.module(
    'game.main'
)
// now require the appropriate files
.requires(

    // the following is the only file required to use Impact++

    'plusplus.core.plusplus',

    // the remaining files are all specific to this demo
    // and as this demo is the kitchen sink (every feature in the library)
    // we'll give an example of a new feature(s) in each level
    // for specifics on a feature, look at the level and the entities it uses

    'game.levels.title',
    'game.levels.player',
    'game.levels.camera',
    'game.levels.lighting',
    'game.levels.core',
    'game.levels.abilities',
    'game.levels.creatures',
    'game.levels.ui',
    'game.levels.particles',
    'game.levels.obstacles',
    'game.levels.conversations',
    'game.levels.spawners',

    // debug while developing
    // remove before release!

    'plusplus.debug.debug'

)
// define the main module
.defines(function() {
    "use strict";
    var _c = ig.CONFIG;

    // have your game class extend Impact++'s game class
    var game = ig.GameExtended.extend({

        // background color is dark, but not too dark
        clearColor: "#111111",

        // convert the collision map shapes
        // either or both can be removed
        shapesPasses: [
            // for climbing
            // we ignore solids and one ways
            // to only retrieve climbable areas
            {
                ignoreSolids: true,
                ignoreOneWays: true
            },
            // for lighting and shadows
            // we ignore climbables and the edge boundary
            {
                ignoreClimbable: true,
                // throw away the inner loop of the edge of the map
                discardBoundaryInner: true,
                // throw away the outer loop of the edge of the map
                retainBoundaryOuter: false
            }
        ],

        // override the game init function
        init: function() {

            this.parent();

            // so we can load the first level
            // which of course you didn't forget to require above

            this.loadLevel(ig.global.LevelTitle);

        },

        // we uses load level to load and transition
        // and build level does the building after transition

        buildLevel: function() {

            this.parent();

            // get the player entity
            // if none, assume we're waiting for input to start

            var player = this.getPlayer();

            if (!player) {

                // lets have the camera follow the title first

                var title = this.namedEntities["title"];

                if (title && this.camera) {

                    // first parameter is the entity to follow
                    // second parameter is snap (instead of transition)
                    // third parameter is to center on entity

                    this.camera.follow(title, true, true);

                }

                // and in the first level, an input trigger is used
                // which waits for a tap (and click === tap)
                // and once that happens, it:
                // activates the title to remove the text
                // spawns the player and starts the game

            }

        },

        // add a few extra inputs
        // Impact++ adds a few basic inputs already:
        // tap / click to use a quick ability
        // spacebar / swipe to jump
        // wasd / arrows to move
        inputStart: function() {

            this.parent();

            ig.input.bind(ig.KEY.X, 'jump');
            ig.input.bind(ig.KEY.C, 'tap');

        },

        inputEnd: function() {

            this.parent();

            ig.input.unbind(ig.KEY.X, 'jump');
            ig.input.unbind(ig.KEY.C, 'tap');

        }

    });

    // now lets boot up impact with
    // our game and config settings
    // we've modified Impact++'s 'config-user.js' file
    // to override some of the default settings
    ig.main(
        '#canvas',
        game,
        60,
        _c.GAME_WIDTH,
        _c.GAME_HEIGHT,
        _c.SCALE,
        ig.LoaderExtended
    );

});
