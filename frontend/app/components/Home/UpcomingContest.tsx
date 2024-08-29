import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from "next/navigation";

const UpcomingContest: React.FC = () => {
    return (
        <div className="flex flex-col">
          <div className="self-start -mt-3.5 text-5xl border border-solid border-cyan-950 text-blue-950 max-md:max-w-full max-md:text-4xl">
            UPCOMING CONTEST
          </div>
          <div className="mt-10 w-full border border-solid bg-cyan-950 border-blue-950 min-h-[1px] max-md:mt-10 max-md:max-w-full" />
          <div className="flex flex-col items-start px-16 py-12 mt-12 ml-2.5 w-full bg-white rounded-3xl border-2 border-solid border-blue-950 shadow-[0px_6px_4px_rgba(119,176,170,0.25)] max-md:px-5 max-md:mt-10 max-md:mr-1 max-md:max-w-full">
            <div className="text-5xl text-center text-blue-950 max-md:max-w-full max-md:text-4xl">
              Reading Skill (AI generated contest) #01
            </div>
            <div className="flex flex-wrap gap-8 mt-5 text-4xl">
              <div className="basis-auto text-blue-950">Bắt đầu trong: </div>
              <div className="flex-auto text-sky-600 max-md:max-w-full">
                {" "}
                2 ngày 3 tiếng 5 phút 23 giây
              </div>
            </div>
            <div className="self-end px-12 py-2.5 mt-3 text-4xl text-emerald-50 bg-sky-600 rounded-3xl border border-emerald-50 border-solid max-md:px-5">
              Đăng ký
            </div>
          </div>
          <div className="self-center mt-12 text-2xl text-sky-600 max-md:mt-10">
            READ MORE
          </div>
        </div>
    );
};

export default UpcomingContest;