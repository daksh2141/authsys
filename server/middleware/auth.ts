import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get token from "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = verified; // Add the user data to the request object
        next(); // Move to the actual route logic
    } catch (error) {
        res.status(400).json({ error: "Invalid Token" });
    }
};