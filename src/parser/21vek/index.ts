import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

const BRAND_SERIES: [string, string[]][] = [
  ['baby mom', []],
  ['babygo', []],
  ['baby turco', []],
  ['bella baby happy', []],
  ['brand for my son', []],
  ['cam', ['pannolino batuffi']],
  ['cushy baby', []],
  ['pampers', ['premium care', 'active baby dry', 'new baby dry']],
  ['pufies', []],
  [
    'huggies',
    [
      'elite soft platinum',
      'elite soft overnites',
      'elite soft',
      'disney girl',
      'disney boy',
      'dry nites',
      'little swimmers',
      'ultra comfort',
      'classic',
    ],
  ],
  ['happy mum', []],
  ['paddlers', []],
  ['poopeys', []],
  ['palmbaby', ['magic']],
  ['merries', ['econom']],
  ['mepsi', []],
  ['mioki', []],
  ['mykiddo', []],
  ['manu', []],
  ['noopii', []],
  ['senso baby', ['sensitive', 'simple', 'ecoline']],
  ['senso', ['simple', 'sens']],
  ['skippy', ['more happiness', 'ultra', 'pull up', 'econom']],
  ['synergetic', ['pure nature']],
  ['sleepy', []],
  ['slipers', []],
  ['softlove', ['platinum', 'smart pants']],
  ['yokosun', ['econom', 'eco', 'premium']],
  ['yumiko', []],
  ['tokisan', ['baby pull up']],
  ['dada', ['extra care', 'extra soft']],
  ['evy baby', []],
  ['lalaku', []],
  ['watashi', []],
  ['little art', []],
  ['libero', ['touch', 'comfort']],
  ['lody', []],
  ['offspring', []],
  ['kunder', []],
  ['unidry', ['ultra soft', 'premium']],
];

const SIZES: [string, string[]][] = [
  ['7 XXXL', ['7', 'лет', 'XXXL']],
  ['6 XXL', ['6', 'large', 'XXL']],
  ['5 XL', ['5', 'junior', '5XL-junior', 'XL', 'ХL']],
  ['4 L', ['4', 'maxi', '4L-maxi', 'L']],
  ['3 M', ['3', 'midi', '3M-midi', 'M', 'М']],
  ['2 S', ['2', 'mini', '2S-mini', 'S']],
  ['0 NB XS', ['0', 'micro', 'NB XS', 'XS', 'new born xs', 'before new born']],
  ['1 NB', ['1', 'new born', 'NB', 'новорожденных']],
];

interface IPreParseData {
  title: string | undefined;
  price: string | undefined;
  link: string | undefined;
  imgLink: string | undefined;
}

export type Product = {
  brand: string;
  series: string;
  link: string;
  imgLink: string;
  count: number;
  price: number;
  size: number | string;
  priceForOne: number;
  isPants: boolean;
};

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

async function parseEmall(page = 1): Promise<IPreParseData[]> {
  const response = await fetch(`https://emall.by/catalog/9930.html?lazy_steep=${page}`);
  const productEls = parse(await response.text()).querySelectorAll('.products_card .form_wrapper');
  const preParseData = productEls.map((el) => {
    return {
      title: el.querySelector('.title a')?.textContent.toLowerCase(),
      price: el.querySelector('.price')?.textContent.match(/\d+/g)?.slice(0, 2).join('.'),
      link: el.querySelector('.img a')?.getAttribute('href'),
      imgLink: el.querySelector('.img a img')?.getAttribute('src'),
    };
  });

  return productEls.length ? preParseData.concat(await parseEmall(page + 1)) : preParseData;
}

async function parse21vek(page = 1): Promise<IPreParseData[]> {
  const inStock = 'filter%5Bgood_status%5D%5B%5D=in';
  const response = await fetch(`https://www.21vek.by/diapers/page:${page}/?${inStock}`);
  const root = parse(await response.text());
  const productEls = root.querySelectorAll('.result__item');

  const preParseData = productEls.map((el) => {
    return {
      title: el.querySelector('.result__name')?.textContent.toLowerCase(),
      price: el.querySelector('.g-item-data')?.getAttribute('content'),
      link: el.querySelector('.result__link')?.getAttribute('href'),
      imgLink: el.querySelector('.result__img img')?.getAttribute('src'),
    };
  });

  const isNotLastPage = root.querySelectorAll('.j-load_page.cr-paging_link')?.pop()?.textContent === '>';
  return isNotLastPage ? preParseData.concat(await parse21vek(page + 1)) : preParseData;
}

interface IDetMirItem {
  price: { price: number; currency: string };
  title: string;
  link: { web_url: string };
  pictures: { web: string }[];
}

async function parseDetmir(offset = 0): Promise<IPreParseData[]> {
  const categories = 'categories[].alias:podguzniki,diapers_pants,night_panties';
  const response = await fetch(`https://api.detmir.by/v2/products?filter=${categories}&limit=100&offset=${offset}`);
  const items = (await response.json()) as IDetMirItem[];

  const preParseData: IPreParseData[] = items.map((item) => {
    return {
      title: item.title,
      price: `${item.price.price}`,
      link: item.link.web_url,
      imgLink: item.pictures[0].web,
    };
  });

  return items.length === 100 ? preParseData.concat(await parseDetmir(offset + 100)) : preParseData;
}

const parseFuncArr: Array<() => Promise<IPreParseData[]>> = [parseEmall, parse21vek, parseDetmir];

export default async function parser(parseFuncArr: Array<() => Promise<IPreParseData[]>>): Promise<Partial<Product>[]> {
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
