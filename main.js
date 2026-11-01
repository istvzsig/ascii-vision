const CONFIG = {
  chars:
    " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  defaultFPS: 24,
};

function getElements() {
  const characters = document.getElementById("characters");
  characters.style.width = window.innerWidth / 2 + "px";

  return {
    video: document.getElementById("video"),
    canvas: document.getElementById("canvas"),
    output: document.getElementById("output"),
    status: document.getElementById("status"),
    start: document.getElementById("start"),
    stop: document.getElementById("stop"),
    copy: document.getElementById("copy"),
    resolution: document.getElementById("resolution"),
    contrast: document.getElementById("contrast"),
    fps: document.getElementById("fps"),
    invert: document.getElementById("invert"),
    color: document.getElementById("color"),
    charSize: document.getElementById("charSize"),
    charSizeValue: document.getElementById("charSizeValue"),
    characters,
  };
}

function createCamera(video) {
  let stream = null;

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    video.srcObject = stream;
    await video.play();
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });

      stream = null;
    }

    video.srcObject = null;
  }

  return { start, stop };
}

function createRenderer(config) {
  const canvas = config.canvas;
  const video = config.video;
  const output = config.output;
  const controls = config.controls;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  function escapeHtml(value) {
    return value.replace(/[&<>]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
      }[char];
    });
  }

  function getBrightness(r, g, b, contrast, invert) {
    let brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    brightness = (brightness - 128) * contrast + 128;
    brightness = Math.max(0, Math.min(255, brightness));

    return invert ? 255 - brightness : brightness;
  }

  function render() {
    if (video.readyState < 2) return;

    const width = Number(controls.resolution.value);
    const aspect = video.videoHeight / video.videoWidth;
    const height = Math.max(1, Math.floor(width * aspect * 0.48));

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);

    const pixels = ctx.getImageData(0, 0, width, height).data;

    const contrast = Number(controls.contrast.value);
    const invert = controls.invert.checked;
    const colorMode = controls.color.checked;

    const chars = controls.characters.value || CONFIG.chars;
    const maxIndex = chars.length - 1;
    const lines = [];

    for (let y = 0; y < height; y++) {
      let line = "";

      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const brightness = getBrightness(r, g, b, contrast, invert);

        const index = Math.floor((brightness / 255) * maxIndex);

        const char = escapeHtml(chars[index]);

        if (colorMode) {
          line +=
            '<span style="color:rgb(' +
            r +
            "," +
            g +
            "," +
            b +
            ')">' +
            char +
            "</span>";
        } else {
          line += char;
        }
      }

      lines.push(line);
    }

    output.innerHTML = lines.join("\n");
  }

  return { render };
}

function createControls(config) {
  const elements = config.elements;
  const camera = config.camera;
  const renderer = config.renderer;

  let running = false;
  let animationId = null;
  let lastFrame = 0;

  function setStatus(message) {
    elements.status.textContent = message;
  }

  function stop() {
    running = false;

    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    camera.stop();

    setStatus("CAMERA OFFLINE");
    elements.output.textContent = "CAMERA OFFLINE\nPRESS START CAMERA";
  }

  function loop(timestamp) {
    if (!running) return;

    animationId = requestAnimationFrame(loop);

    const fps = Number(elements.fps.value);
    const interval = 1000 / fps;

    if (timestamp - lastFrame < interval) return;

    lastFrame = timestamp;
    renderer.render();
  }

  async function start() {
    if (running) return;

    try {
      setStatus("STARTING CAMERA...");

      await camera.start();

      running = true;
      lastFrame = 0;

      setStatus("CAMERA ACTIVE");
      loop(0);
    } catch (error) {
      camera.stop();
      setStatus("Camera error: " + error.message);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(elements.output.textContent);

      setStatus("ASCII COPIED");
    } catch (error) {
      setStatus("Clipboard unavailable");
    }
  }

  function bind() {
    elements.start.addEventListener("click", start);
    elements.stop.addEventListener("click", stop);
    elements.copy.addEventListener("click", copy);

    const visualControls = [
      elements.resolution,
      elements.contrast,
      elements.invert,
      elements.color,
      elements.characters,
    ];

    visualControls.forEach(function (control) {
      control.addEventListener("input", function () {
        if (running) renderer.render();
      });
    });

    elements.charSize.addEventListener("input", function () {
      elements.charSizeValue.textContent = elements.charSize.value + "px";
      elements.output.style.fontSize = elements.charSize.value + "px";
    });

    window.addEventListener("beforeunload", stop);
  }

  bind();

  return {
    start,
    stop,
  };
}

function init() {
  const elements = getElements();

  const camera = createCamera(elements.video);

  const renderer = createRenderer({
    canvas: elements.canvas,
    video: elements.video,
    output: elements.output,
    controls: {
      resolution: elements.resolution,
      contrast: elements.contrast,
      invert: elements.invert,
      color: elements.color,
      characters: elements.characters,
    },
  });

  const controls = createControls({
    elements: elements,
    camera: camera,
    renderer: renderer,
  });

  elements.output.style.fontSize = elements.charSize.value + "px";

  return {
    camera,
    renderer,
    controls,
  };
}

document.addEventListener("DOMContentLoaded", init, {
  once: true,
});
