// initialize audioContext and get canvas
const audioContext = new AudioContext();
const canvas = document.getElementById("canvas");

// create a visualizer
const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: canvas.width,
  height: canvas.height,
});

// get audioNode from microphone
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  const audioNode = audioContext.createMediaStreamSource(stream);
  visualizer.connectAudio(audioNode);
});

// load a preset
const presets = butterchurnPresets.getPresets();
const preset = presets["Flexi, martin + geiss - dedicated to the sherwin maxawow"];
visualizer.loadPreset(preset, 0.0); // 2nd argument is the number of seconds to blend presets

// render a frame
function render() {
  visualizer.render();
  requestAnimationFrame(render);
}
render();
