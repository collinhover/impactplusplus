Impact++ (r6dev)
========

###[DOCS](http://collinhover.github.com/impactplusplus) / [DEMO](http://collinhover.github.com/impactplusplus)  
  
####Overview

Expanding the [ImpactJS engine](http://impactjs.com "ImpactJS") by over x10 so you can kick-start your game project into a full featured experience for the web (and mobile!).
```
Impact++ is stable for ImpactJS v1.20 - v1.23
```
  
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
Check out the Jump N' Run demo for an overview of getting started with Impact++, located in the 'examples/jumpnrun' directory. Don't forget to copy the ImpactJS engine and Weltmeister files into the demo directory!
  
####Demo: SUPER COLLIDER!
Check out the SUPER COLLIDER demo for an overview of how to use almost every single feature in Impact++, located in the 'examples/supercollider' directory. Don't forget to copy the ImpactJS engine and Weltmeister files into the demo directory!
  
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
  
##Changelog
Check out the [Releases](https://github.com/collinhover/impactplusplus/releases).