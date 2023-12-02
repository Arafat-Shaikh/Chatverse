import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Chat from "./Components/Chat";
import Login from "./Components/Login";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkUserAsync } from "./features/slices/userSlice";
import { AppContext } from "./Context/socketContext";
import { socket } from "./Context/socketContext";
import Signup from "./Components/Signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Chat />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

function App() {
  const dispatch = useDispatch();
  axios.defaults.baseURL = "http://localhost:8080";
  axios.defaults.withCredentials = true;

  useEffect(() => {
    dispatch(checkUserAsync());
  }, [dispatch]);

  return (
    <AppContext.Provider value={{ socket }}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}

export default App;
