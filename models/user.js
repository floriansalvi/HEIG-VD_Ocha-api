import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [ true, 'Email requis' ],
        unique: true,
        lowercase: true,
        trim: true,
    },
    display_name: {
        type: String,
        required: [ true, 'Nom d\'utilisateur requis' ],
        unique: true,
        trim: true,
    },
    phone: {
        type: String,
        required: false,

    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [ true, 'Mot de passe requis' ],
        select: false,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);