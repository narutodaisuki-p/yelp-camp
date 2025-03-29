const Joi = require('joi');
const sanitizeHtml = require("sanitize-html");

// Joiにカスタムルールを追加
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.noHtml': 'HTMLタグを含めることはできません。',
    },
    rules: {
        noHtml: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) {
                    return helpers.error('string.noHtml');
                }
                return clean;
            }
        }
    }
});

// Joiを拡張
const ExtendedJoi = Joi.extend(extension);

// キャンプ場のスキーマ
module.exports.campgroundSchema = ExtendedJoi.object({
    campground: ExtendedJoi.object({
        title: ExtendedJoi.string().required().noHtml(),        // HTMLタグ禁止
        price: ExtendedJoi.number().required().min(0),
        image: ExtendedJoi.string().required(),
        location: ExtendedJoi.string().required().noHtml(),     // HTMLタグ禁止
        description: ExtendedJoi.string().required().noHtml()   // HTMLタグ禁止
    }).required()
});

// レビューのスキーマ
module.exports.reviewSchema = ExtendedJoi.object({
    review: ExtendedJoi.object({
        rating: ExtendedJoi.number().required().min(1).max(5),
        body: ExtendedJoi.string().required().noHtml()          // HTMLタグ禁止
    }).required()
});
