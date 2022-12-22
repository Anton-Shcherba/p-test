import { BRAND_SERIES, SIZES } from './patterns';
import parseFuncArr from './parseSites';
function getBrandNSeries(title) {
    const replacing = [/ /gi, '[&-»«]? ?'];
    const brandInd = BRAND_SERIES.findIndex(([brand]) => title.match(new RegExp(brand.replace(...replacing), 'i')));
    const seriesInd = BRAND_SERIES[brandInd]?.[1].findIndex((series) => title.match(new RegExp(series.replace(...replacing), 'i')));
    return [BRAND_SERIES[brandInd]?.[0], BRAND_SERIES[brandInd]?.[1][seriesInd]];
}
function getSize(title) {
    return SIZES.find(([_, qArr]) => title.match(new RegExp(qArr.map((q) => `[ /p]${q.replace(/ /g, '[ -]?')}[\\+ ,XLMNS]`).join('|'), 'i')))?.[0];
}
function getCount(title) {
    const regArr = title.match(/(\d*?)(?:\+?)(\d+)(?= ?шт| ?ш)/i);
    return regArr?.[1] ? +regArr[1] + +regArr[2] : regArr ? +regArr[0].trim() : undefined;
}
export default async function parser() {
    const titleNPriceArr = (await Promise.all(parseFuncArr.map((parseFunc) => parseFunc()))).flat();
    return titleNPriceArr.map(({ title, price, link, imgLink }) => {
        const [brand, series] = title ? getBrandNSeries(title) : [];
        const product = {
            brand: brand,
            count: title ? getCount(title) : undefined,
            price: price?.length && Number(price) ? +price : undefined,
            size: title ? getSize(title) : undefined,
            series: series,
            link: link,
            imgLink: imgLink,
            isPants: title ? !!title.match(/трусики|pants/i) : undefined,
        };
        if (product.price && product.count) {
            product.priceForOne = Math.round((product.price / product.count) * 100) / 100;
        }
        return product;
    });
}
