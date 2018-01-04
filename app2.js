#!/usr/bin/env node

var Gpio = require('pigpio').Gpio;
var wpi = require('wiring-pi');
var Polly = require('./polly');
var Speaker = require('speaker');
var lame = require('lame');
var volume = require("pcm-volume");
var fs = require('fs');

Polly.Speak('I like potatoes and other vegetables, such as tomatoes or penises');


//Function to set left motor position
//function moveServo(servoPin, servoDegrees) {
	//expression to convert degrees into pulseWidth
//	var pulseWidth = Math.round(500 + (servoDegrees*(2000/180)));
	//Variable to identify servo based on GPIO pin number
//	var motor = new Gpio(servoPin, {mode: Gpio.OUTPUT});

//	if (pulseWidth>499&&pulseWidth<2501){
//		var interval = setInterval(function () {
//			motor.servoWrite(pulseWidth);
//		}, 10);
//	}else{
//		console.log("You can only use values between 0 and 180");
//	}
//}

//moveServo(17, 180);
//var motor = new Gpio(17, {mode: Gpio.OUTPUT});
//var motor2 = new Gpio(21, {mode: Gpio.OUTPUT});

wpi.setup('wpi');
wpi.wiringPiSPISetup(0, 500000);
const RED_DATA = 0;
const BLUE_DATA = 1;
const GREEN_DATA = 2;

const data = Buffer.from([0x0,0x0,0x0,0x0]);
const heart = Buffer.from([0xff,0x99,0x00,0x00,0x00,0x81,0xc3,0xe7]);

setInterval(function() {
	//while(true){
		for(j=0;j<8;j++){
			data[0] = 0xFF;
			data[2] = heart[j];
			data[1] = 0xFF;
			data[3]	= 0x01 << j;
			wpi.wiringPiSPIDataRW(0,data);
		//}

	// var pulseWidth = 1000;
	// var increment = 100;
  //
	// //setInterval(function(){
	// 	motor.servoWrite(pulseWidth);
	// 	motor2.servoWrite(pulseWidth);
	// 	pulseWidth += increment;
  //
	// 	if(pulseWidth>=2500){
	// 		increment = -100;
	// 	} else if (pulseWidth<=500){
	// 		increment = 100;
	// 	}
  //
  //
	// //}, 30)
	}


}, 0.00001);
