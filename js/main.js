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
        YPOS: 200
    }),
    OBSTACLE: Object.freeze({
        NUM_OBSTACLES: 5,
        WIDTH: 20,
        XPOS: 10,
        YPOS: 10,
        MOVE_SPEED: 8
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

    obstacles: [],
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
        this.obstacles = this.makeObs(this.OBSTACLE.NUM_OBSTACLES);

    },


    update: function () {
        // LOOP
        // schedule a call to update()
        this.animationID = requestAnimationFrame(this.update.bind(this));

        // HOW MUCH TIME HAS GONE BY?
        var dt = this.calculateDeltaTime();

        this.moveBun(dt);
        this.moveObstacle(dt);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.drawBun(this.ctx);
        this.drawObstacle(this.ctx);
    },

    makeObs: function (num) {

        var obstacleMove = function (dt) {
            if (this.x < 640) {
                this.x += getRandom(5, 20);
            } else if (this.x >= 640) {
                this.x = 0;
            }
        }

        var obstacleDraw = function (ctx) {
            console.log("called");
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.closePath();
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.restore();
        }

        var array = [];
        for (var i = 0; i < 5; i++) {

            var o = {};
            o.x = 20;
            o.y = getRandom(0, 480);

            o.size = this.OBSTACLE.WIDTH;

            o.speed = this.OBSTACLE.MOVE_SPEED;

            o.draw = obstacleDraw;
            o.move = obstacleMove;

            Object.seal(o);
            array.push(o);
        }

        return array;

    },

    makeBun: function () {

        var bunMove = function (dt) {
            if (myKeys.keydown[myKeys.KEYBOARD.KEY_LEFT] && this.x > 0) {
                this.x -= 5;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_RIGHT] && this.x < 640 - 50) {
                this.x += 5;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_UP] && this.y > 0) {
                this.y -= 5;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_DOWN] && this.y < 480 - 50) {
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

    drawObstacle: function (ctx) {
        for (var i = 0; i < this.obstacles.length; i++) {
            var o = this.obstacles[i];
            o.draw(ctx);
        }
    },

    moveObstacle: function (dt) {
        for (var i = 0; i < this.obstacles.length; i++) {
            var o = this.obstacles[i]
            o.move(dt);
        }
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