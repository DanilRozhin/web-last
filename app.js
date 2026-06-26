const express = require('express');
const busboy = require('busboy');
const zlib = require('zlib');
const app = express();

const USER_LOGIN = 'danilrozhin';

app.get('/login', (req, res) => {
  res.send(USER_LOGIN);
});

app.post('/zipper', (req, res) => {
  const bb = busboy({ headers: req.headers });
  let fileBuffer = Buffer.alloc(0);
  let fileReceived = false;

  bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
    fileReceived = true;
    file.on('data', (chunk) => {
      fileBuffer = Buffer.concat([fileBuffer, chunk]);
    });
  });

  bb.on('field', (fieldname, value) => {
    if (!fileReceived) {
      fileBuffer = Buffer.from(value);
      fileReceived = true;
    }
  });

  bb.on('finish', () => {
    if (!fileReceived || fileBuffer.length === 0) {
      return res.status(400).send('No file uploaded');
    }

    zlib.gzip(fileBuffer, (err, compressed) => {
      if (err) {
        return res.status(500).send('Compression error');
      }

      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="result.gz"',
      });
      res.send(compressed);
    });
  });

  bb.on('error', () => {
    res.status(500).send('Internal server error');
  });

  req.pipe(bb);
});

app.listen(5000, '0.0.0.0');
