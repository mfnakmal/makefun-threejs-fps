import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const repoDir = 'D:/Bot/Make Fun/makefun-threejs-fps';
const screenshotsDir = path.join(repoDir, 'screenshots');
fs.mkdirSync(screenshotsDir, { recursive: true });

// Start local HTTP server
const serverProc = spawn('node', [path.join(repoDir, 'serve.ts'), '--port', '8088'], {
  cwd: repoDir
});

serverProc.stdout.on('data', (d) => {
  const str = d.toString();
  if (str.includes('8088')) {
    captureAll();
  }
});

const tasks = [
  { name: '1-combat.jpg', shot: 'combat' },
  { name: '2-buy.jpg', shot: 'buy' },
  { name: '3-plant.jpg', shot: 'plant' },
  { name: '4-victory.jpg', shot: 'victory' }
];

function captureAll() {
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpChrome = 'D:/Bot/Make Fun/tmp_chrome_fps';
  fs.mkdirSync(tmpChrome, { recursive: true });

  for (const t of tasks) {
    const rawPng = path.join(screenshotsDir, t.name.replace('.jpg', '_raw.png'));
    const finalJpg = path.join(screenshotsDir, t.name);

    console.log(`Capturing ${t.name} (?shot=${t.shot}) ...`);
    const res = spawnSync(chrome, [
      '--headless=new',
      '--user-data-dir=' + tmpChrome,
      '--no-first-run',
      '--no-default-browser-check',
      '--use-gl=angle',
      '--enable-webgl',
      '--screenshot=' + rawPng,
      '--window-size=1280,720',
      '--virtual-time-budget=2000',
      `http://127.0.0.1:8088/?shot=${t.shot}&seed=1`
    ]);

    if (fs.existsSync(rawPng)) {
      // Convert PNG to high-quality JPEG (Quality 85%) using PowerShell System.Drawing
      const psCmd = `
        Add-Type -AssemblyName System.Drawing;
        $img = [System.Drawing.Image]::FromFile('${rawPng.replace(/\\/g, '\\\\')}');
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq 'JPEG' };
        $params = New-Object System.Drawing.Imaging.EncoderParameters(1);
        $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85);
        $img.Save('${finalJpg.replace(/\\/g, '\\\\')}', $codec, $params);
        $img.Dispose();
      `;
      spawnSync('powershell', ['-NoProfile', '-Command', psCmd]);
      fs.unlinkSync(rawPng);

      if (fs.existsSync(finalJpg)) {
        const sz = fs.statSync(finalJpg).size;
        console.log(`Success: ${t.name} -> ${sz} bytes (limit 262144 bytes)`);
      } else {
        console.error(`Failed to convert ${t.name}`);
      }
    } else {
      console.error(`Failed to capture ${rawPng}:`, res.stderr?.toString());
    }
  }

  // Remove old starter screenshots if present
  for (const old of ['1-start.jpg', '2-play.jpg', '3-end.jpg']) {
    const oldP = path.join(screenshotsDir, old);
    if (fs.existsSync(oldP)) fs.unlinkSync(oldP);
  }

  serverProc.kill();
  console.log('All 4 tactical screenshots captured successfully!');
  process.exit(0);
}
