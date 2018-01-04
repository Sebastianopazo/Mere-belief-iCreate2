var Speaker = require('speaker');
var Fs = require('fs');
var Analyser = require('audio-analyser');

var speaker = new Speaker({
	channels:2,
	bitDepth: 16,
	sampleRate: 44100
});

var analyser = new Analyser({
	minDecibels: -1000,
	maxDecibels: 1000,
	
	fftSize: 8,
	
	frequencyBitCount: 8 / 2,
	
	smoothingTimeConstant: 0.2,
	channel: 1,
	bufferSize: 16000,
	
	//applyWindow: function(sampleNumber, totalSamples){
	//	//console.log(sampleNumber, totalSamples);
		
	//},

	'pcm-stream': {
		channels: 1,
		sampleRate: 44100,
		bitDepth: 16,
		byteOrder: 'LE',
		max: 32767,
		min: 32768,
		samplesperFrame: 1024
	}
	
});


var file = Fs.createReadStream('./0477.wav');


function print(){
	console.log(analyser.getFrequencyData());	
}
//file.pipe(speaker);

file.pipe(analyser);
file.on('data', (data) => {
			var ffts = analyser.getFrequencyData();
			//console.log("Recieved Input Stream: "+ data.length);
			//setInterval(print, 100);
			for(var i=0; i< ffts.length;i++){
				console.log(ffts[i]);
			}
		});

file.on('finish', (data) => {
			file.pipe(speaker);
		});



