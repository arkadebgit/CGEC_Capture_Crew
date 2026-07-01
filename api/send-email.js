import https from 'https';

function sendResendRequest(path, apiKey, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.resend.com',
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => {
        resBody += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          body: resBody
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(body);
    req.end();
  });
}

export default async function handler(req, res) {
  // Add CORS headers for local development testing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Robustly parse the request body
  let bodyObj = req.body;
  if (typeof bodyObj === 'string') {
    try {
      bodyObj = JSON.parse(bodyObj);
    } catch (e) {
      console.error("JSON parsing error for body:", e);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  if (!bodyObj) {
    bodyObj = {};
  }

  let apiKey = process.env.RESEND_API_KEY || 'xxx';
  if (apiKey) {
    apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  }

  let from = 'Capture Crew <newsletter@capturecrew.site>';

  if (bodyObj.from && /@capturecrew\.site>?$/i.test(bodyObj.from.trim())) {
    from = bodyObj.from.trim();
  }

  // Check if this is a batch request
  const { batch } = bodyObj;

  if (batch && Array.isArray(batch)) {
    try {
      const emailPayloads = batch.map(item => {
        const payload = {
          from,
          to: item.to,
          subject: item.subject,
          html: item.html
        };
        if (item.text) payload.text = item.text;
        if (item.reply_to) payload.reply_to = item.reply_to;
        if (item.headers) payload.headers = item.headers;
        return payload;
      });

      const result = await sendResendRequest('/emails/batch', apiKey, emailPayloads);

      if (!result.ok) {
        console.error("Resend Batch API error response:", result.status, result.body);
        return res.status(result.status).json({ error: result.body || 'Resend Batch API error' });
      }

      return res.status(200).json(JSON.parse(result.body));
    } catch (error) {
      console.error("Internal server error during batch send:", error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  const { to, bcc, reply_to, subject, html, text, headers } = bodyObj;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html (or batch array)' });
  }

  try {
    const emailPayload = {
      from,
      to,
      subject,
      html
    };

    if (text) emailPayload.text = text;
    if (reply_to) emailPayload.reply_to = reply_to;
    if (headers) emailPayload.headers = headers;

    if (bcc && Array.isArray(bcc) && bcc.length > 0) {
      emailPayload.bcc = bcc;
    }

    const result = await sendResendRequest('/emails', apiKey, emailPayload);

    if (!result.ok) {
      console.error("Resend API error response:", result.status, result.body);
      return res.status(result.status).json({ error: result.body || 'Resend API error' });
    }

    return res.status(200).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Internal server error during single send:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
