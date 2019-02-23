
// GameBoard code below
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
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
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

function Naruto(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.spriteSheet = ASSET_MANAGER.getAsset("./img/naruto.png");
    this.animation = new Animation(this.spriteSheet, 159, 192, 1, 1, 1, true, .5)
    this.player = 1;
    this.radius = 20;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
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
            this.game.addEntity(new Naruto(this.game));
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

// function Circle(game) {
//     this.player = 1;
//     this.radius = 20;
//     this.colors = ["Red", "Green", "Blue", "White"];
//     this.color = 3;
//     Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
//     this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
//     var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
//     if (speed > maxSpeed) {
//         var ratio = maxSpeed / speed;
//         this.velocity.x *= ratio;
//         this.velocity.y *= ratio;
//     };
// }

// Circle.prototype = new Entity();
// Circle.prototype.constructor = Circle;

// Circle.prototype.collideRight = function () {
//     return this.x + this.radius > 800;
// };
// Circle.prototype.collideLeft = function () {
//     return this.x - this.radius < 0;
// };
// Circle.prototype.collideBottom = function () {
//     return this.y + this.radius > 800;
// };
// Circle.prototype.collideTop = function () {
//     return this.y - this.radius < 0;
// };

// Circle.prototype.collide = function (other) {
//     return distance(this, other) < this.radius + other.radius;
// };

// Circle.prototype.update = function () {
//     Entity.prototype.update.call(this);

//     this.x += this.velocity.x * this.game.clockTick;
//     this.y += this.velocity.y * this.game.clockTick;

//     if (this.collideLeft() || this.collideRight()) {
//         this.velocity.x = -this.velocity.x;
//     }
//     if (this.collideTop() || this.collideBottom()) {
//         this.velocity.y = -this.velocity.y;
//     }

//     for (var i = 0; i < this.game.entities.length; i++) {
//         var ent = this.game.entities[i];
//         if (this != ent && this.collide(ent) && count < 20) {
//             var temp = this.velocity;
//             this.velocity = ent.velocity;
//             ent.velocity = temp;
//             this.game.addEntity(new Circle(this.game));
//             count++;
//         };
//     };

//     for (var i = 0; i < this.game.entities.length; i++) {
//         var ent = this.game.entities[i];
//         if (this != ent) {
//             var dist = distance(this, ent);
//             var difX = (ent.x - this.x) / dist;
//             var difY = (ent.y - this.y) / dist;
//             this.velocity.x += difX / (dist * dist) * acceleration;
//             this.velocity.y += difY / (dist * dist) * acceleration;

//             var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
//             if (speed > maxSpeed) {
//                 var ratio = maxSpeed / speed;
//                 this.velocity.x *= ratio;
//                 this.velocity.y *= ratio;
//             };
//         };
//     }

//     this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
//     this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;

// }

// Circle.prototype.draw = function (ctx) {
//     ctx.beginPath();
//     ctx.fillStyle = this.colors[this.color];
//     ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//     ctx.fill();
//     ctx.closePath();
// }

var friction = 1;
var acceleration = 10000;
var maxSpeed = 2000;
let count = 2;

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/naruto.png");
ASSET_MANAGER.queueDownload("./img/leafvil.jpg");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    village = new Background(gameEngine, ASSET_MANAGER.getAsset("./img/leafvil.jpg"))
    naruto = new Naruto(gameEngine);
    narutoClone = new Naruto(gameEngine)

    gameEngine.addEntity(village);
    gameEngine.addEntity(naruto);
    gameEngine.addEntity(narutoClone);

});
