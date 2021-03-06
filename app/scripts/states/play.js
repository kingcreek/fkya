'use strict';
var Phaser = require('Phaser'),
    Bird = require('../prefabs/bird'),
    SilentBird = require('../prefabs/silentbird'),
    Ground = require('../prefabs/ground'),
    PipeGroup = require('../prefabs/pipeGroup'),
    io = require('socket.io-client'),
	Scoreboard = require('../prefabs/scoreboard');

var http = require('https');

var MAX_WIDTH = 576,
    DEBUG = false;
var mayorName = ''; var mayorScore = '';
var miMaxScore = 0;

function getUrlParam(param)
{
  param = param.replace(/([\[\](){}*?+^$.\\|])/g, '\\$1');
  var regex = new RegExp('[?&]' + param + '=([^&#]*)');
  var url   = decodeURIComponent(window.location.href);
  var match = regex.exec(url);
  return match ? match[1] : 'KyA';
}

function Play() {
}

Play.prototype = {
	preload: function() {
  },
  
  create: function() {
	  
	//read best score
	//if(!!localStorage) {
	//	miMaxScore = localStorage.getItem('bestScore');
	//} else {
	//	miMaxScore = 0;
    //}
  
    // start the phaser arcade physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, MAX_WIDTH, this.game.height);

    // give our world an initial gravity of 1200
    this.game.physics.arcade.gravity.y = 1200;

    // add the background sprite
    this.background = this.game.add.tileSprite(0, 0,
                                               this.game.width,
                                               this.game.height,
                                               'background');
    this.background.fixedToCamera = true;
    this.background.autoScroll(-10, 0);

    // create and add a group to hold our pipeGroup prefabs
    this.pipes = this.game.add.group();

    // create and add a new Bird object
    this.bird = new Bird(this.game, 100, this.game.height / 2);
    this.game.add.existing(this.bird);
    this.game.camera.follow(this.bird);
	
    // create and add a new Ground object
    this.ground = new Ground(this.game, 0, 400, this.game.width, 112);
    this.game.add.existing(this.ground);

    // add keyboard controls
    this.flapKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.flapKey.onDown.addOnce(this.startGame, this);
    this.flapKey.onDown.add(this.flap, this);

    // add mouse/touch controls
    this.game.input.onDown.addOnce(this.startGame, this);
    this.game.input.onDown.add(this.flap, this);

    // keep the spacebar from propogating up to the browser
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
	
	//set weapon control
	this.fireKey = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
    this.fireKey.onDown.add(this.fire, this);
	
	this.score = 0;
    this.scoreText = this.game.add.bitmapText(this.game.width/2, 10, 'flappyfont',this.score.toString(), 24);
	this.scoreText.fixedToCamera = true;
	
	this.scoreList = this.game.add.bitmapText(this.game.width, this.game.height, 'flappyfont', mayorName + mayorScore, 24);
	this.scoreList.fixedToCamera = true;
	this.scoreList.anchor.setTo(1, 1);

    this.instructionGroup = this.game.add.group();
    this.instructionGroup.add(this.game.add.sprite(this.game.width / 2,
                                                   100, 'getReady'));
    this.instructionGroup.add(this.game.add.sprite(this.game.width / 2,
                                                   325, 'instructions'));
    this.instructionGroup.setAll('anchor.x', 0.5);
    this.instructionGroup.setAll('anchor.y', 0.5);

    this.pipeGenerator = null;

    this.gameover = false;
	this.pipeHitSound = this.game.add.audio('pipeHit');
    this.groundHitSound = this.game.add.audio('groundHit');
    this.scoreSound = this.game.add.audio('score');

    // Handle socket.io
    this.clones = this.game.add.group();
    this.socket = io.connect();
    this.socket.on('position', function(data) {
      var name = 'C' + data.sender;
	  
      //console.debug('[Flappy] Position received for ' + name, data);

	  //store best score
		if(data.score > mayorScore) {
			mayorScore = data.score;
			mayorName = data.username + ': ';
			this.scoreList.setText(mayorName + mayorScore);
		}
	 // Only Clone if my socket not equals to socket recibe
	  if(name !== 'C' + this.socket.id) {
		
      // Do we have already this one?
      var clone = this.clones.filter(function(child) {
        return child.name === name;
      }, true).first;
      if (!clone) {
        clone = this.clones.getFirstExists(false);
        clone = new SilentBird(this.game, data.x, data.y, null, name, data.username, data.muneco);
	    this.clones.add(clone);
		}
		clone.unserialize(data);
	  }
    }.bind(this));
	
  },

  update: function() {
	  
    // enable collisions between the bird and the ground
    this.game.physics.arcade.collide(this.bird, this.ground, this.deathHandler, null, this);
    this.game.physics.arcade.collide(this.clones, this.ground);
	
	// enable collisions between the bullets and the ground && clones && birds
	this.game.physics.arcade.collide(this.clones, this.bird.weapon.bullets);
	//only is not my bullet
	if(this.bird.name !== 'You')
	{
		this.game.physics.arcade.collide(this.bird, this.bird.weapon.bullets, this.deathHandler, null, this);
	}//else{
		//my bullet can hit me
		//this.game.physics.arcade.collide(this.bird, this.bird.weapon.bullets);
	//}
	this.game.physics.arcade.collide(this.ground, this.bird.weapon.bullets);

    if (!this.gameover) {
        // enable collisions between the bird and each group in the pipes group
        this.pipes.forEach(function(pipeGroup) {
		  this.checkScore(pipeGroup);
          this.game.physics.arcade.collide(this.bird, pipeGroup, this.deathHandler, null, this);
          this.game.physics.arcade.collide(this.clones, pipeGroup);
		  
		  // enable collisions between the bullets and each group in the pipes group
		  this.game.physics.arcade.collide(pipeGroup, this.bird.weapon.bullets);
        }, this);
    }

    // Update world bounds
    this.game.world.setBounds(this.bird.body.x - 100, 0,
                              MAX_WIDTH, this.game.height);

  },

  render: function() {
    if (DEBUG) {
      this.game.debug.cameraInfo(this.game.camera, 10, 10);
      this.game.debug.spriteCoords(this.bird, 10, this.game.height - 60);
    }
  },

  shutdown: function() {
    this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    this.bird.destroy();
    this.pipes.destroy();
    this.clones.destroy();
  },

  startGame: function() {
    if (!this.bird.alive && !this.gameover) {
		
      this.bird.body.allowGravity = true;
      this.bird.alive = true;
      this.bird.body.velocity.x = 200;
      this.socket.emit('position', this.bird.serialize());

      // Use a common seed for randomness
      this.game.rnd.sow([5654, 7655, 8765]);

      // add a timer
      this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.25,
                                                      this.generatePipes, this);
      this.pipeGenerator.timer.start();

      this.instructionGroup.destroy();
    }
  },
  
  checkScore: function(pipeGroup) {
    if(pipeGroup.exists && !pipeGroup.hasScored && pipeGroup.topPipe.world.x <= this.bird.world.x) {
        pipeGroup.hasScored = true;
        this.score++;
		
		if(this.score < miMaxScore) {
			this.bird.score = miMaxScore;
		}else{
			this.bird.score = this.score;
		}
        this.scoreText.setText(this.score.toString());
        this.scoreSound.play();
    }
  },

  flap: function() {
	  this.bird.flap();
	  if (!this.gameover) {
		  var data = this.bird.serialize();
		  data.event = 'flap';
		  this.socket.emit('position', data);
	  }
  },
  
  fire: function() {
	if (!this.gameover) {
		this.bird.fire();
		var data = this.bird.serialize();
		data.event = 'fire';
		this.socket.emit('position', data);
	}
  },

  deathHandler: function(bird, enemy) {
    bird.deathHandler(enemy);

    // If we are dead, it's game over
    if (bird === this.bird && !this.gameover) {
      this.gameover = true;
      this.bird.kill();
      this.pipes.callAll('stop');
      this.pipeGenerator.timer.stop();
      this.ground.stopScroll();
      this.background.stopScroll();

      var data = this.bird.serialize();
      data.event = 'killed';
      this.socket.emit('position', data);
	  
	  

	  //show scoreboard
	  this.scoreboard = new Scoreboard(this.game);
      this.game.add.existing(this.scoreboard);
      this.scoreboard.show(this.score);
	  
	  var options = {
  hostname: 'cooeekya.esy.es',
  port: 443,
  path: '/chat/includes/fbird.php',
  method: 'POST',
  headers: {
	  'Content-Type': 'application/json',
  }
};
var req = http.request(options, function(){//res) {
  //console.log('Status: ' + res.statusCode);
  //console.log('Headers: ' + JSON.stringify(res.headers));
 // res.on('data', function (body) {
    //console.log('Body: ' + body);
//  });
});
//req.on('error', function(e) {
  //console.log('problem with request: ' + e.message);
//});
// write data to request body
req.write('{"nomb": "' + getUrlParam('name') + '", "punt": "' + this.score + '"}');
req.end();
		
	  
      // add a restart button with a callback
      //var t = this.game.time.events.add(Phaser.Timer.SECOND * 1, this.restartButton, this);
      //t.timer.start();
    }
  },

  restartButton: function() {
    this.startButton = this.game.add.button(this.game.width / 2,
                                            300, 'startButton',
                                            this.restartClick,
                                            this);
    this.startButton.fixedToCamera = true;
    this.startButton.anchor.setTo(0.5, 0.5);
  },

  restartClick: function() {
    this.game.state.start('play');
  },

  generatePipes: function() {
    var pipeY = this.game.rnd.integerInRange(-100, 100);
    var pipeGroup = this.pipes.getFirstExists(false);
    if (!pipeGroup) {
      pipeGroup = new PipeGroup(this.game,
                                this.pipes);
    }
	pipeGroup.hasScored = false;
    pipeGroup.reset(this.bird.body.x - 100 + MAX_WIDTH, pipeY);
  }
};

module.exports = Play;
