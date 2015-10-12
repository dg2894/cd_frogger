"use strict";

var app = app || {};

app.main = {
    //  properties
    WIDTH: 640,
    HEIGHT: 480,
    canvas: undefined,
    ctx: undefined,
    lastTime: 0, // used by calculateDeltaTime() 
    debug: true,
    BUN: Object.freeze({
        SIZE: 50,
        MOVE_SPEED: 10,
        XPOS: 200,
        YPOS: 200,
    }),
    OBSTACLE: Object.freeze({
        NUM_CIRCLES_START: 5,
        WIDTH: 50,
    }),
    BUN_STATE: Object.freeze({ //fake enumeration, actually an object literal
        STANDING: 0,
        MOVING: 4
    }),
    GAME_STATE: Object.freeze({ // another fake enumeration
        BEGIN: 0,
        DEFAULT: 1,
        END: 5
    }),

    numCircles: 0,
    paused: false,
    animationID: 0,
    gameState: undefined,
    roundScore: 0,
    totalScore: 0,


    bgAudio: undefined,
    effectAudio: undefined,
    currentEffect: 0,
    currentDirection: 1,

    sound: undefined,
    min_explosions: 0,
    fired: false,

    // methods
    init: function () {
        console.log("app.main.init() called");
        // initialize properties
        this.canvas = document.querySelector('canvas');
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.ctx = this.canvas.getContext('2d');

        this.gameState = this.GAME_STATE.BEGIN

        this.reset();

        //start the game loop
        this.update();

    },

    reset: function () {
        this.BUN = this.makeBun();
    },


    update: function () {
        // LOOP
        // schedule a call to update()
        this.animationID = requestAnimationFrame(this.update.bind(this));

        // HOW MUCH TIME HAS GONE BY?
        var dt = this.calculateDeltaTime();
        console.log(this.xDir);

        this.moveBun(dt);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.drawBun(this.ctx);
    },


    makeBun: function () {

        var bunMove = function (dt) {
            if (myKeys.keydown[myKeys.KEYBOARD.KEY_LEFT]) {
                this.x -= 5;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_RIGHT]) {
                this.x += 5;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_UP]) {
                this.y -= 5;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_DOWN]) {
                this.y += 5;
            } else {
                this.x += 0;
                this.y += 0;
            }
        }

        var bunDraw = function (ctx) {
            //draw circle
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.closePath();
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.restore();
        };

        var b = {};
        b.x = this.BUN.XPOS;
        b.y = this.BUN.YPOS;

        //add a radius property
        b.size = this.BUN.SIZE;

        //make more properites
        b.speed = this.BUN.MOVE_SPEED;
        b.fillStyle = "white";
        b.state = this.BUN_STATE.STANDING;

        //no more properties can be added!
        b.draw = bunDraw;
        b.move = bunMove;


        Object.seal(b);
        return b;
    },

    drawBun: function (ctx) {
        var b = this.BUN;
        b.draw(ctx)
    },

    moveBun: function (dt) {
        var b = this.BUN;
        b.move(dt);
    },

    calculateDeltaTime: function () {
        // what's with (+ new Date) below?
        // + calls Date.valueOf(), which converts it from an object to a 	
        // primitive (number of milliseconds since January 1, 1970 local time)
        var now, fps;
        now = (+new Date);
        fps = 1000 / (now - this.lastTime);
        fps = clamp(fps, 12, 60);
        this.lastTime = now;
        return 1 / fps;
    },

}; // end app.main