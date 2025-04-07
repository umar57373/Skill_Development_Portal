const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // Optional if using Clerk for auth
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) { return /^\d{10}$/.test(v); },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    profile_pic: { type: String, default: 'default.png' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    clerkId: { type: String, unique: true }, // Store Clerk user ID
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;