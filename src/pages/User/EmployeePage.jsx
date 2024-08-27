import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { deleteApi, getApi, postApi, apiUrl, postApiForm } from '../../api/api';
import { Typography, Button, Input, Textarea, Radio, Card, CardHeader, CardBody, CardFooter, IconButton, Tooltip, Dialog, DialogBody, DialogFooter, Progress } from '@material-tailwind/react';
import { ArrowLeftEndOnRectangleIcon, EnvelopeIcon, HomeIcon, IdentificationIcon, PencilIcon, PencilSquareIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import defaultprofile from '../../assets/defaultprofile.png'
import gallery from '../../assets/gallery.png'
import NoData from '../../utils/NoData';
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { imageDb } from '../../config/firbaseConfig';

function EmployeePage() {
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [taskData, setTaskData] = useState([]);
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState(gallery);
    const [previewImage, setPreviewImage] = useState('');
    const [EmployeePopup, setEmployeePopup] = useState(false)
    const [error, setError] = useState({ name: false, email: false });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false)


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    const fetchData = (id) => {
        getApi(`/user?userId=${id}`)
            .then(res => {
                setUser(res.data);
            })
            .catch(err => {
                console.error("Error fetching users:", err);
            });
    }

    const fetchTask = (id) => {
        getApi(`/UserTasks?UserId=${id}`)
            .then(res => {
                setTaskData(res.data);
            })
            .catch(err => {
                console.error("Error fetching users:", err);
            });
    }

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const decryptedToken = JSON.parse(atob(token.split('.')[1]));
            if (decryptedToken?.id) {
                setUserId(decryptedToken?.id)
                fetchData(decryptedToken?.id)
                fetchTask(decryptedToken?.id)
            }

        }
    }, []);

    const userDetailsHead = [

        {
            icon: <UserCircleIcon className="h-4 w-4" />,
            name: 'User name',
            value: 'name'
        },
        {
            icon: <IdentificationIcon className="h-4 w-4" />,
            name: 'User Id',
            value: 'customId'
        },
        {
            icon: <EnvelopeIcon className="h-4 w-4" />,
            name: 'User Email',
            value: 'email'
        },
        {
            icon: <IdentificationIcon className="h-4 w-4" />,
            name: 'User Role',
            value: 'role'
        },

    ]

    const handleChangeStatus = async (val, id) => {

        postApi(`/UpdateTasks/?taskId=${taskData[id]?._id}`, {
            "status": parseInt(val),
            "assignedTo": taskData[id]?.assignedTo?._id
        }).then(res => {

            if (res.status >= 200 && res.status < 300) {
                fetchTask(userId)
            }
        }).catch(err => {
            console.error("Error adding user:", err);
            fetchTask(userId)
        });
    }

    const signOut = () => {
        localStorage.clear()
        navigate('/')
    }

    const handleClear = () => {
        setEmployeePopup(false)
        setName('')
        setEmail('')
        setPreviewImage('')
        setProfileImage(gallery)
        setError({
            name: false,
            email: false
        })
    }

    const handleSubmitUser = async () => {
        setError({ name: name === '', email: email == '' || !email.includes('@gmail.com') })

        if (error.name || error.email || !name || !email) {
            return
        }

        setIsLoading(true)

        const data = {
            name,
            email,
            isEdit: true,
            id: user?._id
        };


        const uploadImage = () => {
            return new Promise((resolve, reject) => {
                if (profileImage && profileImage !== gallery) {
                    try {
                        const uniqueFilename = profileImage.name;
                        const storageRef = ref(imageDb, "profilePicture/" + uniqueFilename);
                        const uploadTask = uploadBytesResumable(storageRef, profileImage);

                        uploadTask.on('state_changed',
                            (snapshot) => {
                                const percentCompleted = Math.round((snapshot.bytesTransferred * 100) / snapshot.totalBytes);
                                setUploadProgress(percentCompleted);
                            },
                            (error) => {
                                console.error('Upload failed', error);
                                reject(error);
                            },
                            async () => {
                                try {
                                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                                    data.imageUrl = downloadUrl;
                                    resolve();
                                } catch (downloadError) {
                                    console.error('Failed to get download URL', downloadError);
                                    reject(downloadError);
                                }
                            }
                        );
                    } catch (err) {
                        console.error('Unexpected error', err);
                        reject(err);
                    }
                } else {
                    resolve();
                }
            });
        };

        try {
            await uploadImage();

            const response = await postApi('/register', data);

            if (response.status >= 200 && response.status < 300) {
                setIsLoading(false)
                toast.success('Updated successfully');
                fetchData(userId);
                handleClear();
            }
        } catch (err) {
            setIsLoading(false)
            console.error("Error adding user:", err);
        }
    };

    const handleEdit = () => {
        setEmployeePopup(true)
        setName(user?.name)
        setEmail(user?.email)
        setPreviewImage(user?.profilePicture != undefined ? user?.profilePicture : '')
    }


    return (
        <div className=" h-full w-full flex justify-center  p-10">
            <Card className=" w-[60rem] h-full">
                <div className="  w-full min-h-[12rem] bg-white rounded-xl shadow-lg flex flex-col justify-between p-5">

                    <div className=' flex space-x-4 items-center w-full mb-5 justify-between'>
                        <Typography
                            variant="h4"
                            color="blue-gray"
                        >
                            Todo Page
                        </Typography>

                        <div className=' flex space-x-3'>
                            <div className=' flex space-x-2 items-center p-2 rounded-full bg-black text-white cursor-pointer hover:scale-90 hover:text-blue-600 transition-all duration-500' onClick={handleEdit}>
                                <Tooltip content="Edit">
                                    <PencilSquareIcon className=' w-6' />
                                </Tooltip>
                            </div>

                            <div className=' flex space-x-2 items-center p-2 rounded-full bg-red-100 cursor-pointer hover:scale-90 hover:text-black transition-all duration-500' onClick={signOut}>
                                <Tooltip content="Sign out">
                                    <ArrowLeftEndOnRectangleIcon className=' w-6' />
                                </Tooltip>
                            </div>
                        </div>

                    </div>

                    <div className=" flex w-full items-center gap-4">
                        <img src={user?.profilePicture ? user?.profilePicture : defaultprofile} alt="" className=" h-24 shadow-xl w-24 rounded-full" />
                        <div className=" grid grid-cols-3 w-full ">
                            {
                                userDetailsHead.map((item) =>
                                    <div key={item.name} className=" gap-2">
                                        <div className="flex space-x-2  items-center">
                                            {item.icon}
                                            <Typography
                                                variant="h6"
                                                color="blue-gray"
                                                className=" font-semibold"
                                            >
                                                {item.name}
                                            </Typography>
                                        </div>
                                        <Typography
                                            variant="small"
                                            color=""
                                            className={` font-normal text-gray-500 ml-6 ${user?.[item?.value] == '' && ' pl-5 text-red-500'}`}
                                        >

                                            {user?.[item?.value] || '-'}
                                        </Typography>

                                    </div>
                                )
                            }

                        </div>
                    </div>

                </div>
                <CardBody className=' w-full'>

                    <div className=' flex flex-col  h-[32rem]  w-full divide-y-2 overflow-y-auto'>
                        {taskData?.length < 1 ? <div className=' flex flex-col h-full justify-center'><NoData /></div>
                            : taskData?.map((item, index) =>
                                <div className=' h-20  p-2 px-4 w-full grid grid-cols-5 items-center hover:bg-green-50 hover:rounded-md'>
                                    <div>
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal"
                                        >
                                            Title
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal opacity-70"
                                        >
                                            {item?.title}
                                        </Typography>
                                    </div>

                                    <div className=' col-span-2'>
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal"
                                        >
                                            Description
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal opacity-70"
                                        >
                                            {item?.description}
                                        </Typography>
                                    </div>

                                    <div>
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal"
                                        >
                                            Priority
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal opacity-70"
                                        >
                                            {item?.priority}
                                        </Typography>
                                    </div>


                                    <div className="">
                                        <select
                                            value={item?.status.toString()}
                                            onChange={(e) => handleChangeStatus(e.target.value, index)}
                                            className={`w-fit p-1 rounded-lg border text-white ${item?.status == 2 ? 'bg-gradient-to-br from-[#2dcebf] to-[#2dce97] ' : (item?.status == 1 ? 'bg-gradient-to-br from-[#fb6a40] to-[#fbad40] ' : 'bg-gradient-to-br from-[#f5583d] to-[#f53f54] ')}`}
                                        >
                                            <option className=" bg-black" value="0">Pending</option>
                                            <option className=" bg-black" value="1">In progress</option>
                                            <option className=" bg-black" value="2">Completed</option>
                                        </select>

                                    </div>


                                </div>
                            )
                        }

                    </div>


                </CardBody>

                <Dialog open={EmployeePopup}>
                    <DialogBody>
                        <section className="grid text-center items-center p-5">
                            <div>
                                <Typography variant="h3" color="blue-gray" className="mb-2">
                                    Edit Employee
                                </Typography>
                                <form action="#" className=" gap-6 text-left flex mt-8">
                                    <div className=' cursor-pointer' onClick={() => document.getElementById('profile-image').click()}>
                                        <img
                                            src={previewImage || profileImage}
                                            alt="pr img"
                                            className="w-[9rem] h-[9rem] rounded-lg border bg-white border-[#79747ea4]"
                                        />
                                        <div className="mt-3 text-sm flex justify-center items-center space-x-1">
                                            <label htmlFor="profile-image" className="flex items-center space-x-1 cursor-pointer">
                                                <img src={gallery} alt="g" className="h-6 w-6" />
                                                <h1 className="text-[#1b5dff] text-xs hover:text-[#284180]">
                                                    {previewImage ? 'Change Profile' : 'Select Profile'}
                                                </h1>
                                            </label>

                                        </div>
                                        <input
                                            id="profile-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className=" w-[50%]">
                                        <div className="mb-6">
                                            <label htmlFor="name">
                                                <Typography
                                                    variant="small"
                                                    className="mb-2 block font-medium text-gray-900"
                                                >
                                                    Name
                                                </Typography>
                                            </label>
                                            <Input
                                                variant="static"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                id="name"
                                                color="gray"
                                                size="lg"
                                                type="text"
                                                name="name"
                                                placeholder="Enter the name"
                                                className="w-full placeholder:opacity-100 focus:border-t-black border-t-blue-gray-200"

                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label htmlFor="email">
                                                <Typography
                                                    variant="small"
                                                    className="mb-2 block font-medium text-gray-900"
                                                >
                                                    Email
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
                                                placeholder="Enter the email"
                                                disabled
                                                className="w-full placeholder:opacity-100 focus:border-t-black border-t-blue-gray-200 pl-2"

                                            />
                                        </div>
                                    </div>

                                </form>
                                {uploadProgress > 0 &&
                                    <div className=" flex justify-center">
                                        <Progress value={uploadProgress} label="Uploading" className=" w-[20rem]" />
                                    </div>
                                }
                            </div>
                        </section>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            variant="text"
                            color="red"
                            onClick={handleClear}
                            className="mr-1"
                        >
                            <span>Cancel</span>
                        </Button>
                        <Button variant="gradient" color="green" onClick={handleSubmitUser}>
                            {isLoading ? (<div className=' w-full h-full'>
                                <div className=' h-4 w-4 border-l-2 border-white rounded-full animate-spin'></div>
                            </div>) : (<span>Update</span>)}
                        </Button>
                    </DialogFooter>
                </Dialog>

            </Card>
        </div >


    );
};

export default EmployeePage
