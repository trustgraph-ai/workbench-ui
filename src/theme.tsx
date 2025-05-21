import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

export const config = defineConfig({
  //  strictTokens: true,
  globalCss: {
    "#root": {
      color: "{colors.text}",
      backgroundColor: "{colors.background}",
    },
    "html, body": {
      margin: 0,
      padding: 0,
    },
  },
  theme: {
    tokens: {
      colors: {
        tgBlue: {
          50: { value: "#EBF2FF" },
          100: { value: "#D6E4FF" },
          200: { value: "#ADC8FF" },
          300: { value: "#85ADFF" },
          400: { value: "#6693FB" },
          500: { value: "#5285ED" }, // Your light color
          600: { value: "#4275DD" }, // Your lightmid color
          700: { value: "#3A6FD4" }, // Your darkmid color
          800: { value: "#2F5EC0" }, // Your dark color
          900: { value: "#234CA6" },
        },
        tgGreen: {
          50: { value: "#E9FBF0" },
          100: { value: "#D1F7DE" },
          200: { value: "#A8EEBF" },
          300: { value: "#86E5A1" },
          400: { value: "#65C97A" }, // Your light mode color
          500: { value: "#55B96A" }, // Your hover light mode color
          600: { value: "#4EAF63" }, // Your dark mode color
          700: { value: "#409A53" }, // Your dark mode hover color
          800: { value: "#34844A" },
          900: { value: "#296F3E" },
        },
        gray: {
          50: { value: "#F7FAFC" }, // Lightest
          100: { value: "#EDF2F7" },
          200: { value: "#E2E8F0" },
          300: { value: "#CBD5E0" },
          400: { value: "#A0AEC0" },
          500: { value: "#718096" }, // Mid-gray
          600: { value: "#4A5568" },
          700: { value: "#2D3748" },
          800: { value: "#1A202C" },
          900: { value: "#171923" }, // Darkest
        },
      },
      fonts: {
        heading: { value: "Montserrat, sans-serif" },
        body: { value: "Montserrat, sans-serif" },
        mono: { value: "Roboto mono, monospace" },
      },
    },
    semanticTokens: {
      colors: {
        background: {
          value: {
            base: "{colors.gray.50}",
            _dark: "{colors.gray.900}",
          },
        },
        text: {
          value: {
            base: "{colors.gray.900}",
            _dark: "{colors.gray.100}",
          },
        },
        brand: {
          solid: {
            value: {
              base: "{colors.tgBlue.500}",
              _dark: "{colors.tgBlue.500}",
            },
          },
          contrast: {
            value: {
              base: "{colors.tgBlue.100}",
              _dark: "{colors.tgBlue.900}",
            },
          },
          fg: {
            value: {
              base: "{colors.tgBlue.700}",
              _dark: "{colors.tgBlue.300}",
            },
          },
          muted: {
            value: {
              base: "{colors.tgBlue.100}",
              _dark: "{colors.tgBlue.900}",
            },
          },
          subtle: {
            value: {
              base: "{colors.tgBlue.200}",
              _dark: "{colors.tgBlue.800}",
            },
          },
          emphasized: {
            value: {
              base: "{colors.tgBlue.300}",
              _dark: "{colors.tgBlue.700}",
            },
          },
          focusRing: {
            value: {
              base: "{colors.tgBlue.400}",
              _dark: "{colors.tgBlue.600}",
            },
          },
        },
        altBrand: {
          solid: {
            value: {
              base: "{colors.tgGreen.900}",
              _dark: "{colors.tgGreen.100}",
            },
          },
          contrast: {
            value: {
              base: "{colors.tgGreen.100}",
              _dark: "{colors.tgGreen.900}",
            },
          },
          fg: {
            value: {
              base: "{colors.tgGreen.700}",
              _dark: "{colors.tgGreen.200}",
            },
          },
          muted: {
            value: {
              base: "{colors.tgGreen.100}",
              _dark: "{colors.tgGreen.900}",
            },
          },
          subtle: {
            value: {
              base: "{colors.tgGreen.200}",
              _dark: "{colors.tgGreen.700}",
            },
          },
          emphasized: {
            value: {
              base: "{colors.tgGreen.300}",
              _dark: "{colors.tgGreen.600}",
            },
          },
          focusRing: {
            value: {
              base: "{colors.tgGreen.500}",
              _dark: "{colors.tgGreen.500}",
            },
          },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
