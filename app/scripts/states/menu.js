'use strict';

var Phaser = require('Phaser');

function Menu() {}

Menu.prototype = {
  preload: function() {
  },

  create: function() {
    // add the background sprite
    this.background = this.game.add.tileSprite(0, 0,
                                               this.game.width,
                                               this.game.height,
                                               'background');
    this.background.autoScroll(-10, 0);

    // add the ground sprite as a tile
    // and start scrolling in the negative x direction
    this.ground = this.game.add.tileSprite(0, 400, this.game.width, 112,
                                           'ground');
    this.ground.autoScroll(-200, 0);

    /** STEP 1 **/
    // create a group to put the title assets in
    // so they can be manipulated as a whole
    this.titleGroup = this.game.add.group();

    /** STEP 2 **/
    // create the title sprite
    // and add it to the group
    this.title = this.add.sprite(0, 0, 'title');
    this.titleGroup.add(this.title);

    /** STEP 3 **/
    // create the bird sprite
    // and add it to the title group
    this.bird = this.add.sprite(200, 5, 'bird');
    this.titleGroup.add(this.bird);

    /** STEP 4 **/
    // add an animation to the bird
    // and begin the animation
    this.bird.animations.add('flap');
    this.bird.animations.play('flap', 12, true);

    /** STEP 5 **/
    // Set the originating location of the group
    this.titleGroup.x = (this.game.width - 200) / 2;
    this.titleGroup.y = 100;

    /** STEP 6 **/
    //  create an oscillating animation tween for the group
    this.game.add.tween(this.titleGroup).to({y: 115}, 350,
                                            Phaser.Easing.Linear.NONE,
                                            true, 0, 1000, true);

	//add birds to elect one
	//set line position
	this.linea = this.add.image(this.game.width / 2 - 50, 380, 'linea');
	this.linea.anchor.setTo(0.5, 0.5);
	//last bird selected
	//read best score
	if(!!localStorage) {
		if(localStorage.getItem('muneco') === 'pmorado')
		{
			this.linea.x = this.game.width / 2 - 50;
		}else if(localStorage.getItem('muneco') === 'pverde')
		{
			this.linea.x = this.game.width / 2;
		}else if(localStorage.getItem('muneco') === 'projo')
		{
			this.linea.x = this.game.width / 2 + 50;
		}else{
			localStorage.setItem('muneco', 'pmorado');
		}
	}
	
	//purple
	this.birdpurple = this.game.add.button(this.game.width / 2 - 50, 360, 'bird',
                                            this.selectBirdP,
                                            this);
	this.birdpurple.anchor.setTo(0.5, 0.5);
	//green
	this.birdgreen = this.game.add.button(this.game.width / 2, 360, 'birdgreen',
                                            this.selectBirdG,
                                            this);
	this.birdgreen.anchor.setTo(0.5, 0.5);
	//red
	this.birdred = this.game.add.button(this.game.width / 2 + 50, 360, 'birdred',
                                            this.selectBirdR,
                                            this);
	this.birdred.anchor.setTo(0.5, 0.5);
	
	
    // add our start button with a callback
    this.startButton = this.game.add.button(this.game.width / 2,
                                            300, 'startButton',
                                            this.startClick,
                                            this);
    this.startButton.anchor.setTo(0.5, 0.5);
  },
  
  selectBirdP: function() {
	  this.linea.x = this.game.width / 2 - 50;
	  localStorage.setItem('muneco', 'pmorado');
  },
    selectBirdG: function() {
		this.linea.x = this.game.width / 2;
		localStorage.setItem('muneco', 'pverde');
  },
    selectBirdR: function() {
		this.linea.x = this.game.width / 2 + 50;
		localStorage.setItem('muneco', 'projo');
  },
  
  startClick: function() {
    // start button click handler
    // start the 'play' state
    this.game.state.start('play');
  }
  
};

module.exports = Menu;
