
import Lottie from 'lottie-react';
import React from 'react';
import LoadingLottie from '../assets/loading.json'

const LoadingSpinner = () => {
  return (
    <div className=" absolute rounded-lg backdrop-blur-sm top-0 left-0  bg-white/30 z-50 h-full w-full flex flex-col justify-center items-center">
      <Lottie animationData={LoadingLottie} loop={true} className=' h-[20rem]' />
    </div>
  );
};

export default LoadingSpinner;