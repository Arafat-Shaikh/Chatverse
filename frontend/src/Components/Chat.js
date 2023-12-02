import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  checkUserAsync,
  logoutUserAsync,
  resetNotification,
  selectNotification,
  selectUserDetails,
} from "../features/slices/userSlice";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import { AppContext } from "../Context/socketContext";

const groups = [
  { name: "tech" },
  { name: "education" },
  { name: "general" },
  { name: "news" },
  { name: "football" },
];

export default function Chat() {
  const user = useSelector(selectUserDetails);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const { socket } = useContext(AppContext);
  const [allUsers, setAllUsers] = useState("");
  const [section, setSection] = useState("groups");
  const [person, setPerson] = useState("");
  const [roomMessages, setRoomMessages] = useState("");
  const scrollToMessage = useRef();
  const notification = useSelector(selectNotification);

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  function scrollToBottom() {
    scrollToMessage.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }

  function joinRoom(room) {
    if (!user) {
      return alert("Try Login");
    }
    socket.emit("join-room", currentRoom, room);
    setCurrentRoom(room);
    dispatch(resetNotification(room));
  }

  socket.off("join-room").on("join-room", (payload) => {
    console.log(payload);
  });

  socket.off("room-messages").on("room-messages", (payload) => {
    console.log(payload);
    setRoomMessages(payload);
  });

  socket.off("new-user").on("new-user", (payload) => {
    setAllUsers(payload);
  });

  function privateMessage(receiver) {
    if (!user) return;
    const roomId1 = receiver.id + "-" + user.id;
    const roomId2 = user.id + "-" + receiver.id;
    let room;
    if (roomId1 > roomId2) {
      console.log(roomId1);
      room = roomId1;
    } else {
      room = roomId2;
    }
    setPerson(receiver.id);
    socket.emit("join-room", currentRoom, room);
    dispatch(resetNotification(room));
    setCurrentRoom(room);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      alert("Please Login");
    } else {
      const date = getFormattedDateAndTime().date;
      const time = getFormattedDateAndTime().time;
      socket.emit(
        "create-message",
        message,
        {
          email: user.email,
          id: user.id,
          name: user.name,
          picture: user.picture,
        },
        currentRoom,
        date,
        time
      );
    }
    setMessage("");
  }

  socket.off("notifications").on("notifications", (payload) => {
    console.log(payload);
    dispatch(addNotification(payload));
  });

  function getFormattedDateAndTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString();
    const day = date.getDate().toString();
    const fullDate =
      (day < 10 ? "0" + day : day) +
      "/" +
      (month < 10 ? "0" + month : month) +
      "/" +
      year;
    const minutes =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    const time = date.getHours() + ":" + minutes;

    return { date: fullDate, time: time };
  }

  useEffect(() => {
    if (user) {
      socket.emit("new-user");
      socket.emit("join-room", "", "general");
      setCurrentRoom("general");
    }
  }, []);

  return (
    <>
      {!user && <Navigate to={"/login"} replace={true} />}
      <div className="flex h-screen">
        <div className="bg-gray-800 w-1/4 flex flex-col">
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <div className="text-green-600 font-bold flex gap-2 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                </svg>
                ChatVerse
              </div>
              <div className="flex items-center mr-4 bg-gray-850 px-2 py-1 rounded-md cursor-pointer min-w-max">
                <img
                  className="w-8 h-8 rounded-full"
                  src={user.picture}
                  alt={user.id}
                />
                <p className="ml-2 text-yellow-600">{user.name}</p>
              </div>
            </div>
            <div
              // onClick={() => onClick(id)}
              className={
                "border-b border-gray-800 flex items-center gap-2 cursor-pointer relative" +
                (true ? "bg-gray-800" : "")
              }
            >
              <div className="relative flex max-w-[500px] h-full w-full flex-col rounded-[10px] bg-gray-600 bg-clip-border dark:!bg-navy-800 dark:text-white">
                <div className="flex h-fit w-full items-center justify-between bg-gray-900 px-4 pb-[20px] pt-4 dark:!bg-navy-700">
                  <button
                    onClick={() =>
                      setSection(section === "users" ? "group" : "users")
                    }
                    className="linear rounded-[20px] bg-lightPrimary px-4 py-2 text-base font-medium text-brand-500 transition duration-200 hover:bg-gray-500 bg-gray-700 active:bg-gray-200 dark:bg-white/5 text-white dark:hover:bg-white/10 dark:active:bg-white/20"
                  >
                    {section === "users" ? "Groups" : "Users"}
                  </button>
                </div>
                <div className="w-full overflow-x-scroll px-4 md:overflow-x-hidden">
                  <table role="table" className="w-full overflow-x-scroll">
                    <tbody role="rowgroup" className="px-4">
                      {section === "users"
                        ? allUsers &&
                          allUsers
                            .filter((u) => u.id !== user.id)
                            .map((u, idx) => (
                              <tr role="row " key={idx}>
                                <td
                                  className={`py-3 text-sm hover:bg-gray-500 cursor-pointer rounded-md px-2 ${
                                    person === u.id ? "bg-gray-700" : ""
                                  }`}
                                  role="cell"
                                  onClick={() => privateMessage(u)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-[30px] w-[30px] rounded-full">
                                      <img
                                        src={u.picture}
                                        className="h-full w-full rounded-full"
                                        alt={u.id}
                                      />
                                    </div>
                                    <p className="text-sm font-medium text-gray-300 dark:text-white">
                                      {u.name}
                                    </p>
                                    <span className="bg-yellow-700 rounded-full px-2 ">
                                      {notification[u.name]
                                        ? notification[u.name]
                                        : ""}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))
                        : groups.map((group, index) => (
                            <tr role="row" key={index}>
                              <td
                                onClick={() => joinRoom(group.name)}
                                className={`py-3 text-sm hover:bg-gray-500 cursor-pointer rounded-md px-2 ${
                                  currentRoom === group.name
                                    ? "bg-gray-700"
                                    : ""
                                }`}
                                role="cell"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-300 dark:text-white">
                                    {group.name}
                                  </p>
                                  <span className="bg-yellow-700 rounded-full px-2 ">
                                    {notification[group.name]
                                      ? notification[group.name]
                                      : ""}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch(logoutUserAsync())}
              className="absolute bottom-4 left-4 bg-yellow-700 px-2 rounded-md hover:bg-yellow-600 text-black"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex flex-col bg-gray-700 w-3/4 p-2">
          <div className="flex-grow">
            {true && (
              <div className="relative h-full ">
                <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                  <div className="px-8">
                    {roomMessages &&
                      roomMessages.map((room, idx) => (
                        <div key={idx}>
                          <div className="flex justify-center mt-6 mb-10">
                            <p className="bg-yellow-700 rounded-md px-2">
                              {room._id}
                            </p>
                          </div>
                          {room.messagesByDate.map((msg, idx) => (
                            <div
                              key={idx}
                              className={
                                msg.from.email === user.email
                                  ? "text-right"
                                  : "text-left "
                              }
                            >
                              <div
                                className={
                                  "text-left inline-block px-2 pb-0 my-1 rounded-md text-sm break-all " +
                                  (msg.from.email === user.email
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-800 text-white")
                                }
                              >
                                <div className="flex items-center">
                                  <img
                                    className="w-7 h-7 rounded-full mt-1"
                                    src={msg.from.picture}
                                    alt={msg.from.id}
                                  />
                                  <span className="ml-2 text-yellow-600 text-xs font-semibold">
                                    {msg.from.email === user.email
                                      ? "You"
                                      : msg.from.name}
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                  </span>
                                </div>
                                {msg.message}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <p className="text-tiny font-semibold text-yellow-600 text-right">
                                  {msg.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                  <div ref={scrollToMessage}></div>
                </div>
              </div>
            )}
          </div>
          {true && (
            <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
              <input
                type="text"
                value={message}
                onChange={(ev) => setMessage(ev.target.value)}
                placeholder="Type your message here"
                className="bg-gray-800 flex-grow rounded-md p-2 focus:outline-none text-white"
              />

              <button
                type="submit"
                className="bg-yellow-600 p-2 text-white rounded-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// function extras() {
//   return (
//     <div className="h-screen">
//       <Navbar />
//       <div className="flex h-[620px]">
//         <div className="bg-gray-800 w-1/4 flex flex-col">
//           <div className="flex-grow">
//             <div className="flex flex-col h-full justify-center items-center">
//               <div className="relative flex max-w-[500px] h-full w-full flex-col rounded-[10px] bg-gray-600 bg-clip-border dark:!bg-navy-800 dark:text-white">
//                 <div className="flex h-fit w-full items-center justify-between bg-gray-900 px-4 pb-[20px] pt-4 dark:!bg-navy-700">
//                   <button
//                     onClick={() =>
//                       setSection(section === "users" ? "group" : "users")
//                     }
//                     className="linear rounded-[20px] bg-lightPrimary px-4 py-2 text-base font-medium text-brand-500 transition duration-200 hover:bg-gray-500 bg-gray-700 active:bg-gray-200 dark:bg-white/5 text-white dark:hover:bg-white/10 dark:active:bg-white/20"
//                   >
//                     {section === "users" ? "Groups" : "Users"}
//                   </button>
//                 </div>
//                 <div className="w-full overflow-x-scroll px-4 md:overflow-x-hidden">
//                   <table role="table" className="w-full overflow-x-scroll">
//                     <tbody role="rowgroup" className="px-4">
//                       {section === "users"
//                         ? allUsers &&
//                           allUsers
//                             .filter((u) => u.id !== user.id)
//                             .map((u, idx) => (
//                               <tr role="row " key={idx}>
//                                 <td
//                                   className={`py-3 text-sm hover:bg-gray-500 cursor-pointer rounded-md px-2 ${
//                                     person === u.id ? "bg-gray-700" : ""
//                                   }`}
//                                   role="cell"
//                                   onClick={() => privateMessage(u)}
//                                 >
//                                   <div className="flex items-center gap-2">
//                                     <div className="h-[30px] w-[30px] rounded-full">
//                                       <img
//                                         src={u.picture}
//                                         className="h-full w-full rounded-full"
//                                         alt={u.id}
//                                       />
//                                     </div>
//                                     <p className="text-sm font-medium text-gray-300 dark:text-white">
//                                       {u.name}
//                                     </p>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))
//                         : groups.map((group, index) => (
//                             <tr role="row" key={index}>
//                               <td
//                                 onClick={() => joinRoom(group.name)}
//                                 className={`py-3 text-sm hover:bg-gray-500 cursor-pointer rounded-md px-2 ${
//                                   currentRoom === group.name
//                                     ? "bg-gray-700"
//                                     : ""
//                                 }`}
//                                 role="cell"
//                               >
//                                 <div className="flex items-center gap-2">
//                                   <p className="text-sm font-medium text-gray-300 dark:text-white">
//                                     {group.name}
//                                   </p>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col bg-gray-700 w-3/4 p-2 px-6">
//           <div className="flex-grow overflow-y-scroll overflow-x-clip">
//             <div className="flex h-full flex-grow ">
//               <div className="text-gray-300 ">
//                 {roomMessages &&
//                   roomMessages.map((room) => (
//                     <>
//                       <div className="bg-yellow-700 text-gray-900 px-2 rounded-md mb-10">
//                         {room._id}
//                       </div>
//                       <div className="mb-10 ">
//                         {room.messagesByDate.map((msg, idx) => (
//                           <div
//                             key={idx}
//                             className={
//                               true === true ? "text-right" : "text-left"
//                             }
//                           >
//                             <div
//                               className={
//                                 "text-left inline-block p-2 my-2 rounded-md text-sm " +
//                                 (true === true
//                                   ? "bg-blue-500 text-white"
//                                   : "bg-white text-gray-500")
//                               }
//                             >
//                               {msg.message}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   ))}
//               </div>
//             </div>
//             <div ref={scrollToMessage} />
//           </div>

//           <form
//             className="flex gap-2 mb-4 mt-2"
//             onSubmit={(e) => handleSubmit(e)}
//           >
//             <input
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               type="text"
//               placeholder="Type your message here"
//               className="focus:outline-none text-white flex-grow  rounded-md bg-gray-950 p-2"
//             />
//             <button
//               type="submit"
//               className="bg-green-500 p-2 text-white rounded-sm"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className="w-6 h-6"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
//                 />
//               </svg>
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
