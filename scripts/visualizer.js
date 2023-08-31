window.addEventListener("load", function () {
  // make settings modal dynamic
  const settingsIcon = document.getElementById("settingsIcon");
  settingsIcon.addEventListener("click", function () {
    const settingsModal = document.getElementById("settingsModal");
    settingsModal.classList.toggle("hidden");
  });

  const closeSettingsButton = document.getElementById("closeSettingsButton");
  closeSettingsButton.addEventListener("click", function () {
    const settingsModal = document.getElementById("settingsModal");
    settingsModal.classList.toggle("hidden");
  });

  // enable fullscreen
  const fullscreenButton = document.getElementById("openFullscreenIcon");
  fullscreenButton.addEventListener("click", function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });

  // create audiocontext
  const audioContext = new AudioContext();

  // set initial canvas size
  const canvas = document.getElementById("canvas");
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  canvas.style.backgroundColor = "#ffffff";

  canvas.addEventListener("click", function () {
    if (!settingsModal.classList.contains("hidden")) {
      settingsModal.classList.toggle("hidden");
    } else {
      settingsIcon.classList.toggle("hidden");
      fullscreenButton.classList.toggle("hidden");
      if (document.fullscreenElement) {
        if (document.body.style.cursor === "none") {
          document.body.style.cursor = "default";
        } else {
          document.body.style.cursor = "none";
        }
      }
    }
  });

  // create initial visualiser
  const visualizer = butterchurn.default.createVisualizer(
    audioContext,
    canvas,
    {
      width: this.document.documentElement.clientWidth,
      height: this.document.documentElement.clientHeight,
    }
  );

  // set initial renderer size
  visualizer.setRendererSize(
    document.documentElement.clientWidth,
    document.documentElement.clientHeight
  );

  // create audioNode from microphone
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    const microphone = audioContext.createMediaStreamSource(stream);
    visualizer.connectAudio(microphone);
  });

  // populate and load presets
  const presets = butterchurnPresets.getPresets();
  const presetNames = Object.keys(presets);
  const presetSelect = document.getElementById("presetSelect");
  presetNames.forEach((presetName) => {
    const option = document.createElement("option");
    option.text = presetName;
    presetSelect.add(option);
  });
  const preset =
    presets["Flexi, martin + geiss - dedicated to the sherwin maxawow"];
  visualizer.loadPreset(preset, 5.0); // 2nd argument is the number of seconds to blend presets
  presetSelect.value =
    "Flexi, martin + geiss - dedicated to the sherwin maxawow";

  // enable preset selection
  presetSelect.addEventListener("change", function () {
    const preset = presets[presetSelect.value];
    visualizer.loadPreset(preset, 5.0);
  });

  // ensure canvas always fills the window
  window.addEventListener("resize", function () {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    visualizer.setRendererSize(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight
    );
  });

  function animate() {
    visualizer.render(); // render a frame
    requestAnimationFrame(animate); // request the next frame
  }

  requestAnimationFrame(animate); // start the animation loop
});
