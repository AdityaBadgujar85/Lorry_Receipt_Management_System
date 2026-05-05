import { useState, useEffect } from "react";
import axios from "axios";
import { MdClose, MdCloudUpload } from "react-icons/md";

const ExpenseModel = ({ setOpenModel, id, editMode, editData, refreshData }) => {

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    amount: "",
    uploadReceipt: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNameDisplay, setFileNameDisplay] = useState("Choose File...");

  useEffect(() => {
    if (editMode && editData) {
      setFormData({
        date: editData.date?.slice(0, 10) || "",
        description: editData.description || "",
        amount: editData.amount || "",
        uploadReceipt: editData.uploadReceipt || "",
      });

      setFileNameDisplay(editData.uploadReceipt || "Choose File...");
      setSelectedFile(null);
    }
  }, [editMode, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setFileNameDisplay(file.name);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (selectedFile) {
        data.append("receipt", selectedFile); // ✅ multer fix
      }

      const API_URL = "http://localhost:8000/expense";

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (editMode) {
        await axios.put(`${API_URL}/${id}`, data, config);
      } else {
        await axios.post(API_URL, data, config);
      }

      refreshData();
      setOpenModel(false);

    } catch (error) {
      console.error("Expense Error:", error);
      alert(error.response?.data?.message || "Failed to save expense");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0E334D]/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

        {/* HEADER */}
        <div className="bg-[#0E334D] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">
              {editMode ? "Edit Expense" : "Add Expense"}
            </h3>
            <p className="text-blue-200 text-xs mt-1">
              Record your expense details
            </p>
          </div>

          <button
            onClick={() => setOpenModel(false)}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 bg-white overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* DATE */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              />
            </div>

            {/* AMOUNT */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                placeholder="₹ 0.00"
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold text-[#0E334D]"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                placeholder="Enter expense description"
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
              />
            </div>

            {/* FILE */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                Receipt (PDF/JPG)
              </label>

              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="w-full px-4 py-2.5 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl flex items-center gap-2 text-blue-600 text-sm font-medium group-hover:bg-blue-50 transition-all">
                  <MdCloudUpload size={20} />
                  <span className="truncate">{fileNameDisplay}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button
            onClick={() => setOpenModel(false)}
            className="px-6 py-2.5 text-gray-400 font-bold hover:text-gray-600"
          >
            Discard
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#0E334D] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#1a4a6d] active:scale-95 transition-all"
          >
            {editMode ? "Update Expense" : "Save Expense"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExpenseModel;