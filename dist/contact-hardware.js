export const CONTACT_ASSETS = {
  "relay": {
    "name": "5V relay module",
    "sourcePart": "wokwi-relay-module",
    "width": 128.001,
    "height": 58.239,
    "asset": "relay-module.svg",
    "poweredAsset": "relay-module-powered.svg",
    "energizedAsset": "relay-module-energized.svg",
    "pins": [
      {
        "id": "VCC",
        "name": "VCC",
        "x": 0.007559,
        "y": 18.703143,
        "side": "left",
        "role": "supply"
      },
      {
        "id": "GND",
        "name": "GND",
        "x": 0.007559,
        "y": 28.427848,
        "side": "left",
        "role": "reference"
      },
      {
        "id": "IN",
        "name": "IN",
        "x": 0.007559,
        "y": 38.167671,
        "side": "left",
        "role": "control"
      },
      {
        "id": "NC",
        "name": "NC",
        "x": 113.721974,
        "y": 20.14503,
        "side": "right",
        "role": "contact"
      },
      {
        "id": "COM",
        "name": "COM",
        "x": 113.721974,
        "y": 29.745011,
        "side": "right",
        "role": "contact"
      },
      {
        "id": "NO",
        "name": "NO",
        "x": 114.099926,
        "y": 39.344991,
        "side": "right",
        "role": "contact"
      }
    ],
    "glows": {
      "power": {
        "x": 26.834591,
        "y": 6.803325
      },
      "energized": {
        "x": 26.834591,
        "y": 51.401659
      }
    },
    "contactStates": {
      "deenergized": [
        [
          "COM",
          "NC"
        ]
      ],
      "energized": [
        [
          "COM",
          "NO"
        ]
      ]
    },
    "isolation": "Control pins VCC/GND/IN have no internal contact-net union with COM/NO/NC.",
    "defaultActiveHigh": true,
    "circuitForgeControlPolicy": {
      "powerRequired": true,
      "nominalSupplyVoltage": 5,
      "inputReference": "GND",
      "commonReferenceRequiredForDirectMcuDrive": true,
      "disconnectedInput": "deenergized",
      "states": [
        {
          "powered": false,
          "activeHigh": null,
          "input": null,
          "energized": false
        },
        {
          "powered": true,
          "activeHigh": true,
          "input": "HIGH",
          "energized": true
        },
        {
          "powered": true,
          "activeHigh": true,
          "input": "LOW",
          "energized": false
        },
        {
          "powered": true,
          "activeHigh": false,
          "input": "HIGH",
          "energized": false
        },
        {
          "powered": true,
          "activeHigh": false,
          "input": "LOW",
          "energized": true
        },
        {
          "powered": true,
          "activeHigh": null,
          "input": "disconnected",
          "energized": false
        }
      ],
      "policyOrigin": "Explicit CircuitForge owner decision; not a claim of matching Wokwi relay emulator."
    },
    "upstreamBehaviorConflict": "Official docs Attributes calls npn active-high/pnp active-low, but Operation paragraph states the inverse. Do not translate transistor attr without deciding compatibility policy.",
    "source": "https://github.com/wokwi/wokwi-docs/blob/1b91bec815b31d336cf1122c004ade238a8abec5/docs/parts/wokwi-relay-module.svg",
    "docs": "https://docs.wokwi.com/parts/wokwi-relay-module",
    "docsCommit": "1b91bec815b31d336cf1122c004ade238a8abec5",
    "license": "MIT",
    "copyright": "2021-2024 CodeMagic LTD",
    "coordinateBasis": "Derived from actual source artwork: left lead tips and right screw centers; no arbitrary edge-spaced pins.",
    "illustrationScope": "Wokwi documentation illustration, not a particular calibrated manufactured PCB.",
    "researchDate": "2026-10-10"
  },
  "spdt": {
    "name": "SPDT slide switch",
    "sourcePart": "wokwi-slide-switch",
    "width": 32.125984251968504,
    "height": 34.885039370078744,
    "asset": "slide-switch-left.svg",
    "rightAsset": "slide-switch-right.svg",
    "pins": [
      {
        "id": "1",
        "name": "Left terminal",
        "x": 6.765354,
        "y": 34.771654,
        "number": 1,
        "side": "bottom"
      },
      {
        "id": "2",
        "name": "Common",
        "x": 16.062992,
        "y": 34.771654,
        "number": 2,
        "side": "bottom"
      },
      {
        "id": "3",
        "name": "Right terminal",
        "x": 25.511811,
        "y": 34.771654,
        "number": 3,
        "side": "bottom"
      }
    ],
    "sourcePinInfo": [
      {
        "id": "1",
        "x": 6.5,
        "y": 34
      },
      {
        "id": "2",
        "x": 16,
        "y": 34
      },
      {
        "id": "3",
        "x": 25.5,
        "y": 34
      }
    ],
    "states": {
      "left": {
        "value": 0,
        "connected": [
          [
            "1",
            "2"
          ]
        ]
      },
      "right": {
        "value": 1,
        "connected": [
          [
            "2",
            "3"
          ]
        ]
      }
    },
    "common": "2",
    "defaultValue": 0,
    "supplyRequired": false,
    "bounce": "Wokwi defaults to bounce; ideal CircuitForge contacts may omit bounce but must say so.",
    "source": "https://github.com/wokwi/wokwi-elements/blob/72d8b5b1f472121987d8c74b60a0e7a5d756c54c/src/slide-switch-element.ts",
    "docs": "https://docs.wokwi.com/parts/wokwi-slide-switch",
    "elementsVersion": "1.9.2",
    "elementsCommit": "72d8b5b1f472121987d8c74b60a0e7a5d756c54c",
    "license": "MIT",
    "copyright": "2020 Uri Shaked",
    "coordinateBasis": "Exact drawn lead tips. Upstream rounded pinInfo preserved separately for provenance.",
    "researchDate": "2026-10-10"
  }
};
