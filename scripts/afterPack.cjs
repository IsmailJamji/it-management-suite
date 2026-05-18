/**
 * Garantit la présence des DLL Chromium/Electron à côté de l'exécutable Windows.
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_DLLS = [
  'ffmpeg.dll',
  'libEGL.dll',
  'libGLESv2.dll',
  'd3dcompiler_47.dll',
  'vk_swiftshader.dll',
  'vulkan-1.dll',
];

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const electronDist = path.join(__dirname, '..', 'node_modules', 'electron', 'dist');
  const appOutDir = context.appOutDir;

  if (!fs.existsSync(electronDist)) {
    console.warn('[afterPack] electron dist introuvable:', electronDist);
    return;
  }

  for (const file of REQUIRED_DLLS) {
    const src = path.join(electronDist, file);
    const dest = path.join(appOutDir, file);

    if (!fs.existsSync(src)) {
      if (file.endsWith('.dll')) {
        console.warn('[afterPack] DLL manquante dans electron/dist:', file);
      }
      continue;
    }

    fs.copyFileSync(src, dest);
    console.log('[afterPack] Copié:', file);
  }

  const ffmpegDest = path.join(appOutDir, 'ffmpeg.dll');
  if (!fs.existsSync(ffmpegDest)) {
    throw new Error('[afterPack] ffmpeg.dll introuvable après copie — build Windows invalide.');
  }
};
