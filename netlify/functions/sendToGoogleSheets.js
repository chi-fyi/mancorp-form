const { google } = require('googleapis');

exports.handler = async (event, context) => {
    try {
        // Parse form data from the POST request
        const data = JSON.parse(event.body);

        // Google Sheets setup
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = process.env.GOOGLE_SHEET_ID; // Add this in your environment variables
        const range = 'Sheet1!A1:C1'; // Update this range as per your Google Sheets setup

        // Append data to Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[data.name, data.email, data.message]], // Adjust keys to match your form data
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data added to Google Sheets' }),
        };
    } catch (error) {
        console.error('Error adding data to Google Sheets:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to add data to Google Sheets' }),
        };
    }
};
