const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, jsonString) => {
    currentNotes = jsonString ? JSON.parse(jsonString) : [];
    res.json(currentNotes);
  })
}); 

app.get('/api/notes/:noteId', (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, jsonString) => {
    currentNotes = jsonString ? JSON.parse(jsonString) : [];

    noteId = req.params['noteId']

    const note = currentNotes.filter(n => {
      return n.note_id === noteId;
    });

    if(note[0]) {
      res.json(note[0]);
    } else {
      res.json({error: 'Note ID not found'});
    }
  })
  });

app.post("/api/notes", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };

    fs.readFile("./db/db.json", "utf8", (err, jsonString) => {
      // currentReviews = jsonString ? JSON.parse(jsonString) : [];

      if (jsonString) {
        currentNotes = JSON.parse(jsonString);
      } else {
        currentNotes = [];
      }

      currentNotes = [...currentNotes, newNote];

      noteString = JSON.stringify(currentNotes);

      //Write the string to a file
      fs.writeFile(`./db/db.json`, noteString, (err) =>
        err
          ? console.error(err)
          : console.log(`${newNote.title} has been written to JSON file`)
      );
    });

    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);
    res.json(response);
  } else {
    res.json("Error in posting note");
  }
});

app.delete('/api/notes/:noteId', async (req, res) => {

  fs.readFile("./db/db.json", "utf8", (err, jsonString) => {
    currentNotes = jsonString ? JSON.parse(jsonString) : [];

    noteId = req.params['noteId']

    const note = currentNotes.filter(n => {
      return n.note_id === noteId;
    });

    if(note[0]) {
      
      const newNotes = currentNotes.filter(n => {
        return n.note_id !== noteId;
      });

      noteString = JSON.stringify(newNotes);

      //Write the string to a file
      fs.writeFile(`./db/db.json`, noteString, (err) =>
        err ? res.json('Error deleting note') : res.json('note deleted')
      );
    } else {
      res.json({error: 'Note ID not found'});
    }
  })

})


  app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);