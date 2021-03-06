'use strict';

var Phaser = require('Phaser'),
    Ground = require('../prefabs/ground'),
    Pipe = require('../prefabs/pipe');


// A silent translucent bird
var SilentBird = function(game, x, y, frame, name, username, muneco) {
	
  //get color bird
  if(name === 'You')
  {
	  if(localStorage.getItem('muneco') === 'pmorado')
		{
			Phaser.Sprite.call(this, game, x, y, 'bird', frame);
			muneco = 'bird';
		}else if(localStorage.getItem('muneco') === 'pverde')
		{
			Phaser.Sprite.call(this, game, x, y, 'birdgreen', frame);
			muneco = 'birdgreen';
		}else if(localStorage.getItem('muneco') === 'projo')
		{
			Phaser.Sprite.call(this, game, x, y, 'birdred', frame);
			muneco = 'birdred';
		}
		else if(localStorage.getItem('muneco') === 'newazul')
		{
			Phaser.Sprite.call(this, game, x, y, 'newbirdblue', frame);
			muneco = 'newbirdblue';
		}else if(localStorage.getItem('muneco') === 'rosa')
		{
			Phaser.Sprite.call(this, game, x, y, 'rosa', frame);
			muneco = 'rosa';
		}
  }else{
	  Phaser.Sprite.call(this, game, x, y, muneco, frame);
  }
  
  this.anchor.setTo(0.5, 0.5);
  this.animations.add('flap');
  this.animations.play('flap', 12, true);

  //add text name in bird
	var style = { font: '14px flappyfont', fill: '#ff0044', wordWrap: true, wordWrapWidth: this.width, align: 'center' };
	this.text = this.game.add.text(0, 0, username, style);
    this.text.anchor.set(0.5);
	
   //add weapon
   this.weapon = game.add.weapon(1, 'bulletpink');
   this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
   this.weapon.bulletSpeed = 1200;
   this.weapon.fireRate = 100;
   this.weapon.trackSprite(this, 0, 0, true);

  this.score = 0;
  this.username = username;
  this.muneco = muneco;
  this.name = name;
  this.alive = false;
  this.onGround = false;
  this.alpha = 0.4;
  

  // enable physics on the bird
  // and disable gravity on the bird
  // until the game is started
  this.game.physics.arcade.enableBody(this);
  this.body.allowGravity = false;
  this.body.collideWorldBounds = false;

  this.events.onKilled.add(this.onKilled, this);
};

SilentBird.prototype = Object.create(Phaser.Sprite.prototype);
SilentBird.prototype.constructor = SilentBird;

SilentBird.prototype.update = function() {
	// update position text
	this.text.x = Math.floor(this.body.x + 17 );
    this.text.y = Math.floor(this.body.y - 28);

  // check to see if our angle is less than 90
  // if it is rotate the bird towards the ground by 2.5 degrees
  if(this.angle < 90 && this.alive) {
    this.angle += 2.5;
  }
};

SilentBird.prototype.flap = function() {
  if(!!this.alive) {
    if (this.flapSound) {
      this.flapSound.play();
    }

    //cause our bird to "jump" upward
    this.body.velocity.y = -400;

    // rotate the bird to -40 degrees
    this.game.add.tween(this).to({angle: -40}, 100).start();
  }
};

SilentBird.prototype.fire = function() {
    this.weapon.fire();
};

SilentBird.prototype.onKilled = function() {
  this.exists = true;
  this.visible = true;
  this.animations.stop();
  var duration = 90 / this.y * 300;
  this.game.add.tween(this).to({angle: 90}, duration).start();
};

SilentBird.prototype.deathHandler = function(enemy) {
  if (enemy instanceof Ground && !this.onGround) {
    if (this.groundHitSound) {
      this.groundHitSound.play();
    }
    this.onGround = true;
  } else if (enemy instanceof Pipe) {
    if (this.pipeHitSound) {
      this.pipeHitSound.play();
    }
  }
  this.body.velocity.x = 0;
};

// Serialize ourself
SilentBird.prototype.serialize = function() {
  return {
	score: this.score,
	username: this.username,
	muneco: this.muneco,
    x: this.body.x + (localStorage.getItem('x') / 2),
    y: this.body.y + (localStorage.getItem('y') / 2),
    dx: this.body.velocity.x,
    dy: this.body.velocity.y,
    gravity: this.body.allowGravity,
    angle: this.angle,
    alive: this.alive,
    onGround: this.onGround
  };
};

// Unserialize ourself
SilentBird.prototype.unserialize = function(data) {
  this.score = data.score;
  this.username = data.username;
  this.muneco = data.muneco;
  this.body.allowGravity = data.gravity;
  this.angle = data.angle;
  this.alive = data.alive;
  this.onGround = data.onGround;
  this.reset(data.x, data.y);
  this.body.velocity.setTo(data.dx, data.dy);

  if (data.event === 'flap') {
    this.game.add.tween(this).to({angle: -40}, 100).start();
  } else if (data.event === 'killed') {
    this.kill();
  }else if (data.event === 'fire') {
    this.weapon.fire();
  }
};

module.exports = SilentBird;
