const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Note');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// ROUTE 1 : Get All Notes Using : GET "/api/notes/fetchallnotes" Login Required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server error");
    }
});

// ROUTE 2 : Add a new Note Using : POST "/api/notes/addnote" Login Required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 10 }),
    body('description', 'Enter should have a least 15 chararacters').isLength({ min: 15 }),
], async (req, res) => {

    try {

        const { title, description, tag } = req.body;
        // If there are ant error occurs then return BAd request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.message });
        }

        const note = new Note({
            title, description, tag, user: req.user.id,
        })
        const savedNote = await note.save();
        res.json(savedNote);


    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server error");
    }
});

// ROUTE 3 : Update an exsting Note useing : PUT "/api/notes/updatenote". Login Required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    // Creating a new Note object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { description.title = description };
    if (tag) { tag.title = tag };

    // Find the note to be updated to update it
    let note = await Note.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Fount") }

    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
    res.json({ note });
})

// ROUTE 4 : Delete an existing Note using : delete "/api/notes/deletenote". Login Required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    // Find the note to be Deleted to Delete it
    let note = await Note.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Fount") }

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ "Success": "Note has been deleted", note: note });
})

module.exports = router;
