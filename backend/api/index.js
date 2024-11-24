import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import {Strategy as GitHubStrategy} from 'passport-github2';
import {connectDB, getDb} from './db.js';
import authRoutes from './auth.js';
import bookmarkRoutes from './bookmarks.js';


const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google Strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const db = getDb();  // получаем доступ к БД
            const user = await db.collection('users').findOne({googleId: profile.id});
            if (user) {
                return done(null, user);
            }

            const newUser = {
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                createdAt: new Date()
            };

            await db.collection('users').insertOne(newUser);
            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const db = getDb();  // получаем доступ к БД
            const user = await db.collection('users').findOne({githubId: profile.id});
            if (user) {
                return done(null, user);
            }

            const newUser = {
                githubId: profile.id,
                email: profile.emails?.[0]?.value,
                name: profile.displayName,
                createdAt: new Date()
            };

            await db.collection('users').insertOne(newUser);
            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    }
));

// Routes
app.use('/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: 'Something broke!'});
});

// Connect to DB and start server
connectDB().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});


export default app;






