export const environment = {
  production: false,
  googleCalendar: {
    clientId: process.env['GOOGLE_CLIENT_ID'] || '',
    apiKey: process.env['GOOGLE_API_KEY'] || ''
  }
};