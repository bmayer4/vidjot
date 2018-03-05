const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');  //for public folder to work (core node module)
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const keys = require('./config/database');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;
require('./models/User');  //** must require this before anything that relies on it
require('./models/Idea');

//Load routes
const ideasRoutes = require('./routes/ideas');  //function 
const usersRoutes = require('./routes/users');

//Require config
require('./config/passport')(passport);

//Connect to mongoose
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI)
.then(() => { console.log('Connected to mongoose!') })
.catch((err) => { console.log('Error: ', err) });

//Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//static folder
app.use(express.static(path.join(__dirname, 'public')));

//method-override middleware
app.use(methodOverride('_method'))

//express session middleware, from docs. I changed secret and resave to true, didn't need cookie
app.use(session({
    secret: 'secret7673',  
    resave: true,
    saveUninitialized: true
}));

//passport middleware, must go after express session middleware
app.use(passport.initialize());
app.use(passport.session());


  //connect-flash middleware
 app.use(flash()); 

 //Global variables, middleware
 app.use((req, res, next) => {
    res.locals.success_message = req.flash('success_message');  //res.locals exists only for one request
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');  //we will use this for passport later
    res.locals.user = req.user || null;  //req.user will only exist if logged in
    next();
 });

//Handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

ideasRoutes(app);
usersRoutes(app);

//Index route
app.get('/', (req, res) => {
    const title = 'Welcome'
    res.render('index', {
        title: title
    });
});

//About route
app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(port, () => {
    console.log(`server is up on port ${port}`);
});