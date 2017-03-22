#!/usr/bin/env node


//Initiate communication with robot via socket.io
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var child_process = require('child_process');
var PythonShell = require('python-shell');

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});


//Create audio player for behaviors
var Omx = require('node-omxplayer');


//ROBOT Communication and Behaviors

var create = require('create2');
var start, shell, dock, clientDisconnect, stopAll, robot, turnRobot, stopTurn, moveForward, player, stop, moveBackward, turnRight, turnLeft, answer1Server, answer2Server, answer3Server, answer4Server, answer5Server, answer6Server, answer7Server, answer8Server, answer9Server, backAndForthloop, tracker, done;

var timeouts = [];
var tracker = false;

start = function () {
	create.prompt(function(p){create.open(p,main)});
}

//Main Program:
function main(r) {
	robot = r; handleInput(robot);

	//Enter Full Mode:
	robot.full(); var run = 1;
  //stop communication

	//We'll play this song whenever entering user-control:
  robot.setSong(0, [[72,12],[72,12],[72,12],[72,36],[68,36],[70,36],[72,24],[70,12],[72,48]]);


	//Handle First onChange:
	robot.onChange = function() {
		if(robot.data.charger || robot.data.docked) { robot.start(); run = 0; }
		else { robot.play(0); driveLogic(); } robot.onChange = onchange;
	}

	//Handle onChange Events:
	function onchange(chg) {
		if(robot.data.mode == 3 && run == 1) { //FULL mode:
			//lightBumper is a macro for all light bump sensors (lightBumpLeft, lightBumpRight, etc)
			//Unfortunately, no similar macro exists for cliff sensors or bumper switches due to the way the data is delivered.
			if(chg.lightBumper || chg.bumpLeft || chg.bumpRight || chg.dropLeft || chg.dropRight || chg.clean || chg.docked) {
				driveLogic(); //Run drive logic only when sensor values change.
			}
			// //Charging Station Detected! Since it's in front of the robot anyway... Start Auto-Docking!
			// if(robot.data.irLeft == 172 || robot.data.irRight == 172) {
			// 	robot.drive(0,0); run = -1; robot.showText("SEEK", 500, false, robot.autoDock);
			// }
		} else if(robot.data.mode == 1) { //PASSIVE mode:
			if(chg.clean && robot.data.clean) { //Clean Pressed:
				if(robot.data.docked) robot.clean(); //Start backing up if clean pressed while docked.
				else preventDefault(function(){run = 1; driveLogic()}); //Prevent default.
			}
			if(chg.docked && robot.data.docked) { //Robot Docked:
				setUndock(0); robot.full(); robot.showText("DOCK", 500, false, robot.start);
			} else if(chg.docked/* && !robot.data.charger*/ && !robot.data.docked) { //Robot Undocked:
				setUndock(1);
			} else if(chg.dropLeft || chg.dropRight) { //Docking Interrupted:
				if(run == -1) {robot.full();robot.showText("RST", 500, false, robot.autoDock)}
				//else setUndock(1);
			}
		}
	}

	//Logic to Start and Stop Moving Robot:
	function driveLogic() {
		//We're in user-control (FULL mode) and can control the robot. (Your main program would be here!)
		if(robot.data.lightBumper || robot.data.bumpLeft || robot.data.bumpRight) robot.driveSpeed(0,0); //Disable motors.
		else robot.driveSpeed(robot.data.dropLeft?0:0,robot.data.dropRight?0:0); //Enable motors if wheels are up.
		if(robot.data.clean || robot.data.docked) {robot.driveSpeed(0,0);robot.start()} //Back to PASSIVE mode.
	}

	//Enable and disable undocking timer:
	var dTmr; function setUndock(e) {
		if(dTmr) clearTimeout(dTmr); //Cancel timer if already running.
		if(e) { run = 1; robot.start(); dTmr = setTimeout(function() {
			robot.full(); run = 1; dTmr = setTimeout(function(){robot.showText
			("UNDOCK", 250, true);robot.play(0);driveLogic();dTmr=null},250);
		}, 4400); } else run = 0;
	}

	//Turns robot when 't' is pressed:
	var drRun = 0, drAngle = 0;
	turnRobot = function() {
		if(robot.data.mode == 3 && drRun) { //If already turning:
			run = 0; if(drAngle) drAngle = 0; else //Set desired angle to original angle.
			drAngle = (robot.motorRad==1)?64:-64; //Continue in current motor direction.
			robot.drive(100, (drAngle-angle<0)?-1:1); drRun = 1;
		} else if(robot.data.mode == 3 && run == 1) { //Start new turn in opposite direction:
			run = 0; drAngle = drAngle<0?64:-64; angle = 0; drRun = 1;
			robot.drive(100, (drAngle-angle<0)?-1:1);
		}
	}

	//Stop turning when 's' is pressed:
	stopTurn = function() {
		if(robot.data.mode == 3 && drRun) { //If already turning:
			run = 1; drRun = 0; driveLogic(); //Stop turn.
		}
	}

	var angle = 0; //Count Angle Changes Using Encoders:
	robot.onMotion = function() {
		angle += robot.delta.angle; //console.log("Angle:", angle);
		if(((drAngle >= 0 && angle >= drAngle) || (drAngle < 0 && angle
		<= drAngle)) && drRun) { drRun = 0; run = 1; driveLogic();
    }else if (tracker==true && (angle < 10 || angle > -10)) {
  	  console.log("Resetting Position");
      if (angle > 10) {
        robot.driveSpeed(robot.data.dropLeft?0:100,robot.data.dropRight?0:-100);
      } else if (angle < -10) {
        robot.driveSpeed(robot.data.dropLeft?0:-100,robot.data.dropRight?0:100);
      }
      else if (angle <= 10 && angle >= -10) {
        stop();
        done();
        tracker = false;
        console.log(tracker);
        console.log("Position Reset!");
      }
  	}
	}
	//Prevent Default Behavior of Buttons in Passive Mode:
	function preventDefault(func) {
		setTimeout(function(){robot.full();if(func)setTimeout(func,500)},1400);
	}
  //GENERAL RANDOMIZER
  // if only one argument is passed, it will assume that is the high
  // limit and the low limit will be set to zero
  // so you can use either r = new randomeGenerator(9);
  // or r = new randomGenerator(0, 9);
  function randomGenerator(low, high) {
      if (arguments.length < 2) {
          high = low;
          low = 0;
      }
      this.low = low;
      this.high = high;
      this.reset();
  }

  randomGenerator.prototype = {
      reset: function() {
          this.remaining = [];
          for (var i = this.low; i <= this.high; i++) {
              this.remaining.push(i);
          }
      },
      get: function() {
          if (!this.remaining.length) {
              this.reset();
          }
          var index = Math.floor(Math.random() * this.remaining.length);
          var val = this.remaining[index];
          this.remaining.splice(index, 1);
          return val;
      }
  }


  //Characters for messages
  var characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  //randomize behaviors for sound files
  function behaviorRandomizer(duration, gestureQuantity) {

    var time = duration*1000;
    var gestureDuration = time/gestureQuantity;
    timeouts = [];
    var gesture = [
        turnRight1 = function() {
          if (angle >= -15) {
            robot.driveSpeed(robot.data.dropLeft?0:100,robot.data.dropRight?0:-100);
            }
          },
        turnLeft1 = function() {
          if (angle <= 15 ) {
            robot.driveSpeed(robot.data.dropLeft?0:-100,robot.data.dropRight?0:100);
            }
          },
          stop1 = function() {
              robot.driveSpeed(robot.data.dropLeft?0:0,robot.data.dropRight?0:0);
          },
          backAndForthloop = function () {
            robot.driveSpeed(robot.data.dropLeft?0:100,robot.data.dropRight?0:100);
            setTimeout(function(){
              robot.driveSpeed(robot.data.dropLeft?0:-100,robot.data.dropRight?0:-100);
            }, gestureDuration/2)
          }
        ];
    var r = new randomGenerator(gesture.length-1);
    var text = new randomGenerator(characters.length-1);
    for (var i = 0; i < gestureQuantity; i++) {
        var addedTime = gestureDuration*i;
          timeouts.push(setTimeout(function() {
            gesture[r.get()]();
            robot.showText(characters[text.get()], 50, true);
          }, addedTime));
      };
          timeouts.push(setTimeout(function() {
            if (angle < 5 || angle < -5) {
              stop();
              done();
            }
            tracker = true;
            console.log(tracker);

          }, time+100));

    };


  stop = function() {
    robot.driveSpeed(robot.data.dropLeft?0:0,robot.data.dropRight?0:0);
  }

  moveForward = function() {
    robot.driveSpeed(robot.data.dropLeft?0:100,robot.data.dropRight?0:100);
    },
  moveBackward = function() {
      robot.driveSpeed(robot.data.dropLeft?0:-100,robot.data.dropRight?0:-100);
    },
  turnRight = function() {
      robot.driveSpeed(robot.data.dropLeft?0:100,robot.data.dropRight?0:-100);
    },
  turnLeft = function() {
      robot.driveSpeed(robot.data.dropLeft?0:-100,robot.data.dropRight?0:100);
    }
  dock = function() {
    robot.autoDock();
  }
  unDock = function(){
    run = 0;
  }


  answerServer = function(answerNum, duration, gestureQuantity) {
    behaviorRandomizer(duration, gestureQuantity);
    var options = {
      mode: 'text',
      args: ['--file=/var/www/html/Roomba/audio/answer'+ answerNum +'.mp3']
    };

    shell = PythonShell.run('/lightshowpi/py/synchronized_lights.py', options, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution
    });
  };

  stopAll = function(){
    for (var i=0; i<timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    };
    stop();
    shell.childProcess.kill('SIGINT');
  };

}



function handleInput(robot) {
	//Process user input, quit on 'exit'
	const rl = require('readline').createInterface
	({input:process.stdin, output:process.stdout});
	rl.on('line', function(text) {
		if(text == "exit" || text == "quit") {
			console.log("Exiting..."); process.exit();
		} else if(text == "t") {
		   turnRobot(); //Turn Robot.

		} else if(text == "s") {
			turnRobot();//stop turn.
		} else if (text =="p"){
      speakServer();
    }
	});
}

//Testing Text to speech functions;

var say = require('say');

// Fire a callback once the text has completed being spoken

function speakServer() {
  say.speak('Hello!', 'voice_kal_diphone');
}
//Functions from client (browser app)

  io.on('connection', function(client) {
    console.log('Client connected...');

    done = function(){
      client.emit('messages', 'Done!');
    };

    client.on('start', function(data) {
        console.log(data);
        client.emit('messages', 'Roombokita Session Connected!');
        start();
    });

    client.on('dock', function(data) {
        console.log(data);
        client.emit('messages', 'Starting docking sequence...');
        dock();
    });

    client.on('Undock', function(data) {
        console.log(data);
        client.emit('messages', 'Undocked. You can move!');
        unDock();
    });

    client.on('move', function(data) {
        console.log(data);
        client.emit('messages', 'Moving...');
        moveForward();
    });
    client.on('stop', function(data) {
        console.log(data);
        stop();
    });
    client.on('back', function(data) {
        console.log(data);
        client.emit('messages', 'Moving...');
        moveBackward();
    });
    client.on('turn_right', function(data) {
        console.log(data);
        client.emit('messages', 'Turning...');
        turnRight();
    });
    client.on('turn_left', function(data) {
        console.log(data);
        client.emit('messages', 'Turning...');
        turnLeft();
    });
    client.on('play_answer1', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer1...');
        answerServer(1, 22, 25);
    });

    client.on('play_answer2', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer2...');
        answerServer(2, 12, 15);
    });
    client.on('play_answer3', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer3...');
        answerServer(3, 14, 16);
    });
    client.on('play_answer4', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer4...');
        answerServer(4, 5, 10);
    });
    client.on('play_answer5', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer5...');
        answerServer(5, 25, 30);
    });
    client.on('play_answer6', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer6...');
        answerServer(6, 16, 18);
    });
    client.on('play_answer7', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer7...');
        answerServer(7, 17, 20);
    });
    client.on('play_answer8', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer8...');
        answerServer(8, 9, 12);
    });
    client.on('play_answer9', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer9...');
        answerServer(9, 31, 35);
    });

    client.on('play_answer10', function(data) {
        console.log(data);
        client.emit('messages', 'Requesting Answer10...');
        answerServer(10, 248, 800);
    });

    client.on('stopAll', function(data) {
        console.log(data);
        client.emit('messages', 'Aborted!');
        stopAll();
    });
    client.on('speak', function(data) {
        console.log(data);
        client.emit('messages', 'Speaking!');
        speakServer();
    });

  });

server.listen(8080, function(){
  console.log('listening on *:8080');
});
