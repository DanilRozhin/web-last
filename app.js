const express = require('express');
const multer = require('multer');
const zlib = require('zlib');
const app = express();

const USER_LOGIN = 'danilrozhin';

const upload = multer();

app.get('/login', (req, res) => {
  res.send(USER_LOGIN);
});

app.post('/zipper', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const fileBuffer = req.file.buffer;

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

app.listen(3000);
