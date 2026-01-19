import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

// Using 'function' instead of '=>' is the key
// 1. Remove 'next' from the arguments
userSchema.pre('save', async function (this: any) {
    // 2. Simply 'return' if the password hasn't changed
    if (!this.isModified('password')) return;
    
    try {
        // 3. Await the hash and assign it directly
        this.password = await bcrypt.hash(this.password, 10);
        // No next() call needed here
    } catch (error: any) {
        // If there's an error, just throw it; Mongoose will catch it
        throw error;
    }
});

export default mongoose.model('User', userSchema);