"use strict";

var app = app || {};

app.main = {
    //  properties
    WIDTH: 900,
    HEIGHT: 800,
    canvas: undefined,
    ctx: undefined,
    lastTime: 0, // used by calculateDeltaTime() 
    debug: true,
    BUN: Object.freeze({
        WIDTH: 40,
        HEIGHT: 64,
        MOVE_SPEED: 10,
        XPOS: 200,
        YPOS: 200,
        image: undefined,
    }),
    OBSTACLE: Object.freeze({
        NUM_OBSTACLES: 5,
        WIDTH: 100,
        HEIGHT: 63,
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
    paused: false,
    animationID: 0,
    gameState: undefined,
    roundScore: 0,
    hopped: false,
    bunImage: undefined,
    carImage: undefined,

    // methods
    init: function () {
        console.log("app.main.init() called");
        // initialize properties
        this.canvas = document.querySelector('canvas');
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.ctx = this.canvas.getContext('2d');

        this.gameState = this.GAME_STATE.BEGIN;

        this.bunImage = new Image();
        this.bunImage.src = "../images/bunny.png";

        this.carImage = new Image();
        this.carImage.src = "../images/redcar.png";

        this.reset();

        //start the game loop
        this.update();

    },

    update: function () {
        // LOOP
        // schedule a call to update()
        this.animationID = requestAnimationFrame(this.update.bind(this));

        if (this.paused) {
            this.drawPauseScreen(this.ctx);
            return;
        }



        // HOW MUCH TIME HAS GONE BY?
        var dt = this.calculateDeltaTime();

        this.moveBun(dt);
        this.moveObstacle(dt);

        this.checkCollision();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.drawBun(this.ctx);
        this.drawObstacle(this.ctx);
    },


    reset: function () {
        this.BUN = this.makeBun();
        this.obstacles = this.makeObs(this.OBSTACLE.NUM_OBSTACLES);

    },

    drawPauseScreen: function (ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = "12pt Arial"
        ctx.fillText("PAUSED", this.WIDTH / 2, this.HEIGHT / 2);
        ctx.restore();
    },


    pauseGame: function () {
        this.paused = true;
        //stop the animation loop
        cancelAnimationFrame(this.animationID);
        //call update() once so that our paused screen gets drawn
        this.update();
    },

    resumeGame: function () {
        //stop the animation loop, just in case it's running
        cancelAnimationFrame(this.animationID);
        this.paused = false;
        //restart the loop
        this.update();
    },

    checkCollision: function () {
        for (var i = 0; i < this.obstacles.length; i++) {
            if (squaresIntersect(this.BUN, this.obstacles[i])) {
                this.obstacles[i].speed = 0;
            }
        }
    },

    makeObs: function (num) {

        var obstacleMove = function (dt) {
            if (this.x < this.playWidth) {
                this.x += this.speed;
            } else if (this.x >= this.playWidth) {
                this.x = 0;
            }
        }

        var obstacleDraw = function (ctx) {
            ctx.save();
            ctx.translate(this.x, this.y)
            ctx.translate(this.width / 2, this.height / 2)
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -(this.width / 2), -(this.height / 2), this.width, this.height);
            ctx.restore();
            /*            ctx.save();
                        ctx.beginPath();
                        ctx.rect(this.x, this.y, this.width, this.height);
                        ctx.closePath();
                        ctx.fillStyle = "red"
                        ctx.strokeStyle = "white";
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();*/
        }

        var array = [];
        var theY = 40;
        var make = true;
        var numOb = 0;

        while (numOb < 5) {

            var o = {};
            o.width = this.OBSTACLE.WIDTH;
            o.height = this.OBSTACLE.HEIGHT;

            o.playWidth = this.WIDTH;
            o.playHeight = this.HEIGHT;


            o.x = 20;
            o.y = theY; //initial 40


            if (array.length > 0) { //if array is larger than 1
                for (var n = 0; n < array.length; n++) { //loop thru exisiting array
                    o.y = theY; //update the y value to latest theY
                    if (squaresIntersect(array[n], o)) { //check if squares intersect
                        make = false; //if they do, don't make the square
                        theY = getRandom(0, o.playHeight - o.height); //find a new theY
                        break;
                    } else { //squares do not intersect
                        make = true; //make the new square
                    }
                }
            }

            if (make) {
                o.speed = getRandom(2, 10);

                o.image = this.carImage;
                o.rotation = 0;

                o.draw = obstacleDraw;
                o.move = obstacleMove;

                Object.seal(o);
                array.push(o);
                numOb++;
            }

        }

        return array;

    },

    makeBun: function () {

        var bunMove = function (dt) {
            if (myKeys.keydown[myKeys.KEYBOARD.KEY_LEFT] && this.x > 0 && !app.main.hopped) {
                this.x -= this.width;
                app.main.hopped = true;
                this.rotation = -(Math.PI / 2);
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_RIGHT] && this.x < this.playWidth - this.width && !app.main.hopped) {
                this.x += this.width;
                this.rotation = Math.PI / 2;
                app.main.hopped = true;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_UP] && this.y > 0 && !app.main.hopped) {
                this.y -= this.width;
                this.rotation = 0;
                app.main.hopped = true;
            } else if (myKeys.keydown[myKeys.KEYBOARD.KEY_DOWN] && this.y < this.playHeight - this.height && !app.main.hopped) {
                this.y += this.width;
                this.rotation = Math.PI;
                app.main.hopped = true;

            } else {
                this.x += 0;
                this.y += 0;
            }
        }

        var bunDraw = function (ctx) {
            ctx.save();
            ctx.translate(this.x, this.y)
            ctx.translate(this.width / 2, this.height / 2)
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -(this.width / 2), -(this.height / 2), this.width, this.height);
            ctx.restore();
            /*ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.closePath();
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.restore();*/

        };

        var b = {};


        b.width = this.BUN.WIDTH;
        b.height = this.BUN.HEIGHT;

        b.playWidth = this.WIDTH;
        b.playHeight = this.HEIGHT;

        b.x = this.WIDTH / 2 - b.width / 2;
        b.y = this.HEIGHT / 2 - b.height / 2;

        b.hopped = this.hopped;

        b.image = this.bunImage;
        b.rotation = 0;

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