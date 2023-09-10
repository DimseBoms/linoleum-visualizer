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

  let currentPresetName = ""
  function loadPreset(presetName) {
    let _preset = presets[presetName];
    visualizer.loadPreset(_preset, 5.0); // 2nd argument is the number of seconds to blend presets
    currentPresetName = presetName
    presetDisplay.innerHTML = `Preset: ${truncateString(presetName, 30)}`;
    presetSelect.value = presetName;
  }

  presetNames.forEach((presetName) => {
    const option = document.createElement("option");
    option.text = presetName;
    presetSelect.add(option);
  });
  loadPreset(presetSelect.value);

  // enable preset selection
  presetSelect.addEventListener("change", function () {
    loadPreset(presetSelect.value);
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

  const customBpmPresetsContainer = document.getElementById(
    "customBpmPresetsContainer"
  );
  const customBpmPresets = {};

  function editCustomBpmPreset(presetName, preset, presetDiv) {
    presetDiv.innerHTML = `
      <input type="text" class customBpmPresetName id="customBpmPresetName-${presetName}" value="${presetName}">
      <select class="customBpmPresetPreset" id="customBpmPresetPreset-${presetName}">
      </select>
      <input type="number" class="customBpmPresetBpm" id="customBpmPresetBpm-${presetName}" value="${preset.bpm}">
      <button class="customBpmPresetButton" id="saveCustomBpmPresetButton-${presetName}">Save</button>
      <button class="customBpmPresetButton" id="cancelCustomBpmPresetButton-${presetName}">Cancel</button>
    `;
    let customBpmPresetPreset = document.getElementById(
      `customBpmPresetPreset-${presetName}`
    );
    presetNames.forEach((presetName) => {
      const option = document.createElement("option");
      option.text = presetName;
      customBpmPresetPreset.add(option);
    });
    customBpmPresetPreset.value = preset.preset;
    const saveButton = document.getElementById(
      `saveCustomBpmPresetButton-${presetName}`
    );
    const cancelButton = document.getElementById(
      `cancelCustomBpmPresetButton-${presetName}`
    );
    saveButton.addEventListener("click", function () {
      const newPresetName = document.getElementById(
        `customBpmPresetName-${presetName}`
      ).value;
      const newPreset = {
        preset: document.getElementById(
          `customBpmPresetPreset-${presetName}`
        ).value,
        bpm: document.getElementById(`customBpmPresetBpm-${presetName}`).value,
      };
      console.log(newPreset);
      delete customBpmPresets[presetName];
      customBpmPresets[newPresetName] = newPreset;
      generateCustomBpmPresets();
    }
    );
    cancelButton.addEventListener("click", function () {
      generateCustomBpmPresets();
    }
    );
  }

  function generateCustomBpmPresets() {
    customBpmPresetsContainer.innerHTML = "";
    Object.keys(customBpmPresets).forEach((presetName) => {
      const preset = customBpmPresets[presetName];
      const presetDiv = document.createElement("div");
      presetDiv.classList.add("customBpmPreset");
      presetDiv.innerHTML = `
        <div class="customBpmPresetName">${presetName}</div>
        <div class="customBpmPresetNameDivider">-</div>
        <div class="customBpmPresetPreset">${preset.preset}</div>
        <div class="customBpmPresetNameDivider">-</div>
        <div class="customBpmPresetBpm">${preset.bpm} BPM</div>
        <button class="customBpmPresetButton" id="editCustomBpmPresetButton-${presetName}">Edit</button>
        <button class="customBpmPresetButton" id="deleteCustomBpmPresetButton-${presetName}">Delete</button>
      `;
      customBpmPresetsContainer.appendChild(presetDiv);
      const deleteButton = document.getElementById(
        `deleteCustomBpmPresetButton-${presetName}`
      );
      const editButton = document.getElementById(
        `editCustomBpmPresetButton-${presetName}`
      );
      editButton.addEventListener("click", function () {
        editCustomBpmPreset(presetName, preset, presetDiv);
      });
      deleteButton.addEventListener("click", function () {
        delete customBpmPresets[presetName];
        generateCustomBpmPresets();
      });
    });
    console.log(customBpmPresets);
  }

  function addNewEmptyPreset() {
    const newPresetName = prompt("Enter a unique name for the new preset:");
    if (newPresetName) {
      const newPreset = {
        preset: presetSelect.value,
        bpm: 120,
      };
      customBpmPresets[newPresetName] = newPreset;
      generateCustomBpmPresets();
    }
  }

  let addCustomBpmPresetButton = document.getElementById("addCustomBpmPreset");
  addCustomBpmPresetButton.addEventListener("click", function () {
    addNewEmptyPreset();
  });

  console.log(visualizer)

  // update preset when bpm changes to the preset with the closest bpm
  function updatePreset(bpm) {
    let closestPreset = "";
    let closestPresetBpm = 0;
    let closestPresetDifference = 100000;
    Object.keys(customBpmPresets).forEach((presetName) => {
      const preset = customBpmPresets[presetName];
      const difference = Math.abs(preset.bpm - bpm);
      if (difference < closestPresetDifference) {
        closestPreset = presetName;
        closestPresetBpm = preset.bpm;
        closestPresetDifference = difference;
      }
    });
    if (closestPresetBpm !== 0) {
      loadPreset(customBpmPresets[closestPreset].preset);
    }
  }

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
      updatePreset(bpm);
    }
  });
});
