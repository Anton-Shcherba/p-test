export type PreParseData = {
  title: string | undefined;
  price: string | undefined;
  link: string | undefined;
  imgLink: string | undefined;
};

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

export type DetMirItem = {
  title: string;
  price: { price: number; currency: string };
  link: { web_url: string };
  pictures: { web: string }[];
};
