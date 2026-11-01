# ASCII Vision

A lightweight real-time webcam ASCII renderer built with vanilla JavaScript and HTML5 Canvas.

Convert live camera input into ASCII characters directly in your browser.

## Features

- Real-time webcam rendering
- ASCII character mapping based on pixel brightness
- RGB color mode
- Inverted brightness mode
- Adjustable rendering resolution
- Contrast adjustment
- Configurable frame rate
- Copy ASCII output to clipboard
- No external dependencies

## Getting Started

Clone the repository:

```bash
git clone https://github.com/USERNAME/ascii-vision.git
cd ascii-vision
```

Start a local development server:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Click **START CAMERA** and grant webcam permissions.

## Configuration

The renderer provides several adjustable settings:

| Setting    | Description                    |
| ---------- | ------------------------------ |
| Resolution | Controls ASCII output width    |
| Contrast   | Adjusts brightness contrast    |
| FPS        | Controls rendering frame rate  |
| Invert     | Reverses brightness mapping    |
| Color      | Enables RGB character coloring |

## Requirements

- Modern browser with webcam support
- Camera permission
- HTTPS or localhost environment

## Technology

- JavaScript (ES6)
- HTML5 Canvas
- WebRTC MediaDevices API
- CSS3

## License

MIT
