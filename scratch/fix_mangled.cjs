const fs = require('fs');
const path = 'src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
const search = '          <button className="back-btn" onClick={onClose}>';
const suffix = ' Back to Home</button>';
// We'll replace the line that contains these two parts
const lines = content.split('\n');
const index = lines.findIndex(l => l.includes(search) && l.includes(suffix));
if (index !== -1) {
  lines[index] = '          <button className="back-btn" onClick={onClose}><ArrowLeft /> Back to Home</button>';
  fs.writeFileSync(path, lines.join('\n'));
  console.log('Successfully updated line ' + (index + 1));
} else {
  console.log('Line not found');
}
