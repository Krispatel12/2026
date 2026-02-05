import fs from 'fs';

const path = 'src/features/organization/pages/Registration.tsx';
let content = fs.readFileSync(path, 'utf8').split('\n');

// 1. Fix Auth Sector Closure
// From view_file 1501:
// 1481:             </div> (index 1480)
// 1482:             );     (index 1481)
content.splice(1481, 1, '            </div>', '        </div>', '    );');

// 2. Fix Export indentation (Index 1582ish - let's check current index)
// Line 1582 in Step 1501 was index 1581.
// After splice above, it shifts by +2.
// So original index 1581 becomes index 1583.
if (content[1583] && content[1583].includes('export default')) {
    content[1583] = 'export default OrganizationRegistration;';
} else {
    // Search for it if the index is slightly off
    const idx = content.findIndex(l => l.includes('export default OrganizationRegistration'));
    if (idx !== -1) {
        content[idx] = 'export default OrganizationRegistration;';
    }
}

fs.writeFileSync(path, content.join('\n'));
console.log('ESM Structural repair successful.');
