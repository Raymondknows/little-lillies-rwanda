const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 64, 192, 512];
const padding = 0.15; // 15% safe padding

// Generate icons with safe padding
async function generateIcons() {
  try {
    // Load the base logo
    const sourceIcon = path.join(__dirname, 'logo.png');
    
    if (!fs.existsSync(sourceIcon)) {
      console.error(`Logo not found: ${sourceIcon}`);
      process.exit(1);
    }

    // Generate each size with padding
    for (const size of sizes) {
      const paddingPixels = Math.round(size * padding);
      const innerSize = size - (paddingPixels * 2);

      console.log(`Generating ${size}x${size} icon with ${paddingPixels}px padding...`);

      // Create icon with padding: transparent background, logo centered
      await sharp(sourceIcon)
        .resize(innerSize, innerSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
        })
        .extend({
          top: paddingPixels,
          bottom: paddingPixels,
          left: paddingPixels,
          right: paddingPixels,
          background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
        })
        .png()
        .toFile(path.join(__dirname, `favicon-${size}x${size}.png`));

      console.log(`✓ Generated favicon-${size}x${size}.png`);
    }

    // Also generate android icons
    console.log(`\nGenerating Android Chrome icons...`);
    
    // 192x192
    const padding192 = Math.round(192 * padding);
    const inner192 = 192 - (padding192 * 2);
    await sharp(sourceIcon)
      .resize(inner192, inner192, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: padding192,
        bottom: padding192,
        left: padding192,
        right: padding192,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, `android-chrome-192x192.png`));
    console.log(`✓ Generated android-chrome-192x192.png`);

    // 512x512
    const padding512 = Math.round(512 * padding);
    const inner512 = 512 - (padding512 * 2);
    await sharp(sourceIcon)
      .resize(inner512, inner512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: padding512,
        bottom: padding512,
        left: padding512,
        right: padding512,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, `android-chrome-512x512.png`));
    console.log(`✓ Generated android-chrome-512x512.png`);

    // Apple touch icon
    const paddingApple = Math.round(192 * padding);
    const innerApple = 192 - (paddingApple * 2);
    await sharp(sourceIcon)
      .resize(innerApple, innerApple, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // white for Apple
      })
      .extend({
        top: paddingApple,
        bottom: paddingApple,
        left: paddingApple,
        right: paddingApple,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, `apple-touch-icon.png`));
    console.log(`✓ Generated apple-touch-icon.png`)

    console.log('\n✅ All icons generated successfully with 15% safe padding!');
    console.log('\nGenerated/Updated files:');
    sizes.forEach(size => console.log(`  - favicon-${size}x${size}.png`));
    console.log(`  - android-chrome-192x192.png`);
    console.log(`  - android-chrome-512x512.png`);
    console.log(`  - apple-touch-icon.png`);
    console.log('\nIcons now have proper padding to prevent logo overflow on mobile OS adaptive icons.');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
