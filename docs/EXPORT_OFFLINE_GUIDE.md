# Export & Offline Access Guide - DKL Steps App Documentation

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 💾 Complete Export & Offline Guide

---

## 💾 Documentation Export & Offline Access

Deze gids legt uit hoe je de DKL Steps App documentatie kunt exporteren naar verschillende formaten en offline kunt gebruiken.

---

## 📋 Export Formats

### PDF Export

#### Method 1: Browser Print to PDF
1. **Open Documentation**: Ga naar de GitHub repository docs folder
2. **Navigate to File**: Open het gewenste `.md` bestand
3. **Browser Print**:
   - Chrome: Ctrl+P (Windows) / Cmd+P (Mac)
   - Firefox: Ctrl+P (Windows) / Cmd+P (Mac)
4. **Print Settings**:
   - **Destination**: Save as PDF
   - **Layout**: Portrait
   - **Paper Size**: A4
   - **Margins**: Default
   - **Scale**: 100%
5. **Save**: Kies locatie en bestandsnaam

#### Method 2: Pandoc Conversion
```bash
# Install pandoc
# Windows: choco install pandoc
# macOS: brew install pandoc
# Linux: sudo apt-get install pandoc

# Convert single file
pandoc docs/README.md -o docs/README.pdf

# Convert with custom styling
pandoc docs/README.md \
  -o docs/README.pdf \
  --pdf-engine=pdflatex \
  --variable geometry:margin=1in \
  --variable fontsize=11pt

# Convert entire documentation
find docs/ -name "*.md" -exec pandoc {} -o {}.pdf \;
```

#### Method 3: Markdown PDF VSCode Extension
1. **Install Extension**: "Markdown PDF" by yzane
2. **Open Markdown File**: In VSCode
3. **Command Palette**: Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)
4. **Select**: "Markdown PDF: Export (pdf)"
5. **Configure**: Settings voor styling en layout

### HTML Export

#### GitHub Pages Style
```bash
# Convert to HTML with GitHub styling
pandoc docs/README.md \
  -o docs/README.html \
  --self-contained \
  --css=github-markdown.css

# Batch convert all docs
for file in docs/*.md; do
  pandoc "$file" -o "${file%.md}.html" --self-contained
done
```

#### Custom HTML with Navigation
```html
<!-- index.html template -->
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>DKL Steps App Documentation</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav id="sidebar">
        <!-- Navigation menu -->
    </nav>
    <main id="content">
        <!-- Converted markdown content -->
    </main>
</body>
</html>
```

### Other Formats

#### Word Document (.docx)
```bash
# Convert to Word
pandoc docs/README.md -o docs/README.docx

# With reference document
pandoc docs/README.md \
  -o docs/README.docx \
  --reference-doc=template.docx
```

#### eBook Formats
```bash
# EPUB for e-readers
pandoc docs/README.md -o docs/README.epub

# MOBI for Kindle
# Requires calibre: https://calibre-ebook.com/
ebook-convert docs/README.epub docs/README.mobi
```

#### Plain Text
```bash
# Remove markdown formatting
pandoc docs/README.md -t plain -o docs/README.txt

# Preserve some structure
pandoc docs/README.md -t markdown -o docs/README_clean.md
```

---

## 💻 Offline Access Methods

### Method 1: Local Web Server

#### Python HTTP Server
```bash
# Navigate to docs directory
cd docs/

# Start local server (Python 3)
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Access at: http://localhost:8000
```

#### Node.js Server
```bash
# Install http-server globally
npm install -g http-server

# Start server in docs directory
cd docs/
http-server -p 8080

# Access at: http://localhost:8080
```

#### PHP Built-in Server
```bash
# If PHP is installed
cd docs/
php -S localhost:8080

# Access at: http://localhost:8080
```

### Method 2: Git Clone for Offline Access
```bash
# Clone entire repository
git clone https://github.com/your-org/dkl-steps-app.git
cd dkl-steps-app/docs/

# Open files directly in browser or editor
# All cross-references work offline
```

### Method 3: Documentation Viewer Applications

#### Typora (Markdown Editor)
- **Download**: https://typora.io/
- **Open Folder**: Select docs/ directory
- **Features**: Live preview, export options
- **Offline**: Full functionality without internet

#### Mark Text
- **Download**: https://marktext.app/
- **Open Folder**: docs/ directory
- **Features**: Real-time preview, file tree
- **Offline**: Complete offline editing

#### Obsidian
- **Download**: https://obsidian.md/
- **Create Vault**: Point to docs/ folder
- **Features**: Graph view, backlinks, search
- **Offline**: Full knowledge management

### Method 4: Static Site Generators

#### MkDocs
```bash
# Install MkDocs
pip install mkdocs

# Create MkDocs config
cd docs/
echo "site_name: DKL Steps App Documentation
nav:
  - Home: README.md
  - Getting Started: 01-getting-started/README.md
theme: readthedocs" > mkdocs.yml

# Build static site
mkdocs build

# Serve locally
mkdocs serve

# Access at: http://localhost:8000
```

#### Docsify
```bash
# Install Docsify CLI
npm install -g docsify-cli

# Initialize in docs directory
cd docs/
docsify init

# Configure index.html
echo '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DKL Steps App Docs</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Documentation for DKL Steps App">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: "DKL Steps App",
      repo: "https://github.com/your-org/dkl-steps-app",
      loadSidebar: true,
      subMaxLevel: 3
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js"></script>
</body>
</html>' > index.html

# Serve locally
docsify serve

# Access at: http://localhost:3000
```

---

## 📱 Mobile Offline Access

### Mobile Browsers
- **Save Pages**: Most browsers allow saving complete pages
- **Web Archives**: Save as .mhtml or .webarchive
- **Reading Mode**: Use browser reading mode for distraction-free viewing

### Mobile Apps

#### iOS
- **Documents by Readdle**: PDF and document viewer
- **GoodReader**: Advanced PDF reader with annotation
- **Bear**: Markdown editor with offline sync

#### Android
- **Markor**: Markdown editor for Android
- **Markdown Viewer**: Simple markdown viewer
- **Turndown**: Web page to markdown converter

### Progressive Web App (PWA)
```javascript
// Service worker for offline caching
// public/sw.js
const CACHE_NAME = 'dkl-docs-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/app.js',
  // Add documentation files
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

---

## 🔄 Synchronization Strategies

### Git-Based Sync
```bash
# Regular updates
cd dkl-steps-app/
git pull origin main

# Check for documentation updates
git log --oneline --since="1 week ago" -- docs/

# Update local exports
# Re-run export scripts as needed
```

### Automated Sync Scripts
```bash
#!/bin/bash
# sync-docs.sh

# Update repository
git pull origin main

# Re-export PDFs if needed
find docs/ -name "*.md" -newer docs/ -name "*.pdf" -exec pandoc {} -o {}.pdf \;

# Update HTML versions
for file in docs/*.md; do
  if [ "$file" -nt "${file%.md}.html" ]; then
    pandoc "$file" -o "${file%.md}.html" --self-contained
  fi
done

echo "Documentation sync complete"
```

### Version Tracking
- **Git Tags**: Mark documentation versions
- **Release Notes**: Document changes in each update
- **Change Logs**: Track what changed between versions

---

## 🗂️ Organization & Storage

### Directory Structure for Exports
```
docs/
├── exports/
│   ├── pdf/
│   │   ├── README.pdf
│   │   ├── COMPLETE_DOCUMENTATIE.pdf
│   │   └── ...
│   ├── html/
│   │   ├── index.html
│   │   ├── README.html
│   │   └── ...
│   └── epub/
│       ├── documentation.epub
│       └── ...
├── offline/
│   ├── mkdocs-site/
│   └── docsify-site/
└── scripts/
    ├── export-pdf.sh
    ├── export-html.sh
    └── sync-offline.sh
```

### Backup Strategies
- **Cloud Storage**: Google Drive, Dropbox, OneDrive
- **Local Archives**: ZIP files with timestamps
- **Version Control**: Git history as backup
- **Redundant Copies**: Multiple locations

### File Naming Conventions
```
# PDF exports
README-v1.0.2-20251103.pdf
COMPLETE_DOCUMENTATIE-v1.0.2-20251103.pdf

# HTML exports
docs-html-20251103.zip
docs-mkdocs-20251103.zip

# Archive naming
dkl-docs-backup-20251103.tar.gz
```

---

## 🛠️ Automation Scripts

### Complete Export Script
```bash
#!/bin/bash
# export-all.sh

# Configuration
OUTPUT_DIR="exports/$(date +%Y%m%d)"
SOURCE_DIR="docs"
VERSION="1.0.2"

# Create output directory
mkdir -p "$OUTPUT_DIR/pdf" "$OUTPUT_DIR/html" "$OUTPUT_DIR/text"

# Export PDFs
echo "Exporting PDFs..."
find "$SOURCE_DIR" -name "*.md" | while read file; do
  filename=$(basename "$file" .md)
  pandoc "$file" -o "$OUTPUT_DIR/pdf/$filename-v$VERSION.pdf" \
    --pdf-engine=pdflatex \
    --variable geometry:margin=1in
done

# Export HTML
echo "Exporting HTML..."
find "$SOURCE_DIR" -name "*.md" | while read file; do
  filename=$(basename "$file" .md)
  pandoc "$file" -o "$OUTPUT_DIR/html/$filename-v$VERSION.html" \
    --self-contained \
    --css=github-markdown.css
done

# Export plain text
echo "Exporting plain text..."
find "$SOURCE_DIR" -name "*.md" | while read file; do
  filename=$(basename "$file" .md)
  pandoc "$file" -t plain -o "$OUTPUT_DIR/text/$filename-v$VERSION.txt"
done

# Create archives
echo "Creating archives..."
cd "$OUTPUT_DIR"
tar -czf "../dkl-docs-$VERSION-$(date +%Y%m%d).tar.gz" .
cd ..

echo "Export complete: $OUTPUT_DIR"
```

### Quick Export Menu
```bash
#!/bin/bash
# export-menu.sh

echo "DKL Steps App Documentation Export"
echo "=================================="
echo "1. Export all to PDF"
echo "2. Export all to HTML"
echo "3. Export single file"
echo "4. Start local server"
echo "5. Update offline docs"
echo "6. Clean old exports"
echo ""
read -p "Choose option (1-6): " choice

case $choice in
  1) ./scripts/export-pdf.sh ;;
  2) ./scripts/export-html.sh ;;
  3) ./scripts/export-single.sh ;;
  4) ./scripts/start-server.sh ;;
  5) ./scripts/sync-offline.sh ;;
  6) ./scripts/clean-exports.sh ;;
  *) echo "Invalid option" ;;
esac
```

---

## 📊 Usage Analytics

### Export Tracking
- **Popular Formats**: Track which export formats are most used
- **Access Patterns**: Monitor when offline access is needed
- **Device Types**: Understand mobile vs desktop usage
- **Geographic Data**: See where offline access is important

### Feedback Collection
```markdown
<!-- Add to exported documents -->
## Feedback

This documentation was exported on $(date).

**Was this export format helpful?**
- [ ] Very helpful
- [ ] Somewhat helpful
- [ ] Not helpful

**What could be improved?**
[Your feedback here]

**Contact**: docs@dkloroop.nl
```

---

## 🔒 Security Considerations

### Local Storage Security
- **File Permissions**: Restrict access to exported files
- **Encryption**: Encrypt sensitive documentation if needed
- **Cleanup**: Remove temporary files after export
- **Access Control**: Limit who can export documentation

### Offline Access Security
- **HTTPS**: Use secure connections when possible
- **Authentication**: Require login for sensitive docs
- **Watermarking**: Add export timestamps and user info
- **Audit Trail**: Track who exports what and when

---

## 🚀 Advanced Features

### Custom Export Templates
```latex
% custom-template.tex
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\geometry{margin=1in}

% Custom styling
\usepackage{xcolor}
\definecolor{dkblue}{RGB}{0,107,255}

% Header
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead[L]{\textcolor{dkblue}{DKL Steps App Documentation}}

\begin{document}
% Content will be inserted here
\end{document}
```

### Integrated Documentation System
- **Single Source**: Maintain docs in Markdown, export to multiple formats
- **Version Control**: Git-based versioning for all formats
- **Automated Publishing**: CI/CD pipeline for documentation deployment
- **Multi-channel Distribution**: Web, PDF, mobile app integration

---

## 📞 Support & Troubleshooting

### Common Issues

#### PDF Export Problems
**Issue**: Pandoc not found
**Solution**: Install pandoc from https://pandoc.org/

**Issue**: LaTeX errors
**Solution**: Install LaTeX distribution (TeX Live, MiKTeX)

**Issue**: Special characters not rendering
**Solution**: Use `--pdf-engine=xelatex` for Unicode support

#### HTML Export Issues
**Issue**: Styles not applied
**Solution**: Use `--self-contained` flag for embedded CSS

**Issue**: Links not working
**Solution**: Ensure relative paths or use absolute URLs

#### Offline Access Problems
**Issue**: Local server not starting
**Solution**: Check port availability, try different port number

**Issue**: Files not updating
**Solution**: Clear browser cache, restart local server

### Getting Help
- **Documentation Issues**: Create GitHub issue with "documentation" label
- **Export Problems**: Check [`MAINTENANCE_GUIDE.md`](MAINTENANCE_GUIDE.md)
- **Technical Support**: Contact development team
- **Community Help**: Post in GitHub Discussions

---

## ✅ Best Practices

### Export Quality
- [ ] Test all links in exported documents
- [ ] Verify formatting in target format
- [ ] Check images and media embedding
- [ ] Validate accessibility features
- [ ] Test on target devices/platforms

### Maintenance
- [ ] Keep export scripts updated
- [ ] Regularly test export processes
- [ ] Monitor export quality
- [ ] Update templates as needed
- [ ] Archive old versions

### Distribution
- [ ] Use consistent naming conventions
- [ ] Include version information
- [ ] Add export timestamps
- [ ] Provide multiple format options
- [ ] Document export procedures

---

**Export & Offline Access Guide** © 2025 DKL Organization. All rights reserved.