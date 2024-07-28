import React, { useEffect, useState } from 'react'
import {
    Button,
    Typography,
} from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'





function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decryptedToken = JSON.parse(atob(token.split('.')[1]));
                const tokenExpiry = decryptedToken.exp;
                const userRole = decryptedToken.role;

                const isTokenExpired = new Date(tokenExpiry * 1000) < new Date();

                if (!isTokenExpired) {

                    if (userRole === 'admin') {
                        navigate('/admin-page');
                    } else {
                        navigate('/user-page');
                    }
                } else {

                    navigate('/login');
                    localStorage.clear()
                }
            } catch (error) {
                console.error('Invalid token:', error);

                navigate('/login');
            }
        } else {

        }
    }, []);



    return (
        <div className=' overflow-hidden h-screen relative flex justify-center'>
            {/* <BackgroundGradientAnimation /> */}
            <header className=" p-8 absolute top-0">
                <div className="grid mt-16 min-h-[82vh] w-full lg:h-[54rem] md:h-[34rem] place-items-stretch bg-[url('/image/bg-hero-17.svg')] bg-center bg-contain bg-no-repeat">
                    <motion.div initial={{ opacity: 0.0, y: 0 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.8,
                            ease: "easeInOut",
                        }} className="container mx-auto px-4 text-center ">

                        <Typography
                            variant="h1"
                            color="blue-gray"
                            className="mx-auto my-6 w-full leading-snug  !text-2xl lg:max-w-3xl lg:!text-5xl"
                        >
                            Welcom to the new{" "}
                            <span className="text-green-500 leading-snug ">

                                Task Manager.
                            </span>{" "}

                        </Typography>
                        <Typography
                            variant="lead"
                            className="mx-auto w-full !text-gray-500 lg:text-lg text-base"
                        >
                            Let's get started
                        </Typography>
                        <div className="mt-8 grid w-full place-items-start md:justify-center">
                            <div className="mb-2 flex w-full flex-col gap-4 md:flex-row">

                                <Button
                                    color="gray"
                                    className="w-full px-4 md:w-[12rem]" onClick={() => navigate('/login')}
                                >
                                    Login
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>
        </div>
    )
}


export default LandingPage
