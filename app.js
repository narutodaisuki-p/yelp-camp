const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const helmet = require("helmet")
const MongoStore = require('connect-mongo');

require('dotenv').config(); // dotenvを使って環境変数を読み込む


dbUrl =process.env.DB_URL|| "mongodb://localhost:27017/yelp-camp"
mongoose.connect(dbUrl,
    {
        
        
    })
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const store  = new MongoStore({
    mongoUrl:dbUrl,
    crypto:{
        secret:"mysecret"
        
    },
    touchAfter:24 *3600
})
store.on("error",e =>{
    console.log("セッションエラー",e)
})
const sessionConfig = {
    store,
    name:"session",
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => {
    
    process.nextTick(() => {
        done(null, user.id);
        
    });
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
app.use(flash());

app.use((req, res, next) => {
   
    res.locals.currentUser = req.user 
    
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use((req, res, next) => {
    console.log('セッション:', req.session);
    console.log('フラッシュメッセージ:', req.flash());
    next();
});




// app.use(helmet({
//     contentSecurityPolicy:false
// }))


app.get('/', (req, res) => {
    
    res.render('home');
});
app.get('/test-flash', (req, res) => {
    req.flash('success', 'フラッシュメッセージが動作しています！');
    res.redirect('/show-flash');
});

app.get('/show-flash', (req, res) => {
    const messages = req.flash('success');
    res.send(messages);
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
    
    next(new ExpressError('ページが見つかりませんでした', 404));
    
});

app.use((err, req, res, next) => {
    console.log(err)
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
    
    
});

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});
