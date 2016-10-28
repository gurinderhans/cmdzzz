"use strict";

/// TODO: have a visual slider hooked to top of page for visual clues and allow slider-like interface on that visual
/// the slider will only show when keyboard shortcut is pressed and will hide soon after

/// MARK: consts
const LAST_N_FRAMES = 9; // and +1 because zero-indicies
const WINDOW_FRAMES = 'windowFrames';
const RECORD_DELAY = 1000;
const MOVE_FORWARD_KEY = 39;
const MOVE_BACKWARD_KEY = 37;

/// MARK: global variables
let frameStorage = [];
let cycleIndex = -1;
let shouldRecordScroll = true;

function getStoredFrames() {
	return frameStorage;
}

function cycleBackward() {
	const storedFrames = getStoredFrames();

	if (cycleIndex < 1) {
		return;
	}

	shouldRecordScroll = false;

	const pos = storedFrames[--cycleIndex];
	window.scrollTo(pos[0], pos[1]);
}

function cycleForward() {
	const storedFrames = getStoredFrames();

	if (cycleIndex >= storedFrames.length - 1) {
		return;
	}

	shouldRecordScroll = false;

	const pos = storedFrames[++cycleIndex];
	window.scrollTo(pos[0], pos[1]);
}

function recordWindowPosition() {

	// tab jumps are so fast, we need to record the position as soon as this function is called, we can save it after
	const pos = [ window.scrollX, window.scrollY ];

	if (!shouldRecordScroll) {
		shouldRecordScroll = true;
		return;
	}

	let lastNframes = getStoredFrames();

	if (lastNframes.length > LAST_N_FRAMES) {
		lastNframes = lastNframes.splice(lastNframes.length - LAST_N_FRAMES, lastNframes.length);
	}

	lastNframes.push(pos);

	frameStorage = lastNframes;

	// update cycle index to latest recorded pos
	cycleIndex = lastNframes.length - 1;
}

function delay(func, delayAmount) {
	let wait = false;
	return () => {
		if (!wait) {
			func.apply(null, arguments);
			wait = true;
			setTimeout(() => {
				wait = false;
			}, delayAmount);
		}
	}
}

function handleKeyUp() {
	return (keyEvent) => {
		if (keyEvent.keyCode == MOVE_BACKWARD_KEY) {
			cycleBackward();
		} else if (keyEvent.keyCode == MOVE_FORWARD_KEY) {
			cycleForward();
		}
	}
}

// hook into window.onscroll to listen for scroll
window.onscroll = delay(recordWindowPosition, RECORD_DELAY);

window.onkeyup = handleKeyUp();

window.onload = () => { recordWindowPosition() };
