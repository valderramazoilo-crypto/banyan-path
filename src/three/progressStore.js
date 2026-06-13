// Tiny shared store the scroll listener writes to and the 3D scene reads from
// in its render loop. Avoids prop-drilling into the R3F Canvas and keeps the
// scroll → growth mapping smooth (the scene lerps `current` toward `target`).
export const banyan = {
  scrollTarget: 0, // 0..1 normalised scroll position
  scrollCurrent: 0,
  pointerX: 0, // -1..1
  pointerY: 0,
  // branch focus (set on click; CameraRig flies toward it)
  focusActive: false,
  focusX: 0,
  focusY: 0,
  focusZ: 0,
}
