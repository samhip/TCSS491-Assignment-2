

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
        this.x, this.y);
};

Background.prototype.update = function () {
};

function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

var game;

function Naruto(game, x, y) {
    this.game = game;
    this.ctx = game.ctx;
    this.spriteSheet = ASSET_MANAGER.getAsset("./img/naruto.png");
    this.animation = new Animation(this.spriteSheet, 159, 192, 1, 1, 1, true, .5)
    this.player = 1;
    this.radius = 20;
    Entity.call(this, game, this.radius + x, this.radius + y);
    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    };
}

Naruto.prototype = new Entity();
Naruto.prototype.constructor = Naruto;

Naruto.prototype.collideRight = function () {
    return this.x + this.radius > 800;
};
Naruto.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Naruto.prototype.collideBottom = function () {
    return this.y + this.radius > 800;
};
Naruto.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};

Naruto.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Naruto.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

Naruto.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.collide(ent) && count < 50) {
            var temp = this.velocity;
            this.velocity = ent.velocity;
            ent.velocity = temp;
            this.game.addEntity(new Naruto(this.game, Math.random() * (800 - this.radius * 2), Math.random() * (800 - this.radius * 2)));
            count++;
        };
    };

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent) {
            var dist = distance(this, ent);
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            this.velocity.x += difX / (dist * dist) * acceleration;
            this.velocity.y += difY / (dist * dist) * acceleration;

            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > maxSpeed) {
                var ratio = maxSpeed / speed;
                this.velocity.x *= ratio;
                this.velocity.y *= ratio;
            };
        };
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;

}

var friction = 1;
var acceleration = 10000;
var maxSpeed = 2000;
let count = 2;



var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/naruto.png");
ASSET_MANAGER.queueDownload("./img/leafvil.jpg");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    game = gameEngine;

    game.init(ctx);
    game.start();

    var village = new Background(game, ASSET_MANAGER.getAsset("./img/leafvil.jpg"))
    var naruto = new Naruto(game, 300, 300);
    var narutoClone = new Naruto(game, 500, 500)

    game.addEntity(village);
    game.addEntity(naruto);
    game.addEntity(narutoClone);

    // Assignment 3

    var socket = io.connect("http://24.16.255.56:8888");

    socket.on("load", function (data) {
        console.log(data);

        game.entities = [];
        var dataInfo = data.data.stuff;
        for (var i = 0; i < dataInfo.length; i++) {
            var info = dataInfo[i];
            var clone = new Naruto(game, info.x, info.y);
            clone.velocity = info.velocity;
            console.log(info.velocity);
            game.addEntity(clone);
        }
    });

    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");

    saveButton.onclick = function () {
        console.log("save");
        text.innerHTML = "Saved."

        var state = {
            stuff: []
        };
        for (var i = 0; i < game.entities.length; i++) {
            var entiddy = game.entities[i];

            state.stuff.push({
                "x": entiddy.x,
                "y": entiddy.y,
                "velocity": entiddy.velocity
            });
        }
        console.log(state);
        socket.emit("save", { studentname: "Sam Hipolito", statename: "narutoes", data: state });
    };

    loadButton.onclick = function () {
        console.log("load");
        text.innerHTML = "Loaded."
        socket.emit("load", { studentname: "Sam Hipolito", statename: "narutoes" });
    };

});
