const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Remove import React from 'react';
    content = content.replace(/^import React from ['"]react['"];?\r?\n?/m, '');
    // Replace import React, { ... } from 'react'; with import { ... } from 'react';
    content = content.replace(/^import React,\s*{([^}]+)}\s*from\s*['"]react['"];?/m, 'import {$1} from "react";');
    fs.writeFileSync(file, content);
});
console.log('Cleaned up React imports in ' + files.length + ' files');
