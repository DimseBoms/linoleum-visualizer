(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";(()=>{var l=(o,t,e)=>new Promise((n,s)=>{var r=a=>{try{d(e.next(a))}catch(h){s(h)}},i=a=>{try{d(e.throw(a))}catch(h){s(h)}},d=a=>a.done?n(a.value):Promise.resolve(a.value).then(r,i);d((e=e.apply(o,t)).next())});var g="realtime-bpm-processor";var T=`"use strict";(()=>{var c=(a,o,e)=>new Promise((s,t)=>{var n=i=>{try{l(e.next(i))}catch(d){t(d)}},r=i=>{try{l(e.throw(i))}catch(d){t(d)}},l=i=>i.done?s(i.value):Promise.resolve(i.value).then(n,r);l((e=e.apply(a,o)).next())});var y="realtime-bpm-processor";function h(t){return c(this,arguments,function*(a,o=.2,e=.95,s=.05){let n=e;do if(n-=s,yield a(n))break;while(n>o)})}function A(a=.2,o=.95,e=.05){let s={},t=o;do t-=e,s[t.toString()]=[];while(t>a);return s}function v(a=.2,o=.95,e=.05){let s={},t=o;do t-=e,s[t.toString()]=0;while(t>a);return s}function m(){let o=0,e=new Float32Array(0);function s(){o=0,e=new Float32Array(0)}function t(){return o===4096}function n(){s()}return function(r){t()&&n();let l=new Float32Array(e.length+r.length);return l.set(e,0),l.set(r,e.length),e=l,o+=r.length,{isBufferFull:t(),buffer:e,bufferSize:4096}}}function b(a,o,e=0,s=1e4){let t=[],{length:n}=a;for(let r=e;r<n;r+=1)a[r]>o&&(t.push(r),r+=s);return{peaks:t,threshold:o}}function I(a,o){return c(this,null,function*(){let e=15,s=!1,t=.2;if(yield h(n=>c(this,null,function*(){return s?!0:(a[n].length>e&&(s=!0,t=n),!1)})),s&&t){let n=C(a[t]),r=S(o,n);return{bpm:w(r),threshold:t}}return{bpm:[],threshold:t}})}function w(a,o=5){return a.sort((e,s)=>s.count-e.count).splice(0,o)}function C(a){let o=[];for(let e=0;e<a.length;e++)for(let s=0;s<10;s++){let t=a[e],n=e+s,r=a[n]-t;if(!o.some(i=>i.interval===r?(i.count+=1,i.count):!1)){let i={interval:r,count:1};o.push(i)}}return o}function S(a,o){let e=[];for(let s of o){if(s.interval===0)continue;s.interval=Math.abs(s.interval);let t=60/(s.interval/a);for(;t<90;)t*=2;for(;t>180;)t/=2;if(t=Math.round(t),!e.some(r=>r.tempo===t?(r.count+=s.count,r.count):!1)){let r={tempo:t,count:s.count,confidence:0};e.push(r)}}return e}var u={minValidThreshold:()=>.2,validPeaks:()=>A(),nextIndexPeaks:()=>v(),skipIndexes:()=>1,effectiveBufferTime:()=>0},f=class{constructor(){this.options={continuousAnalysis:!1,stabilizationTime:2e4,muteTimeInIndexes:1e4,debug:!1};this.minValidThreshold=u.minValidThreshold();this.validPeaks=u.validPeaks();this.nextIndexPeaks=u.nextIndexPeaks();this.skipIndexes=u.skipIndexes();this.effectiveBufferTime=u.effectiveBufferTime();this.computedStabilizationTimeInSeconds=0;this.updateComputedValues()}setAsyncConfiguration(o){Object.assign(this.options,o),this.updateComputedValues()}updateComputedValues(){this.computedStabilizationTimeInSeconds=this.options.stabilizationTime/1e3}reset(){this.minValidThreshold=u.minValidThreshold(),this.validPeaks=u.validPeaks(),this.nextIndexPeaks=u.nextIndexPeaks(),this.skipIndexes=u.skipIndexes(),this.effectiveBufferTime=u.effectiveBufferTime()}clearValidPeaks(o){return c(this,null,function*(){this.minValidThreshold=Number.parseFloat(o.toFixed(2)),yield h(e=>c(this,null,function*(){return e<o&&typeof this.validPeaks[e]!="undefined"&&(delete this.validPeaks[e],delete this.nextIndexPeaks[e]),!1}))})}analyzeChunck(o,e,s,t){return c(this,null,function*(){this.options.debug&&t({message:"ANALYZE_CHUNK",data:o}),this.effectiveBufferTime+=s;let n=s*this.skipIndexes,r=n-s;yield this.findPeaks(o,s,r,n,t),this.skipIndexes++;let l=yield I(this.validPeaks,e),{threshold:i}=l;t({message:"BPM",result:l}),this.minValidThreshold<i&&(t({message:"BPM_STABLE",result:l}),yield this.clearValidPeaks(i)),this.options.continuousAnalysis&&this.effectiveBufferTime/e>this.computedStabilizationTimeInSeconds&&(this.reset(),t({message:"ANALYZER_RESETED"}))})}findPeaks(o,e,s,t,n){return c(this,null,function*(){yield h(r=>c(this,null,function*(){if(this.nextIndexPeaks[r]>=t)return!1;let l=this.nextIndexPeaks[r]%e,{peaks:i,threshold:d}=b(o,r,l);if(i.length===0)return!1;for(let F of i){let g=s+F;this.nextIndexPeaks[d]=g+this.options.muteTimeInIndexes,this.validPeaks[d].push(g),this.options.debug&&n({message:"VALID_PEAK",data:{threshold:d,index:g}})}return!1}),this.minValidThreshold)})}};var x=class extends AudioWorkletProcessor{constructor(){super();this.realTimeBpmAnalyzer=new f;this.stopped=!1;this.aggregate=m(),this.port.addEventListener("message",this.onMessage.bind(this)),this.port.start()}onMessage(e){e.data.message==="ASYNC_CONFIGURATION"&&(console.log("[processor.onMessage] ASYNC_CONFIGURATION"),this.realTimeBpmAnalyzer.setAsyncConfiguration(e.data.parameters)),e.data.message==="RESET"&&(console.log("[processor.onMessage] RESET"),this.aggregate=m(),this.stopped=!1,this.realTimeBpmAnalyzer.reset()),e.data.message==="STOP"&&(console.log("[processor.onMessage] STOP"),this.aggregate=m(),this.stopped=!0,this.realTimeBpmAnalyzer.reset())}process(e,s,t){let n=e[0][0];if(this.stopped||!n)return!0;let{isBufferFull:r,buffer:l,bufferSize:i}=this.aggregate(n);return r&&this.realTimeBpmAnalyzer.analyzeChunck(l,sampleRate,i,d=>{this.port.postMessage(d)}).catch(d=>{console.error(d)}),!0}};registerProcessor(y,x);var K={};})();

`;function f(s){return l(this,arguments,function*(o,t=.2,e=.95,n=.05){let r=e;do if(r-=n,yield o(r))break;while(r>t)})}function v(o=.2,t=.95,e=.05){let n={},s=t;do s-=e,n[s.toString()]=[];while(s>o);return n}function y(o=.2,t=.95,e=.05){let n={},s=t;do s-=e,n[s.toString()]=0;while(s>o);return n}function x(o,t,e=0,n=1e4){let s=[],{length:r}=o;for(let i=e;i<r;i+=1)o[i]>t&&(s.push(i),i+=n);return{peaks:s,threshold:t}}function M(o){return l(this,null,function*(){let t=[],e=0;return yield f(n=>l(this,null,function*(){let{peaks:s}=x(o,n);return s.length<15?!1:(t=s,e=n,!0)})),{peaks:t,threshold:e}})}function R(o){let t=o.createBiquadFilter();t.type="lowpass",t.frequency.value=150,t.Q.value=1;let e=o.createBiquadFilter();return e.type="highpass",e.frequency.value=100,e.Q.value=1,{lowpass:t,highpass:e}}function A(o,t){return l(this,null,function*(){let e=15,n=!1,s=.2;if(yield f(r=>l(this,null,function*(){return n?!0:(o[r].length>e&&(n=!0,s=r),!1)})),n&&s){let r=B(o[s]),i=V(t,r);return{bpm:b(i),threshold:s}}return{bpm:[],threshold:s}})}function b(o,t=5){return o.sort((e,n)=>n.count-e.count).splice(0,t)}function B(o){let t=[];for(let e=0;e<o.length;e++)for(let n=0;n<10;n++){let s=o[e],r=e+n,i=o[r]-s;if(!t.some(a=>a.interval===i?(a.count+=1,a.count):!1)){let a={interval:i,count:1};t.push(a)}}return t}function V(o,t){let e=[];for(let n of t){if(n.interval===0)continue;n.interval=Math.abs(n.interval);let s=60/(n.interval/o);for(;s<90;)s*=2;for(;s>180;)s/=2;if(s=Math.round(s),!e.some(i=>i.tempo===s?(i.count+=n.count,i.count):!1)){let i={tempo:s,count:n.count,confidence:0};e.push(i)}}return e}function O(o){return l(this,null,function*(){let t=o.getChannelData(0),{peaks:e}=yield M(t),n=B(e),s=V(o.sampleRate,n);return b(s,t.length)})}var u={minValidThreshold:()=>.2,validPeaks:()=>v(),nextIndexPeaks:()=>y(),skipIndexes:()=>1,effectiveBufferTime:()=>0},w=class{constructor(){this.options={continuousAnalysis:!1,stabilizationTime:2e4,muteTimeInIndexes:1e4,debug:!1};this.minValidThreshold=u.minValidThreshold();this.validPeaks=u.validPeaks();this.nextIndexPeaks=u.nextIndexPeaks();this.skipIndexes=u.skipIndexes();this.effectiveBufferTime=u.effectiveBufferTime();this.computedStabilizationTimeInSeconds=0;this.updateComputedValues()}setAsyncConfiguration(t){Object.assign(this.options,t),this.updateComputedValues()}updateComputedValues(){this.computedStabilizationTimeInSeconds=this.options.stabilizationTime/1e3}reset(){this.minValidThreshold=u.minValidThreshold(),this.validPeaks=u.validPeaks(),this.nextIndexPeaks=u.nextIndexPeaks(),this.skipIndexes=u.skipIndexes(),this.effectiveBufferTime=u.effectiveBufferTime()}clearValidPeaks(t){return l(this,null,function*(){this.minValidThreshold=Number.parseFloat(t.toFixed(2)),yield f(e=>l(this,null,function*(){return e<t&&typeof this.validPeaks[e]!="undefined"&&(delete this.validPeaks[e],delete this.nextIndexPeaks[e]),!1}))})}analyzeChunck(t,e,n,s){return l(this,null,function*(){this.options.debug&&s({message:"ANALYZE_CHUNK",data:t}),this.effectiveBufferTime+=n;let r=n*this.skipIndexes,i=r-n;yield this.findPeaks(t,n,i,r,s),this.skipIndexes++;let d=yield A(this.validPeaks,e),{threshold:a}=d;s({message:"BPM",result:d}),this.minValidThreshold<a&&(s({message:"BPM_STABLE",result:d}),yield this.clearValidPeaks(a)),this.options.continuousAnalysis&&this.effectiveBufferTime/e>this.computedStabilizationTimeInSeconds&&(this.reset(),s({message:"ANALYZER_RESETED"}))})}findPeaks(t,e,n,s,r){return l(this,null,function*(){yield f(i=>l(this,null,function*(){if(this.nextIndexPeaks[i]>=s)return!1;let d=this.nextIndexPeaks[i]%e,{peaks:a,threshold:h}=x(t,i,d);if(a.length===0)return!1;for(let F of a){let m=n+F;this.nextIndexPeaks[h]=m+this.options.muteTimeInIndexes,this.validPeaks[h].push(m),this.options.debug&&r({message:"VALID_PEAK",data:{threshold:h,index:m}})}return!1}),this.minValidThreshold)})}};function X(o){return l(this,null,function*(){let t=yield L(o,g);return yield o.resume(),t})}function L(o,t){return l(this,null,function*(){let e=new Blob([T],{type:"application/javascript"}),n=URL.createObjectURL(e);return yield o.audioWorklet.addModule(n),new AudioWorkletNode(o,t)})}})();


},{}],2:[function(require,module,exports){
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

  console.log("trying to load bpm analyzer");
  const realtimeBpmAnalyzer = require("realtime-bpm-analyzer");
  console.log(realtimeBpmAnalyzer);

  // initialize bpm analyzer
  const realtimeAnalyzerNode = await createRealTimeBpmProcessor(audioContext);
});

},{"realtime-bpm-analyzer":1}]},{},[2]);
