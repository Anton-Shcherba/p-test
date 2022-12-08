import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

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

function getBrand(title: string): string | undefined {
  const regArr = title.match(/pampers/i);
  return regArr ? regArr[0] : undefined;
}

function getCount(title: string): number | undefined {
  const regArr = title.match(/(?<=\()\s?\d+\s?(?=шт\s?\))/i);
  return regArr ? +regArr[0].trim() : undefined;
}

function getSeries(title: string): string | undefined {
  const regArr = title.match(
    /premium[\s|-]?care|active[\s|-]?baby[\s|-]?dry|new[\s|-]?baby[\s|-]?dry/i
  );
  return regArr ? regArr[0] : undefined;
}

function getSize(title: string): number | undefined {
  const regArr = title.match(
    /(micro)|(new\s?born)|(mini)|(midi)|(maxi)|(junior)|(extra\s?large)|(?<=\s)[0-7](?=\D)/i
  );
  if (!regArr) return undefined;
  if (Number(regArr[0])) return +regArr[0];
  const size = regArr.slice(1, 8).findIndex(Boolean);
  return size >= 0 ? size : undefined;
}

function isNotLastPage(paginatorStr: string): boolean {
  const regArr = paginatorStr.match(/(?<showInd>\d*)\sиз\s(?<lastInd>\d*)/i);
  if (!(regArr?.groups?.showInd && regArr?.groups?.lastInd)) return false;
  return regArr.groups.showInd !== regArr.groups.lastInd;
}

export default async function parse21vek(page = 1): Promise<Partial<Product>[]> {
  const response = await fetch(
    `https://www.21vek.by/diapers/page:${page}/?filter%5Bproducer%5D%5B%5D=pampers`
  );

  const root = parse(await response.text());
  const productEls = root.querySelectorAll('.result__item');

  const result: Partial<Product>[] = [];

  productEls.forEach((productEl) => {
    const titleElStr = productEl.querySelector('.result__name')?.textContent;
    const priceElStr = productEl.querySelector('.g-item-data')?.getAttribute('content');

    const prod: Partial<Product> = {
      brand: titleElStr ? getBrand(titleElStr) : undefined,
      count: titleElStr ? getCount(titleElStr) : undefined,
      price: priceElStr?.length && Number(priceElStr) ? +priceElStr : undefined,
      size: titleElStr ? getSize(titleElStr) : undefined,
      series: titleElStr ? getSeries(titleElStr) : undefined,
      link: productEl.querySelector('.result__link')?.getAttribute('href'),
      imgLink: productEl.querySelector('.result__img img')?.getAttribute('src'),
      isPants: titleElStr ? !!titleElStr.match(/трусики|pants/i) : undefined,
    };

    if (prod.price && prod.count) {
      prod.priceForOne = Math.round((prod.price / prod.count) * 100) / 100;
    }

    result.push(prod);
  });

  const pageElStr = root.querySelector('.cr-paginator_page_list')?.textContent;

  return pageElStr && isNotLastPage(pageElStr)
    ? [...result, ...(await parse21vek(page + 1))]
    : result;
}
