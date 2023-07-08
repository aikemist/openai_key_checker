require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Configuration, OpenAIApi } = require("openai");

const app = express();

const preprocess_messages = [{
  role: "system",
  content: "You will be provided a paragraph containing one or more serial keys. The key is a string assembled by alphabet and numbers and '-' which's length is exactly 51 and starts with 'sk-'. You need to find all keys in the paragraph, response and only response a json object containing all keys. The json should only contain a array named 'keys' and all keys should be stored in that 'keys' array.",
}];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/check', async (req, res) => {
  const { key, org } = req.body;

  try {
      const configuration = new Configuration({
        apiKey: key,
        organization: org,
      });
      
      const openai = new OpenAIApi(configuration);
      const models = await openai.listModels();
      console.log(models.data);
      res.json(models.data);
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
  }
});

app.post('/api/preprocess', async (req, res) => {
  const { keyText } = req.body;

  preprocess_messages.length = 1;  
  preprocess_messages.push({
    role: "user",
    content: keyText,
  })

  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: preprocess_messages,
    });
    console.log(completion);
    res.json(completion.data.choices[0].message.content);
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});