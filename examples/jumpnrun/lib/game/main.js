/*ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.player',
	'game.entities.spike',
	'game.levels.test'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	gravity: 300, // All entities are affected by this
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	
	init: function() {
		// Bind keys
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.X, 'jump' );
		ig.input.bind( ig.KEY.C, 'shoot' );
		
		// Load the LevelTest as required above ('game.level.test')
		this.loadLevel( LevelTest );
	},
	
	update: function() {		
		// Update all entities and BackgroundMaps
		this.parent();
		
		// screen follows the player
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
			this.screen.x = player.pos.x - ig.system.width/2;
			this.screen.y = player.pos.y - ig.system.height/2;
		}
	},
	
	draw: function() {
		// Draw all entities and BackgroundMaps
		this.parent();
		
		this.font.draw( 'Arrow Keys, X, C', 2, 2 );
	}
});


// Start the Game with 60fps, a resolution of 240x160, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 240, 160, 2 );

});*/

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
    'plusplus.core.config',
    'plusplus.core.loader',
    'plusplus.core.game',
	
	'impact.font',
	
	'game.entities.player',
	'game.entities.spike',
	
	'game.levels.test'
)
// define the main module
.defines(function () {
    "use strict";
    var _c = ig.CONFIG;
    // we probably want to go ahead and debug while developing
    if (_c.DEBUG) {
        ig.module(
                'game.game-debug'
            )
            .requires(
                'plusplus.debug.debug'
            )
            .defines(function () {
                start();
            });
    }
    // and don't forget to turn off debugging
    // in the config when releasing your game!
    else {
        start();
    }
    function start() {
        // have your game class extend Impact++'s game class
        var game = ig.GameExtended.extend({
			// get the collision map shapes for lighting and shadows
			shapesPasses: [
				{
					ignoreClimbable: true,
					discardBoundaryInner: true
				}
			],
            // override the game init function
            init: function () {
			
                this.parent();
				
                // so we can load the first level
                // which of course you didn't forget to require above
                this.loadLevel(ig.global.LevelTest);
				
				// and lets add some atmosphere!
				this.camera.addAtmosphere();
				
            }
        });
        // now lets boot up impact with
        // our game and config settings
        ig.main(
            '#canvas',
            game,
            60,
            _c.GAME_WIDTH,
            _c.GAME_HEIGHT,
            _c.SCALE,
            ig.LoaderExtended
        );
        // and resize to make sure everything looks fine
        ig.system.resize(
            ig.global.innerWidth * _c.CANVAS_WIDTH_PCT * ( 1 / _c.SCALE ),
            ig.global.innerHeight * _c.CANVAS_HEIGHT_PCT * ( 1 / _c.SCALE ),
            _c.SCALE
        );
    }
});
