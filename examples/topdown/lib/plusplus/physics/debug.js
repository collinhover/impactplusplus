/**
 * Draws physics world.
 * Create an instance of ig.DebugPhysics and call draw at end of main draw.
 **/
ig.module( 
	'plusplus.physics.debug'
)
.requires(
	'plusplus.core.config',
	'plusplus.physics.box2d'
)
.defines(function(){

var _c = ig.shared;
var _b2 = ig.Box2D;

ig.DebugPhysics = ig.Class.extend({
	drawer: null,
	world: null,
	alpha: 1,
	
	init: function( world, alpha, thickness ) {
		this.world = world;
		
		this.drawer = new _b2.DebugDraw();
		this.drawer.m_sprite = ig.system.context;
		this.drawer.m_drawScale = 1 / _c.SCALE_PHYSICS * ig.system.scale;
		this.drawer.m_fillAlpha = alpha || 0.3;
		this.drawer.m_lineThickness = thickness || 1.0;
		this.drawer.m_drawFlags = _b2.DebugDraw.e_shapeBit | _b2.DebugDraw.e_jointBit;
	},
	
	draw: function() {
		
		ig.system.context.save();
		
		// we need to reposition context so draw is not upside down
		
		ig.system.context.translate( -ig.game.screen.x * ig.system.scale, -ig.game.screen.y * ig.system.scale + ig.system.height * ig.system.scale );
		ig.system.context.scale( 1, -1 );
		
		// set debug drawer, draw and unset again, to prevent box2d from drawing on it's own during step()
		
		this.world.SetDebugDraw( this.drawer );
		this.world.DrawDebugData( false ); // false = don't clear canvas, draw on top
		this.world.SetDebugDraw( null );
		
		ig.system.context.restore();
	},
	
	clear: function(){},
	
	lineStyle: function( thickness, color, alpha ) {
		ig.system.context.strokeStyle = 'rgb('+color.r+','+color.g+','+color.b+')';
		ig.system.context.lineWidth = thickness;
	},
	
	moveTo: function( x, y ) {
		ig.system.context.beginPath();
		ig.system.context.moveTo( x, y );
	},
	
	lineTo: function( x, y ) {
		ig.system.context.lineTo( x, y );
		ig.system.context.stroke();
	},
	
	beginFill: function( color, alpha ) {
		this.alpha = alpha;
		ig.system.context.fillStyle = 'rgb('+color.r+','+color.g+','+color.b+')';
		ig.system.context.beginPath();
	},
	
	endFill: function() {
		ig.system.context.globalAlpha = this.alpha;
		ig.system.context.fill();
		ig.system.context.globalAlpha = 1;
	},
	
	drawCircle: function( x, y, r ) {
		ig.system.context.beginPath();
		ig.system.context.arc(x, y, r, 0, Math.PI*2, true);
		ig.system.context.stroke();
	}
});

});