import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import { PreParseData, DetMirItem } from './types';

async function parseEmall(page = 1): Promise<PreParseData[]> {
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

async function parse21vek(page = 1): Promise<PreParseData[]> {
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

async function parseDetmir(offset = 0): Promise<PreParseData[]> {
  const categories = 'categories[].alias:podguzniki,diapers_pants,night_panties';
  const response = await fetch(`https://api.detmir.by/v2/products?filter=${categories}&limit=100&offset=${offset}`);
  const items = (await response.json()) as DetMirItem[];

  const preParseData: PreParseData[] = items.map((item) => {
    return {
      title: item.title,
      price: `${item.price.price}`,
      link: item.link.web_url,
      imgLink: item.pictures[0].web,
    };
  });

  return items.length === 100 ? preParseData.concat(await parseDetmir(offset + 100)) : preParseData;
}

const parseFuncArr: Array<() => Promise<PreParseData[]>> = [parseEmall, parse21vek, parseDetmir];

export default parseFuncArr;
