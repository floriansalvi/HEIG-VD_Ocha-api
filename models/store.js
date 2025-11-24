import mongoose from "mongoose";
import validator from 'validator';
import slugify from 'slugify';

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Nom du magasin requis' ],
        unique: true,
        trim: true,
        minlength: [ 3, 'Le nom du magasin doit contenir au moins 3 caractères' ],
        maxlength: [ 50, 'Le nom du magasin ne peut pas dépasser 50 caractères' ]
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
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
    address: {
        line1: {
            type: String,
            required: [ true, 'Adresse requise' ],
            trim: true,
        },
        city: {
            type: String,
            required: [ true, 'Ville requise' ],
            trim: true,
        },
        zipcode: {
            type: String,
            required: [ true, 'Code postal requis' ],
            trim: true,
        },
        country: {
            type: String,
            required: [ true, 'Pays requis' ],
            trim: true,
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [ true, 'Coordonnées requises' ],
            validate: {
                validator: function(v) {
                    return v.length === 2 &&
                        v[0] >= -180 && v[0] <= 180 &&
                        v[1] >= -90 && v[1] <= 90;

                },
                message: "Les coordonnées doivent contenir une longitude et une latitude valides"
            }
        }
    },
    is_active: {
        type: Boolean,
        default: true
    },
    opening_hours: {
        type: [[String]],
        default: [
            [],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["09:00", "17:00"]
        ],
        validate: {
            validator: function(arr) {
                if (arr.length !== 7) return false;
                return arr.every(day => {
                    if (day.length === 0) return true;
                    if (day.length !== 2) return false;
                    return /^([01]\d|2[0-3]):[0-5]\d$/.test(day[0]) && 
                           /^([01]\d|2[0-3]):[0-5]\d$/.test(day[1]);
                });
            },
            message: "Format invalide. Utilisez [] pour fermé ou ['HH:MM', 'HH:MM'] pour ouvert"
        }
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', function(next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    this.updated_at = Date.now();
    next();
});

storeSchema.methods.isOpenAt = function(date = new Date()) {
    const dayIndex = date.getDay();
    const daySchedule = this.opening_hours[dayIndex];
    if (daySchedule.length === 0) return false;

    const currentTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const [openTime, closeTime] = daySchedule;

    return currentTime >= openTime && currentTime <= closeTime;
}

storeSchema.methods.getScheduleForDay = function(dayIndex) {
    return this.opening_hours[dayIndex] || [];
}

storeSchema.statics.findNearby = function(longitude, latitude, maxDistanceInMeters) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistanceInMeters
            }
        },
        is_active: true
    });
}

export default mongoose.model('Store', storeSchema);