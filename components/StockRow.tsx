import React from "react";
import Image from "next/image";
import { StockData } from "../types/stocks";

const StockRow = ({
  image,
  name,
  safe,
  api,
  percent,
}: {
  image?: string;
  name: string;
  safe?: "bored" | "safe" | "trade" | "risky" | "critical";
  api?: string | StockData;
  percent: string;
}) => {
  // console.log(typeof api === "object" ? api.price : "");
  return (
    <div className="w-full h-8 flex pr-4 my-5">
      <div className=" w-1/5 h-full relative">
        {image && (
          <Image
            className="h-full w-full"
            src={image}
            alt={name}
            layout="fill"
            objectFit="contain"
            quality={100}
          />
        )}
      </div>
      <div className="w-2/5 h-full text-center">
        <p
          className={`${image ? "text-white" : "textPink"} font-semibold ${
            image ? "text-base sm:text-xl" : "text-sm"
          } text-center`}
        >
          {name}
          {safe && (
            <span
              className={`${
                safe === "safe"
                  ? "text-green-600"
                  : safe === "trade"
                  ? "text-yellow-300"
                  : safe === "risky"
                  ? "text-yellow-500"
                  : safe === "bored"
                  ? "text-gray-500"
                  : "text-red-500"
              } text-xl font-bold`}
            >
              {" "}
              •
            </span>
          )}
        </p>
      </div>
      <div className="w-1/5 h-full text-center">
        <p
          className={`${image ? "text-white" : "textPink"} text-sm ${
            typeof api === "string" ? "font-semibold" : "sm:text-xl"
          } text-center`}
        >
          {!api ? (
            "-"
          ) : typeof api === "string" ? (
            api
          ) : (
            <>
              ${api.price}
              <span
                className={`text-xs ${
                  api.day_change === 0
                    ? ""
                    : api.day_change > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {" "}
                ({(api.day_change < 0 ? "" : "+") + api.day_change}%)
              </span>
            </>
          )}
        </p>
      </div>
      <div className="w-1/5 h-full text-center">
        <p
          className={`${image ? "text-white" : "textPink"} font-semibold ${
            image ? "text-base sm:text-xl" : "text-sm"
          } text-center`}
        >
          {percent}
        </p>
      </div>
    </div>
  );
};

export default StockRow;
