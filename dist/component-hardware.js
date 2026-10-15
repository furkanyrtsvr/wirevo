export const COMPONENT_ASSETS = {
  "led": {
    "width": 40,
    "height": 50,
    "asset": "led-red.svg",
    "onAsset": "led-red-on.svg",
    "pins": [
      {
        "id": "A",
        "name": "A \u00b7 Anode",
        "x": 24.817407,
        "y": 42.441336
      },
      {
        "id": "K",
        "name": "K \u00b7 Cathode",
        "x": 15.326715,
        "y": 42.373985,
        "sourceId": "C"
      }
    ],
    "light": {
      "x": 20.306859,
      "y": 19.574684
    },
    "variants": {
      "red": "led-red.svg",
      "green": "led-green.svg",
      "blue": "led-blue.svg",
      "yellow": "led-yellow.svg"
    },
    "source": "https://github.com/wokwi/wokwi-elements/blob/main/src/led-element.ts",
    "license": "MIT",
    "copyright": "2020 Uri Shaked"
  },
  "resistor": {
    "width": 59.13070866141733,
    "height": 11.338582677165356,
    "asset": "resistor-220.svg",
    "pins": [
      {
        "id": "1",
        "name": "1",
        "x": 0.0,
        "y": 5.650507
      },
      {
        "id": "2",
        "name": "2",
        "x": 58.80189,
        "y": 5.650507
      }
    ],
    "variants": {
      "220": "resistor-220.svg",
      "1000": "resistor-1000.svg",
      "10000": "resistor-10000.svg"
    },
    "source": "https://github.com/wokwi/wokwi-elements/blob/main/src/resistor-element.ts",
    "license": "MIT",
    "copyright": "2020 Uri Shaked"
  },
  "button": {
    "width": 67.28314960629922,
    "height": 45.35433070866142,
    "asset": "pushbutton-12mm.svg",
    "pressedAsset": "pushbutton-12mm-pressed.svg",
    "pins": [
      {
        "id": "1",
        "name": "1.l",
        "x": 0.397531,
        "y": 12.918492,
        "bus": "1"
      },
      {
        "id": "2",
        "name": "2.l",
        "x": 0.397531,
        "y": 31.887107,
        "bus": "2"
      },
      {
        "id": "1.r",
        "name": "1.r",
        "x": 66.93851,
        "y": 12.918492,
        "bus": "1"
      },
      {
        "id": "2.r",
        "name": "2.r",
        "x": 66.93851,
        "y": 31.887107,
        "bus": "2"
      }
    ],
    "source": "https://github.com/wokwi/wokwi-elements/blob/main/src/pushbutton-element.ts",
    "license": "MIT",
    "copyright": "2020 Uri Shaked"
  },
  "pot": {
    "width": 75.59055118110237,
    "height": 75.59055118110237,
    "asset": "potentiometer.svg",
    "bodyAsset": "potentiometer-body.svg",
    "pins": [
      {
        "id": "GND",
        "name": "GND",
        "x": 29.026772,
        "y": 68.031496
      },
      {
        "id": "OUT",
        "name": "SIG",
        "x": 38.626772,
        "y": 68.031496,
        "sourceId": "SIG"
      },
      {
        "id": "VCC",
        "name": "VCC",
        "x": 48.226772,
        "y": 68.031496
      }
    ],
    "knob": {
      "center": {
        "x": 37.795276,
        "y": 30.23622
      },
      "markStart": {
        "x": 38.588976,
        "y": 7.559055
      },
      "markEnd": {
        "x": 38.588976,
        "y": 19.275591
      },
      "minimumAngle": -135,
      "maximumAngle": 135
    },
    "originalArtwork": "https://freesvg.org/potentiometer",
    "originalLicense": "CC0 / public domain",
    "source": "https://github.com/wokwi/wokwi-elements/blob/main/src/potentiometer-element.ts",
    "license": "MIT",
    "copyright": "2020 Uri Shaked"
  }
};
