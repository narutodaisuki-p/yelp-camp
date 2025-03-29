const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    associatedEntity: {
        type: Schema.Types.ObjectId,
        ref: 'Campground', // Adjust the reference as needed
        required: true
    }
});

reviewSchema.index({ author: 1, associatedEntity: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
