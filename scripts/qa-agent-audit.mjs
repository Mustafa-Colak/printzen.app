#!/usr/bin/env node

/**
 * Printzen Quality Gate & Content QA Agent Linter
 * 
 * Verifies content integrity before build/deploy:
 * 1. Title stuttering (e.g., "Rehberi Rehberi", "Guide Guide")
 * 2. Hardcoded API secrets and dummy tokens (e.g. PRZ_LIVE_, sk_live_, BURAYA)
 * 3. Broken template variables or unresolved JS interpolation (${...}, [object Object])
 * 4. Technical code-page contradictions (CP857 byte inversion bugs)
 * 5. Frontmatter completeness and date validation
 * 6. Markdown code block balancing (unclosed ``` blocks)
 * 7. Stitched redundant sections after FAQ
 * 8. pSEO doorway page title & grammar audit
 * 9. Broken internal link detection (/tr/rehberler, /tr/rehber, /guides)
 */

import fs from 'fs';
import path from 'path';

const ERRORS = [];
const WARNINGS = [];

function reportError(file, line, message) {
  ERRORS.push(`❌ [ERROR] ${file}${line ? ':' + line : ''} - ${message}`);
}

function reportWarning(file, line, message) {
  WARNINGS.push(`⚠️  [WARN]  ${file}${line ? ':' + line : ''} - ${message}`);
}

// 1. Audit Markdown Guides
const GUIDES_DIRS = ['src/content/guides/tr', 'src/content/guides/en'];

for (const dir of GUIDES_DIRS) {
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  for (const filename of files) {
    const filePath = path.join(dir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Frontmatter extraction
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      reportError(filePath, 1, 'Missing YAML frontmatter block (---)');
      continue;
    }

    const frontmatter = fmMatch[1];
    const requiredFields = ['title', 'description', 'publishDate', 'translationKey'];
    for (const field of requiredFields) {
      if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
        reportError(filePath, 1, `Frontmatter missing required field: "${field}"`);
      }
    }

    // Title checks
    const titleMatch = frontmatter.match(/^title:\s*"?(.*?)"?$/m);
    if (titleMatch) {
      const title = titleMatch[1];
      if (/Rehberi\s+Rehberi/i.test(title)) {
        reportError(filePath, 2, `Title stutter detected: "${title}" contains "Rehberi Rehberi"`);
      }
      if (/Guide\s+Guide/i.test(title)) {
        reportError(filePath, 2, `Title stutter detected: "${title}" contains "Guide Guide"`);
      }
      if (/Kılavuzu\s+Kılavuzu/i.test(title)) {
        reportError(filePath, 2, `Title stutter detected: "${title}" contains "Kılavuzu Kılavuzu"`);
      }
    }

    // Line by line content checks
    let inCodeBlock = false;
    let codeBlockCount = 0;
    let foundFaqHeader = false;

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];

      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        codeBlockCount++;
      }

      // Title stuttering in body headers
      if (/^#+\s+.*(Rehberi\s+Rehberi|Guide\s+Guide|Kılavuzu\s+Kılavuzu)/i.test(line)) {
        reportError(filePath, lineNum, `Header contains duplicate word stutter: "${line}"`);
      }

      // Hardcoded live secret keys or placeholders
      if (/(PRZ_LIVE_[A-Z0-9_]+|sk_live_[a-zA-Z0-9]+|BURAYA)/i.test(line) && !line.includes('your_secret_token_here')) {
        reportError(filePath, lineNum, `Suspicious hardcoded secret or placeholder: "${line.trim()}"`);
      }

      // Unresolved template interpolation
      if (/\$\{topic\.|\$\{m\.brand\}|\[object Object\]/.test(line)) {
        reportError(filePath, lineNum, `Unresolved template variable residue found: "${line.trim()}"`);
      }

      // CP857 byte inversion check ('ğ': 0xA7, 'Ğ': 0xA6)
      if (/'ğ':\s*0xA7/.test(line) || /'Ğ':\s*0xA6/.test(line)) {
        reportError(filePath, lineNum, `Inverted CP857 hex byte encoding detected (ğ should be 0xA6, Ğ should be 0xA7)`);
      }

      // Duplicate stitched tail check: H2 after FAQ that isn't device links
      if (/^##\s+.*(Sıkça Sorulan Sorular|Frequently Asked Questions)/i.test(line)) {
        foundFaqHeader = true;
      } else if (foundFaqHeader && /^##\s+/.test(line)) {
        if (!line.includes('Popüler Model') && !line.includes('Device-Specific') && !line.includes('Rehberler') && !line.includes('Guides') && !line.includes('Desteklenen Cihazlar') && !line.includes('Supported Devices')) {
          reportWarning(filePath, lineNum, `Potential stitched redundant section after FAQ: "${line.trim()}"`);
        }
      }
    }

    // Code block balance
    if (codeBlockCount % 2 !== 0) {
      reportError(filePath, lines.length, `Unbalanced markdown code blocks (${codeBlockCount} backtick fences found)`);
    }

    // Internal link integrity check: verify linked page actually exists
    const linkRegex = /\]\((\/(?:tr\/rehberler|tr\/rehber|guides)\/([a-z0-9-]+))\/?\)/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const [, fullPath, slug] = linkMatch;
      const linkLineNum = content.slice(0, linkMatch.index).split('\n').length;
      let exists = false;

      if (fullPath.startsWith('/tr/rehberler/')) {
        exists = fs.existsSync(path.join('src/content/guides/tr', `${slug}.md`));
      } else if (fullPath.startsWith('/tr/rehber/')) {
        exists = fs.existsSync(path.join('public/tr/rehber', `${slug}.html`));
      } else if (fullPath.startsWith('/guides/')) {
        exists = fs.existsSync(path.join('src/content/guides/en', `${slug}.md`)) ||
                 fs.existsSync(path.join('public/guides', `${slug}.html`));
      }

      if (!exists) {
        reportError(filePath, linkLineNum, `Broken internal link: "${fullPath}" — target page not found`);
      }
    }
  }
}

// 2. Audit pSEO doorway sample pages
const PSEO_DIR = 'public/tr/rehber';
if (fs.existsSync(PSEO_DIR)) {
  const pseoFiles = fs.readdirSync(PSEO_DIR).filter(f => f.endsWith('.html'));
  
  for (const filename of pseoFiles) {
    const filePath = path.join(PSEO_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('Rehberi Rehberi')) {
      reportError(filePath, null, `pSEO page contains "Rehberi Rehberi" in HTML content`);
    }

    if (content.includes('rehberi süreçlerini')) {
      reportError(filePath, null, `pSEO page contains grammatically broken "rehberi süreçlerini" phrase`);
    }

    if (!content.includes('<title>') || !content.includes('</title>')) {
      reportError(filePath, null, `Missing <title> tag in HTML`);
    }
  }
}

// Output summary
console.log('\n========================================');
console.log('   PRINTZEN QUALITY GATE AUDIT REPORT   ');
console.log('========================================');
console.log(`Audited Markdown Guides: ${GUIDES_DIRS.join(', ')}`);
console.log(`Audited pSEO Pages: ${PSEO_DIR} (${fs.existsSync(PSEO_DIR) ? fs.readdirSync(PSEO_DIR).length : 0} files)`);
console.log('----------------------------------------');

if (WARNINGS.length > 0) {
  console.log(`\nWarnings (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(w));
}

if (ERRORS.length > 0) {
  console.log(`\nFailed checks (${ERRORS.length} errors found):`);
  ERRORS.forEach(e => console.log(e));
  console.log('\n❌ QA GATE FAILED: Deployment / build aborted due to content defects.\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL QUALITY GATES PASSED: Content is clean, verified, and safe to deploy.\n');
  process.exit(0);
}
