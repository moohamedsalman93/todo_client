import React, { useEffect, useState } from 'react'
import { Typography, Input, Button, Stepper, Step } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon, EnvelopeOpenIcon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';
import { postApi } from '../api/api';
import { BackgroundGradientAnimation } from '../utils/BackgroundGradientAnimation ';
import { useLoading } from '../utils/LoadingContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isNew, setIsnew] = useState(false)

    useEffect(() => {
        if (isNew && password !== confirmPassword) {
            setMessage('Password mismatch')
        } else {
            if (password.length < 8 && password.length > 0) {
                setMessage('Password lent should atleast 8 in length')
            }
            else {  
                setMessage('');
            }
        }

    }, [confirmPassword, password])


    const handleSubmit = () => {
        if (step === 0) {
            if (email === '') {
                toast.error('Please enter email first')
                return

            }
            postApi('/checkuser', {
                "email": email,
            }).then(res => {
                if (res.status >= 200 && res.status < 300) {
                    setIsnew(res?.data?.isNew)
                    setStep(1)
                }
            }).catch(err => {
                toast.error("Email not found");
            });
        } else {

            if (password.length < 8) {
                setMessage('please enter password');
                return
            }

            postApi('/login', {
                "email": email,
                "password": password
            }).then(res => {
                if (res.status >= 200 && res.status < 300) {
                    localStorage.setItem('token', res.data.token);
                    navigate(res.data.role === 'admin' ? '/admin-page' : '/user-page');
                }
            }).catch(err => {
                toast.error("Please check your credential");
            });

        }


    }

    return (
        <div className=' flex flex-col justify-center items-center h-screen relative'>
            <BackgroundGradientAnimation />
            <section className=" w-fit h-fit items-center p-8 bg-white rounded-md absolute">
                <div>
                    <Typography variant="h3" color="blue-gray" className="mb-2">
                        Sign In
                    </Typography>
                    <Typography className=" text-gray-600 font-normal text-[18px]">
                        Enter your email and password to sign in
                    </Typography>
                    <form action="#" className="mx-auto max-w-[24rem] text-left">
                        {step === 0 ?
                            <div className="mb-6 mt-16">
                                <label htmlFor="email">
                                    <Typography
                                        variant="small"
                                        className="mb-2 block font-medium text-gray-900"
                                    >
                                        Your Email
                                    </Typography>
                                </label>
                                <Input
                                    variant="static"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    id="email"
                                    color="gray"
                                    size="lg"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="w-full placeholder:opacity-100 focus:border-t-black border-t-blue-gray-200"
                                // labelProps={{
                                //     className: "hidden",
                                // }}
                                />
                            </div>
                            :
                            <div className=' w-full '>
                                <div className=' w-full my-5 py-2 rounded-2xl text-center broder border-gray-600 border-2 flex justify-center items-center space-x-2'>
                                    <EnvelopeOpenIcon className=' h-4 w-4' />
                                    <Typography className=" text-gray-600 font-bold text-sm">
                                        {email}
                                    </Typography>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="password">
                                        <Typography
                                            variant="small"
                                            className="mb-2 block font-medium text-gray-900"
                                        >
                                            Password
                                        </Typography>
                                    </label>
                                    <Input
                                        variant="static"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        size="lg"
                                        placeholder="Enter password"
                                        className="w-full placeholder:opacity-100 focus:border-t-black border-t-blue-gray-200"
                                        type="password"
                                    />
                                </div>
                                {
                                    isNew && <div className="mb-6">
                                        <label htmlFor="password">
                                            <Typography
                                                variant="small"
                                                className="mb-2 block font-medium text-gray-900"
                                            >
                                                Confirm Password
                                            </Typography>
                                        </label>
                                        <Input
                                            variant="static"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            size="lg"
                                            placeholder="Enter confirm password"
                                            className="w-full placeholder:opacity-100 focus:border-t-black border-t-blue-gray-200"
                                            type="password"
                                        />
                                    </div>
                                }
                                {message !== '' &&
                                    <Typography className=" text-red-600 font-normal text-sm">
                                        {message}
                                    </Typography>
                                }


                            </div>

                        }




                        <Button disabled={message !== ''} color="gray" size="lg" className="mt-6" fullWidth onClick={handleSubmit}>
                            {step === 0 ? 'next' : (isNew ? 'Confirm' : 'Sign In')}
                        </Button>


                        <div className=' w-full px-20 py-5'>
                            <Stepper
                                activeStep={step}
                            >
                                <Step className=' hover:bg-gray-600 cursor-pointer' onClick={() => setStep(0)}>1</Step>
                                <Step className='hover:bg-gray-600 cursor-pointer'>2</Step>
                            </Stepper>
                        </div>

                    </form>
                </div>
            </section>
        </div>

    )
}

export default Login


