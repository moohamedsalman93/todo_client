import React from 'react'
import Lottie from "lottie-react";
import nodataLottie from "../assets/nodata.json"
import { Typography } from '@material-tailwind/react';

function NoData() {
    return (
        <div className=' h-full w-full flex justify-center items-center'>
            <Typography className=' text-blue-300 font-semibold'>No Data</Typography>
        </div>
    )
}

export default NoData
