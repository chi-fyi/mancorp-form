const { google } = require('googleapis');

exports.handler = async (event, context) => {
    console.log('Starting function execution...');
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed. Only POST requests are accepted.' })
        };
    }

    try {
        if (!event.body) {
            throw new Error('No request body provided');
        }

        const data = JSON.parse(event.body);
        
        const requiredFields = ['area', 'cleaningType', 'contactName', 'contactPhone'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing required fields', 
                    fields: missingFields 
                })
            };
        }

        const sanitizedData = {
            timestamp: data.timestamp || new Date().toISOString(),
            area: String(data.area).trim(),
            cleaningType: String(data.cleaningType).trim(),
            contactName: String(data.contactName).trim(),
            contactPhone: String(data.contactPhone).trim(),
            contactEmail: data.contactEmail ? String(data.contactEmail).trim() : ''
        };

        const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
            credentials: key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        const sheets = google.sheets('v4');
        
        const rowData = [
            sanitizedData.timestamp,
            sanitizedData.area,
            sanitizedData.cleaningType,
            sanitizedData.contactName,
            sanitizedData.contactPhone,
            sanitizedData.contactEmail
        ];

        console.log('Attempting to append data to sheet...');
        
        const appendResult = await sheets.spreadsheets.values.append({
            auth: client,
            spreadsheetId: '1TZHLzn02cE_WnkzZSnvEvZcpBWVP5Atx9l4x4jopPho',
            range: 'MancorpForm!A2:F',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [rowData]
            }
        });

        console.log('Data successfully appended');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Data successfully added to Google Sheets',
                timestamp: sanitizedData.timestamp
            })
        };

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        if (error.message.includes('parse')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request body format' })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
            })
        };
    }
};