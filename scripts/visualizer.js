window.addEventListener("load", async function () {
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

  document.addEventListener("keydown", function (event) {
    if (event.key === "f") {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }
  });

  // create audiocontext
  const audioContext = new AudioContext();

  // set initial canvas size
  const canvas = document.getElementById("canvas");
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  canvas.style.backgroundColor = "#ffffff";

  const bpmDisplay = document.getElementById("bpmDisplay");
  const presetDisplay = document.getElementById("presetDisplay");

  canvas.addEventListener("click", function () {
    if (!settingsModal.classList.contains("hidden")) {
      settingsModal.classList.toggle("hidden");
    } else {
      settingsIcon.classList.toggle("hidden");
      fullscreenButton.classList.toggle("hidden");
      bpmDisplay.classList.toggle("hidden");
      presetDisplay.classList.toggle("hidden");
      if (document.fullscreenElement) {
        if (document.body.style.cursor === "none") {
          document.body.style.cursor = "default";
        } else {
          document.body.style.cursor = "none";
          // set cursor back to default if fullscreen is exited
          document.addEventListener("fullscreenchange", function () {
            document.body.style.cursor = "default";
            // remove event listener to avoid memory leak
            document.removeEventListener("fullscreenchange", function () {
              document.body.style.cursor = "default";
            });
          });
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

  // populate and load presets
  const presets = butterchurnPresets.getPresets();
  const presetNames = Object.keys(presets);
  const presetSelect = document.getElementById("mainPresetSelect");

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
  presetDisplay.innerHTML = `Preset: ${truncateString(presetSelect.value, 30)}`;

  // enable preset selection
  presetSelect.addEventListener("change", function () {
    const preset = presets[presetSelect.value];
    visualizer.loadPreset(preset, 5.0);
    presetDisplay.innerHTML = `Preset: ${truncateString(
      presetSelect.value,
      30
    )}`;
  });

  function truncateString(str, num) {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  }

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

  // create audioNode from microphone
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    const microphone = audioContext.createMediaStreamSource(stream);
    visualizer.connectAudio(microphone);
  });

  // custom bpm presets
  const customBpmPresets = [];
  function createEmptyPreset() {
    const presetId = Math.random().toString(36).substr(2, 9);
    customBpmPresets.forEach((customBpmPreset) => {
      if (customBpmPreset.id === presetId) {
        createEmptyPreset();
      } else {
        customBpmPresets.push({
          id: presetId,
          name: "",
          preset: "",
          bpm: "",
        });
      }
    }
    );
    return presetId;
  }
  function deletePresetById(id) {
    customBpmPresets.forEach((customBpmPreset) => {
      if (customBpmPreset.id === id) {
        customBpmPresets.splice(customBpmPresets.indexOf(customBpmPreset), 1);
      }
    });
  }

  const customBpmPresetsContainer = document.getElementById(
    "customBpmPresetsContainer"
  );
  const addCustomBpmPresetButton =
    document.getElementById("addCustomBpmPreset");

  addCustomBpmPresetButton.addEventListener("click", function () {
    const customBpmPreset = document.createElement("div");
    let presetId = createEmptyPreset();
    customBpmPreset.classList.add("customBpmPreset");
    customBpmPreset.innerHTML = `
      <input type="text" class="customBpmPresetName" placeholder="Name">
      <select class="customBpmPresetSelect"></select>
      <input type="number" class="customBpmPresetBpm" placeholder="BPM">
      <button class="deleteCustomBpmPreset" style="background-color:red;" id="${presetId}">Delete</button>
    `;
    customBpmPresetsContainer.appendChild(customBpmPreset);
    // populate and load presets into customBpmPresetPresetSelect
    const customBpmPresetPresetSelect = customBpmPreset.querySelector(
      ".customBpmPresetSelect"
    );
    presetNames.forEach((presetName) => {
      const option = document.createElement("option");
      option.text = presetName;
      customBpmPresetPresetSelect.add(option);
    });
    // enable name input
    const customBpmPresetName = customBpmPreset.querySelector(
      ".customBpmPresetName"
    );
    customBpmPresetName.addEventListener("change", function () {
      customBpmPresets.forEach((customBpmPreset) => {
        if (customBpmPreset.id === presetId) {
          customBpmPreset.name = customBpmPresetName.value;
        }
      });
      console.log(customBpmPresets);
    });
    // enable preset selection
    customBpmPresetPresetSelect.addEventListener("change", function () {
      customBpmPresets.forEach((customBpmPreset) => {
        if (customBpmPreset.id === presetId) {
          customBpmPreset.preset = customBpmPresetPresetSelect.value;
        }
      });
      console.log(customBpmPresets);
    });
    // enable preset deletion
    document.getElementById(presetId).addEventListener("click", function () {
      deletePresetById(presetId);
      customBpmPresetsContainer.removeChild(customBpmPreset);
      console.log(customBpmPresets);
    });
  });

  // register bpm via spacebar and update bpm display.
  // uses the last 10 spacebar presses to calculate bpm.
  let keyPressArray = [];
  document.addEventListener("keydown", function (event) {
    if (event.key === " ") {
      keyPressArray.push(Date.now());
      if (keyPressArray.length > 10) {
        keyPressArray.shift();
      }
      const bpm = Math.round(
        (60000 * keyPressArray.length) /
          (keyPressArray[keyPressArray.length - 1] - keyPressArray[0] + 0.0)
      );
      bpmDisplay.innerHTML = `BPM: ${bpm}`;
    }
  });
});
