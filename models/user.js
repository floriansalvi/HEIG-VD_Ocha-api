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
        validate: {
            validator: (v) => validator.isEmail(v),
            message: "Email invalide"
        }
    },
    display_name: {
        type: String,
        required: [ true, 'Nom d\'utilisateur requis' ],
        unique: true,
        trim: true,
        minlength: [ 3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères' ],
        maxlength: [ 30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères' ],
        validate: {
            validator: (v) => /^[a-zA-Z0-9_]+$/.test(v),
            message: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores"
        }
    },
    phone: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return validator.isMobilePhone(v, 'any');
            },
            message: "Numéro de téléphone invalide"
        }
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
        minlength: [ 8, 'Le mot de passe doit contenir au moins 8 caractères' ],
        select: false,
        validate: {
            validator: (v) => {
                return (
                    /[a-z]/.test(v) &&
                    /[A-Z]/.test(v) &&
                    /[0-9]/.test(v) &&
                    /[\W_]/.test(v)
                );
            },
            message: "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial"
        }
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