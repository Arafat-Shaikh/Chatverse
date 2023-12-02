import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUserAsync,
  selectError,
  selectUserDetails,
  signupUserAsync,
} from "../features/slices/userSlice";
import { Link, Navigate } from "react-router-dom";

export default function Login() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const user = useSelector(selectUserDetails);
  const authError = useSelector(selectError);
  console.log(user);
  console.log(authError);

  const onSubmit = async (data) => {
    console.log(data);
    dispatch(loginUserAsync(data));
  };
  return (
    <>
      {user && <Navigate to={"/"} replace={true} />}
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
        <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
          <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="px-5 py-7"
              noValidate
            >
              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                E-mail
              </label>
              <input
                {...register("email", { required: "email is required" })}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                Password
              </label>
              <input
                {...register("password", { required: "password is required" })}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-2 text-sm w-full"
              />
              {errors.password && (
                <p className="text-red-500 mb-2">{errors.password.message}</p>
              )}
              {!errors.password && authError ? (
                <p className="text-red-500 mb-2">{authError}</p>
              ) : (
                ""
              )}

              <button
                type="submit"
                className="transition duration-200 bg-gray-600 hover:bg-gray-700 focus:bg-gray-800 focus:shadow-sm focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                <span className="inline-block mr-2">Login</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4 inline-block"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
              <p className="text-center text-sm mt-2 ">
                Don't have an account ?{" "}
                <Link className="text-yellow-600" to="/signup">
                  Signup
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
