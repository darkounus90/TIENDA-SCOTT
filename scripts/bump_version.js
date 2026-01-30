const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    path.join(__dirname, '../index.html'),
    path.join(__dirname, '../admin.html')
];

function bumpVersion(content) {
    // Regex for style.css?v=X.Y.Z
    const styleRegex = /style\.css\?v=(\d+)\.(\d+)\.(\d+)/g;
    // Regex for "Versión X.Y.Z"
    const textRegex = /Versión\s+(\d+)\.(\d+)\.(\d+)/g;

    let major, minor, patch;
    let newVersion = '';

    // First pass to find current version
    let match = styleRegex.exec(content);
    if (!match) {
        // Try text regex if style not found (unlikely for index/admin)
        match = textRegex.exec(content);
    }

    if (match) {
        major = parseInt(match[1]);
        minor = parseInt(match[2]);
        patch = parseInt(match[3]);
        patch++; // Increment patch
        newVersion = `${major}.${minor}.${patch}`;
        console.log(`Bumping version to: ${newVersion}`);
    } else {
        console.error("Could not find version pattern.");
        return null;
    }

    // Replace all occurrences
    let newContent = content.replace(styleRegex, `style.css?v=${newVersion}`);
    newContent = newContent.replace(textRegex, `Versión ${newVersion}`);

    return newContent;
}

filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`Processing ${path.basename(file)}...`);
        const content = fs.readFileSync(file, 'utf8');
        const newContent = bumpVersion(content);
        if (newContent) {
            fs.writeFileSync(file, newContent);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
});
