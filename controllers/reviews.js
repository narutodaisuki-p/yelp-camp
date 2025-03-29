const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const { id } = req.params; // エンティティのID（例: キャンプ場）
    const userId = req.user._id; // ログイン中のユーザーID

    // ユーザーがすでにこのエンティティにレビューを投稿しているか確認
    const existingReview = await Review.findOne({ author: userId, associatedEntity: id });
    if (existingReview) {
        req.flash('error', 'このエンティティにはすでにレビューを投稿しています。');
        return res.redirect(`/campgrounds/${id}`); // 必要に応じてリダイレクト先を調整
    }

    // キャンプ場を取得
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'キャンプ場が見つかりませんでした。');
        return res.redirect('/campgrounds'); // 必要に応じてリダイレクト先を調整
    }

    // レビューを作成して保存
    const review = new Review(req.body.review);
    review.author = userId;
    review.associatedEntity = id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash('success', 'レビューを正常に作成しました！');
    res.redirect(`/campgrounds/${id}`); // 必要に応じてリダイレクト先を調整
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // キャンプ場のレビュー配列から削除
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // レビュー自体を削除
    const review = await Review.findById(reviewId);
    if (review) {
        await review.deleteOne(); // レビューを削除
    }

    // フラッシュメッセージとリダイレクト
    req.flash('success', 'レビューを削除しました');
    res.redirect(`/campgrounds/${id}`);
};