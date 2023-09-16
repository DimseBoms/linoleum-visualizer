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
  let visualizer = butterchurn.default.createVisualizer(audioContext, canvas, {
    width: this.document.documentElement.clientWidth,
    height: this.document.documentElement.clientHeight,
  });

  // set initial renderer size
  visualizer.setRendererSize(
    document.documentElement.clientWidth,
    document.documentElement.clientHeight
  );

  // populate and load presets
  const presets = butterchurnPresets.getPresets();
  const presetNames = Object.keys(presets);
  const presetSelect = document.getElementById("mainPresetSelect");

  let currentPresetName = "";
  const gainNode = audioContext.createGain();
  function loadPreset(presetName, customPresetName = false) {
    let _preset = presets[presetName];
    gainNode.gain.value = 1;
    visualizer.loadPreset(_preset, 5.0); // 2nd argument is the number of seconds to blend presets
    currentPresetName = presetName;
    if (!customPresetName) {
      presetDisplay.innerHTML = `Preset: ${truncateString(
        currentPresetName,
        30
      )}`;
    } else {
      presetDisplay.innerHTML = `Preset: ${truncateString(
        customPresetName,
        30
      )}`;
    }
    presetSelect.value = presetName;
  }

  function clearPreset() {
    visualizer.loadPreset(presets["Aderrasi + Geiss - Airhandler (Kali Mix) - Canvas Mix"], 1);
    gainNode.gain.value = 0;
    currentPresetName = "";
    presetDisplay.innerHTML = `Preset: ${truncateString(
      currentPresetName,
      30
    )}`;
    presetSelect.value = "";
  }

  // bind space bar key to clear preset
  document.addEventListener("keydown", function (event) {
    if (event.key === " ") {
      clearPreset();
    }
  });

  presetNames.forEach((presetName) => {
    const option = document.createElement("option");
    option.text = presetName;
    presetSelect.add(option);
  });
  // load preset from local storage
  if (localStorage.getItem("currentPreset")) {
    loadPreset(localStorage.getItem("currentPreset"));
  } else {
    loadPreset(presetSelect.value);
  }

  // enable preset selection
  presetSelect.addEventListener("change", function () {
    loadPreset(presetSelect.value);
    // save preset to local storage
    localStorage.setItem("currentPreset", presetSelect.value);
  });

  // enable preset switching with arrow keys
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
      const index = presetNames.indexOf(currentPresetName);
      if (index > 0) {
        loadPreset(presetNames[index - 1]);
        // save preset to local storage
        localStorage.setItem("currentPreset", presetNames[index - 1]);
      }
    } else if (event.key === "ArrowDown") {
      const index = presetNames.indexOf(currentPresetName);
      if (index < presetNames.length - 1) {
        loadPreset(presetNames[index + 1]);
        // save preset to local storage
        localStorage.setItem("currentPreset", presetNames[index + 1]);
      }
    }
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
    // create gainNode to control volume
    microphone.connect(gainNode);
    visualizer.connectAudio(gainNode);
  });

  const customBpmPresetsContainer = document.getElementById(
    "customBpmPresetsContainer"
  );

  let customBpmPresets = {};
  // load custom presets from local storage
  if (localStorage.getItem("customBpmPresets")) {
    customBpmPresets = JSON.parse(localStorage.getItem("customBpmPresets"));
    generateCustomBpmPresets();
  }

  function editCustomBpmPreset(presetName, preset, presetDiv) {
    presetDiv.innerHTML = `
      <input type="text" class="customBpmPresetName" id="customBpmPresetName-${presetName}" value="${presetName}">
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
      // const newPresetName = document.getElementById(
      //   `customBpmPresetName-${presetName}`
      // ).value;
      // const newPreset = {
      //   preset: document.getElementById(`customBpmPresetPreset-${presetName}`)
      //     .value,
      //   bpm: document.getElementById(`customBpmPresetBpm-${presetName}`).value,
      // };
      // console.log(newPreset);
      // delete customBpmPresets[presetName];
      // customBpmPresets[newPresetName] = newPreset;

      let _presets = {};
      Object.keys(customBpmPresets).forEach((presetName) => {

        if (presetName !== Object.keys(customBpmPresets).find(key => customBpmPresets[key] === preset)) {
          _presets[presetName] = customBpmPresets[presetName];
        } else {
          _presets[document.getElementById(`customBpmPresetName-${presetName}`).value] = {
            preset: document.getElementById(`customBpmPresetPreset-${presetName}`)
              .value,
            bpm: document.getElementById(`customBpmPresetBpm-${presetName}`).value,
            keybind: customBpmPresets[presetName].keybind,
          };
        }
      });
      customBpmPresets = _presets; 
      generateCustomBpmPresets();
      // save to local storage
      localStorage.setItem(
        "customBpmPresets",
        JSON.stringify(customBpmPresets)
      );
    });
    cancelButton.addEventListener("click", function () {
      generateCustomBpmPresets();
    });
  }

  function generateCustomBpmPresets() {
    customBpmPresetsContainer.innerHTML = "";
    Object.keys(customBpmPresets).forEach((presetName) => {
      const preset = customBpmPresets[presetName];
      const presetDiv = document.createElement("div");
      presetDiv.classList.add("customBpmPreset");
      presetDiv.innerHTML = `
        <button class="customBpmPresetButton" id="customBpmPresetKeybindButton-${presetName}">Keybind: <b>${preset.keybind ? preset.keybind : '⠀'}</b></button>
        <div class="customBpmPresetName">${presetName}</div>
        <div class="customBpmPresetNameDivider">-</div>
        <div class="customBpmPresetPreset">${preset.preset}</div>
        <div class="customBpmPresetNameDivider">-</div>
        <div class="customBpmPresetBpm">${preset.bpm} BPM</div>
        <button class="customBpmPresetButton" id="editCustomBpmPresetButton-${presetName}">Edit</button>
        <button class="customBpmPresetButton" id="deleteCustomBpmPresetButton-${presetName}">Delete</button>
      `;
      customBpmPresetsContainer.appendChild(presetDiv);
      const keybindButton = document.getElementById(
        `customBpmPresetKeybindButton-${presetName}`
      );
      keybindButton.addEventListener("click", function () {
        keybindButton.innerHTML = "Press any key...";
        document.addEventListener(
          "keydown",
          function (event) {
            preset.keybind = event.key;
            keybindButton.innerHTML = `Keybind: ${preset.keybind}`;
            // save to local storage
            localStorage.setItem(
              "customBpmPresets",
              JSON.stringify(customBpmPresets)
            );
          },
          { once: true }
        );
      });
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
        // save to local storage
        localStorage.setItem(
          "customBpmPresets",
          JSON.stringify(customBpmPresets)
        );
      });
    });
  }

  // add function to watch for keybinds
  document.addEventListener("keydown", function (event) {
    Object.keys(customBpmPresets).forEach((presetName) => {
      const preset = customBpmPresets[presetName];
      if (preset.keybind === event.key) {
        loadPreset(preset.preset, Object.keys(customBpmPresets).find(key => customBpmPresets[key] === preset));
      }
    });
  });

  function addNewEmptyPreset() {
    const newPresetName = prompt("Enter a unique name for the new preset:");
    if (newPresetName) {
      const newPreset = {
        preset: presetSelect.value,
        bpm: 120,
        keybind: "",
      };
      customBpmPresets[newPresetName] = newPreset;
      generateCustomBpmPresets();
      // save to local storage
      localStorage.setItem(
        "customBpmPresets",
        JSON.stringify(customBpmPresets)
      );
    }
  }

  let addCustomBpmPresetButton = document.getElementById("addCustomBpmPreset");
  addCustomBpmPresetButton.addEventListener("click", function () {
    addNewEmptyPreset();
  });

  // load settings from file
  const loadSettingsButton = document.getElementById("loadSettingsButton");
  loadSettingsButton.addEventListener("click", function () {
    const settingsInput = document.createElement("input");
    settingsInput.type = "file";
    settingsInput.accept = "application/json";
    settingsInput.click();
    settingsInput.addEventListener("change", function () {
      const file = settingsInput.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", function (event) {
        const settings = JSON.parse(event.target.result);
        customBpmPresets = settings.presets;
        generateCustomBpmPresets();
        loadPreset(settings.currentPreset);
      });
      reader.readAsText(file);
    });
    // save to local storage
    localStorage.setItem("customBpmPresets", JSON.stringify(customBpmPresets));
  });

  // save settings to file
  const saveSettingsButton = document.getElementById("saveSettingsButton");
  saveSettingsButton.addEventListener("click", function () {
    const settings = {
      presets: customBpmPresets,
      currentPreset: currentPresetName,
    };
    const settingsBlob = new Blob([JSON.stringify(settings)], {
      type: "application/json",
    });
    const settingsUrl = URL.createObjectURL(settingsBlob);
    const settingsLink = document.createElement("a");
    settingsLink.href = settingsUrl;
    settingsLink.download = "settings.json";
    settingsLink.click();
  });

  // update preset when bpm changes to the preset with the closest bpm
  const presetBpmControlCheckbox = document.getElementById("presetBpmControl");
  // load button state from local storage
  if (
    localStorage.getItem("presetBpmControl") === "true" ||
    localStorage.getItem("presetBpmControl") === null
  ) {
    presetBpmControlCheckbox.checked = true;
  } else {
    presetBpmControlCheckbox.checked = false;
  }
  presetBpmControlCheckbox.addEventListener("change", function () {
    if (presetBpmControlCheckbox.checked) {
      // save button state to local storage
      localStorage.setItem("presetBpmControl", "true");
    } else {
      // save button state to local storage
      localStorage.setItem("presetBpmControl", "false");
    }
  });

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
    if (closestPresetBpm !== 0 && presetBpmControlCheckbox.checked) {
      loadPreset(customBpmPresets[closestPreset].preset);
    }
  }

  // register bpm via spacebar and update bpm display.
  // uses the last 10 spacebar presses to calculate bpm.
  let keyPressArray = [];
  // document.addEventListener("keydown", function (event) {
  //   if (event.key === " ") {
  //     keyPressArray.push(Date.now());
  //     if (keyPressArray.length > 10) {
  //       keyPressArray.shift();
  //     }
  //     const bpm = Math.round(
  //       (60000 * keyPressArray.length) /
  //         (keyPressArray[keyPressArray.length - 1] - keyPressArray[0] + 0.0)
  //     );
  //     bpmDisplay.innerHTML = `BPM: ${bpm}`;
  //     updatePreset(bpm);
  //   }
  // });
});
