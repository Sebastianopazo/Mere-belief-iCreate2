var AWS = require('aws-sdk');
var Speaker = require('speaker');
var Stream = require('stream');
var lame = require('lame');
var Fs = require('fs');
var Analyser = require('audio-analyser');
var Polly = new AWS.Polly({
	region: 'us-east-2',
	accessKeyId: 'AKIAIYTGNMVI2X7OMQZA',
	secretAccessKey: '7F35RF+y6bkP3CkxCojDOWxXDvbSHVrOMVcbrToG'
	
});

var speaker = new Speaker({
	channels: 1,
	bitDepth: 16,
	sampleRate: 16000
	});


var analyser = new Analyser({
	minDecibels: -1000,
	maxDecibels: 1000,
	
	fftSize: 256,
	
	frequencyBitCount: 256 / 2,
	
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


var params = {OutputFormat: 'pcm', VoiceId: 'Joey', SampleRate: '16000', TextType: 'ssml'};

var speak = function (text) {
	params.Text = "<speak><prosody volume='x-loud' pitch='-100%' rate='50%'>"+text+"</prosody></speak>";
	Polly.synthesizeSpeech(params, (err, data) =>{
	if (err){
		console.log(err.code);
	}else if (data && data.AudioStream instanceof Buffer){
		var bufferStream = new Stream.PassThrough()
		bufferStream.end(data.AudioStream)

		bufferStream.pipe(analyser);
		bufferStream.pipe(speaker);
		


		bufferStream.on('data', (data) => {
			
			console.log("Recieved Input Stream: "+ data.length);
			var audioData = analyser.getFrequencyData();
			
		});

	}

	});
};

	


speak('Good morning.');
