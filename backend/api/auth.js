import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import {body, validationResult} from 'express-validator';
import {getDb} from './db.js';

const router = express.Router();

router.get('/google',
    passport.authenticate('google', {scope: ['profile', 'email']})
);

router.get('/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    (req, res) => {
        // Проверяем заголовок или параметр запроса, чтобы определить источник
        const isExtension = req.query.source === 'extension';  // или можно использовать req.headers['x-source']

        if (isExtension) {
            // Для расширения используем postMessage
            res.send(`
                <script>
                    window.opener.postMessage(
                        { type: 'auth-success', user: ${JSON.stringify(req.user)} }, 
                        '${process.env.EXTENSION_URL}'
                    );
                    window.close();
                </script>
            `);
        } else {
            // Для веб-версии делаем редирект
            res.redirect(process.env.FRONTEND_URL);
        }
    }
);

router.get('/github',
    passport.authenticate('github', {scope: ['user:email']})
);

// То же самое для GitHub
router.get('/github/callback',
    passport.authenticate('github', {failureRedirect: '/login'}),
    (req, res) => {
        const isExtension = req.query.source === 'extension';

        if (isExtension) {
            res.send(`
                <script>
                    window.opener.postMessage(
                        { type: 'auth-success', user: ${JSON.stringify(req.user)} }, 
                        '${process.env.EXTENSION_URL}'
                    );
                    window.close();
                </script>
            `);
        } else {
            res.redirect(process.env.FRONTEND_URL);
        }
    }
);

router.get('/user', (req, res) => {
    if (req.user) {
        res.json({user: req.user});
    } else {
        res.status(401).json({error: 'Not authenticated'});
    }
});

router.post('/logout', (req, res) => {
    req.logout();
    res.json({message: 'Logged out'});
});


// Валидация входных данных
const registerValidation = [
    body('firstName').trim().notEmpty().withMessage('Имя обязательно'),
    body('lastName').trim().notEmpty().withMessage('Фамилия обязательна'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Введите корректный email')
        .normalizeEmail(),
    body('password')
        .isLength({min: 8})
        .withMessage('Пароль должен содержать минимум 8 символов')
        .matches(/\d/)
        .withMessage('Пароль должен содержать хотя бы одну цифру')
        .matches(/[a-zA-Z]/)
        .withMessage('Пароль должен содержать хотя бы одну букву'),
];

// Регистрация пользователя
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Проверяем ошибки валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {firstName, lastName, email, password} = req.body;
        const db = getDb();

        // Проверяем, существует ли пользователь
        const existingUser = await db.collection('users').findOne({email});
        if (existingUser) {
            return res.status(400).json({
                error: 'Пользователь с таким email уже существует'
            });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создаем нового пользователя
        const newUser = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            authType: 'local'
        };

        const result = await db.collection('users').insertOne(newUser);

        // Создаем объект пользователя без пароля для ответа
        const userResponse = {
            _id: result.insertedId,
            firstName,
            lastName,
            email,
            createdAt: newUser.createdAt,
            authType: 'local'
        };

        // Автоматически логиним пользователя после регистрации
        req.login(userResponse, (err) => {
            if (err) {
                return res.status(500).json({error: 'Ошибка при входе в систему'});
            }
            return res.status(201).json({user: userResponse});
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({error: 'Ошибка при регистрации пользователя'});
    }
});

// Вход по email/паролю
router.post('/login', [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').notEmpty().withMessage('Введите пароль')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        const db = getDb();

        // Ищем пользователя
        const user = await db.collection('users').findOne({email});
        if (!user) {
            return res.status(401).json({error: 'Неверный email или пароль'});
        }

        // Проверяем пароль
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({error: 'Неверный email или пароль'});
        }

        // Создаем объект пользователя без пароля
        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
            authType: user.authType
        };

        // Логиним пользователя
        req.login(userResponse, (err) => {
            if (err) {
                return res.status(500).json({error: 'Ошибка при входе в систему'});
            }
            return res.json({user: userResponse});
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: 'Ошибка при входе в систему'});
    }
});

export default router;