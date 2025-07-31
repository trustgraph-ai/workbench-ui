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

        // Colours from the website at coolors.co, palette from Claude
        airForceBlue: {
          50: { value: "#EDF5F9" },
          100: { value: "#DBEAF3" },
          200: { value: "#B7D5E7" },
          300: { value: "#93C0DB" },
          400: { value: "#6FABCF" },
          500: { value: "#558BB4" }, // Base color
          600: { value: "#4A7BA2" },
          700: { value: "#3F6B90" },
          800: { value: "#345B7E" },
          900: { value: "#294B6C" },        
        },
        skyBlue: {
          50: { value: "#F0F7FA" },
          100: { value: "#E1EFF5" },
          200: { value: "#C3DFEB" },
          300: { value: "#A5CFE1" },
          400: { value: "#94C3D7" },
          500: { value: "#83B7CE" }, // Base color
          600: { value: "#72A4BC" },
          700: { value: "#6191AA" },
          800: { value: "#507E98" },
          900: { value: "#3F6B86" },      
        },
        deepPlum: {
          50: { value: "#F9F8F9" },
          100: { value: "#F3F1F3" },
          200: { value: "#E7E3E7" },
          300: { value: "#DBD5DB" },
          400: { value: "#CFC7CF" },
          500: { value: "#A394A3" }, // Lightened base for usability
          600: { value: "#7A6B7A" },
          700: { value: "#5C4D5C" },
          800: { value: "#3D2E3D" },
          900: { value: "#250219" }, // Original color
        },
        darkViolet: {
          50: { value: "#FAF9FB" },
          100: { value: "#F5F3F6" },
          200: { value: "#EBE7ED" },
          300: { value: "#E1DBE4" },
          400: { value: "#D7CFDB" },
          500: { value: "#9A7BA2" }, // Lightened base for usability
          600: { value: "#7A5B82" },
          700: { value: "#5F4268" },
          800: { value: "#4F2F56" },
          900: { value: "#3F1D44" }, // Original color
        },
        thistle: {
          50: { value: "#FDFCFE" },
          100: { value: "#FAF8FC" },
          200: { value: "#F5F0F9" },
          300: { value: "#F0E8F6" },
          400: { value: "#E5D4F1" },
          500: { value: "#DAC0EC" }, // Base color
          600: { value: "#C8A5E0" },
          700: { value: "#B68AD4" },
          800: { value: "#A46FC8" },
          900: { value: "#8B4FB5" },
        },

        // Triadic based on above primary, palette by Claude
        warmOrange: {
          50: { value: "#FEFAF8" },
          100: { value: "#FDF5F0" },
          200: { value: "#FBEBE1" },
          300: { value: "#F9E1D2" },
          400: { value: "#F8BF9B" },
          500: { value: "#F79D65" }, // Base color
          600: { value: "#F5853E" },
          700: { value: "#E66B1A" },
          800: { value: "#C55A15" },
          900: { value: "#A44A11" },
        },

        // More desaturated orange
        warmNeutral: {
          50: { value: "#FDFCFB" },
          100: { value: "#FAF8F6" },
          200: { value: "#F5F1ED" },
          300: { value: "#EFEAE4" },
          400: { value: "#E0D5CA" },
          500: { value: "#D1C1B0" }, // Desaturated warm base
          600: { value: "#B8A394" },
          700: { value: "#9F8578" },
          800: { value: "#6B5B52" }, // Dark enough for backgrounds
          900: { value: "#3A312B" }, // Very dark warm neutral
        },
        
        // White variant and green variant, may be useful for agent dialog
        mintCream: {
          50: { value: "#FDFEFD" },
          100: { value: "#EFF7F6" }, // Original color moved up
          200: { value: "#DEF0ED" },
          300: { value: "#CDE9E4" },
          400: { value: "#BCE2DB" },
          500: { value: "#9DD4CA" }, // Usable mid-tone
          600: { value: "#7EC6B9" },
          700: { value: "#5FB8A8" },
          800: { value: "#4A9A8A" },
          900: { value: "#357C6C" },
        },
        sageGreen: {
          50: { value: "#F7FAF8" },
          100: { value: "#EFF5F1" },
          200: { value: "#DFEBE3" },
          300: { value: "#CFE1D5" },
          400: { value: "#B9D1BE" },
          500: { value: "#A4C2A8" }, // Base color
          600: { value: "#8FB394" },
          700: { value: "#7AA480" },
          800: { value: "#65956C" },
          900: { value: "#508658" },
        },

        // Colours from logos
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
              base: "{colors.airForceBlue.500}",
              _dark: "{colors.airForceBlue.500}",
            },
          },
          contrast: {
            value: {
              base: "{colors.airForceBlue.100}",
              _dark: "{colors.airForceBlue.900}",
            },
          },
          fg: {
            value: {
              base: "{colors.airForceBlue.700}",
              _dark: "{colors.airForceBlue.300}",
            },
          },
          muted: {
            value: {
              base: "{colors.airForceBlue.100}",
              _dark: "{colors.airForceBlue.900}",
            },
          },
          subtle: {
            value: {
              base: "{colors.airForceBlue.200}",
              _dark: "{colors.airForceBlue.800}",
            },
          },
          emphasized: {
            value: {
              base: "{colors.airForceBlue.300}",
              _dark: "{colors.airForceBlue.700}",
            },
          },
          focusRing: {
            value: {
              base: "{colors.airForceBlue.400}",
              _dark: "{colors.airForceBlue.600}",
            },
          },
        },

        altBrand: {
          solid: {
            value: {
              base: "{colors.skyBlue.900}",
              _dark: "{colors.skyBlue.100}",
            },
          },
          contrast: {
            value: {
              base: "{colors.skyBlue.100}",
              _dark: "{colors.skyBlue.900}",
            },
          },
          fg: {
            value: {
              base: "{colors.skyBlue.700}",
              _dark: "{colors.skyBlue.200}",
            },
          },
          muted: {
            value: {
              base: "{colors.skyBlue.100}",
              _dark: "{colors.skyBlue.900}",
            },
          },
          subtle: {
            value: {
              base: "{colors.skyBlue.200}",
              _dark: "{colors.skyBlue.700}",
            },
          },
          emphasized: {
            value: {
              base: "{colors.skyBlue.300}",
              _dark: "{colors.skyBlue.600}",
            },
          },
          focusRing: {
            value: {
              base: "{colors.skyBlue.500}",
              _dark: "{colors.skyBlue.500}",
            },
          },
        },

        warmBrand: {
          solid: {
            value: {
              base: "{colors.warmNeutral.900}",
              _dark: "{colors.warmNeutral.100}",
            },
          },
          contrast: {
            value: {
              base: "{colors.warmNeutral.100}",
              _dark: "{colors.warmNeutral.900}",
            },
          },
          fg: {
            value: {
              base: "{colors.warmNeutral.700}",
              _dark: "{colors.warmNeutral.200}",
            },
          },
          muted: {
            value: {
              base: "{colors.warmNeutral.100}",
              _dark: "{colors.warmNeutral.900}",
            },
          },
          subtle: {
            value: {
              base: "{colors.warmNeutral.200}",
              _dark: "{colors.warmNeutral.700}",
            },
          },
          emphasized: {
            value: {
              base: "{colors.warmNeutral.300}",
              _dark: "{colors.warmNeutral.600}",
            },
          },
          focusRing: {
            value: {
              base: "{colors.warmNeutral.500}",
              _dark: "{colors.warmNeutral.500}",
            },
          },
        },

        insightfulBrand: {
          solid: {
            value: {
              base: "{colors.mintCream.900}",
              _dark: "{colors.mintCream.100}",
            },
          },
          contrast: {
            value: {
              base: "{colors.mintCream.100}",
              _dark: "{colors.mintCream.900}",
            },
          },
          fg: {
            value: {
              base: "{colors.mintCream.700}",
              _dark: "{colors.mintCream.200}",
            },
          },
          muted: {
            value: {
              base: "{colors.mintCream.100}",
              _dark: "{colors.mintCream.900}",
            },
          },
          subtle: {
            value: {
              base: "{colors.mintCream.200}",
              _dark: "{colors.mintCream.700}",
            },
          },
          emphasized: {
            value: {
              base: "{colors.mintCream.300}",
              _dark: "{colors.mintCream.600}",
            },
          },
          focusRing: {
            value: {
              base: "{colors.mintCream.500}",
              _dark: "{colors.mintCream.500}",
            },
          },


        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
