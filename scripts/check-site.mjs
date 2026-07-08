import { access, readFile } from 'node:fs/promises';

const requiredOutput = [
  'dist/index.html',
  'dist/contact/index.html',
  'dist/privacy/index.html',
  'dist/terms/index.html',
  'dist/security/index.html',
  'dist/consent.js',
  'dist/_headers',
];

const failures = [];

for (const path of requiredOutput) {
  try {
    await access(path);
  } catch {
    failures.push(`Missing build output: ${path}`);
  }
}

const checks = [
  ['dist/contact/index.html', '<link rel="canonical" href="https://agyl.ai/contact">'],
  ['dist/privacy/index.html', '<link rel="canonical" href="https://agyl.ai/privacy">'],
  ['dist/terms/index.html', '<link rel="canonical" href="https://agyl.ai/terms">'],
  ['dist/security/index.html', '<link rel="canonical" href="https://agyl.ai/security">'],
  ['dist/consent.js', 'loadApollo();'],
  ['dist/consent.js', 'navigator.globalPrivacyControl === true'],
  ['dist/_headers', 'https://*.apollo.io'],
];

for (const [path, expected] of checks) {
  try {
    const content = await readFile(path, 'utf8');
    if (!content.includes(expected)) {
      failures.push(`${path} does not contain: ${expected}`);
    }
  } catch {
    // Missing outputs are reported above.
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('AGYL site checks passed.');
