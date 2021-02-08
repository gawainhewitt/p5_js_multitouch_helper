let endedTouches = []; // array to store ended touches in
let buttonXpositions = [80, 200, 320]; // position to draw the buttons
let buttonColour  = [0, 1, 2]; // colour of the buttons at any given time
const buttonOffColour = [0, 1, 2]; // default off colours
const buttonOnColour = [3, 3, 3]; // default on colours


function setup() {
  let cnv = createCanvas(400, 400); // create canvas
  cnv.parent('p5parent'); //put the canvas in a div with this id if needed
  colorMode(HSB, 5); // specify HSB colormode and set the range to be between 0 and 5
  noStroke(); // no stroke on the drawings
}

function draw() {
  background(1, 0, 4); // background is grey (remmember 5 is maximum)

  for (let i = 0; i < buttonXpositions.length; i++) {
    fill(buttonColour[i], 4, 4);
    ellipse(buttonXpositions[i], 200, 100);
  }

  // fill(1, 4, 4);
  // ellipse(buttonXpositions[1], 200, 100);


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

function touchStarted() {
  return false;
}

function touchMoved() {
  return false;
}

function touchEnded(e) {
  if (e instanceof TouchEvent) {  // touchEnded also captures other events, so this ensures we're only looking at the info we are interested in
    for (let t of e.changedTouches) { // cycle through the p5.js changedTouches array (which is not documented)
      console.log("touch id " + t.identifier + // debugging
        " released at x: " + t.clientX +
        " y: " + t.clientY)
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
