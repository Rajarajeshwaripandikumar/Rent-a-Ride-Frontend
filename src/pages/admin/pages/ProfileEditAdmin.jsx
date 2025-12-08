import { useState } from "react";
import Modal from "../components/CustomModal";
import { TbEditCircle } from "react-icons/tb";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import {
  editUserProfile,
  setUpdated,
  signInSuccess,
} from "../../../redux/user/userSlice";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import defaultAvatar from "../../../assets/default-avatar.png";

// ⭐ use central API wrapper instead of raw fetch
import { api } from "../../../api";

const ProfileEditAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { username, email, phoneNumber, adress, _id, profilePicture } =
    useSelector((state) => state.user.currentUser || {});

  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const getProfileImageUrl = (raw) => {
    if (!raw) return defaultAvatar;
    if (raw.startsWith("http")) return raw;
    return `/uploads/${raw}`;
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const editProfileData = async (formValues, id) => {
    try {
      setSaving(true);

      // Filter empty fields
      const filteredValues = {};
      Object.entries(formValues).forEach(([k, v]) => {
        if (v !== "" && v !== undefined && v !== null) {
          filteredValues[k] = v;
        }
      });

      let updatedUser = null;

      /* ------------------------------------------------------------
         CASE 1: With image upload (multipart/form-data)
      ------------------------------------------------------------ */
      if (file) {
        const formData = new FormData();
        Object.entries(filteredValues).forEach(([k, v]) =>
          formData.append(k, v)
        );
        formData.append("image", file);

        const data = await api.form(
          `/api/user/editUserProfile/${id}`,
          formData
        );

        updatedUser = data?.currentUser || data;
      }

      /* ------------------------------------------------------------
         CASE 2: Without image upload (JSON body)
      ------------------------------------------------------------ */
      else {
        const data = await api.put(`/api/user/editUserProfile/${id}`, {
          formData: filteredValues,
        });
        updatedUser = data?.currentUser || data;
      }

      if (!updatedUser) throw new Error("Invalid server response");

      dispatch(signInSuccess(updatedUser));
      dispatch(setUpdated(true));
      toast.success("Admin profile updated successfully");

      return { success: true };
    } catch (error) {
      console.error("Admin profile update error:", error);
      toast.error(error.message || "Failed to update admin profile");
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data) => {
    const { currentPassword, newPassword, confirmNewPassword } = data;

    const isChangingPassword =
      currentPassword || newPassword || confirmNewPassword;

    if (isChangingPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        toast.error("Fill all password fields.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    const result = await editProfileData(data, _id);

    if (result.success) {
      setFile(null);
      setPreview(null);
      reset();
      setIsModalOpen(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setIsModalOpen(false);
    setFile(null);
    setPreview(null);
    reset();
  };

  return (
    <>
      {/* Open button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="
          inline-flex items-center justify-center
          rounded-full
          p-1.5
          text-[#4B5563]
          hover:text-white
          hover:bg-[#0071DC]
          transition
        "
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
          border border-gray-200
          shadow-xl
          max-w-[600px]
          w-full
        "
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Edit Admin Profile
            </h2>

            <div className="flex flex-col gap-5 mt-6">
              {/* Image Section */}
              <div className="flex items-center gap-4">
                <div className="h-[84px] w-[84px] rounded-full overflow-hidden shadow-sm border bg-gray-50">
                  <img
                    src={preview || getProfileImageUrl(profilePicture)}
                    className="w-full h-full object-cover"
                    alt="profile"
                  />
                </div>

                <div className="flex flex-col text-sm">
                  <label className="text-gray-600">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </div>
              </div>

              {/* Inputs */}
              <TextField
                label="Full Name"
                defaultValue={username}
                {...register("username")}
              />

              <TextField
                label="Email"
                defaultValue={email}
                {...register("email")}
              />

              <TextField
                label="Phone Number"
                type="number"
                defaultValue={phoneNumber}
                {...register("phoneNumber")}
              />

              <TextField
                label="Address"
                multiline
                rows={4}
                defaultValue={adress}
                {...register("adress")}
              />

              {/* Password Section */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Change Password (optional)
                </h3>

                <TextField
                  label="Current Password"
                  type="password"
                  {...register("currentPassword")}
                />

                <TextField
                  label="New Password"
                  type="password"
                  {...register("newPassword")}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  {...register("confirmNewPassword")}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={saving}
                className="
                  px-5 py-2 rounded-full
                  text-white font-semibold
                  bg-[#0071DC]
                  hover:bg-[#0654BA]
                "
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
