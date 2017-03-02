//Initiate communication with robot via socket.io

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});


//Create audio player for behaviors
const player = require('play-sound')(opts = {});


//ROBOT Communication and Behaviors

var create = require('create2');
var robot, turnRobot, stopTurn, moveForward, stop, moveBackward, turnRight, turnLeft, answer1, answer2, answer3, answer4, answer5, answer6, answer7, amswer8, answer9;

function start() {
	create.prompt(function(p){create.open(p,main)});
}

//Main Program:
function main(r) {
	robot = r; handleInput(robot);

	//Enter Full Mode:
	robot.full(); var run = 1;

	//setTimeout(function(){robot.showText("Hello World!", 500, true)}, 500);

	//We'll play this song whenever entering user-control:
	robot.setSong(0, [[76,12],[76,12],[76,12],[76,36],[72,36],[74,36],[76,24],[74,12],[76,48],]);

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
			//Charging Station Detected! Since it's in front of the robot anyway... Start Auto-Docking!
			if(robot.data.irLeft == 172 || robot.data.irRight == 172) {
				robot.drive(0,0); run = -1; robot.showText("SEEK", 500, false, robot.autoDock);
			}
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
		angle += robot.delta.angle; console.log("Angle:", angle);
		if(((drAngle >= 0 && angle >= drAngle) || (drAngle < 0 && angle
		<= drAngle)) && drRun) { drRun = 0; run = 1; driveLogic(); }
	}

	//Prevent Default Behavior of Buttons in Passive Mode:
	function preventDefault(func) {
		setTimeout(function(){robot.full();if(func)setTimeout(func,500)},1400);
	}
  function behaviorRandomizer(duration, gestureQuantity) {
    var behaviorCycle = [moveForward, moveBackward, turnRight, turnLeft];
    var randomBehavior = behaviorCycle[Math.floor(Math.random()* behaviorCycle.length)]();
    var time = duration*1000;
    var gestureDuration = time/gestureQuantity;
    console.log(gestureDuration);
    for (var i = 0; i < gestureQuantity; i++) {
      var addedTime = gestureDuration*i;
      moveForward();
      setTimeout(function(){
        stop();
        }, 1000);
      }
    }

moveForward = function() {
    robot.driveSpeed(robot.data.dropLeft?0:100,robot.data.dropRight?0:100);
  }

moveBackward = function() {
      robot.driveSpeed(robot.data.dropLeft?0:-100,robot.data.dropRight?0:-100);
    }
turnRight = function() {
      robot.driveSpeed(robot.data.dropLeft?0:100,robot.data.dropRight?0:-100);
    }
turnLeft = function() {
      robot.driveSpeed(robot.data.dropLeft?0:-100,robot.data.dropRight?0:100);
    }

stop = function() {
    robot.driveSpeed(robot.data.dropLeft?0:0,robot.data.dropRight?0:0);
  }
answer1Server = function() {
  player.play('audio/answer1.mp3', { omxplayer: ['-o', 'local' ]}, function(err){
    if (err) throw err
    });
    var text = "1010101111010101011111001101010101001111100101110101";
  robot.showText(text, 700, false);
  behaviorRandomizer(22, 5);
  }
}




function handleInput(robot) {
	//Process user input, quit on 'exit'
	const rl = require('readline').createInterface
	({input:process.stdin, output:process.stdout});
	rl.on('line', function(text) {
		if(text == "exit" || text == "quit") {
			console.log("Exiting..."); process.exit();
		} else if(text == "t") {
			poto(); //Turn Robot.
		} else if(text == "s") {
			stopTurn(); //Stop Turning.
		}
	});
}


//Functions from client (browser app)

  io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('move', function(data) {
        console.log(data);
        client.emit('messages', 'Executing...');
        moveForward();
    });
    client.on('stop', function(data) {
        console.log(data);
        client.emit('messages', 'Executing...');
        stop();
    });
    client.on('back', function(data) {
        console.log(data);
        client.emit('messages', 'Executing...');
        moveBackward();
    });
    client.on('turn_right', function(data) {
        console.log(data);
        client.emit('messages', 'Executing...');
        turnRight();
    });
    client.on('turn_left', function(data) {
        console.log(data);
        client.emit('messages', 'Executing...');
        turnLeft();
    });
    client.on('play_answer1', function(data) {
        console.log(data);
        client.emit('messages', 'Executing...');
        answer1Server();
    });
    client.on('connect', function(data) {
        console.log(data);
        client.emit('messages', 'Connecting...');
        start();
    });
  });

server.listen(8080, function(){
  console.log('listening on *:8080');
});
