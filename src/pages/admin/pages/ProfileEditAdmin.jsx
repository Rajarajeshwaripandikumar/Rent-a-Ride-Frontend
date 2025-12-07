import { useState } from "react";
import Modal from "../components/CustomModal";
import { TbEditCircle } from "react-icons/tb";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import {
  editUserProfile,
  setUpdated,
  signInSuccess,
} from "../../../redux/user/userSlice"; // ⭐ use user slice, same as normal profile
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import defaultAvatar from "../../../assets/default-avatar.png";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

const getProfileImageUrl = (raw) => {
  if (!raw) return defaultAvatar;
  if (raw.startsWith("http")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
};

const ProfileEditAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 👇 admin is still a "user" with isAdmin flag → data lives in user.currentUser
  const { username, email, phoneNumber, adress, _id, profilePicture } =
    useSelector((state) => state.user.currentUser || {});

  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file (png / jpg).");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const editProfileData = async (formValues, id) => {
    try {
      setSaving(true);

      // remove empty-string values (for optional password fields)
      const filteredValues = {};
      Object.entries(formValues || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          filteredValues[k] = v;
        }
      });

      if (file) {
        const formData = new FormData();
        Object.entries(filteredValues).forEach(([k, v]) => {
          formData.append(k, v);
        });
        formData.append("image", file);

        // optimistic update in user slice
        try {
          dispatch(editUserProfile({ ...(filteredValues || {}) }));
        } catch (e) {
          // ignore
        }

        const res = await fetch(`/api/user/editUserProfile/${id}`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Update failed");
        }

        const data = await res.json();
        const returnedUser = data?.currentUser || data || {};
        dispatch(signInSuccess(returnedUser));
        dispatch(setUpdated(true));
        toast.success("Admin profile updated successfully");
        return { success: true };
      } else {
        const payload = { ...filteredValues };
        dispatch(editUserProfile({ ...payload }));

        const res = await fetch(`/api/user/editUserProfile/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: payload }),
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Update failed");
        }

        const data = await res.json();
        const returnedUser = data?.currentUser || data || {};
        dispatch(signInSuccess(returnedUser));
        dispatch(setUpdated(true));
        toast.success("Admin profile updated successfully");
        return { success: true };
      }
    } catch (error) {
      console.error("Admin profile update error:", error);
      toast.error(error?.message || "Failed to update admin profile");
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data) => {
    const { currentPassword, newPassword, confirmNewPassword } = data;
    const isTryingToChangePassword =
      currentPassword || newPassword || confirmNewPassword;

    if (isTryingToChangePassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        toast.error("Please fill all password fields to change password.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password should be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        toast.error("New passwords do not match.");
        return;
      }
    }

    const result = await editProfileData(data, _id);
    if (result?.success) {
      setFile(null);
      setPreview(null);
      reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setIsModalOpen(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setIsModalOpen(false);
      setFile(null);
      setPreview(null);
      reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  };

  return (
    <>
      {/* Trigger icon in navbar/header */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="
          inline-flex items-center justify-center
          rounded-full
          p-1.5
          border border-transparent
          text-[#4B5563]
          hover:text-white
          hover:bg-[#0071DC]
          transition-colors
        "
        title="Edit admin profile"
      >
        <TbEditCircle className="text-xl" />
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        className="
          bg-white
          rounded-2xl
          border border-[#E5E7EB]
          shadow-xl
          max-w-[600px]
          w-full
        "
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 sm:px-8 py-6 sm:py-7">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-lg sm:text-xl text-[#0F172A]">
                  Edit Admin Profile
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                  Update your admin account details and password.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5 my-6">
              {/* Image picker + preview */}
              <div className="flex items-center gap-4">
                <div className="h-[84px] w-[84px] rounded-full border border-gray-200 shadow-sm overflow-hidden bg-gray-50">
                  <img
                    src={preview || getProfileImageUrl(profilePicture)}
                    alt="Admin avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">
                    Profile image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="text-sm"
                  />
                  <div className="text-xs text-gray-400">
                    JPG/PNG, max 5MB. Square images look best.
                  </div>
                </div>
              </div>

              {/* Basic info */}
              <TextField
                id="username"
                label="Full Name"
                variant="outlined"
                defaultValue={username}
                {...register("username")}
                className="w-full"
              />

              <TextField
                id="email"
                label="Email"
                variant="outlined"
                defaultValue={email}
                {...register("email")}
                className="w-full"
              />

              <TextField
                id="phoneNumber"
                label="Phone"
                type="number"
                variant="outlined"
                defaultValue={phoneNumber}
                {...register("phoneNumber")}
                className="w-full"
              />

              <TextField
                id="adress"
                label="Address"
                multiline
                rows={4}
                defaultValue={adress}
                {...register("adress")}
                className="w-full"
              />

              {/* Change Password */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-[#111827] mb-3">
                  Change Password (optional)
                </h3>
                <div className="flex flex-col gap-3">
                  <TextField
                    id="currentPassword"
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    {...register("currentPassword")}
                    className="w-full"
                  />
                  <TextField
                    id="newPassword"
                    label="New Password"
                    type="password"
                    variant="outlined"
                    {...register("newPassword")}
                    className="w-full"
                  />
                  <TextField
                    id="confirmNewPassword"
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    {...register("confirmNewPassword")}
                    className="w-full"
                  />
                  <p className="text-[11px] text-gray-400">
                    Leave these fields empty if you don&apos;t want to change
                    your password.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                className="
                  px-4 sm:px-5
                  py-2
                  rounded-full
                  border border-[#E5E7EB]
                  bg-white
                  text-sm font-medium
                  text-[#374151]
                  hover:bg-[#F3F4F6]
                  transition-colors
                "
                onClick={handleClose}
                disabled={saving}
              >
                Close
              </button>

              <button
                type="submit"
                className={`
                  px-4 sm:px-5
                  py-2
                  rounded-full
                  text-sm font-semibold
                  text-white
                  transition-colors
                  ${saving ? "bg-gray-400" : "bg-[#0071DC] hover:bg-[#0654BA]"}
                `}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProfileEditAdmin;
