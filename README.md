Impact++ (r4)
========

####Overview
A series of extensions and additions to the [Impact javascript engine](http://impactjs.com "ImpactJS")  
  
The core goal of this project is to expand ImpactJS to make it easier and faster to start developing full featured games. ImpactJS is a great engine, but it is fairly minimal to start, and our hope is that Impact++ will save you a few months of dev time! 
  
Impact++ is also partly a product of work on the game Mimic (which may or may not be released as of you reading this), which you can [see in action here!](http://collinhover.github.com/mimic "Mimic")

####Features
* Extended capability of ImpactJS's default classes to improve collisions, animations,...
* ```ig.CONFIG``` data driven configuration to allow you to change parameters without rebuilding or modifying the library
* ```ig.GameExtended``` game with layers, easy pausing, improved debugger,...
* ```ig.EntityExtended``` entities with lots of extra helper functions, opt-in performance, inheritance friendly animations,...
* ```ig.InputPoint``` input with multi-touch and gestures that works the same for mouse or touch
* ```ig.Camera``` camera for screen control, smooth target transitions, atmospheric overlays,...
* ```ig.UIElement``` a whole list of ui element entities to make text, buttons, overlays,...
* ```ig.Ability``` abilities that are entirely modular, have a built in casting system, upgrades,...
* ```ig.EntityLight``` lighting in real-time with shadows, dynamic alpha and/or color,...
* ```ig.Character``` abstract character class with options for moving, jumping, climbing,...
* ```ig.Player``` abstract player class with built in interaction and input handling,...
* ```ig.Tutorial``` abstract tutorial class to help you show your players how to do things
* ```ig.Spawner``` abstract spawner class with pooling for better performance
* ```ig.Particle``` abstract particle class with fading in and/or out, random velocities,...
* ```ig.EntityTrigger``` easy to use set of triggers for complex event driven behavior
* ```ig.EntityCheckpoint``` checkpoint for automatic player respawning on death
* ```ig.utils``` huge list of utility functions for vectors, drawing, intersections, math, tiles,...
* and too much more to reasonably list here! 

##How to Use
1. Download using one of the below links and extract the files.
2. Copy the **impactplusplus/lib/plusplus** folder into your new or existing ImpactJS project **lib** directory.
3. Either copy the **impactplusplus/lib/weltmeister/config.js** into your projet's **lib/weltmeister** directory...
4. Or, if you have a custom Weltmeister config:
	* add ```'lib/plusplus/entities/*.js'``` to the ```entityFiles``` setting
	* change the ```collisionTiles.path``` setting to ```'lib/weltmeister/collisiontiles_plusplus_64.png'```
5. Make sure you're comfortable with the [ImpactJS Documentation](http://impactjs.com/documentation)
6. Dive into the [Impact++ Documentation](http://collinhover.github.com/impactplusplus)

####Download
[
![Download Zip](http://github.com/images/modules/download/zip.png)
]
(http://github.com/collinhover/impactplusplus/zipball/master/)
[
![Download Zip](http://github.com/images/modules/download/tar.png)
]
(http://github.com/collinhover/impactplusplus/tarball/master/)

##Getting Started
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
            // don't forget to load your levels
            'path.to.area1',
            'path.to.area2',
            'path.to.areaEtc'
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
    
                    // override the game init function
    
                    init: function () {
    
                        this.parent();
    
                        // so we can load the first level
                        // which of course you didn't forget to require above
    
                        this.loadLevel(ig.global.LevelArea1);
    
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
Impact++ is licensed under the MIT license. For full license and information, see [LICENSE](https://github.com/collinhover/impactplusplus/blob/master/LICENSE.md),
