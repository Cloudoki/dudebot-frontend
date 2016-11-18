/*global webkitSpeechRecognition:true*/

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition || null;
if(SpeechRecognition === null){
  alert("Web speech API is not supported.");
} else {
  document.getElementById('icon').style.display = "none";
  var recognizer = new SpeechRecognition();
  if (recognizer.continuous) {
    recognizer.continuous = true;
  }
  recognizer.interimResults = true; // we want partial result
  recognizer.lang = 'pt-PT'; // set language
  recognizer.maxAlternatives = 1;

  recognizer.onstart = function() {
    // listening started
    console.log("started");
    document.getElementById('icon').style.display = "block";
  };

  recognizer.onend = function() {
    // listening ended
    console.log("ended");
    document.getElementById('icon').style.display = "none";
    recognizer.start();
  };

  recognizer.onerror = function(error) {
    // gave an error
    console.log(error);
  };


  recognizer.onresult = function(event) {
    // the event holds the results

    if (typeof(event.results) === 'undefined') { //Something is wrong…
        recognizer.stop();
        return;
    }

    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) { //Final results
          var finals = document.getElementById('finals');
          var txt = event.results[i][0].transcript;
          console.log("final results: " + txt);   // final results
          finals.innerHTML += txt + "<br />";
        } else {
          var partials = document.getElementById('partials');
          var txt = event.results[i][0].transcript;
          console.log("interim results: " + txt);  // partials results
          partials.innerHTML = txt;
        }
    }
  };

  // mute button
  var play = document.getElementById('button-play');

  play.onclick = function() {
    if(play.getAttribute('data-muted') === 'false') {
      try {
        recognizer.start();
        play.setAttribute('data-muted', 'true');
        play.innerHTML = "Stop Listening";
      } catch(ex) {
        console.log('Recognition error: ' + ex.message);
      }
    } else {
      play.setAttribute('data-muted', 'false');
      recognizer.stop();
      play.innerHTML = "Start Listening";
    }
  };
}
