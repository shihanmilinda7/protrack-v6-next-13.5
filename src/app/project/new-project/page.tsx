"use client";

import NextAutoFocusTextInputField from "@/app/components/common-comp/nextui-input-fields/next-autofocus-text-input-fields";
import NextDateInputField from "@/app/components/common-comp/nextui-input-fields/next-date-input-fields";
import NextSelectInputField from "@/app/components/common-comp/nextui-input-fields/next-select-input-fields";
import NextAreaTextInputField from "@/app/components/common-comp/nextui-input-fields/next-textarea-input-fields";
import { WithRole } from "@/app/components/common-comp/withRole";
import Navbar from "@/app/components/navbar/navbar";
import NewProjectTask from "@/app/components/project/project-task-addnew";
import { ProjectTaskTable } from "@/app/components/project/project-task-table";
import { TaskObjectTypes } from "@/app/components/project/types";
import { handleSelectChangeEvent } from "@/app/components/utils";
import Spinner from "@/app/dashboard/loading";
import { inputFieldValidation } from "@/app/utils/utils";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Input } from "@nextui-org/react";
import ConfirmAlertbox from "@/app/components/common-comp/confirm-alertbox";
import ProjectAssignScreen from "@/app/components/project/project-assign";
import { setCurPrjTaskRowOj } from "@/store/projectAssignSaveSlice";
import { useDispatch } from "react-redux";
import { MdOutlineArrowBack } from "react-icons/md";
import SearchFilter from "@/app/components/common-comp/input-fields/search-filter";
import { FaSearch } from "react-icons/fa";
import IconConfirmAlertbox from "@/app/components/common-comp/icon-confirm-alertbox";

export default function NewProject() {
  //get pathname
  let pathname: string = "";

  try {
    pathname = window.location.href;
    // console.log("pathname1", window.location.href);
  } catch (error) {}

  if (pathname) {
    const r: number = pathname.indexOf("/", 9);
    if (r !== -1) {
      pathname = pathname.substring(0, r);
    }
    // console.log("pathname", pathname);
  }
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  //define state variables
  // const [reloadTable, setReloadTable] = useState(false);

  const searchParams = useSearchParams();
  const selProjectid = searchParams.get("projectid");

  const [projectid, setProjectid] = useState("");
  const [projectname, setProjectname] = useState("");
  const [projectdescription, setProjectdescription] = useState("");
  const [startdate, setStartdate] = useState("");
  const [enddate, setEnddate] = useState("");
  const [projectstatus, setProjectstatus] = useState(new Set([]));
  // const [pageReload, setPageReload] = useState(false);
  const [search, setSearch] = useState("");
  const [taskRowObjects, setTaskRowObjects] = useState<any[]>([]);
  const [updateScreen, setUpdateScreen] = useState(false);

  const toggleAssignSave = () => {
    setUpdateScreen((prv: boolean) => !prv);
  };

  const statusOptionValues = [
    { value: "Pending", name: "Pending" },
    { value: "Started", name: "Started" },
    { value: "End", name: "End" },
    { value: "Suspended", name: "Suspended" },
  ];

  const updateTaskRowObjectArray = (
    tasks?: any,
    index?: number,
    options?: { deleteTask?: boolean; deltaskid?: number }
  ) => {
    const tmpArray: any = [...taskRowObjects];

    if (options?.deleteTask) {
      if (index || index == 0) {
        if (!options?.deltaskid) {
          tmpArray.splice(index, 1);
          setTaskRowObjects(tmpArray);
        } else {
          tmpArray[index]["rowStatus"] = "deleted";
          setTaskRowObjects(tmpArray);
        }
      }
    } else {
      if (tasks) {
        if (index || index == 0) {
          const keys: any = Object.keys(tasks);
          keys.forEach((key: any) => {
            tmpArray[index][key] = tasks[key];
          });
          setTaskRowObjects(tmpArray);
        } else {
          //update display object
          tasks.assignmembers = [];
          tmpArray.unshift(tasks);
          // tmpArray.push(tasks);
          setTaskRowObjects(tmpArray);
          //update initial object
        }
      }
    }
  };

  //for states update
  useEffect(() => {
    // declare the data fetching function

    if (selProjectid) {
      const fetchData = async () => {
        const reponse = await fetch(
          pathname + "/api/project/get-as-project?projectid=" + selProjectid
        );
        const res = await reponse.json();
        console.log("res", res);
        const project = res.project[0];
        let projectTasks = res.projectTasks;
        // console.log("project.projectid", projectTasks);
        //update states
        setProjectid(project.projectid);
        setProjectname(project.projectname);
        setProjectdescription(project.projectdescription);
        setStartdate(project.startdate);
        setEnddate(project.enddate);
        setProjectstatus(new Set([project.projectstatus]));

        projectTasks = projectTasks.map((t) => {
          return { ...t, show: true };
        });

        setTaskRowObjects(projectTasks);
        // setPageReload(true)  project.projectstatus
      };

      // call the function
      fetchData().catch(console.error);
    }
  }, [updateScreen]);

  const cancelButton = () => {
    dispatch(setCurPrjTaskRowOj([]));

    router.push("/project");
  };

  const submitButtonHandler = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!projectid) {
      await addnew();
    } else {
      await update();
    }
    dispatch(setCurPrjTaskRowOj([]));
  };

  //add new project action
  const addnew = async () => {
    const validation = inputFieldValidation({
      projectname,
      projectdescription,
      startdate,
      enddate,
    });
    try {
      //check input field empty or not
      if (validation == 0) {
        if (taskRowObjects.length > 0) {
          //api call
          const response = await fetch(
            pathname + "/api/project/get-as-project",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                projectname,
                projectdescription,
                startdate,
                enddate,
                projectstatus: projectstatus.values().next().value,
                taskRowObjects,
              }),
            }
          );
          const jsonResponse = await response.json();

          if (jsonResponse == "SUCCESS") {
            toast.success("Project created successfully!", {
              position: "top-right",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            router.push("/project");
          }
        } else {
          toast.info("Project should be contain at least one task!", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }
      }
    } catch (error) {
      toast.error("Error!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  //update project action
  const update = async () => {
    const validation = inputFieldValidation({
      projectname,
      projectdescription,
      startdate,
      enddate,
    });
    try {
      //check input field empty or not
      if (validation == 0) {
        if (taskRowObjects.length > 0) {
          //api call
          const response = await fetch(
            pathname + "/api/project/get-as-project",
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                projectid,
                projectname,
                projectdescription,
                startdate,
                enddate,
                projectstatus: projectstatus.values().next().value,
                taskRowObjects,
              }),
            }
          );
          const jsonResponse = await response.json();

          if (jsonResponse == "SUCCESS") {
            toast.success("Project updated successfully!", {
              position: "top-right",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            router.push("/project");
          }
        } else {
          toast.info("Project should be contain at least one task!", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }
      }
    } catch (error) {
      toast.error("Error!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const searchEvent = (e) => {
    setSearch(e.target.value);
    const tmpArray = [...taskRowObjects];
    tmpArray.forEach((obj) => {
      if (obj.taskname.search(e.target.value) == -1) {
        obj.show = false;
      } else {
        obj.show = true;
      }
    });
    setTaskRowObjects(tmpArray);
  };

  const deleteAction = async () => {
    if (projectid) {
      const responseDel = await fetch(
        pathname + "/api/project/get-as-project",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectid }),
        }
      );

      const res = await responseDel.json();
      if (res == "SUCCESS") {
        toast.success("Project deleted successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        router.push("/project");
      } else {
        toast.error("Error!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } else {
      router.push("/project");
    }
  };

  if (status === "loading") {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (!session) {
    router.push("/"); // Redirect to login page if not authenticated
    return null;
  }

  return (
    <WithRole roles={["Admin", "Manager", "User"]}>
      <div>
        <Navbar />
        <div className="">
          <div className="flex items-center justify-center p-2">
            <div className="pt-2 mr-2">
              <Button
                color="primary"
                onClick={cancelButton}
                variant="bordered"
                startContent={
                  <MdOutlineArrowBack className="inline-block h-5 w-5" />
                }
              >
                Go back
              </Button>
            </div>
            <span className="text-2xl font-semibold leading-none text-gray-900 select-none pt-2 mr-auto">
              <span className="text-indigo-600">
                {!projectid ? "New Project" : "Project - " + projectname}
              </span>
            </span>
            {userRole == "User" || !projectid ? null : (
              <ProjectAssignScreen
                projectid={projectid}
                projectname={projectname}
                projectTasks={taskRowObjects}
                updateMainScreen={toggleAssignSave}
              />
            )}
          </div>
          <div className="flex items-center justify-center p-2">
            <div className="mx-auto w-full flex flex-wrap">
              <div
                className={
                  userRole == "User"
                    ? "pointer-events-none mx-auto w-full flex flex-wrap gap-2 sm:flex-nowrap flex-col"
                    : "mx-auto w-full flex flex-wrap gap-2 sm:flex-nowrap flex-col"
                }
              >
                <div className="mx-auto w-full flex flex-wrap gap-2 sm:flex-nowrap">
                  <div className="w-full sm:w-1/4">
                    <NextAutoFocusTextInputField
                      label="Project Name"
                      value={projectname}
                      onChange={(e) => setProjectname(e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <NextDateInputField
                      label="Start Date"
                      value={startdate}
                      onChange={(e) => setStartdate(e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <NextDateInputField
                      label="End Date"
                      value={enddate}
                      onChange={(e) => setEnddate(e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <NextSelectInputField
                      label="Project Status"
                      value={projectstatus}
                      onChange={(e) =>
                        handleSelectChangeEvent(
                          e,
                          setProjectstatus,
                          projectstatus
                        )
                      }
                      optionValues={statusOptionValues}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-4 w-full mt-3">
                    <NextAreaTextInputField
                      label="Project Description"
                      value={projectdescription}
                      onChange={(e) => setProjectdescription(e.target.value)}
                    />
                    {/* <label
                    htmlFor="projectdescription"
                    className="mb-3 block text-base font-medium text-[#07074D]"
                  >
                    Project Description
                  </label>
                  <div className="mt-2 sm:w-5/5">
                    <textarea
                      id="projectdescription"
                      name="projectdescription"
                      rows={2}
                      // cols={40}
                      value={projectdescription}
                      onChange={(e) => setProjectdescription(e.target.value)}
                      className="p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                  </div> */}
                  </div>
                </div>
              </div>
              <div className="flex px-3 w-full items-center justify-center">
                <span className="text-xl font-semibold leading-none text-gray-900 select-none mr-2 pt-1">
                  <span className="text-indigo-600">Task list</span>
                </span>
                <div className="mr-auto">
                  <Input
                    autoFocus
                    isClearable
                    startContent={
                      <FaSearch className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                    color="primary"
                    label=""
                    placeholder="Type to search..."
                    variant="flat"
                    value={search}
                    onChange={(e) => searchEvent(e)}
                    onClear={() => setSearch("")}
                  />
                </div>
                <div className={userRole == "User" ? "hidden" : "ml-auto"}>
                  <NewProjectTask
                    arrayUpdateFuntion={updateTaskRowObjectArray}
                    buttonName="New task"
                  />
                </div>
              </div>
              <div className="w-full max-h-[400px] overflow-y-auto">
                <ProjectTaskTable
                  taskRowObjects={taskRowObjects}
                  arrayUpdateFuntion={updateTaskRowObjectArray}
                />
              </div>
              {/* {JSON.stringify(taskRowObjects)} */}
              <div className="flex px-3 w-full mt-2">
                <div
                  className={
                    userRole == "User" || !projectid ? "hidden" : "ml-auto"
                  }
                >
                  <IconConfirmAlertbox
                    buttonName="Delete"
                    leftButtonAction={deleteAction}
                    description="Do you want to delete this record ?"
                  />
                </div>
                <div
                  className={
                    userRole == "User" || !projectid ? "ml-auto" : "ml-3"
                  }
                >
                  <ConfirmAlertbox
                    buttonName="Cancel"
                    leftButtonAction={cancelButton}
                    description="Do you want cancel?"
                  />
                </div>

                <div className={userRole == "User" ? "hidden" : "ml-3"}>
                  <Button color="success" onClick={submitButtonHandler}>
                    Save
                  </Button>
                </div>

                {/* <div className={showDelButton ? "flex ml-auto" : "flex ml-auto hidden"}>
                <ConfirmAlertbox buttonName="Delete" leftButtonAction={deleteAction} title="Are you sure?" description="Do you want to delete this record ?" />
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WithRole>
  );
}
