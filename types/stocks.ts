/* eslint-disable camelcase */
export type StockRequest = {
  meta: { requested: number; returned: number };
  data: StockData[];
};

export type StockData = {
  ticker: string;
  price: number;
  day_change: number;
};
