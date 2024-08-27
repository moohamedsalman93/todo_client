import { MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { Button, Dialog, DialogBody, DialogFooter, Drawer, IconButton, Input, Radio, Step, Stepper, Tab, Tabs, TabsHeader, Textarea, Typography } from "@material-tailwind/react"
import { useEffect, useRef, useState } from "react"
import { motion } from 'framer-motion'
import { apiUrl, deleteApi, getApi, postApi } from "../../api/api"
import defaultprofile from '../../assets/defaultprofile.png'
import NoData from "../../utils/NoData"
import toast from "react-hot-toast"

function TaskManage({ TaskPopup, setTaskPopup }) {
    const [taskDrawer, setTaskDrawer] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState(0)
    const [priority, setPriority] = useState('low')
    const [assignedTo, setAssignedTo] = useState(null)
    const [edit, setEdit] = useState(-1);
    const [taskData, setTaskData] = useState([])
    const [taskDataFiltered, setTaskDataFiltered] = useState([])
    const [search, setSearch] = useState('');
    const [searchEmployee, setSearchEmployee] = useState('');
    const [isFocus, setIsFocus] = useState(false)
    const [userData, setUserData] = useState([])
    const [deleteTask, setDeleteTask] = useState(-1);
    const [activeTab, setActiveTab] = useState("all");
    const [error, setError] = useState(false)

    const inputRef = useRef(null);

    const statusValue = ["Pending", "In-prograss", "Completed"];

    const TabData = [
        {
            label: "All",
            value: "all",
        },
        {
            label: "Assigned",
            value: "assigned",
        },
        {
            label: "Un Assigned",
            value: "unassigned",
        },
    ];

    // useEffect(() => {
    //     const filtered = taskData.filter(task => {
    //         if (activeTab === 'assigned') {
    //             return task.assignedTo !== null;
    //         } else if (activeTab === 'unassigned') {
    //             return task.assignedTo === null;
    //         }
    //         return true;
    //     });

    //     setTaskDataFiltered(filtered)
    // }, [activeTab])

    const fetchUserData = () => {
        getApi('/users?q=' + searchEmployee)
            .then(res => {
                setUserData(res.data);
            })
            .catch(err => {
                console.error("Error fetching users:", err);
            });
    }

    useEffect(() => {
        if (taskDrawer) fetchUserData()
    }, [searchEmployee, taskDrawer]);

    const handleSubmit = () => {

        if (title == '') {
            setError(true)
            return
        }

        if (edit === -1) {

            if (!title) {
                toast.error(`Task title is required`)
                return
            }


            postApi('/tasks', {
                "title": title,
                "description": description,
                "status": status,
                "priority": priority,
                "assignedTo": assignedTo?._id,
            }).then(res => {

                if (res.status >= 200 && res.status < 300) {
                    handleClear()
                    fetchData()
                }
            }).catch(err => {
                console.error("Error adding user:", err);
            });
        }
        else {

            if (!title) {
                toast.error(`Task title is required`)
                return
            }

            postApi(`/UpdateTasks/?taskId=${edit}`, {
                "title": title,
                "description": description,
                "assignedTo": assignedTo?._id,
                "status": status,
                "priority": priority
            }).then(res => {

                if (res.status >= 200 && res.status < 300) {
                    handleClear()
                    fetchData()
                }
            }).catch(err => {
                console.error("Error adding user:", err);
            });
        }

    }

    const handleClear = () => {
        setEdit(-1)
        setTaskDrawer(false)
        setTitle('')
        setDescription('')
        setStatus(0)
        setPriority('low')
        setAssignedTo(null)
        setDeleteTask(-1)
        setError(false)
    }

    const fetchData = () => {
        getApi(`/allTasks?q=` + search)
            .then(res => {

                const filtered = res?.data?.filter(task => {
                    if (activeTab === 'assigned') {
                        return task?.assignedTo !== null;
                    } else if (activeTab === 'unassigned') {
                        return task?.assignedTo === null;
                    }
                    return true;
                });

                setTaskData(res?.data);
                setTaskDataFiltered(filtered)
            })
            .catch(err => {
                console.error("Error fetching users:", err);
            });
    }

    useEffect(() => {
        if (TaskPopup) fetchData()
    }, [search, activeTab, TaskPopup]);


    const handleEdit = (index) => {
        setTaskDrawer(true)
        setEdit(taskDataFiltered[index]?._id)
        setTitle(taskDataFiltered[index]?.title)
        setDescription(taskDataFiltered[index]?.description)
        setStatus(taskDataFiltered[index]?.status)
        setPriority(taskDataFiltered[index]?.priority)
        setAssignedTo(taskDataFiltered[index]?.assignedTo)
    }

    const handleDelete = () => {
        deleteApi(`/tasks?taskId=${taskData[deleteTask]._id}`)
            .then(res => {

                if (res.status >= 200 && res.status < 300) {
                    toast.success(`task: ${taskData[deleteTask]?.title} deleted successfully`)
                    handleClear()
                    fetchData()
                }
            }).catch(err => {
                console.error("Error deleting task:", err);
            });
    }



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setIsFocus(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Dialog size={'xl'} open={TaskPopup} className=" relative">
            <DialogBody>
                <div className=" flex justify-between w-full">
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-2">
                            Manage  Task
                        </Typography>

                        <Tabs value={activeTab} className=' py-2 h-full'>
                            <TabsHeader className=' ml-4 shadow-md  z-0 border  w-96 bg-white' indicatorProps={{
                                className: "bg-black text-white",
                            }}>
                                {TabData.map(({ label, value }, index) => (
                                    <Tab key={index} value={value} onClick={() => setActiveTab(value)}
                                        className={activeTab === value ? "text-white" : ""}>
                                        <div className="flex items-center gap-2 font-medium">
                                            {label}
                                        </div>
                                    </Tab>
                                ))}
                            </TabsHeader>
                        </Tabs>

                    </div>

                    <div className=" flex flex-col items-end space-y-2">
                        <Button className="flex items-center gap-3" size="sm" onClick={() => setTaskDrawer(true)}>
                            <PlusIcon strokeWidth={2} className="h-4 w-4" /> New Task
                        </Button>
                        <div className="w-full md:w-72">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                label="Search"
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            />
                        </div>
                    </div>

                </div>
                <section className=" h-[35rem] w-full m-1 overflow-y-auto">


                    {taskDataFiltered.length < 1 ? <div className=" w-full h-full justify-center items-center"><NoData /></div> :
                        taskDataFiltered?.map((item, index) =>
                            <div className={` h-20  p-2 px-4 w-full grid gap-1 grid-cols-8 ${activeTab === 'all' && item?.assignedTo !== null && 'bg-green-50'} items-center border-b hover:bg-green-50 rounded-md overflow-hidden`}>
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

                                <div className=' col-span-2 pr-2 max-h-full overflow-hidden text-ellipsis w-full'>
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
                                        className="font-normal opacity-70 "
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
                                        Status
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal opacity-70"
                                    >
                                        {statusValue[item?.status]}
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
                                        {item?.priority?.charAt(0).toUpperCase() + item?.priority?.slice(1)}
                                    </Typography>
                                </div>

                                <div className=' col-span-2 '>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        Assigned To
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal opacity-70"
                                    >
                                        name : {item?.assignedTo?.name || 'Not assigned'}
                                    </Typography>

                                </div>

                                <div className=' space-x-4'>
                                    <IconButton color='white' className=' hover:bg-red-600 bg-red-100 hover:text-white' onClick={() => setDeleteTask(index)}>
                                        <TrashIcon className='w-4 h-4' />
                                    </IconButton>

                                    <IconButton color='white' className=' hover:bg-blue-600 bg-blue-100 hover:text-white' onClick={() => handleEdit(index)}>
                                        <PencilIcon className='w-4 h-4' />
                                    </IconButton>
                                </div>

                            </div>
                        )
                    }
                </section>
            </DialogBody>
            <DialogFooter>
                <Button variant="gradient" onClick={() => setTaskPopup(false)}>
                    <span>Close</span>
                </Button>
            </DialogFooter>

            {
                taskDrawer &&
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{
                    delay: 0.1,
                    duration: 0.3,
                    ease: "easeInOut",
                }} className=" w-full h-full bg-black/15 absolute z-50 top-0 rounded-lg">
                    <div className=" w-full h-full relative">
                        <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} transition={{
                            delay: 0.1,
                            duration: 0.3,
                            ease: "easeInOut",
                        }} className="w-full h-[60%] bg-white absolute bottom-0 right-0 shadow-2xl rounded-lg border flex flex-col p-4">

                            <div className=" h-14 flex items-center px-3 border-b">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    {edit === -1 ? 'New Task' : 'Edit Task'}
                                </Typography>
                            </div>

                            <div className=" h-full grid-cols-3 grid gap-x-3 gap-y-6 py-5">
                                <div className=" w-[20rem]">
                                    <label htmlFor="email">
                                        <Typography
                                            variant="small"
                                            className={` block font-medium ${error ? 'text-red-600' : 'text-gray-900'}`}
                                        >
                                            Title
                                        </Typography>
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        variant="static"
                                        id="title"
                                        color="gray"
                                        size="lg"
                                        type="text"
                                        name="title"
                                        placeholder="Bug fixing"
                                        className="w-wull placeholder:opacity-100 focus:border-t-black border-t-blue-gray-200"
                                    // labelProps={{
                                    //     className: "hidden",
                                    // }}
                                    />
                                </div>

                                <div className=' w-[20rem] '>
                                    <label>
                                        <Typography
                                            variant="small"
                                            className=" block font-medium text-gray-900"
                                        >
                                            Priority
                                        </Typography>
                                    </label>
                                    <div className="flex justify-between text-sm px-12">
                                        <Radio name="priority" label="Low" checked={priority === 'low'} onChange={() => setPriority('low')} />
                                        <Radio name="priority" label="Medium" checked={priority === 'medium'} onChange={() => setPriority('medium')} />
                                        <Radio name="priority" label="High" checked={priority === 'high'} onChange={() => setPriority('high')} />
                                    </div>
                                </div>

                                <div className=' w-[20rem] '>
                                    <label>
                                        <Typography
                                            variant="small"
                                            className=" block font-medium text-gray-900"
                                        >
                                            Assigned To
                                        </Typography>
                                    </label>
                                    <div ref={inputRef} className="flex flex-col items-start justify-between text-sm px-10 mt-2 relative space-y-2">

                                        <div className=" flex space-x-2 items-center px-2 border w-full py-1 bg-blue-100 rounded-md  relative">
                                            <img src={assignedTo && assignedTo?.profilePicture ? assignedTo?.profilePicture : defaultprofile} alt="" className=" h-10 w-10 rounded-full" />
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold"
                                                >
                                                    Name : {assignedTo?.name}
                                                </Typography>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal opacity-70"
                                                >
                                                    ID : {assignedTo?.customId}
                                                </Typography>
                                            </div>
                                            <div onClick={() => setAssignedTo(null)}
                                                className={` ${!assignedTo && 'hidden'} h-6 w-6 bg-red-400 rounded-full absolute -top-1 -right-1 hover:scale-90 cursor-pointer`}>
                                                <XCircleIcon className="text-white" />
                                            </div>
                                        </div>

                                        <div className="w-full ">
                                            <Input
                                                value={searchEmployee}
                                                onChange={(e) => setSearchEmployee(e.target.value)}
                                                onFocus={() => setIsFocus(true)}
                                                label="Search the employee"
                                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                            />
                                        </div>
                                        {
                                            isFocus && <div className=" w-[15rem] flex flex-col shadow-2xl border absolute top-24 min-h-[5rem] h-[15rem] bg-white rounded-xl">
                                                {userData.length < 1 ? <NoData /> :
                                                    userData.map((item, index) => <div key={index}
                                                        onClick={() => {
                                                            setAssignedTo(item)
                                                            setSearchEmployee('')
                                                            setIsFocus(false)
                                                        }}
                                                        className=" flex space-x-2 items-center px-2 border-b py-1 hover:bg-green-100 rounded-md cursor-pointer">
                                                        <img src={item?.profilePicture ? item?.profilePicture : defaultprofile} alt="" className=" h-10 w-10 rounded-full" />
                                                        <div>
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-semibold"
                                                            >
                                                                Name : {item?.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-normal opacity-70"
                                                            >
                                                                ID : {item?.customId}
                                                            </Typography>
                                                        </div>
                                                    </div>)
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className=" w-[20rem]">
                                    <label htmlFor="email">
                                        <Typography
                                            variant="small"
                                            className="mb-2 block font-medium text-gray-900"
                                        >
                                            Description
                                        </Typography>
                                    </label>
                                    <Textarea size="md" label="Message" value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>

                                {edit !== -1 &&
                                    <div className=' w-full'>
                                        <label htmlFor="email">
                                            <Typography
                                                variant="small"
                                                className=" block font-medium text-gray-900"
                                            >
                                                Status
                                            </Typography>
                                        </label>
                                        <div className="flex justify-center text-sm   w-full px-16 ">
                                            <Stepper
                                                activeStep={status}

                                            >
                                                <Step className=" w-4 h-4" onClick={() => setStatus(0)}>

                                                    <div className="absolute -bottom-[2rem] w-max text-center">
                                                        <Typography
                                                            className="!font-light  !text-sm"
                                                            color={status === 0 ? "blue-gray" : "gray"}
                                                        >
                                                            Pending
                                                        </Typography>

                                                    </div>
                                                </Step>
                                                <Step className=" w-4 h-4" onClick={() => setStatus(1)}>

                                                    <div className="absolute -bottom-[2rem] w-max text-center">
                                                        <Typography
                                                            className="!font-light  !text-sm"
                                                            color={status === 1 ? "blue-gray" : "gray"}
                                                        >
                                                            In Progress
                                                        </Typography>

                                                    </div>
                                                </Step>
                                                <Step className=" w-4 h-4" onClick={() => setStatus(2)}>
                                                    <div className="absolute -bottom-[2rem] w-max text-center">
                                                        <Typography
                                                            className="!font-light  !text-sm"
                                                            color={status === 2 ? "blue-gray" : "gray"}
                                                        >
                                                            Completed
                                                        </Typography>

                                                    </div>
                                                </Step>
                                            </Stepper>
                                        </div>
                                    </div>
                                }


                            </div>

                            <div className=" flex justify-end">
                                <div className=' flex space-x-4'>
                                    <Button className={` bg-red-100 text-black`} onClick={handleClear}>
                                        {edit === -1 ? 'Close' : 'Cancel'}
                                    </Button>

                                    <Button onClick={handleSubmit}>
                                        {edit === -1 ? 'Add' : 'Update'}
                                    </Button>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </motion.div>
            }

            {
                deleteTask !== -1 &&
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{
                    delay: 0.1,
                    duration: 0.3,
                    ease: "easeInOut",
                }} className=" w-full h-full bg-black/15 absolute z-50 top-0 rounded-lg">
                    <div className=" w-full h-full relative flex flex-col items-center">
                        <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} transition={{
                            delay: 0.1,
                            duration: 0.3,
                            ease: "easeInOut",
                        }} className="w-[30rem] h-[40%] bg-white absolute bottom-2  shadow-2xl rounded-lg border flex flex-col p-4">

                            <div className=" h-14 flex items-center px-3 border-b">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Alert
                                </Typography>
                            </div>

                            <div className=" flex flex-col h-full w-full justify-center items-center">
                                <Typography >Are you sure to delete this Task ? </Typography>
                                <Typography color="red" >{taskData[deleteTask]?.title} - {taskData[deleteTask]?.description}</Typography>
                            </div>

                            <div className=" flex justify-end">
                                <div className=' flex space-x-4'>
                                    <Button onClick={handleClear}>
                                        cancel
                                    </Button>

                                    <Button className={` bg-red-100 text-black`} onClick={handleDelete}>
                                        Confirm
                                    </Button>


                                </div>
                            </div>

                        </motion.div>
                    </div>
                </motion.div>
            }

        </Dialog >
    )
}

export default TaskManage
