'use strict';



var NUMBER_OF_HIGHSCORES_TO_RETREIVE = 10;

/*
* This class will store the best score of all players.
* It will try to reach a DB by default (best way to store datas). But if you don't have a MySQL server or if the class
* can't establish a connection, player's score will be store in an array (but values will be lost on server shutdown !)
* 
*/
function ScoreSystem () {
  // Default array
  this._bestScore = [];
    
}

ScoreSystem.prototype.setPlayerHighScore = function (player) {
  var nick = player.getNick();

  // If DB is available, try to get the highscore of the player.
  // If there is no score, insert this player in DB
  
    if (typeof this._bestScore[nick] !== 'undefined') {
		player.setBestScore(this._bestScore[nick]);
	}
      
    else {
		player.setBestScore(0);  
	}
     
};

ScoreSystem.prototype.savePlayerScore = function (player, lastScore) {
  var nick = player.getNick(),
      highScore = player.getHighScore();

  // If the player just beats his highscore, record it !
  if (lastScore > highScore) {
    
      this._bestScore[nick] = lastScore;
      console.info(nick + ' new high score (' + lastScore + ') was saved in the score array !');
    
  }
};

ScoreSystem.prototype.getHighScores = function (callback) {
  var hsArray = null,
      nbRes,
	  key;

  // If DB is available, request it highscores
  
    // Sort tab 
    this._bestScore.sort(function (a, b) {
      if (a > b) {
		  return (-1);
		  }
        
      if (a < b) {
		  return (1);
	  }
        
      return (0);
    });

    // Return the NUMBER_OF_HIGHSCORES_TO_RETREIVE best scores
    hsArray = [];
    nbRes = (this._bestScore.length > NUMBER_OF_HIGHSCORES_TO_RETREIVE) ? NUMBER_OF_HIGHSCORES_TO_RETREIVE : this._bestScore.length;

    for (key in this._bestScore) {
      hsArray.push( { player: key, score: this._bestScore[key] } );
    }
  

  callback(hsArray);
};

module.exports = ScoreSystem;