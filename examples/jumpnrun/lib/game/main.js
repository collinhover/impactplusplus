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
	
	// the following are the only files required to use Impact++
	
    'plusplus.core.plusplus',
	
	// the remaining files are all specific to this demo
	
	'game.entities.player',
	'game.entities.spike',
	
	'game.ui.ui-toggle-gfx-min',
	'game.ui.ui-toggle-gfx-max',
	'plusplus.ui.ui-toggle-pause',
	
	'game.levels.side-scrolling',
	'game.levels.top-down',
	
	// debug while developing
	// remove before release!
	
	'plusplus.debug.debug'
	
)
// define the main module
.defines(function () {
    "use strict";
    var _c = ig.CONFIG;
	
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
			
			if ( _c.TOP_DOWN ) {
				
				this.loadLevel(ig.global.LevelTopDown);
				
			}
			else {
				
				this.loadLevel(ig.global.LevelSideScrolling);
				
			}
			
			// initialize the example UI
			this.initUI();
			
		},
		
		// add a few extra inputs
		// this is just to mimic the original example
		// Impact++ adds a few basics already
		// tap / click to shoot
		// spacebar / swipe to jump
		// wasd / arrows to move
		inputStart: function () {
			
			this.parent();
			
			ig.input.bind(ig.KEY.X, 'jump');
			ig.input.bind(ig.KEY.C, 'shoot');
			ig.input.bind(ig.KEY.G, 'grenade');
			
		},
		
		inputEnd: function () {
			
			this.parent();
			
			ig.input.unbind(ig.KEY.X, 'jump');
			ig.input.unbind(ig.KEY.C, 'shoot');
			ig.input.unbind(ig.KEY.G, 'grenade');
			
		},
		
		// quick and dirty UI for example
		// in your own game you probably want to
		// create separate classes for UI elements
		// instead of defining them dynamically as below
		initUI: function () {
			
			// add a basic pause button
			
			var togglePause = this.spawnEntity( ig.UITogglePause, 0, 0, {
				// position to top left
				posPct: { x: 0, y: 0 },
				// set the margin
				marginAsPct: false,
				margin: { x: 20, y: 20 }
			} );
			
			// add a few buttons to toggle performance
			
			var toggleGfxMin = this.spawnEntity( ig.UIToggleGfxMin, 0, 0, {
			
				// set the margin
				marginAsPct: false,
				margin: { x: 20, y: 0 },
				
				// link to pause
				linkedTo: togglePause,
				
				// set to align next to linked
				linkAlign: { x: 1, y: 0 },
				
				activateCallback: function () {
					
					// deactivate other
					
					if ( toggleGfxMax.activated ) {
						
						toggleGfxMax.deactivate();
						
					}
					
				},
				
				deactivateCallback: function () {
					
					if ( !toggleGfxMax.activated ) {
						
						toggleGfxMax.activate();
						
					}
					
				}
				
			} );
			
			var toggleGfxMax = this.spawnEntity( ig.UIToggleGfxMax, 0, 0, {
			
				// set the margin
				marginAsPct: false,
				margin: { x: 20, y: 0 },
				
				// link
				linkedTo: toggleGfxMin,
				
				// set to align next to linked
				linkAlign: { x: 1, y: 0 },
				
				activateCallback: function () {
					
					// deactivate other
					
					if ( toggleGfxMin.activated ) {
						
						toggleGfxMin.deactivate();
						
					}
					
				},
				
				deactivateCallback: function () {
					
					if ( !toggleGfxMin.activated ) {
						
						toggleGfxMin.activate();
						
					}
					
				}
				
			} );
			
			// toggle max graphics
			
			toggleGfxMax.activate();
			
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
