import express from 'express';
import cors from 'cors';
import parser from './parser';
import mongoose, { Schema } from 'mongoose';
const app = express();
const port = process.env.PORT || 3000;
await mongoose.connect(process.env.DATABASE_URL ||
    'mongodb+srv://my-first-app-main-db-0bf4424284c:PedM9wN7aq8sSgr7pmx178U1t81gDc@prod-us-central1-1.lfuy1.mongodb.net/my-first-app-main-db-0bf4424284c');
const ProductsModel = mongoose.model('product', new Schema({
    brand: String,
    series: String,
    link: String,
    imgLink: String,
    count: Number,
    price: Number,
    size: String,
    priceForOne: Number,
    isPants: Boolean,
}));
const users = await ProductsModel.find({});
let data = users;
app.use(cors());
app.get('/', (_, response) => {
    response.send(JSON.stringify(data));
});
app.listen(port, () => console.log(`Running on port ${port}`));
function timeout() {
    setTimeout(async function () {
        try {
            data = (await parser()).sort((p1, p2) => (p1.priceForOne || Infinity) - (p2.priceForOne || Infinity));
            await ProductsModel.deleteMany({});
            await ProductsModel.insertMany(data);
            console.log('update ' + new Date());
        }
        catch (error) {
            console.log(error);
        }
        timeout();
    }, 1000);
}
timeout();
