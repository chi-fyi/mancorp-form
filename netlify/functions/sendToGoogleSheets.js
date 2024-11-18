const { google } = require('googleapis');

exports.handler = async (event, context) => {
    // 1. Consistent headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 2. Better method validation
    console.log('Function triggered with method:', event.httpMethod);
    
    // 3. Improved OPTIONS handling
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: '' // Explicitly set empty body
        };
    }

    // 4. Strict method checking
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed. Only POST requests are accepted.' })
        };
    }

    // 5. Environment variable validation
    const requiredEnvVars = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server configuration error' })
        };
    }

    try {
        // 6. Input validation
        if (!event.body) {
            throw new Error('No request body provided');
        }

        const data = JSON.parse(event.body);
        
        // 7. Required field validation
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

        // 8. Data sanitization
        const sanitizedData = {
            timestamp: data.timestamp || new Date().toISOString(),
            area: String(data.area).trim(),
            cleaningType: String(data.cleaningType).trim(),
            contactName: String(data.contactName).trim(),
            contactPhone: String(data.contactPhone).trim(),
            contactEmail: data.contactEmail ? String(data.contactEmail).trim() : ''
        };

        // 9. Initialize Google Sheets with error handling
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // 10. Prepare row data
        const rowData = [
            sanitizedData.timestamp,
            sanitizedData.area,
            sanitizedData.cleaningType,
            sanitizedData.contactName,
            sanitizedData.contactPhone,
            sanitizedData.contactEmail
        ];

        // 11. Append to sheet with timeout
        const appendPromise = sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'MancorpForm!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData]
            }
        });

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
        );

        await Promise.race([appendPromise, timeoutPromise]);

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

        // 12. Better error classification
        if (error.message === 'Request timeout') {
            return {
                statusCode: 504,
                headers,
                body: JSON.stringify({ error: 'Request timed out' })
            };
        }

        if (error.message.includes('parse')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request body format' })
            };
        }

        // Default error response
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