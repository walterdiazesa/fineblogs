import axios from "axios";
import { withAuthUser } from "next-firebase-auth";
import React, { useEffect } from "react";
import Nav from "../../components/Nav";
import StockRow from "../../components/StockRow";
import { StockData, StockRequest } from "../../types/stocks";
import redis from "../../utils/redis";

const index = ({
  stockData,
}: {
  stockData?: {
    [key: string]: StockData;
  };
}) => {
  useEffect(() => {
    // console.log(stockData);
  }, []);

  return (
    <>
      <Nav />
      <h1 className="text-2xl font-bold text-center my-5 mt-8">
        My investments
      </h1>
      <StockRow name="Asset Name" api="Today" percent="Share" />
      <StockRow
        safe="safe"
        name="Apple"
        percent="24%"
        api={
          stockData && stockData.hasOwnProperty("AAPL")
            ? stockData["AAPL"]
            : "-"
        }
        image="/imgs/stocks/applelogo.png"
      />
      <StockRow
        safe="safe"
        name="Microsoft"
        percent="20%"
        api={
          stockData && stockData.hasOwnProperty("MSFT")
            ? stockData["MSFT"]
            : "-"
        }
        image="/imgs/stocks/microsoftlogo.png"
      />
      <StockRow
        safe="trade"
        name="Tesla"
        percent="16.5%"
        api={
          stockData && stockData.hasOwnProperty("TSLA")
            ? stockData["TSLA"]
            : "-"
        }
        image="/imgs/stocks/teslalogo.png"
      />
      <StockRow
        safe="trade"
        name="Nvidia"
        percent="16.5%"
        api={
          stockData && stockData.hasOwnProperty("NVDA")
            ? stockData["NVDA"]
            : "-"
        }
        image="/imgs/stocks/nvidialogo.png"
      />
      <StockRow
        safe="safe"
        name="Alphabet A"
        percent="12.5%"
        api={
          stockData && stockData.hasOwnProperty("GOOGL")
            ? stockData["GOOGL"]
            : "-"
        }
        image="/imgs/stocks/alphabetlogo.png"
      />
      <StockRow
        safe="trade"
        name="Amazon"
        percent="10.5%"
        api={
          stockData && stockData.hasOwnProperty("AMZN")
            ? stockData["AMZN"]
            : "-"
        }
        image="/imgs/stocks/amazonlogo.png"
      />
      <StockRow
        safe="critical"
        name="Bitcoin"
        percent="$50"
        image="/imgs/stocks/bitcoinlogo.png"
      />
      <StockRow
        safe="bored"
        name="Berk. Hath. B"
        percent="-"
        image="/imgs/stocks/berkshirehathawaylogo.png"
      />
      <StockRow
        safe="bored"
        name="J.P Morgan"
        percent="-"
        image="/imgs/stocks/jpmorganlogo.png"
      />

      <div className="mx-3 md:mt-12">
        <img
          src="/imgs/stocks/stockportfoliojustification.jpg"
          alt="stockportfoliojustification"
          width="800"
          height="auto"
          className="mx-auto rounded-md"
        />
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  try {
    const redisStocks = await redis.get(`stocks`);

    const stockData: {
      [key: string]: StockData;
    } = redisStocks ? JSON.parse(redisStocks) : {};

    if (!redisStocks) {
      const {
        data: data1,
      }: {
        data: StockRequest;
      } = await axios.get(
        `https://api.stockdata.org/v1/data/quote?symbols=AAPL,TSLA,MSFT&api_token=${process.env.STOCKDATA_KEY}`
      );
      const {
        data: data2,
      }: {
        data: StockRequest;
      } = await axios.get(
        `https://api.stockdata.org/v1/data/quote?symbols=AMZN,GOOGL,NVDA&api_token=${process.env.STOCKDATA_KEY}`
      );

      if (
        data1.meta.requested === data1.meta.returned &&
        data2.meta.requested === data2.meta.returned
      ) {
        data1.data.map((item) => {
          stockData[item.ticker] = item;
        });
        data2.data.map((item) => {
          stockData[item.ticker] = item;
        });
        await redis.set("stocks", JSON.stringify(stockData), "ex", 86400);
      }
    }

    return {
      props: {
        stockData,
      },
    };
  } catch (e) {
    return {
      props: {},
    };
  }
};

export default withAuthUser({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
})(index);
