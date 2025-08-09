const { randomBytes } = require('crypto');

// Returns an 8-character hex string (4 random bytes)
function generateRequestId() {
  return randomBytes(4).toString('hex');
}

function generateAttachmentID() {
  return randomBytes(4).toString('hex');
}

module.exports = {
  generateRequestId,
  generateAttachmentID,
};
