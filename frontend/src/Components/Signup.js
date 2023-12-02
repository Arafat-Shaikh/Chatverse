import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserDetails,
  signupUserAsync,
} from "../features/slices/userSlice";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const user = useSelector(selectUserDetails);
  const [img, setImg] = useState(null);
  const [imgPrev, setImgPrev] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(null);

  const onSubmit = async (data) => {
    console.log(data);
    if (!img) {
      alert("Please upload an Image");
    } else {
      const url = await uploadImg();
      console.log(url);
      dispatch(signupUserAsync({ ...data, picture: url }));
    }
  };

  function validateImage(e) {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Not an image");
    } else {
      setImg(file);
      setImgPrev(URL.createObjectURL(file));
    }
  }

  async function uploadImg() {
    const data = new FormData();
    data.append("file", img);
    data.append("upload_preset", "cloudinary_name");
    try {
      setUploadingImg(true);
      let response = await fetch(
        "https://api.cloudinary.com/v1_1/clouname_here/image/upload",
        {
          method: "post",
          body: data,
        }
      );
      const urlData = await response.json();
      setUploadingImg(false);
      return urlData.url;
    } catch (err) {
      setUploadingImg(false);
      console.log(err);
    }
  }

  return (
    <>
      {user && <Navigate to={"/"} replace={true} />}
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
        <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
          <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
            <div className="text-center">
              <div className="flex justify-center items-center py-2">
                <img
                  className="w-14 h-14 rounded-full"
                  src={
                    imgPrev ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png"
                  }
                />
                <input
                  type="file"
                  id="image-upload"
                  hidden
                  onChange={(e) => validateImage(e)}
                  accept="image/png,image/jpeg"
                />
              </div>

              <label
                htmlFor="image-upload"
                className="ml-4 font-semibold text-yellow-600 cursor-pointer"
              >
                Select Image
              </label>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="px-5 py-7"
              noValidate
            >
              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                Name
              </label>
              <input
                {...register("name", { required: "name is required" })}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              {errors.name && (
                <p className="text-red-500 mb-2">{errors.name.message}</p>
              )}

              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                E-mail
              </label>
              <input
                {...register("email", { required: "email is required" })}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              {errors.email && (
                <p className="text-red-500 mb-2">{errors.email.message}</p>
              )}

              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                Password
              </label>
              <input
                {...register("password", { required: "password is required" })}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              {errors.password && (
                <p className="text-red-500 mb-2">{errors.password.message}</p>
              )}

              <button
                type="submit"
                className="transition duration-200 bg-gray-600 hover:bg-gray-700 focus:bg-gray-800 focus:shadow-sm focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                {uploadingImg ? (
                  <span className="inline-block mr-2">Signing up...</span>
                ) : (
                  <span className="inline-block mr-2">Signup</span>
                )}
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
                Already have an account ?{" "}
                <Link className="text-yellow-500" to="/login">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
