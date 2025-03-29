const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

// Mongoose接続
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB接続成功！');
})
.catch(err => {
    console.error('❌ MongoDB接続エラー:', err);
});

// 配列からランダムに1つ取得
const sample = array => array[Math.floor(Math.random() * array.length)];

// データベースにデータを追加する関数
const seedDB = async () => {
    try {
        await Campground.deleteMany({});
        console.log('🗑️  既存データを削除した！');

        for (let i = 0; i < 50; i++) {
            const randomCityIndex = Math.floor(Math.random() * cities.length);
            const price = Math.floor(Math.random() * 2000) + 1000;
            const randomImageId = Math.floor(Math.random() * 1000);

            const camp = new Campground({
                author: '67e50c972ea88e21cb25e1e1', // 本物のObjectIdにするべき
                location: `${cities[randomCityIndex].prefecture} ${cities[randomCityIndex].city}`,
                title: `${sample(descriptors)}・${sample(places)}`,
                image: `https://source.unsplash.com/random/800x600?sig=${randomImageId}`,
                description: 'ランダムなテキストをここに入れてもOK！',
                price
            });
            await camp.save();
            console.log(`🌲 ${i + 1}件目を作成した！`);
        }
    } catch (err) {
        console.error('⚠️ エラーが発生:', err);
    }
};

// 実行
seedDB().then(() => {
    mongoose.connection.close();
    console.log('🔒 データベース接続を終了した！');
});
