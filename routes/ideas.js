const mongoose = require('mongoose');
require('../models/Idea');  //we didn't export it
const Idea = mongoose.model('Idea');
const requireAuth = require('../helpers/auth');

module.exports = (app) => {

    
//Process form
app.post('/ideas', requireAuth, (req, res) => {
    console.log(req.body);

    //server side validation, we also added client side with required
    let errors = [];
    if (!req.body.title) {
        errors.push({text: 'Please provide a title.'});
    }
    if (!req.body.details) {
        errors.push({text: 'Please provide details.'});
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        new Idea({ title: req.body.title, details: req.body.details, creator: req.user._id }).save().then(() => {
            req.flash('success_message', 'Video idea created');
            res.redirect('/ideas');
        });
    }
});

//Ideas route
app.get('/ideas', requireAuth, (req, res) => {
    Idea.find({ creator: req.user._id }).sort({ date: -1 }).then((ideas) => { 
        res.render('ideas/index', {ideas: ideas});  //ideas is an array, but handlebars takes object
     });
});

//Add Idea Form
app.get('/ideas/add', requireAuth, (req, res) => {
    res.render('ideas/add');
});

//Edit Idea Form
app.get('/ideas/edit/:id', requireAuth, (req, res) => {
    let id = req.params.id;
    Idea.findOne({ _id: id, creator: req.user._id}).then((idea) => {
        if (!idea) {
            res.redirect('/ideas');
            return;
        }
        res.render('ideas/edit', { idea: idea });
    });
});

//Edit Form Process
app.put('/ideas/:id', requireAuth, (req, res) => {

    let id = req.params.id;

    let errors = [];
    if (!req.body.title) {
        errors.push({text: 'Please provide a title.'});
    }
    if (!req.body.details) {
        errors.push({text: 'Please provide details.'});
    }

    if (errors.length > 0) {
        Idea.findOne({_id: id, creator: req.user._id }).then((idea) => {
            res.render('ideas/edit', {
                idea: idea,
                errors: errors,
                title: req.body.title,
                details: req.body.details
        });
    });
        
    return;
   }

    Idea.findOneAndUpdate({_id: id, creator: req.user._id }, { $set: { title: req.body.title, details: req.body.details }}, {new: true}).then((idea) => {
        if (!idea) {
            res.redirect('/ideas');
            return;
        }
        req.flash('success_message', 'Video idea updated');
        res.redirect('/ideas');
    });  
});

app.delete('/ideas/:id', requireAuth, (req, res) => {
    let id = req.params.id;
  
    Idea.findOneAndRemove({_id: id, creator: req.user._id }).then((idea) => {
        if (!idea) {
            res.redirect('/ideas');
            return;
        }
            req.flash('success_message', 'Video idea removed');
            res.redirect('/ideas');
    });
});
    
};