/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of 
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

window.onload = function () {
    console.log("window.onload called");
    //this is the "sandbox" where we hook our modules up
    //so that we don't have any hard coded dependences in
    //the modules themselves
    //more full blown sandbox solutions are discussed here:
    //http://addyosmani.com/writing-modular-js
    //app.sound.init();
    //app.main.sound = app.sound;

    app.main.init();
};


window.onblur = function () {
    console.log("blur at" + Date());
    app.main.paused = true;
    cancelAnimationFrame(app.main.animationID)
    app.main.update();
    app.main.pauseGame();
};

window.onfocus = function () {
    console.log("focus at " + Date());
    cancelAnimationFrame(app.main.animationID);
    app.main.paused = false;
    app.main.update();
    app.main.resumeGame();
};