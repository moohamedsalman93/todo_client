

import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon, PencilIcon, ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  IconButton,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Progress,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import gallery from '../../assets/gallery.png'
import defaultprofile from '../../assets/defaultprofile.png'
import { apiUrl, deleteApi, getApi, postApi, postApiForm } from "../../api/api";
import { useNavigate } from "react-router-dom";
import NoData from "../../utils/NoData";
import TaskManage from "./TaskManage";
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import toast from "react-hot-toast";
import { imageDb } from "../../config/firbaseConfig";
import { uploadBytes, uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';



function AdminPage() {
  const [EmployeePopup, setEmployeePopup] = useState(false)
  const [TaskPopup, setTaskPopup] = useState(false)
  const [users, setUsers] = useState([]);
  const [deleteUser, setDeleteUser] = useState(-1)
  const [EditUser, setEditUser] = useState(-1)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(gallery);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [openImage, setOpenImage] = useState('');
  const [imagePosition, setImagePosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const controls = useAnimation();
  const [error, setError] = useState({ name: false, email: false });


  const handleImageClick = (imageUrl, event) => {
    const imgRect = event.target.getBoundingClientRect();
    setImagePosition({
      top: imgRect.top,
      left: imgRect.left,
      width: imgRect.width,
      height: imgRect.height,
    });
    setOpenImage(imageUrl);
    controls.start({
      top: '50%',
      left: '50%',
      width: '20rem',
      height: '20rem',
      x: '-50%',
      y: '-50%',
      transition: { duration: 0.5 },
    });
  };

  const closeImage = () => {
    setOpenImage('');
  };

  const navigate = useNavigate();

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


  const fetchData = () => {
    getApi('/users?q=' + search)
      .then(res => {
        setUsers(res.data);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
      });
  }

  useEffect(() => {
    fetchData()
  }, [search]);

  const signOut = () => {
    localStorage.clear()
    navigate('/')
  }


  const handleDelete = () => {
    deleteApi(`/DeleteUser?userId=${users[deleteUser]._id}`)
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          toast.success(`User: ${users[deleteUser].name} deleted successfully`)
          setDeleteUser(-1)
          fetchData()
        }
      }).catch(err => {
        console.error("Error deleting user:", err);
      });
  }

  const handleEdit = (index) => {
    setEditUser(index)
    setEmployeePopup(true)
    setName(users[index]?.name)
    setEmail(users[index]?.email)
    setPreviewImage(users[index]?.profilePicture != undefined ? users[index]?.profilePicture : '')
  }

  const handleSubmitUser = async () => {
    setError({ name: name === '', email: email == '' || !email.includes('@gmail.com') })

    if (error.name || error.email || !name || !email) {
      return
    }

    const data = {
      name,
      email,
      isEdit: EditUser !== -1,
    };

    if (users && users[EditUser]) {
      data.id = users[EditUser]._id;
    }

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
        toast.success(EditUser === -1 ? `${name} added` : 'Updated successfully');
        fetchData();
        handleClear();
      }
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };


  const handleClear = () => {
    setEditUser(-1)
    setEmployeePopup(false)
    setName('')
    setEmail('')
    setPreviewImage('')
    setProfileImage(gallery)
    setUploadProgress(0)
    setError({ name: false, email: false })
  }

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setError(prevError => ({ ...prevError, name: value === '' }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(prevError => ({ ...prevError, email: value === '' || !value.includes('@gmail.com') }));
  };


  return (
    <div className=" h-full w-full flex justify-center items-center  p-10 ">
      <Card className=" w-[60rem] h-full">

        <CardHeader floated={false} shadow={false} className="rounded-none min-h-[25%]">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div className=' flex space-x-4 items-center w-full mb-5'>


              <img className=" h-20 w-20 rounded-full bg-black" src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg"
                alt="" />

              <div>

                <Typography
                  variant="h4"
                  color="blue-gray"

                >
                  Admin
                </Typography>

                <Typography
                  // variant="h4"
                  color="red"
                  className=" underline cursor-pointer hover:scale-90 hover:font-bold transition  duration-300" onClick={signOut}
                >
                  Sign Out
                </Typography>

              </div>


            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

              <Button className="flex items-center gap-3" size="sm" onClick={() => setEmployeePopup(true)}>
                <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add employee
              </Button>

              <Button className="flex items-center gap-3" size="sm" onClick={() => setTaskPopup(true)}>
                <ArrowUpTrayIcon strokeWidth={2} className="h-4 w-4" />Tasks
              </Button>

            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Typography
              variant="h4"
              color="blue-gray"

            >
              Employee List
            </Typography>

            <div className="w-full md:w-72">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
          </div>
        </CardHeader>

        <CardBody className=" overflow-y-auto px-6 h-[40rem]  ">

          <div className=" w-full h-full">
            {users.length > 0 ?
              users?.map((item, index) =>
                <div className=' h-20  p-2 px-4 w-full grid grid-cols-5 items-center border-b hover:bg-green-50 hover:rounded-md'>
                  <div className=" flex space-x-2 items-center">
                    <img src={item?.profilePicture ? item?.profilePicture : defaultprofile} onClick={(e) => handleImageClick(item?.profilePicture ? `${item.profilePicture}` : '', e)} alt="" className=" h-10 w-10 rounded-full cursor-pointer hover:scale-90" />
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        ID
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal opacity-70"
                      >
                        {item?.customId}
                      </Typography>
                    </div>
                  </div>

                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold"
                    >
                      Name
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal opacity-70"
                    >
                      {item?.name}
                    </Typography>
                  </div>

                  <div className=' col-span-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold"
                    >
                      Email
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal opacity-70"
                    >
                      {item?.email}
                    </Typography>
                  </div>

                  <div className=" flex justify-end space-x-2">
                    <IconButton color='white' className=' hover:bg-blue-600 bg-blue-100 hover:text-white' onClick={() => handleEdit(index)}>
                      <PencilIcon className='w-4 h-4' />
                    </IconButton>

                    <IconButton color='white' className=' hover:bg-red-600 bg-red-100 hover:text-white' onClick={() => setDeleteUser(index)}>
                      <TrashIcon className='w-4 h-4' />
                    </IconButton>

                  </div>


                </div>
              ) :
              <NoData />
            }
          </div>

        </CardBody>

        {/* add and edit user details */}
        <Dialog open={EmployeePopup}>
          <DialogBody>
            <section className="grid text-center items-center p-5">
              <div>
                <Typography variant="h3" color="blue-gray" className="mb-2">
                  {EditUser !== -1 ? 'Edit Employee' : 'Add Employee'}
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
                          className={`mb-2 block font-medium ${error.name ? 'text-red-600' : 'text-gray-900'}`}
                        >
                          Name
                        </Typography>
                      </label>
                      <Input
                        variant="static"
                        value={name}
                        onChange={handleNameChange}
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
                          className={`mb-2 block font-medium ${error.email ? 'text-red-600' : 'text-gray-900'}`}
                        >
                          Email
                        </Typography>
                      </label>
                      <Input
                        variant="static"
                        value={email}
                        onChange={handleEmailChange}
                        id="email"
                        color="gray"
                        size="lg"
                        type="email"
                        name="email"
                        placeholder="Enter the email"

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
              <span>{EditUser != -1 ? 'Update' : 'Confirm'}</span>
            </Button>
          </DialogFooter>
        </Dialog>

        <TaskManage TaskPopup={TaskPopup} setTaskPopup={setTaskPopup} />

        {/* delete pop up  */}
        <Dialog open={deleteUser !== -1}>
          <DialogHeader >
            <Typography variant="h5" >Alert !</Typography>
          </DialogHeader>
          <DialogBody className=" flex flex-col justify-center items-center w-full">
            <Typography >Are you sure to delete this user ? </Typography>
            <Typography color="red" >{users[deleteUser]?.customId} - {users[deleteUser]?.name}</Typography>
          </DialogBody>
          <DialogFooter>
            <Button variant="gradient" color="green" className="mr-1" onClick={() => setDeleteUser(-1)}>
              <span>Cancel</span>
            </Button>
            <Button
              variant="text"
              color="red"
              onClick={handleDelete}

            >
              <span>Delete</span>
            </Button>

          </DialogFooter>
        </Dialog>

      </Card >

      <AnimatePresence>
        {openImage != '' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-screen  absolute z-50 flex flex-col justify-center items-center"
            onClick={closeImage}
          >
            <motion.div
              initial={{
                top: imagePosition.top,
                left: imagePosition.left,
                width: imagePosition.width,
                height: imagePosition.height
              }}
              animate={{
                top: '50%',
                left: '50%',
                width: '20rem',
                height: '20rem',
                x: '-50%',
                y: '-50%'
              }}
              exit={{
                top: imagePosition.top,
                left: imagePosition.left,
                width: imagePosition.width,
                height: imagePosition.height
              }}
              className="  flex justify-center items-center relative overflow-hidden"
              style={{ position: 'absolute' }}
            >
              <motion.img initial={{ borderRadius: 999 }} whileInView={{ borderRadius: 10 }} exit={{ borderRadius: 999 }} src={openImage} alt="Selected" className="w-full  h-full object-cover" />
              <button
                onClick={closeImage}
                className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div >
  );
}

export default AdminPage

