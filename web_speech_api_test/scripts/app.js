var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition || null;

// create web audio api context
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

// ------------------------ WEB SPEECH API --------------------------

function startSpeechRecognier(auto){
  var triggers = ['hey dude', 'hey mate'];
  var commands = {
    "insult": ['insult']
  };
  var state = {
    "triggered": false,
    "listening": false
  };
  var recognizer = new SpeechRecognition();

  if (recognizer.continuous) {
    recognizer.continuous = true;
  }
  recognizer.interimResults = true; // we want partial result
  recognizer.lang = 'en-US'; // set language
  recognizer.maxAlternatives = 5;

  recognizer.onstart = function() {
    // listening started
    console.log("started");
    document.getElementById('icon').className += " green-text text-darken-2";
    document.getElementById('icon').className = document.getElementById('icon').className.replace( /(?:^|\s)red-text text-darken-4(?!\S)/g , '' );
  };

  recognizer.onend = function() {
    // listening ended
    console.log("ended");
    document.getElementById('icon').className += " red-text text-darken-4";
    document.getElementById('icon').className = document.getElementById('icon').className.replace( /(?:^|\s)green-text text-darken-2(?!\S)/g , '' );
    if(state.listening) {
      recognizer.start();
    }
  };

  recognizer.onerror = function(error) {
    // an error occured
    document.getElementById('mic').innerHTML = 'mic_off';
    console.log(error);
  };

  recognizer.onspeechstart = function() {
    console.log('Speech has been detected');
  }

  recognizer.onspeechend = function() {
    console.log('Speech has stopped being detected');
  }


  recognizer.onresult = function(event) {
    // the event holds the results

    if (typeof(event.results) === 'undefined') { //Something is wrong…
        recognizer.stop();
        return;
    }

    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if(event.results[i].isFinal) {
        // get all the final words into array
        var finalText = [];
        for(var j = 0; j < event.results[i].length; ++j) {
          finalText.push(event.results[i][j].transcript);
        }

        // if triggered call detected command else try to detect trigger
        if(state.triggered) {
          Object.keys(commands).forEach(function(key) {
            var commandDetected = commands[key].some(function(word) {
              return finalText.join(', ').toLowerCase().indexOf(word.toLowerCase()) !== -1;
            });
            if(commandDetected) callCommand(key);
          });
          state.triggered = false;
        } else {
          state.triggered = triggers.some(function(word) {
            return finalText.join(', ').toLowerCase().indexOf(word.toLowerCase()) !== -1;
          });
          if(state.triggered) console.log("TRIGGER DETECTED", finalText);
        }

        console.log("final result:", finalText);
      }
    }

    if (state.triggered) {
      document.getElementById('mic').innerHTML = 'mic';
    } else {
      document.getElementById('mic').innerHTML = 'mic_off';
    }

  };

  // play button
  var play = document.getElementById('button-play');

  play.onclick = function() {
    if(play.getAttribute('data-muted') === 'false') {
      try {
        state.listening = true;
        recognizer.start();
        play.setAttribute('data-muted', 'true');
        play.innerHTML = "Stop Listening";
      } catch(ex) {
        console.log('Recognition error: ' + ex.message);
      }
    } else {
      play.setAttribute('data-muted', 'false');
      state.listening = false;
      recognizer.stop();
      play.innerHTML = "Start Listening";
    }
  };

  if(auto) {
    play.click();
  }
}

function callCommand(command) {
  var finals = document.getElementById('finals');
  finals.innerHTML += '<li class="collection-item">Called ' + command + '</li>';
}

// ---------------------------- WEB AUDIO ---------------------------

var audioSource, gainNode, analyser;

function getUserVoice() {
  if (!navigator.mediaDevices.getUserMedia) {
    alert('Your browser does not support the Media Stream API');
  } else {
    var constraints = { audio: true, video: false };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(mediaStream) {
      audioSource = audioCtx.createMediaStreamSource(mediaStream);
      gainNode = audioCtx.createGain();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      audioSource.connect(gainNode);
      gainNode.connect(analyser);
      // uncomment so that audio will come from the speakers
      analyser.connect(audioCtx.destination);
      gainNode.gain.value = 1;
      // animateVoice();
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
  }
}

function animateVoice() {
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  for (var i = 0; i < bufferLength; i++) {
		var v = dataArray[i] / 128.0;

    // animate something using v
	}

  console.log(dataArray[0], bufferLength);

  window.requestAnimationFrame(animateVoice);
}

// ----------------- INIT -------------------------

if(SpeechRecognition === null){
  alert("Web Speech API is not supported.");
} else {
  startSpeechRecognier(false);
  getUserVoice();
}
