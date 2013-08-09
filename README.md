Impact++ (r5)
========

[Impact++ Documentation](http://collinhover.github.com/impactplusplus) -- [Impact++ Demo](http://collinhover.github.com/impactplusplus)  
  
####Overview

Impact++ is series of extensions and additions to the [ImpactJS engine](http://impactjs.com "ImpactJS"). The core goal of this project is to expand ImpactJS to make it easier and faster to start developing full featured games for the web. ImpactJS is a great engine, but it is fairly minimal to start, and our hope is that Impact++ will save you a few months of dev time!

####Features
* Extended capability of ImpactJS's default classes to improve collisions, animations,...
* ```ig.CONFIG``` data driven configuration to allow you to change parameters without rebuilding or modifying the library
* ```ig.GameExtended``` game with layers, easy pausing, improved debugger,...
* ```ig.EntityExtended``` entities with lots of extra helper functions, opt-in performance, inheritance friendly animations,...
* ```ig.pathfinding``` efficient, garbage collector free pathfinding able to avoid entities and let you draw pathfinding maps in the editor
* ```ig.InputPoint``` input with multi-touch and gestures that works the same for mouse or touch
* ```ig.Camera``` camera for screen control, smooth target transitions, atmospheric overlays,...
* ```ig.UIElement``` a whole list of ui element entities to make text, buttons, overlays,...
* ```ig.Ability``` abilities that are entirely modular, have a built in casting system, upgrades,...
* ```ig.EntityLight``` lighting in real-time with shadows, dynamic alpha and/or color,...
* ```ig.Character``` abstract character class with options for moving, jumping, climbing,...
* ```ig.Creature``` abstract creature class with simple AI to find targets, move to, attack, use abilities, flee...
* ```ig.Player``` abstract player class with built in interaction and input handling,...
* ```ig.Tutorial``` abstract tutorial class to help you show your players how to do things
* ```ig.Spawner``` abstract spawner class with pooling for better performance
* ```ig.Particle``` abstract particle class with fading in and/or out, random velocities,...
* ```ig.EntityTrigger``` easy to use set of triggers for complex event driven behavior
* ```ig.EntityCheckpoint``` checkpoint for automatic player respawning on death
* ```ig.utils``` huge list of utility functions for vectors, drawing, intersections, math, tiles,...
* and too much more to reasonably list here!

####Download
[
![Download Zip](http://github.com/images/modules/download/zip.png)
](http://github.com/collinhover/impactplusplus/zipball/master/)
[
![Download Zip](http://github.com/images/modules/download/tar.png)
](http://github.com/collinhover/impactplusplus/tarball/master/)

##Getting Started
####First Steps
1. Download using one of the "Download" links and extract the files.
2. Copy the **impactplusplus/lib/plusplus** folder into your new or existing ImpactJS project **lib** directory.
3. Either copy the **impactplusplus/lib/weltmeister/config.js** into your projet's **lib/weltmeister** directory...
4. Or, if you have a custom Weltmeister config:
	* add ```'lib/plusplus/entities/*.js'``` to the ```entityFiles``` setting
	* change the ```collisionTiles.path``` setting to ```'lib/weltmeister/collisiontiles_plusplus_64.png'```
5. Make sure you're comfortable with the [ImpactJS Documentation](http://impactjs.com/documentation)
6. Load up the Impact++ Jump N' Run demo (see below) to review the basics
7. Dive into the [Impact++ Documentation](http://collinhover.github.com/impactplusplus)

####Demo: Jump N' Run
Check out the Jump N' Run demo for an overview of getting started with Impact++, located in the 'examples/jumpnrun' directory. Don't forget to copy the ImpactJS engine and Weltmeister files into the Jump N' Run directory!

####Feature Examples
You will find example levels demoing various advanced features of Impact++ in the 'examples/levels' directory. Copy them into your 'lib/game/levels' directory and load them up through Weltmeister. Don't forget to add your player entity to the example levels before trying them out!

##FAQ
####Ejecta, Cocoonjs, etc?
Impact++ has been built from day one to be portable / wrappable to iOS, Android, Win8, etc. Tests are ongoing, but the library does nothing that should need special handling when porting or wrapping your game code for distribution as a mobile app. Please let us know if you find any issues!

####Custom Settings
	// edit the user config file at 'plusplus/config-user.js'
	// then you can set values
	// for any of the properties that appear in ig.CONFIG
	// and they will automatically be merged
	// over the base settings
	ig.CONFIG_USER = {
		// for example, one thing you'll probably want to set right away
		// is your own logo (in base64) for the loader
		LOADER_LOGO_SRC_MAIN: 'data:image/png;base64,...'
	};

####Design Philosophy
* _Modularity_ - code should be reusable whenever possible
* _Parametrize_ - projects should be able to change settings without modifying the library
* _Be agnostic_ - do not rely on device or browser specific functionality
* _Consistency_ - the codebase should look like a cohesive whole
* _Document_ - the codebase should be reasonably documented

####Contributing
We'd love it if you want to help make Impact++ better, so if you're interested take a look at [CONTRIBUTING](https://github.com/collinhover/impactplusplus/blob/master/CONTRIBUTING.md).

####License
Impact++ is licensed under the MIT license. For full license and information, see [LICENSE](https://github.com/collinhover/impactplusplus/blob/master/LICENSE.md).


##Changlog
Check out the [Releases](https://github.com/collinhover/impactplusplus/releases).
####r5
```General```  
* Load up Impact++ by requiring `'plusplus.core.plusplus'` instead of several separate modules  
* Impact++ now appropriately handles various game screen sizing options, including:  
	* fixed pixel size (static scale)  
	* pecent of screen (static scale)  
	* minimum number of pixels in view (dynamic scaling)  
* Impact++ now allows per entity scaling, which can be particularly useful for UI and text when dynamically scaling
* Impact++ now works for both 2D sidescrolling and top-down (see ig.CONFIG.TOP_DOWN)
  
```CONFIG```
* `DYNAMIC` renamed `MOVING`
* `KINEMATIC` renamed `DYNAMIC`
* `AUTO_SORT_LAYERS` added
* `PRERENDER_MAPS` added
* `CANVAS_WIDTH_PCT` renamed `GAME_WIDTH_PCT`
* `CANVAS_HEIGHT_PCT` renamed `GAME_HEIGHT_PCT`

```Physics```
* Box2D physics removed from Impact++, performance is not acceptable for mobile web
  
```Tiles``` 
* Collision tiles completely reworked, all half tiles removed (use offset instead)
* Climbable collision tiles are now climbable AND stairs
* Collision visualization tiles now in 4 sizes: 64 px, 32 px, 16 px, and 8 px
  
```ig.BackgroundMap```   
* ig.BackgroundMap expanded to ig.BackgroundMapExtended
  
```ig.EntityExtended```   
* ig.EntityExtended has been heavily changed!
* `reset` now called at end of `init` method (instead of at start)
* `initVisuals` removed and functionality moved to `resetExtras`
* no longer reliant on `bounds`, use `pos` + `size` properties instead 
* no longer reliant on `boundsDraw`, use `posDraw` + `sizeDraw` properties instead  
* `bounds/boundsDraw` now opt-in and null by default
* `updateBounds` no longer recalculates bounds or vertices by default
* `verticesNeeded` renamed `needsVertices`
* `getTotalPosX/Y` renamed `getDrawX/Y` 
* `totalSizeX/Y` renamed `sizeDraw.x/y`  
* dynamics updates, such as gravity and collisions with collision map moved into `updateDynamics` method
* `addAnim` now takes only animation name and settings as parameters
* `collideWith` replaces `ig.Entity.seperateOnX/YAxis` for better control of collisions
* `collideWith` parameters changed
* `pointInside` removed
* `refresh` added and called by reset (instead of ready)
* `ready` now called by way of adding for proper execution order
* `_ungroundedFor` renamed `ungroundedFor`
* `ungroundedFor` no longer increases when climbing
* `moveToEntity` renamed `moveTo` and automatically handles moving to entity or position
* `movingToEntity` removed
* `movingTo` property now holds a reference to what the entity is moving to rather than true/false
* `moveToHere` renamed `moveToStop`
* textured now creates textures on first draw call instead of when animations first added
* `castShadows` renamed `castShadow`
* `project` renamed `projectShadow`
  
```ig.AnimationExtended```  
* `init` now takes only animation sheet and settings as parameters
* can now play in reverse
* `update` reworked so stop pauses instead of sets frame to end
* `changed` added to keep track of when animation changes tiles

```ig.Character```  
* `moveToLocation` removed and replaced with pathfinding
  
```ig.EntityTrigger```  
* now properly chains triggers (check your trigger targets if you are getting strange behavior)
* `triggering` added to help prevent triggers from infinitely looping
  
```ig.EntityLight```  
* settings now determined by `ig.CONFIG.LIGHT` for easier control
* `createLight` renamed `drawLight`
* `createCache` renamed `resizeCache`
* canvas caches created in `initProperties` method for better garbage handling
* `castShadows` renamed `drawShadows`
* `castShadows` now handles casting each item in light bounds (and called by `drawShadows`)
  
```ig.EntityDestructable```  
* now no longer damageable or targetable or collidable
* `ig.EntityDestructableCollide` is now collidable
* `ig.EntityDestructableDamage` is now damageable and targetable
  
```ig.Door```  
* `locked` and `autoLock` added
  
```ig.EntitySwitch```  
* `stuck` renamed `broken`
* `autoStuck` renamed `autoBreak`
  
```ig.UIElement```    
* ig.UIElement has been heavily changed!
* `refresh` moved to ig.EntityExtended 
* `resize` moved to ig.EntityExtended 
* `reposition` moved to ig.EntityExtended 
* `rebuild` moved to ig.EntityExtended 
* `link/unlink` moved to ig.EntityExtended 
* `vertical` moved to ig.UIMeter
* linkAlign now controls how far inside or outside of linkedTo a linked UI element is offset
* resize renamed refresh
* onResized renamed onRefreshed
* refresh calls (in order) resize and reposition
* `ig.UIText` no longer positions to center by default (but still aligns to center by default)
* `ig.EntityConversation` completely reworked
  
```ig.Ability```    
* `castSettings.entity` renamed `castSettings.entityClass`
* `castSettings.entityClass` is no longer stored for reuse9

```ig.Camera```  
* settings moved from ig.CONFIG to ig.CONFIG.CAMERA
  
```Utils```    
* `ig.utilsdraw.pixelFillPolygon` no longer takes bounds object, takes min/max x/y
* `ig.utilsdraw.fillPolygon` no longer takes fill parameters, instead it assumes fillStyle has already been set
* `ig.utilsintersection` bounds methods can be optionally passed a bounds object to help with garbage collection
  
```ig.pathfinding```  
* pathfinding added, use `ig.Character.canPathfind` with `ig.EntityExtended.moveTo` for magic!
* pathfinding is garbage free
* pathfinding map added to draw optimal pathfinding areas
  
```ig.ImageDrawing```
* `canvas` and `context` removed
* complete overhaul of scaling to defer scaling until first draw call
* most methods and properties moved to `ig.Image`