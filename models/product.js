import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [ true, 'slug requis' ],
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: [ true, 'nom requis' ],
        trim: true,
    },
    category: {
        type: String,
        required: [ true, 'catégorie requise' ],
        trim: true,
    },
    description: {
        type: String,
        required: [ true, 'description requise' ],
        trim: true,
    },
    basePriceCHF: {
        type: Number,
        required: [ true, 'prix de base requis' ],
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    image: {
        type: String, //chaine de caractère qui pointe vers l'image
        required: [ true, 'image requise' ],
    },
    size: {
        type: [String],
        enum: ["S", "M", "L"],
        default: ["S", "M", "L"]
    },
    extra_chf: {
        type: mongoose.Schema.Types.Mixed, 
        default: {S: 0, M: 2, L: 3}  
    }
},{ timestamps: true });


// calcul du prix selon la taille
productSchema.methods.getPriceForSize = function (size) {
    
    if (!["S", "M", "L"].includes(size)) {
        throw new Error(`Taille invalide: ${size}`);
    }

    const base = this.basePriceCHF || 0;
    const extra = this.extra_chf?.[size] || 0;

    return base + extra;
};

// récupérer les produits actifs
productSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

export default mongoose.model('Product', productSchema);3333