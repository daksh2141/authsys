import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { verifyToken } from './middleware/auth.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from './configs/db.js';
import User from './models/User.js';
await connectDB();
const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Create a new user instance
        const newUser = new User({ username, email, password });

        // 2. Save to MongoDB
        await newUser.save();

        res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        console.error("DETAILED ERROR:", error);
res.status(500).json({ error: "Registration failed", details: error });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // 2. Compare the plain password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

    const token = jwt.sign(
    { userId: user._id }, 
    process.env.JWT_SECRET || 'fallback_secret_for_testing', 
    { expiresIn: '1h' }
);

        // 3. Success!
    res.status(200).json({ 
    message: "Login successful!",
    token: token 
    });

    } catch (error: any) {
        res.status(500).json({ error: "Login failed", details: error.message });
    }
});

app.get('/profile', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        res.json({ message: "Welcome to your profile!", userData: verified });
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});
 

app.get('/dashboard', (req, res) => {
   
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No token provided" });
    }

    try {
       
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        
       
        res.json({ 
            message: "Welcome to the secret dashboard!", 
            user: verified 
        });
    } catch (err) {
        res.status(403).json({ error: "Invalid or Expired Token" });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
