const FONT_CANDIDATES = [
  'Arial',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Courier New',
  'Brush Script MT',
  'Comic Sans MS',
  'Impact',
  'Helvetica',
  'Roboto',
  'Inter',
  'Segoe UI',
  'Fira Sans',
  'Monaco',
  'Calibri',
  'Cambria'
];

const FONT_BASES = ['monospace', 'sans-serif', 'serif'];
const FONT_TEST_STRING = 'mmmmmmmmmmlliWWWWWW@@@#12345אבגדהζηθικ漢字🙂';

const connectionFromNavigator = () =>
  navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const fallbackHash = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `fallback_${Math.abs(hash)}`;
};

const hashString = async (value) => {
  try {
    if (window.crypto?.subtle) {
      const data = new TextEncoder().encode(value);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      return toHex(digest);
    }
  } catch (error) {
    // Ignore and fallback
  }
  return fallbackHash(value);
};

const getCanvasFingerprint = async () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 120;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.textBaseline = 'top';
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(20, 20, 100, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('TeleTable Fingerprint Ω≈ç√∫˜µ≤≥÷', 4, 6);
    ctx.strokeStyle = 'rgba(120, 186, 176, 0.7)';
    ctx.beginPath();
    ctx.arc(80, 50, 40, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();

    return hashString(canvas.toDataURL());
  } catch (error) {
    return null;
  }
};

const getWebGLFingerprint = async () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      return {
        vendor: null,
        renderer: null,
        hash: null,
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    gl.clearColor(0.12, 0.24, 0.36, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      vendor: vendor || null,
      renderer: renderer || null,
      hash: await hashString(canvas.toDataURL()),
    };
  } catch (error) {
    return {
      vendor: null,
      renderer: null,
      hash: null,
    };
  }
};

const getAudioFingerprint = async () => {
  try {
    const AudioContextRef = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioContextRef) {
      return null;
    }

    const context = new AudioContextRef(1, 44100, 44100);
    const oscillator = context.createOscillator();
    const compressor = context.createDynamicsCompressor();
    const analyser = context.createAnalyser();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(context.destination);

    oscillator.start(0);

    const renderedBuffer = await context.startRendering();
    const channelData = renderedBuffer.getChannelData(0);
    const sample = Array.from(channelData.slice(4500, 5000));

    return hashString(JSON.stringify(sample));
  } catch (error) {
    return null;
  }
};

const getInstalledFonts = () => {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return [];
    }

    const fontSize = '72px';
    const baselineSizes = {};

    FONT_BASES.forEach((base) => {
      context.font = `${fontSize} ${base}`;
      baselineSizes[base] = {
        width: context.measureText(FONT_TEST_STRING).width,
      };
    });

    return FONT_CANDIDATES.filter((font) => {
      return FONT_BASES.some((base) => {
        context.font = `${fontSize} '${font}', ${base}`;
        const measured = context.measureText(FONT_TEST_STRING).width;
        return measured !== baselineSizes[base].width;
      });
    });
  } catch (error) {
    return [];
  }
};

const getBatteryStatus = async () => {
  try {
    if (typeof navigator.getBattery !== 'function') {
      return {
        supported: false,
        level: null,
        charging: null,
        chargingTime: null,
        dischargingTime: null,
      };
    }

    const battery = await navigator.getBattery();
    return {
      supported: true,
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
  } catch (error) {
    return {
      supported: false,
      level: null,
      charging: null,
      chargingTime: null,
      dischargingTime: null,
    };
  }
};

export const collectFingerprintData = async () => {
  const [canvasHash, webgl, audioHash, batteryStatus] = await Promise.all([
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    getAudioFingerprint(),
    getBatteryStatus(),
  ]);

  const installedFonts = getInstalledFonts();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  const connection = connectionFromNavigator();

  return {
    userAgent: navigator.userAgent || null,
    platform: navigator.platform || null,
    language: navigator.language || null,
    languages: navigator.languages || [],
    screen: {
      width: window.screen?.width ?? null,
      height: window.screen?.height ?? null,
      availWidth: window.screen?.availWidth ?? null,
      availHeight: window.screen?.availHeight ?? null,
      colorDepth: window.screen?.colorDepth ?? null,
      pixelRatio: window.devicePixelRatio ?? null,
    },
    timezone,
    timezoneOffset: new Date().getTimezoneOffset(),
    canvas2dHash: canvasHash,
    webgl,
    audioHash,
    installedFonts,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    deviceMemory: navigator.deviceMemory ?? null,
    battery: batteryStatus,
    touchSupport: {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
    },
    plugins: Array.from(navigator.plugins || []).map((plugin) => ({
      name: plugin.name,
      filename: plugin.filename,
      description: plugin.description,
    })),
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || null,
    network: {
      effectiveType: connection?.effectiveType ?? null,
      downlink: connection?.downlink ?? null,
      rtt: connection?.rtt ?? null,
      saveData: connection?.saveData ?? null,
    },
    collectedAt: new Date().toISOString(),
  };
};
