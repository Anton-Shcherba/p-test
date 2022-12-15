import { BRAND_SERIES, SIZES } from './patterns';
import { Product } from './types';
import parseFuncArr from './parseSites';

function getBrandNSeries(title: string): [string | undefined, string | undefined] {
  const replacing: [RegExp, string] = [/ /gi, '[ &-]?'];
  const brandInd = BRAND_SERIES.findIndex(([brand]) => title.match(new RegExp(brand.replace(...replacing), 'i')));
  const seriesInd = BRAND_SERIES[brandInd]?.findIndex(([_, series]) =>
    title.match(new RegExp(series.replace(...replacing), 'i'))
  );
  return [BRAND_SERIES[brandInd]?.[0], BRAND_SERIES[brandInd]?.[1][seriesInd]];
}

function getSize(title: string): string | undefined {
  return SIZES.find(([_, qArr]) =>
    title.match(new RegExp(qArr.map((q) => `[ /p]${q.replace(/ /g, '[ -]?')}[\\+ ,XLMNS]`).join('|'), 'i'))
  )?.[0];
}

function getCount(title: string): number | undefined {
  const regArr = title.match(/ ?\d+ ?(?=шт? ?)/i);
  return regArr ? +regArr[0].trim() : undefined;
}

export default async function parser(): Promise<Partial<Product>[]> {
  const titleNPriceArr = (await Promise.all(parseFuncArr.map((parseFunc) => parseFunc()))).flat();
  return titleNPriceArr.map(({ title, price, link, imgLink }) => {
    const [brand, series] = title ? getBrandNSeries(title) : [];

    const product: Partial<Product> = {
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
