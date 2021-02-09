/// .clientX and .clientY give the X and Y position of the touches

let endedTouches = []; // array to store ended touches in
let buttonPositions = [{x: 80, y: 200}, {x: 200, y: 200}, {x: 320, y: 200}]; // position to draw the buttons
let buttonState = [0, 0, 0]; //store state of the buttons
let buttonColour  = [0, 1, 2]; // colour of the buttons at any given time
const buttonOffColour = [0, 1, 2]; // default off colours
const buttonOnColour = [3, 3, 3]; // default on colours
let radius = 50;
let ongoingTouches = [];
let notes = ["C4", "D#4", "G4"];
let synth = new Tone.PolySynth().toDestination();
//let synth = new Tone.MonoSynth().toDestination();
//synth.volume.value = -20;
synth.set(  // setup the synth - this is audio stuff really
    {
      "volume": -20,
      "detune": 0,
      "portamento": 0,
      "envelope": {
        "attack": 0.8,
        "attackCurve": "linear",
        "decay": 0.2,
        "decayCurve": "exponential",
        "sustain": 0.3,
        "release": 0.8,
        "releaseCurve": "exponential"
      },
    }
  );


function setup() {
  let cnv = createCanvas(400, 400); // create canvas
  cnv.parent('p5parent'); //put the canvas in a div with this id if needed
  colorMode(HSB, 5); // specify HSB colormode and set the range to be between 0 and 5
  noStroke(); // no stroke on the drawings
}

function draw() {
  background(1, 0, 4); // background is grey (remmember 5 is maximum)

  for (let i = 0; i < buttonPositions.length; i++) {
    fill(buttonColour[i], 4, 4);
    ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
  }

// ********** this example draws a circle for each touch *************

  // for (let t of touches) { // cycle through the touches
  //   //console.log(t) // log the touches if you want to for debugging
  //   fill(t.id % 5, 4, 4); // each touch point's colour relates to touch id. however remember that on iOs the id numbers are huge so this doesn't work so well
  //   ellipse(t.x, t.y, 100); //make a circle at the position of the touch
  //   fill(0, 0, 0); // set colour to black
  //   text(t.id, t.x - 50, t.y - 50); // display the touch id on the screen (for debuggin)
  // }
  // for (let t of endedTouches) { // cycle through the end touches
  //   let tDiff = millis() - t.time; // set tDiff to tell us how recently we stopped touching
  //   if (tDiff < 1000) { // if we stopped touching within the last second
  //     fill(t.id % 5, 4, 4); // set the colour based on the id of the touch that we ended
  //     ellipse(t.x, t.y, map(tDiff, 0, 1000, 100, 0)); // the circle is drawn smaller and smaller depending on how much time elapsed since touch
  //   }
  // }

//************************************************************************ */

}

function touchStarted(e) {
  Tone.start(); // we need this to allow audio to start.

  if (e instanceof TouchEvent) {  // ensures we're only looking at the info we are interested in - not sure if we need this but don't think it hurts

    let _touches = e.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
    //console.log(ongoingTouches); // debugging
    buttonPressed(e);
  } else {
    console.log('non-touch event received');
  }
  return false;
}

function touchMoved(e) {

  if (e instanceof TouchEvent) {  // ensures we're only looking at the info we are interested in - not sure if we need this but don't think it hurts
    let _touches = e.changedTouches; //assign the changedTouches to an array called touches

    for (var i = 0; i < _touches.length; i++) {

      var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

      if (idx >= 0) { // did we get a match?
        // console.log("continuing touch "+idx); // debugging
      // console.log("index = " + idx);
        ongoingTouches.splice(idx, 1, copyTouch(_touches[i]));  // swap in the new touch record
        // console.log(".");
      } else { // no match
        console.log("can't figure out which touch to continue");
      }
    }
    buttonPressed(e);
  } else {
    console.log('non-touch event received');
  }
  return false;
}

function touchEnded(e) {
  if (e instanceof TouchEvent) {  // touchEnded also captures other events, so this ensures we're only looking at the info we are interested in

  let _touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < _touches.length; i++) {

    var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

    if (idx >= 0) { // did we get a match?
      console.log("touchend "+idx);
      //buttonPressed(e);
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    } else { // no match
      console.log("can't figure out which touch to end");
    }
  }
  buttonPressed(e);
    for (let t of e.changedTouches) { // cycle through the p5.js changedTouches array (which is not documented)
      // console.log("touch id " + t.identifier + // debugging
      //   " released at x: " + t.clientX +
      //   " y: " + t.clientY)
      endedTouches.push({ //create our ended touches array from which we can call .time, .id, .x, .y
        time: millis(),
        id: t.identifier,
        x: t.clientX,
        y: t.clientY
      });
    }

  } else {
    console.log('non-touch event received');
  }
  return false;
}

function copyTouch({ identifier, pageX, pageY }) { // this function is used to facilitate copying touch ID properties
  return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) { //compares the more complex stuff to give a simple answer to the question "which touch"
for (var i = 0; i < ongoingTouches.length; i++) {
  var id = ongoingTouches[i].identifier;

  if (id == idToFind) {
    return i;
  }
}
return -1;    // not found
}

function buttonPressed() {

  let _touches = ongoingTouches; //assign the changedTouches to an array called touches
  console.log(_touches);
  //let _touches = e.changedTouches; //assign the changedTouches to an array called touches
  //let _touches = touches; //assign the changedTouches to an array called touches
  let _buttonState = [0, 0, 0];
  console.log("before " +_buttonState);

  if(_touches.length != 0){
    console.log("in loop");
    for (var t = 0; t < _touches.length; t++) {

      for (let i = 0; i < buttonPositions.length; i++) {
        //let d = dist(_touches[t].x, _touches[t].y, buttonPositions[i].x, buttonPositions[i].y);
        //let d = dist(_touches[t].clientX, _touches[t].clientY, buttonPositions[i].x, buttonPositions[i].y);
        let d = dist(_touches[t].pageX, _touches[t].pageY, buttonPositions[i].x, buttonPositions[i].y);
        if (d < radius) {
          _buttonState[i] = 1;
        }else{
          _buttonState[i] = _buttonState[i] + 0;
        }
      }
    }
  }
  console.log("after " +_buttonState);
    for (let i = 0; i < buttonPositions.length; i++) {
      if(_touches.length === 0){
        stopSynth(i);
      }else if(_buttonState[i] === 1){
        playSynth(i);
      }else{
        stopSynth(i);
      }
    }
}

let now = Tone.now();
let synthState = [0, 0, 0]; // manages polyphony issues with too many notes being called

function playSynth(i) {
  buttonColour[i] = buttonOnColour[i];
  //synth.triggerAttackRelease("C4", "8n");
  if(synthState[i] === 0) {
    //synth.triggerAttack(notes[i], now);
    synth.triggerAttack(notes[i]);
    synthState[i] = 1;
  }
}

function stopSynth(i) {
  buttonColour[i] = buttonOffColour[i];
  //synth.triggerRelease(notes[i], now);
  if(synthState[i] === 1) {
  synth.triggerRelease(notes[i]);
  synthState[i] = 0;
  }
}
