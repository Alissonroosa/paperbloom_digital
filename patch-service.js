const fs = require('fs');

const filePath = 'src/services/CardCollectionService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the section
const oldCode = `    if (data.introMessage !== undefined) {
      updates.push(\`intro_message = \${\${paramIndex++}}\`);
      values.push(data.introMessage);
    }
    if (data.status !== undefined) {
      updates.push(\`status = \${\${paramIndex++}}\`);
      values.push(data.status);
    }`;

const newCode = `    if (data.introMessage !== undefined) {
      updates.push(\`intro_message = \${\${paramIndex++}}\`);
      values.push(data.introMessage);
    }
    if (data.youtubeVideoId !== undefined) {
      updates.push(\`youtube_video_id = \${\${paramIndex++}}\`);
      values.push(data.youtubeVideoId);
    }
    if (data.contactName !== undefined) {
      updates.push(\`contact_name = \${\${paramIndex++}}\`);
      values.push(data.contactName);
    }
    if (data.status !== undefined) {
      updates.push(\`status = \${\${paramIndex++}}\`);
      values.push(data.status);
    }`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ CardCollectionService.ts patched successfully!');
