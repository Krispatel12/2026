const fs = require('fs');
const path = 'src/features/organization/pages/Registration.tsx';
let content = fs.readFileSync(path, 'utf8').split('\n');

// 1. Fix Auth Sector (Root Div 1338 is unclosed)
// We need to find where renderStepAuth ends.
// In the current file, after shifting, line 1482 is the closer ');'.
// We need to insert the missing div before it.
content.splice(1481, 0, '            </div>');

// 2. Fix Export indentation
content[1581] = 'export default OrganizationRegistration;';

fs.writeFileSync(path, content.join('\n'));
console.log('Structural repair complete.');
