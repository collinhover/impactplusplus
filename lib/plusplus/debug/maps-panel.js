ig.module(
    'plusplus.debug.maps-panel'
)
    .requires(
        'plusplus.debug.menu',
        'plusplus.core.game',
        'plusplus.core.background-map'
)
    .defines(function() {
        "use strict";


        ig.GameExtended.inject({
            buildLevel: function() {
                this.parent.apply(this, arguments);
                ig.debug.panels.maps.load(this);
            },
            unloadLevel: function() {
                this.parent.apply(this, arguments);
                ig.debug.panels.maps.maps = [];
            }
        });


        ig.DebugMapsPanel = ig.DebugPanel.extend({
            maps: [],
            mapScreens: [],


            init: function(name, label) {
                this.parent(name, label);
                this.load();
            },


            load: function(game) {
                this.options = [];
                this.panels = [];

                if (!game) {
                    this.container.innerHTML = '<em>No Maps Loaded</em>';
                    return;
                }

                this.maps = [];

                for (var i = 0, il = game.layers.length; i < il; i++) {

                    var layer = game.layers[i];

                    if (layer.numBackgroundMaps > 0) {

                        for (var j = 0, jl = layer.items.length; j < jl; j++) {

                            var item = layer.items[j];

                            if (item instanceof ig.BackgroundMap) {

                                this.maps.push(item);

                            }

                        }

                    }

                }

                if (this.maps.length === 0) {
                    this.container.innerHTML = '<em>No Maps Loaded</em>';
                    return;
                }

                this.mapScreens = [];
                this.container.innerHTML = '';

                for (var m = 0; m < this.maps.length; m++) {
                    var map = this.maps[m];

                    var subPanel = new ig.DebugPanel(m, 'Layer ' + m);

                    var head = ig.$new('strong');
                    head.textContent = m + ': ' + map.tiles.path;
                    subPanel.container.appendChild(head);

                    subPanel.addOption(new ig.DebugOption('Enabled', map, 'enabled'));
                    subPanel.addOption(new ig.DebugOption('Pre Rendered', map, 'preRender'));
                    subPanel.addOption(new ig.DebugOption('Show Chunks', map, 'debugChunks'));

                    this.generateMiniMap(subPanel, map, m);
                    this.addPanel(subPanel);
                }
            },


            generateMiniMap: function(panel, mapBase, id) {
                var s = ig.system.scale; // we'll need this a lot

                // get all maps

                var maps = [mapBase];

                if (mapBase.mergedMaps) {

                    maps = maps.concat(mapBase.mergedMaps);

                }

                // get max map size

                var totalMergedWidth = 0;
                var totalMergedHeight = 0;

                for (var i = 0, il = maps.length; i < il; i++) {

                    var map = maps[i];

                    totalMergedWidth = Math.max(totalMergedWidth, map.width);
                    totalMergedHeight = Math.max(totalMergedHeight, map.height);

                }

                // create the minimap canvas
                var mapCanvas = ig.$new('canvas');
                mapCanvas.width = totalMergedWidth * s;
                mapCanvas.height = totalMergedHeight * s;
                var ctx = mapCanvas.getContext('2d');

                if (ig.game.clearColor) {
                    ctx.fillStyle = ig.game.clearColor;
                    ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
                }

                for (var i = 0, il = maps.length; i < il; i++) {

                    var map = maps[i];

                    // make sure map is resized to system scale

                    if (!map.tiles.ignoreSystemScale && map.tiles._scale !== s) {

                        map.tiles.resize(s);

                    }

                    // resize the tileset, so that one tile is 's' pixels wide and high
                    var ts = ig.$new('canvas');
                    var tsctx = ts.getContext('2d');

                    var w = map.tiles.width * s;
                    var h = map.tiles.height * s;
                    var ws = w / map.tilesize;
                    var hs = h / map.tilesize;
                    ts.width = ws;
                    ts.height = hs;

                    tsctx.drawImage(map.tiles.data, 0, 0, w, h, 0, 0, ws, hs);

                    // draw the map
                    var tile = 0;
                    for (var x = 0; x < map.width; x++) {
                        for (var y = 0; y < map.height; y++) {
                            if ((tile = map.data[y][x])) {
                                ctx.drawImage(
                                    ts,
                                    Math.floor(((tile - 1) * s) % ws),
                                    Math.floor((tile - 1) * s / ws) * s,
                                    s, s,
                                    x * s, y * s,
                                    s, s
                                );
                            }
                        }
                    }
                }

                var mapContainer = ig.$new('div');
                mapContainer.className = 'ig_debug_map_container';
                mapContainer.style.width = map.width * s + 'px';
                mapContainer.style.height = map.height * s + 'px';

                var mapScreen = ig.$new('div');
                mapScreen.className = 'ig_debug_map_screen';
                mapScreen.style.width = ((ig.system.width / map.tilesize) * s - 2) + 'px';
                mapScreen.style.height = ((ig.system.height / map.tilesize) * s - 2) + 'px';
                this.mapScreens[id] = mapScreen;

                mapContainer.appendChild(mapCanvas);
                mapContainer.appendChild(mapScreen);
                panel.container.appendChild(mapContainer);
            },


            afterRun: function() {
                // Update the screen position DIV for each mini-map
                var s = ig.system.scale;
                for (var m = 0; m < this.maps.length; m++) {
                    var map = this.maps[m];
                    var screen = this.mapScreens[m];

                    if (!map || !screen) { // Quick sanity check
                        continue;
                    }

                    var x = map.scroll.x / map.tilesize;
                    var y = map.scroll.y / map.tilesize;

                    if (map.repeat) {
                        x %= map.width;
                        y %= map.height;
                    }

                    screen.style.left = (x * s) + 'px';
                    screen.style.top = (y * s) + 'px';
                }
            }
        });


        ig.debug.addPanel({
            type: ig.DebugMapsPanel,
            name: 'maps',
            label: 'Background Maps'
        });


    });
