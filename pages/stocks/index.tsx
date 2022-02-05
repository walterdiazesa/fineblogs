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

      <div className="mx-3 mb-4 md:my-12">
        <img
          src="/imgs/stocks/stockportfoliojustification.jpg"
          alt="stockportfoliojustification"
          width="800"
          height="auto"
          className="mx-auto rounded-md"
        />
      </div>

      <div className="mx-3 md:mx-20 mb-3">
        <p className="text-white my-3">
          - <span className="text-xl font-bold text-green-600">•</span>: The
          asset is outstandingly stable in the long run, hardly suffers falls,
          and those he suffers do not represent a significant risk
        </p>
        <p className="text-white my-3">
          - <span className="text-xl font-bold text-yellow-300">•</span>: The
          asset hardly generates a risk for the investment, but the risk/return
          on the investment is more than worth it; in any case, it still means a
          small but considerable risk by any measure
        </p>
        <p className="text-white my-3">
          - <span className="text-xl font-bold text-yellow-500">•</span>: We
          enter dangerous territory, these assets have a tiny volatility factor,
          but quite possibly, they tend to rise, and the value of the possible
          return makes the risk worthwhile
        </p>
        <p className="text-white my-3">
          - <span className="text-xl font-bold text-red-500">•</span>: Extremely
          volatile, under any concept of considerable or long-term investment,
          avoid them, but the return in case of winning is absurdly huge, which
          makes it an asset to consider in certain situations
        </p>
        <p className="text-white my-3">
          - <span className="text-xl font-bold text-gray-500">•</span>: In most
          cases bank-safe, and in many literally a bank, the risk is so little
          that it is not even worth considering, the disadvantage is that thanks
          to the security of the asset, the return is usually lower
        </p>

        <p className="text-white my-3 font-bold">
          The Today value percentage represents the loss or win against
          yesterday. To know more info about the graphics or revenue over time,
          click the Today value of the asset
        </p>
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
