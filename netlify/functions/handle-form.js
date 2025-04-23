exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        const formData = JSON.parse(event.body);
        
        // Here you can add custom logic for form processing
        // For example, sending emails, storing in a database, etc.
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Form submitted successfully',
                data: formData
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing form submission',
                error: error.message
            })
        };
    }
}; 