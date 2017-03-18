'use strict';

var SilentBird = require('./silentbird');

function getUrlParam(param)
{
  param = param.replace(/([\[\](){}*?+^$.\\|])/g, '\\$1');
  var regex = new RegExp('[?&]' + param + '=([^&#]*)');
  var url   = decodeURIComponent(window.location.href);
  var match = regex.exec(url);
  return match ? match[1] : 'KyA';
}

var nameURL = getUrlParam('name');
// A regular bird
var Bird = function(game, x, y, frame) {
  SilentBird.call(this, game, x, y, frame, 'You', nameURL, 0);

  // New sounds
  this.flapSound = this.game.add.audio('flap');
  this.pipeHitSound = this.game.add.audio('pipeHit');
  this.groundHitSound = this.game.add.audio('groundHit');

  this.body.collideWorldBounds = true;

  this.alpha = 1;
};

Bird.prototype = Object.create(SilentBird.prototype);
Bird.prototype.constructor = Bird;

module.exports = Bird;



