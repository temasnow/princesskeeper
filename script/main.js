var gamejs = require('gamejs');
var box2d = require('./Box2dWeb-2.1.a.3');
var object = require('object');

//------------------------------------------------------------------------------
// preload everything, call main when done
var data = [
    
    "../data/block00.png",
    "../data/block01.png",
    "../data/block02.png",
    "../data/block03.png",
    "../data/floor.png",
];
gamejs.preload(data);
gamejs.ready(main);

//------------------------------------------------------------------------------
// gameplay elements
var NUM_BLOCK_KINDS = 4;
var gBlockStore = null;
var gBlockSet = null;
var gBlockPickup = null;
var gFloor = null;

//------------------------------------------------------------------------------
// Box2D stuff
var BOX2D_SCALE = 30.0;
var b2World = null;
var b2Draw = false;

//------------------------------------------------------------------------------
// entry point
function main() {

    init();
    gamejs.time.fpsCallback(update, this, 24);
}

//------------------------------------------------------------------------------
// create everything
function init() {

    // set display size
    gamejs.display.setMode([1024, 768]);
    
    // create Box2D world
    b2World = new box2d.b2World(
       new box2d.b2Vec2(0, 10),  // gravity
       true                      // allow sleep
    );

    // create block store
    gBlockStore = new gamejs.sprite.Group();
    for (var i=0; i<NUM_BLOCK_KINDS; i++) {
        gBlockStore.add(new object.block([32 + i*64, 32], i));
    }
    
    // create empty block set
    gBlockSet = new gamejs.sprite.Group();
    
    // create floor
    gFloor = new object.floor([0, 640], b2World);

    //setup debug draw
    var debugDraw = new box2d.b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("gjs-canvas").getContext("2d"));
    debugDraw.SetDrawScale(BOX2D_SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);
    b2World.SetDebugDraw(debugDraw);
}
    
//------------------------------------------------------------------------------
// gather input then draw
function update(dt) {
    
    input();
    
    // update physics
    b2World.Step(
        1 / 24,  //frame-rate
        10,      //velocity iterations
        10       //position iterations
    );
    b2World.ClearForces();
    
    // update block positions
    gBlockSet.forEach(function(block) {
        block.update(dt);
    });

    draw();    
}

//------------------------------------------------------------------------------
// handle key / mouse events
function input() {
    
    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.KEY_DOWN) {
            if (event.key === gamejs.event.K_b) {
                b2Draw = true;
            };
        } else if (event.type === gamejs.event.KEY_UP) {
            if (event.key === gamejs.event.K_b) {
                b2Draw = false;
            };
        } else if (event.type === gamejs.event.MOUSE_DOWN) {
            gBlockStore.forEach(function(block) {
                if (block.rect.collidePoint(event.pos)) {
                    gBlockPickup = new object.block(block.rect.topleft, block.index);
                }
            });
        } else if (event.type === gamejs.event.MOUSE_UP) {
            if (gBlockPickup) {
                gBlockPickup.turnOnPhysics(b2World);
                gBlockSet.add(gBlockPickup);
                gBlockPickup = null;
            }
        } else if (event.type === gamejs.event.MOUSE_MOTION) {
            if (gBlockPickup) {
                gBlockPickup.rect.topleft = event.pos;
            }
        }
    });
}

//------------------------------------------------------------------------------
// blit
function draw() {
    
    gamejs.display.getSurface().fill('white');
    
    var mainSurface = gamejs.display.getSurface();
    gBlockStore.draw(mainSurface);
    gBlockSet.draw(mainSurface);
    if (gBlockPickup) {
        gBlockPickup.draw(mainSurface);
    }
    gFloor.draw(mainSurface);

    if (b2Draw) {
        b2World.DrawDebugData();
    }
}