var AWS = require('aws-sdk');
var Speaker = require('speaker');
var Stream = require('stream');
var lame = require('lame');
var Fs = require('fs');
var volume = require('pcm-volume');



var Polly = new AWS.Polly({
	region: 'us-east-2',
	accessKeyId: 'AKIAIYTGNMVI2X7OMQZA',
	secretAccessKey: '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'
	
});



var params = {OutputFormat: 'mp3', VoiceId: 'Joanna'};

var speak = function (text) {
	params.Text = text;
	Polly.synthesizeSpeech(params, (err, data) =>{
	if (err){
		console.log(err.code);
	}else if (data){
		if(data.AudioStream instanceof Buffer){
			Fs.writeFile("./speech.mp3", data.AudioStream, function(err){
				if(err){
					return console.log(err);
					}

				var speaker = new Speaker({
						channels:2,
						bitDepth: 16,
						sampleRate: 44100,
						mode: lame.STEREO
					});
				
				var file = Fs.createReadStream('./speech.mp3');
				var decoder = new lame.Decoder();

				var v = new volume();
				v.setVolume(1.0);
				decoder.pipe(speaker);
				file.pipe(decoder);
				console.log('file Saved!');
				
			});
		}
	}

	});
};

module.exports = {Speak: speak};