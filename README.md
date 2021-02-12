# p5_js_multitouch_helper

This is a project that i've made to allow me to increase my confidence in using location based multi touch in JavaScript
Initially this was intended to focus on p5.js, but it has expanded to be more general.
The first bunch of code should I think in principle work on any JavaScript project as it uses no specific p5 functions for touch.
The commented out version at the bottom is the same but using some of the p5.js touch listeners. I think it's slower. It combines
p5 touch with some vanilla touch to give proper touch end info etc. My view is that if you're doing that you may as well just use
the vanilla JavaScript touch stuff.
The html file expects p5.js to be in your root folder.
I'm using Tone.js for sound.

This was initially inspired by the help offered here https://github.com/processing/p5.js/issues/3091 which I have then built on
