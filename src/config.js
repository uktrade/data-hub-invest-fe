const port = process.env.PORT || 3000
const defaultLogLevel = (process.env.NODE_ENV === 'development') ? 'debug' : 'error'

module.exports = {
  env: process.env.NODE_ENV,
  port,
  apiRoot: process.env.API_ROOT || 'http://localhost:8000',
  postcodeLookup: {
    apiKey: process.env.POSTCODE_KEY,
    baseUrl: 'https://api.getAddress.io/v2/uk/{postcode}?api-key={api-key}'
  },
  logLevel: process.env.LOG_LEVEL || defaultLogLevel
}
