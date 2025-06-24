export const fhirServerBaseUrl = process.env.FHIR_BASE_URL || 'http://joseantcordeiro.hopto.org:8080/fhir'; // Default to a public test server
export const smartClientId = process.env.SMART_CLIENT_ID
export const smartScope = process.env.SMART_SCOPE
export const smartIss = process.env.SMART_ISS

if (!process.env.FHIR_SERVER_BASE_URL) {
  console.warn(`FHIR_SERVER_BASE_URL environment variable not set. Using default: ${fhirServerBaseUrl}`);
}

if (!process.env.SMART_CLIENT_ID) {
  console.error(`SMART_CLIENT_ID environment variable not set. SMART Client ID is required.`);
}

if (!process.env.SMART_SCOPE) {
  console.error(`SMART_SCOPE environment variable not set. SMART Scope is required.`);
}

if (!process.env.SMART_ISS) {
  console.error(`SMART_SCOPE environment variable not set. SMART ISS (FHIR Server URL) is required.`);
}

export const config = {
    private_key: "-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAzgpbAgXkZJ46U6HDdo0sPwnJmlIiy3U3OEdryH9qqR8O34ci\n1iL1+8DICH+6aj9KbjdjyzlXwg0DdY+VlaU9L22cSvZxuRuAIJghOGDmA7kNQuu4\na/Q22bLZ3GpsmIbPePjDLEptjfXgyV1UBLmKbZuH+tiZ2QRrs8pzUQfE8/vQGYdT\nZkPKrmygLDV4jwedsfsigaUGl5gUYtGP0ovkV4AXb2CyQp1yasY5gHJ+QbgUDcoY\ne60THXWqASixPkrSILT1w1m2BZRb2z/8PD+AI7szzF5xSvrjGduDMa/m1P3UELLw\n04mBLYr6KmOOrLE2ZPAX9YAx+vIWFVvMPC0tlwIDAQABAoIBAQCk4kieP9TcaHtI\nviVL1AHamJyLMLvDkhQUp6MrmjvjB4XBf8VzFBtB0q7BjmXB7NBFj3H/Ce6ezgc8\npyEP1mI2eEMhAkNT3RwV+WhsU67+v7JLIZQ+X/sdEDGkYE5zaT7TElAuO4mcl23B\n9zvrZAfRWyvgpEHKF+2Qvay25b7JeAUFz8d9eDr9aP8o4YvEVsfM1IGwzwi5NU9v\nr8LU56Z9rBWckSO8eyEOX9J9/hmfHdOuaAroWdX2xWphL08/Y2dgsxmJ8cFdu3h0\nCiQ9DYbaj0Grv4emIygRtxQf3I2EXl0fuxcoB1AdYjiCRmkx8ErnsVVrvhqbLh1a\nV7WRvBZBAoGBAOujnza2QBGulSSDYkD4YKEtpxKVGRtNswaikIB7nbeQmCBW4BNv\nBMs/SLxPPQZJpPMt2WEU/i6pstNHmqXK64GPAdsJc2ks0JRXc1wdSPVXghgbcT6/\nGVpnVHwaZRfaAnixzjvNteZbL+lt7Llvyp0THq5nL1KOB2BpGon8NVPnAoGBAN/Y\nAV7wY6peBRcd7AAycre7l4mbLtiwp2Gf9sZuOJ3HwyyUskBHgtYUq864F+ZvRs6J\nkFDazbX4Z/lq5AowGyZWHgLzF2EWNJLPVomw2pVDPHmeyDhnzg6TMbl0ox9XFMVe\n33DbJxohSwQ35VEfDz7Z7y6p6qYTINl1rYPEqSLRAoGBAONelXFQeA/XundqAvOX\n9n1vtKd8kKZE2fsL/4zKOsv2TKPf0AVQeXq4jLGPb93ST8SKOBeyDvXtruypSfKy\nE36HBA5bVy5kHLsWiuyWIWEC2Df0utgFwyv1SpMZUPSr2vik8M/J1bv5vwhpliL0\nWLgpy9ATJpltDHcd04rTfo1/AoGADeXWZ/Oa7If73uyPq492SewOw49sAC4vpkMN\nSlKrlzhA6PKugokuGWadKC+L5FXCWq511F9RaFvs8LJvSCameOHd6Sb4q6F6UCcp\nY1EksSHEjnSKT946D/OZob8ZJaf9dSenzdT9f4TTqIZj6X55LtjPHeGU3QzQ/E9v\nH4BFVBECgYEAqeq6yb4DjZ9ZbVU1Pq5z/EX6bnuAHv75gTpe+ILX9FMZNvTWEtnX\nsue2dSS/p/Z1+FseH+69ir9ruCaB+qJjSnhBqx5l0zuUPY6t94ZqFklQ7N8NVhh7\nQW3WQ9bE2Sv0sodmr7t7p5NrdddefvuoaNi9MtIEXBJh98foj6b6Q8k=\n-----END RSA PRIVATE KEY-----\n",
    client_id: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJfa2V5IjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBOXkxYkUyYXc5WnEvdGpFaERnSzJcblp1dVhLeERFRnBQTHNJVHo0dS9CUi92SnFaZG9KeW5RdXA2QU1jWDI0REZxNW9idHFvSm5XYXRiSzdscWpRUGVcbjRHZ25VSUhjWWFld3AvS2NoeHVCRGtZVDgwL3Z4ajl3d0dKWWR1eWpOWFpLam81aW1UQ0FUeUpqWHg5NlU2U1dcbnNaRm9JQkhoOUVacytSRThhdUNTUEc0NGtrRE5DTnBUQXRjQldmQkk5c0RDQmNlU3YvWlhJQVVkWXpjRlVWcXdcbllvL09MdDF1eHQ5ZEd5WDRKdWYxWDVRM3pFUUQyY2ltSGJDbVFGSi9ORkNFTTRyTDBVNmVzSmhNYlNwZ3RGdTdcbjE5MERybExlUDJzUzdmcE1QQXhaV0FhTHU5TDVRQXdXMmg2TnFDczVoekcrUGJUYlpxaXoyUzdmVEVyLy8zT2Ncbkd3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0iLCJpc3MiOiJodHRwOi8vam9zZWFudGNvcmRlaXJvLmhvcHRvLm9yZzo4MDgwL2ZoaXIiLCJhY2Nlc3NUb2tlbnNFeHBpcmVJbiI6NjAsImlhdCI6MTc1MDczMzQxNn0.pa2KjI7SOA9FWSEtowPagqGbwnXNOXA3uJm9cEAB5YI",
    fhir_url: "http://joseantcordeiro.hopto.org:4000/v/r4/fhir",
    token_url: "http://joseantcordeiro.hopto.org:4000/v/r4/auth/token",
    service_url: "http://joseantcordeiro.hopto.org:8080/fhir"
}