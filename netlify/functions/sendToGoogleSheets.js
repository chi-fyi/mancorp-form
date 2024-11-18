const { google } = require('googleapis');

exports.handler = async (event, context) => {
    console.log('Environment Variables Check:', {
        hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasSheetId: !!process.env.GOOGLE_SHEET_ID,
        // Print first few characters to verify format without exposing full values
        clientEmailStart: process.env.GOOGLE_CLIENT_EMAIL?.substring(0, 5),
        privateKeyStart: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 20),
        sheetIdStart: process.env.GOOGLE_SHEET_ID?.substring(0, 5)
    });
    // ... rest of your code

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse form data
        const data = JSON.parse(event.body);

        // Validate required fields
        if (!data.area || !data.cleaningType || !data.contactName || !data.contactPhone) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Verify environment variables
        if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
            console.error('Missing required environment variables');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Google Sheets setup
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Format data for sheets
        const rowData = [
            data.timestamp || new Date().toISOString(),
            data.area,
            data.cleaningType,
            data.contactName,
            data.contactPhone,
            data.contactEmail || ''
        ];

        // Append data to Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'MancorpForm!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData]
            }
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Data successfully added to Google Sheets' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to add data to Google Sheets', details: error.message })
        };
    }
};