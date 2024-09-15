const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Load client secrets from a local file.
const credentials = JSON.parse(fs.readFileSync('../utils/client_secret_744815076272-t85rt6e0glssfs3lfvub6ckdndf5p303.apps.googleusercontent.com.json'));

const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

oauth2Client.setCredentials({ refresh_token: 'YOUR_REFRESH_TOKEN' });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const saveAudioToDrive = async (base64Audio, fileName) => {
  try {
    const buffer = Buffer.from(base64Audio, 'base64');

    const fileMetadata = {
      name: fileName,
      parents: ['YOUR_FOLDER_ID']
    };

    const media = {
      mimeType: 'audio/ogg',
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });

    console.log('File Id:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }
};

module.exports = { saveAudioToDrive };
