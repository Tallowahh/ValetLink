const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080;

function readData() {
    const rawData = fs.readFileSync('namesData.json');
    return JSON.parse(rawData);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
  

app.get('/api/names', (req, res) => {
    const namesData = readData();
    res.json(namesData);
});

app.use(express.static('public'));


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
