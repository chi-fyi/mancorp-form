const { google } = require('googleapis');

exports.handler = async (event, context) => {
    console.log('Function triggered');
    console.log('HTTP Method:', event.httpMethod);
    
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    // Environment variables check
    console.log('Environment Variables Check:', {
        hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasSheetId: !!process.env.GOOGLE_SHEET_ID,
        // Print first few characters to verify format without exposing full values
        clientEmailStart: process.env.GOOGLE_CLIENT_EMAIL?.substring(0, 5),
        privateKeyStart: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 20),
        sheetIdStart: process.env.GOOGLE_SHEET_ID?.substring(0, 5)
    });

    try {
        // Parse request body
        console.log('Parsing request body');
        const data = JSON.parse(event.body);
        console.log('Received data:', {
            timestamp: data.timestamp,
            area: data.area,
            cleaningType: data.cleaningType,
            // Don't log personal information in production
            hasContactName: !!data.contactName,
            hasContactPhone: !!data.contactPhone
        });

        // Initialize Google Sheets
        console.log('Initializing Google Sheets');
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

        console.log('Attempting to append to sheet');
        // Append data to Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'MancorpForm!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData]
            }
        });

        console.log('Successfully appended data');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Data successfully added to Google Sheets' })
        };
    } catch (error) {
        console.error('Error details:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to add data to Google Sheets', 
                details: error.message,
                stack: error.stack 
            })
        };
    }
};