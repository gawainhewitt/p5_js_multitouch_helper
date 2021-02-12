/* This is a project that i've made to allow me to increase my confidence in using location based multi touch in JavaScript
Initially this was intended to focus on p5.js, but it has expanded to be more general.
The first bunch of code should I think in principle work on any JavaScript project as it uses no specific p5 functions for touch.
The commented out version at the bottom is the same but using some of the p5.js touch listeners. I think it's slower. It combines
p5 touch with some vanilla touch to give proper touchend info etc. My view is that if you're doing that you may as well just use
the vanilla JavaScript touch stuff.
The html file expects p5 to be in your root folder.
I'm using Tone.js for sound.
*/

let numberOfButtons = 7;
let endedTouches = []; // array to store ended touches in
let buttonPositions = []; // position to draw the buttons
let buttonState = []; //store state of the buttons
let buttonColour  = []; // colour of the buttons at any given time
let buttonOffColour = []; // default off colours
let buttonOnColour = []; // default on colours
let synthState = []; // we need to store whether a note is playing because the synth is polyphonic and it will keep accepting on messages with every touch or moved touch and we won't be able to switch them all off
let radius = 50; // radius of the buttons
let r = 130; // radius of the circle around which the buttons will be drawn
let angle = 0; // variable within which to store the angle of each button as we draw it
let step;
let ongoingTouches = []; // array to copy the ongoing touch info into
let notes = []; // notes for the synth in this example
var allTheNotes =  ["C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
                    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
                    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
                    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
                    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
                    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
                    "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
                    "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8"]; // all the notes available to us in the code
var major = [0,2,4,5,7,9,11,12,14]; // intervals for a major scale for 9 notes
var pentatonic = [0,2,4,7,9,12,14,16,19]; // intervals for a pentatonic scale for 9 notes
var minor = [0,2,3,5,7,8,10,12,14]; // intervals for a minor scale for 9 notes
var majorBlues = [0,2,3,4,7,9,12,14,15]; // intervals for a major blues scale for 9 notes
var minorBlues = [0,3,5,6,7,10,12,15,17]; // intervals for a minor scale for 9 notes
var scale; // variable to store the scale in
var theKey = 0; // this variable sets the default key on load
var octave = 24; //set the default octave on load
let synth = new Tone.PolySynth().toDestination(); // create a polysynth
let soundOn = false; // have we instigated Tone.start() yet? (needed to allow sound)
synth.set(  // setup the synth - this is audio stuff really
    {
      "volume": -15, //remember to allow for the cumalative effects of polyphony
      "detune": 0,
      "portamento": 0,
      "envelope": {
        "attack": 0.8,
        "attackCurve": "linear",
        "decay": 0,
        "decayCurve": "exponential",
        "sustain": 0.3,
        "release": 0.8,
        "releaseCurve": "exponential"
      },
    }
  );


function setup() {  // setup p5
  step = TWO_PI/numberOfButtons; // in radians the equivalent of 360/6
  scale = pentatonic; // sets the default scale on load
  let cnv = createCanvas(400, 400); // create canvas
  cnv.parent('p5parent'); //put the canvas in a div with this id if needed

  // *** add vanilla JS event listeners for touch which i want to use in place of the p5 ones as I believe that they are significantly faster
  var el = document.getElementById("p5parent");
  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchmove", handleMove, false);

  colorMode(HSB, numberOfButtons + 1); // specify HSB colormode and set the range to be between 0 and numberOfButtons
  noStroke(); // no stroke on the drawings

  welcomeScreen(); // initial screen for project - also allows an elegant place to put in the Tone.start() command.
                    // I don't think that this technique will work if animating as the draw() function will instantly overide it
  createButtonPositions(); // generate the default array info depending on number of buttons
}

function welcomeScreen() {
  background(1, 0, 4); // background is grey (remember 5 is maximum because of the setup of colorMode)
  textSize(32);
  textAlign(CENTER, CENTER);
  text("MultiTouch helper minisite.Touch screen to start", 100, 50, 200, 200);
}

function createButtonPositions() {
  for(let i = 0; i < numberOfButtons; i++) {
    //convert polar coordinates to cartesian coordinates
    let _x = r * sin(angle);
    let _y = r * cos(angle);
    let theNote = scale[i] + octave + theKey; // the note plus the octave plus the offset from the key menu

    console.log(scale);

    //create our buttonPositions array
    buttonPositions.push({
      x: _x + width/2,
      y: _y + height/2
    });

    buttonState.push(0); //create default state of the buttons array
    buttonColour.push(i); // set default colour of the buttons
    buttonOffColour.push(i); // create default off colours
    buttonOnColour.push(numberOfButtons); // create default on colours
    synthState.push(0); //create default state of the synth array
    notes.push(allTheNotes[theNote]); //create the scale that we are using

    //increase angle by step size
    angle = angle + step;
  }
  console.log(notes);
}

/*

function draw() {  // p5 draw function - the traditional way to do this in p5 - this is called 60 times a second so needed if want to animate
  background(1, 0, 4); // background is grey (remmember 5 is maximum)

  for (let i = 0; i < buttonPositions.length; i++) {
    fill(buttonColour[i], 4, 4);
    ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
  }

// ********** this example draws a circle for each touch *************

  for (let t of ongoingTouches) { // cycle through the touches
    //console.log(t) // log the touches if you want to for debugging
    fill(t.identifier % 5, 4, 4); // each touch point's colour relates to touch id. however remember that on iOs the id numbers are huge so this doesn't work so well
    ellipse(t.clientX, t.clientY, 100); //make a circle at the position of the touch
    fill(0, 0, 0); // set colour to black
    //text(t.identifier, t.clientX - 50, t.clientY - 50); // display the touch id on the screen (for debuggin)
  }
  for (let t of endedTouches) { // cycle through the end touches
    let tDiff = millis() - t.time; // set tDiff to tell us how recently we stopped touching
    if (tDiff < 1000) { // if we stopped touching within the last second
      fill(t.id % 5, 4, 4); // set the colour based on the id of the touch that we ended
      ellipse(t.x, t.y, map(tDiff, 0, 1000, 100, 0)); // the circle is drawn smaller and smaller depending on how much time elapsed since touch
    }
  }

// ************************************************************************

}

*/

function drawSynth() { // instead of using the draw function at 60 frames a second we will call this function when something changes
  background(1, 0, 4); // background is grey (remember 5 is maximum)
  for (let i = 0; i < numberOfButtons; i++) {
    fill(buttonColour[i], 4, 4);
    ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
  }
}

function handleStart(e) {
  e.preventDefault(); // prevent default touch actions like scroll
  if(soundOn){
    let _touches = e.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
    //console.log(ongoingTouches); // debugging
    buttonPressed(e);
  }else{
    Tone.start(); // we need this to allow audio to start.
    soundOn = true;
    drawSynth();
    let _touches = e.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
  }
}

function handleMove(e) {
  e.preventDefault(); // prevent default touch actions like scroll
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
}

function handleEnd(e) {
  e.preventDefault(); // prevent default touch actions like scroll
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
    for (let t of e.changedTouches) { // cycle through the changedTouches array
      // console.log("touch id " + t.identifier + // debugging
      //   " released at x: " + t.clientX +
      //   " y: " + t.clientY)
      endedTouches.push({ //create our ended touches array of objects from which we can call .time, .id, .x, .y
        time: millis(),
        id: t.identifier,
        x: t.clientX,
        y: t.clientY
      });
    }
}

function handleCancel(e) { // this handles touchcancel
  e.preventDefault();  // prevent default touch actions like scroll
  console.log("touchcancel."); //debugging
  var touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx
    ongoingTouches.splice(idx, 1);  // remove it; we're done
  }
}

function copyTouch({ identifier, clientX, clientY }) { // this function is used to facilitate copying touch ID properties
  return { identifier, clientX, clientY };
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
  let _buttonState = []; // array to store buttonstate in

  for(let i = 0; i < numberOfButtons; i++) {
    _buttonState.push(0);
  }

  //**** first let's check if each touch is on a button, and store the state in our local variable */

  if(_touches.length != 0){ // if the touches array isn't empty
    for (var t = 0; t < _touches.length; t++) {  // for each touch
      for (let i = 0; i < numberOfButtons; i++) { // for each button
        let d = dist(_touches[t].clientX, _touches[t].clientY, buttonPositions[i].x, buttonPositions[i].y); // compare the touch to the button position
        if (d < radius) { // is the touch where a button is?
          _buttonState[i] = 1; // the the button is on
          console.log("if");
        }else{
          _buttonState[i] = _buttonState[i] + 0; // otherwise add a 0 to the state of that button (another toucch might have put it on you see)
          console.log("else");
        }
      }
    }
  }

  console.log(_buttonState);

  // ********** now our _buttonState array should accurately reflect the state of the touches and buttons so we can do something with it

  for (let i = 0; i < numberOfButtons; i++) { // for each button
    if(_touches.length === 0){ // if there are no touches at all
      stopSynth(i); // call stop synth for each button
    }else if(_buttonState[i] === 1){ // otherwise if the button is on
      playSynth(i); // call play synth for that button
    }else{ // otherwise if the button is off
      stopSynth(i); // call stopsynth for that button
    }
  }
}

function playSynth(i) {
  if(synthState[i] === 0) { // if the synth is not playing that note at the moment
    synth.triggerAttack(notes[i]); // play the note
    synthState[i] = 1; // change the array to reflect that the note is playing
    buttonColour[i] = buttonOnColour[i]; //change the colour of the button to on colour
    drawSynth();
  }
}

function stopSynth(i) {
  if(synthState[i] === 1) { // if the synth is playing that note at the moment
    synth.triggerRelease(notes[i]); // stop the note
    synthState[i] = 0; // change the array to reflect that the note is playing
    buttonColour[i] = buttonOffColour[i]; //change the colour of the button to off colour
    drawSynth();
  }
}





/* **************** follows a touch example using p5.js touch listeners in case you want to look into this******************************* */



// /// .clientX and .clientY give the X and Y position of the touches

// let endedTouches = []; // array to store ended touches in
// let buttonPositions = [{x: 80, y: 200}, {x: 200, y: 200}, {x: 320, y: 200}]; // position to draw the buttons
// let buttonState = [0, 0, 0]; //store state of the buttons
// let buttonColour  = [0, 1, 2]; // colour of the buttons at any given time
// const buttonOffColour = [0, 1, 2]; // default off colours
// const buttonOnColour = [3, 3, 3]; // default on colours
// let radius = 50; // radius of the buttons
// let ongoingTouches = []; // array to copy the ongoing touch info into
// let notes = ["C4", "D#4", "G4"]; // notes for the synth in this example
// let synth = new Tone.PolySynth().toDestination(); // create a polysynth
// synth.set(  // setup the synth - this is audio stuff really
//     {
//       "volume": -20,
//       "detune": 0,
//       "portamento": 0,
//       "envelope": {
//         "attack": 0.8,
//         "attackCurve": "linear",
//         "decay": 0.2,
//         "decayCurve": "exponential",
//         "sustain": 0.3,
//         "release": 0.8,
//         "releaseCurve": "exponential"
//       },
//     }
//   );


// function setup() {  // setup p5
//   let cnv = createCanvas(400, 400); // create canvas
//   cnv.parent('p5parent'); //put the canvas in a div with this id if needed
//   colorMode(HSB, 5); // specify HSB colormode and set the range to be between 0 and 5
//   noStroke(); // no stroke on the drawings
//   drawSynth(); // draw the insterface for the first time
// }

// // function draw() {  // p5 draw function - the traditional way to do this in p5 - this is called 60 times a second
// //   background(1, 0, 4); // background is grey (remmember 5 is maximum)

// //   for (let i = 0; i < buttonPositions.length; i++) {
// //     fill(buttonColour[i], 4, 4);
// //     ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
// //   }

// function drawSynth() { // instead of using the draw function at 60 frames a second we will call this function when something changes
//   background(1, 0, 4); // background is grey (remmember 5 is maximum)

//   for (let i = 0; i < buttonPositions.length; i++) {
//     fill(buttonColour[i], 4, 4);
//     ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
// }

// // ********** this example draws a circle for each touch *************

//   // for (let t of touches) { // cycle through the touches
//   //   //console.log(t) // log the touches if you want to for debugging
//   //   fill(t.id % 5, 4, 4); // each touch point's colour relates to touch id. however remember that on iOs the id numbers are huge so this doesn't work so well
//   //   ellipse(t.x, t.y, 100); //make a circle at the position of the touch
//   //   fill(0, 0, 0); // set colour to black
//   //   text(t.id, t.x - 50, t.y - 50); // display the touch id on the screen (for debuggin)
//   // }
//   // for (let t of endedTouches) { // cycle through the end touches
//   //   let tDiff = millis() - t.time; // set tDiff to tell us how recently we stopped touching
//   //   if (tDiff < 1000) { // if we stopped touching within the last second
//   //     fill(t.id % 5, 4, 4); // set the colour based on the id of the touch that we ended
//   //     ellipse(t.x, t.y, map(tDiff, 0, 1000, 100, 0)); // the circle is drawn smaller and smaller depending on how much time elapsed since touch
//   //   }
//   // }

// //************************************************************************ */

// }

// function touchStarted(e) {
//   Tone.start(); // we need this to allow audio to start.

//   if (e instanceof TouchEvent) {  // ensures we're only looking at the info we are interested in - not sure if we need this but don't think it hurts

//     let _touches = e.changedTouches; //assign the changedTouches to an array called touches
//     ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
//     //console.log(ongoingTouches); // debugging
//     buttonPressed(e);
//   } else {
//     console.log('non-touch event received');
//   }
//   return false;
// }

// function touchMoved(e) {

//   if (e instanceof TouchEvent) {  // ensures we're only looking at the info we are interested in - not sure if we need this but don't think it hurts
//     let _touches = e.changedTouches; //assign the changedTouches to an array called touches

//     for (var i = 0; i < _touches.length; i++) {

//       var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

//       if (idx >= 0) { // did we get a match?
//         // console.log("continuing touch "+idx); // debugging
//       // console.log("index = " + idx);
//         ongoingTouches.splice(idx, 1, copyTouch(_touches[i]));  // swap in the new touch record
//         // console.log(".");
//       } else { // no match
//         console.log("can't figure out which touch to continue");
//       }
//     }
//     buttonPressed(e);
//   } else {
//     console.log('non-touch event received');
//   }
//   return false;
// }

// function touchEnded(e) {
//   if (e instanceof TouchEvent) {  // touchEnded also captures other events, so this ensures we're only looking at the info we are interested in

//   let _touches = e.changedTouches; //assign the changedTouches to an array called touches

//   for (var i = 0; i < _touches.length; i++) {

//     var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

//     if (idx >= 0) { // did we get a match?
//       console.log("touchend "+idx);
//       //buttonPressed(e);
//       ongoingTouches.splice(idx, 1);  // remove it; we're done
//     } else { // no match
//       console.log("can't figure out which touch to end");
//     }
//   }
//   buttonPressed(e);
//     for (let t of e.changedTouches) { // cycle through the changedTouches array
//       // console.log("touch id " + t.identifier + // debugging
//       //   " released at x: " + t.clientX +
//       //   " y: " + t.clientY)
//       endedTouches.push({ //create our ended touches array from which we can call .time, .id, .x, .y
//         time: millis(),
//         id: t.identifier,
//         x: t.clientX,
//         y: t.clientY
//       });
//     }

//   } else {
//     console.log('non-touch event received');
//   }
//   return false;
// }

// function copyTouch({ identifier, clientX, clientY }) { // this function is used to facilitate copying touch ID properties
//   return { identifier, clientX, clientY };
// }

// function ongoingTouchIndexById(idToFind) { //compares the more complex stuff to give a simple answer to the question "which touch"
// for (var i = 0; i < ongoingTouches.length; i++) {
//   var id = ongoingTouches[i].identifier;

//   if (id == idToFind) {
//     return i;
//   }
// }
// return -1;    // not found
// }

// function buttonPressed() {

//   let _touches = ongoingTouches; //assign the changedTouches to an array called touches
//   let _buttonState = [0, 0, 0]; // array to store buttonstate in

//   //**** first lets check if each touch is on a button, and store the state in our local variable */

//   if(_touches.length != 0){ // if the touches array isn't empty
//     for (var t = 0; t < _touches.length; t++) {  // for each touch
//       for (let i = 0; i < buttonPositions.length; i++) { // for each button
//         let d = dist(_touches[t].clientX, _touches[t].clientY, buttonPositions[i].x, buttonPositions[i].y); // compare the touch to the button position
//         if (d < radius) { // is the touch where a button is?
//           _buttonState[i] = 1; // the the button is on
//         }else{
//           _buttonState[i] = _buttonState[i] + 0; // otherwise add a 0 to the state of that button (another toucch might have put it on you see)
//         }
//       }
//     }
//   }

//   // ********** now our _buttonState array should accurately reflect the state of the touches and buttons so we can do something with it

//   for (let i = 0; i < buttonPositions.length; i++) { // for each button
//     if(_touches.length === 0){ // if there are no touches at all
//       stopSynth(i); // call stop synth for each button
//     }else if(_buttonState[i] === 1){ // otherwise if the button is on
//       playSynth(i); // call play synth for that button
//     }else{ // otherwise if the button is off
//       stopSynth(i); // call stopsynth for that button
//     }
//   }
// }

// let synthState = [0, 0, 0]; // we need to store whether a note is playing because the synth is polyphonic and it will keep accepting on messages with every touch or moved touch and we won't be able to switch them all off

// function playSynth(i) {
//   // buttonColour[i] = buttonOnColour[i]; //change the colour of the button to on colour
//   if(synthState[i] === 0) { // if the synth is not playing that note at the moment
//     synth.triggerAttack(notes[i]); // play the note
//     synthState[i] = 1; // change the array to reflect that the note is playing
//     buttonColour[i] = buttonOnColour[i]; //change the colour of the button to on colour
//     drawSynth();
//   }
// }

// function stopSynth(i) {
//   //buttonColour[i] = buttonOffColour[i]; //change the colour of the button to off colour
//   if(synthState[i] === 1) { // if the synth is playing that note at the moment
//     synth.triggerRelease(notes[i]); // stop the note
//     synthState[i] = 0; // change the array to reflect that the note is playing
//     buttonColour[i] = buttonOffColour[i]; //change the colour of the button to off colour
//     drawSynth();
//   }
// }
