import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MdClose, MdCloudUpload } from "react-icons/md";

const Model = ({ setOpenModel, id, editMode, refreshData, editData }) => {
  const [formData, setFormData] = useState({
    unloading_date: "",
    broker: "",
    freight: "",
    advance: "",
    diesel: "",
    driver_allowance: "",
    check_neft_advance: "",
    balance: "",
    unloading_amt: "",
    detaintion: "",
    total_balance: "",
    check_neft_balance: "",
    payment_status: "",
    lr_remark: "",
  });

  const [availableLRs, setAvailableLRs] = useState([]);
  const [selectedLRs, setSelectedLRs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNameDisplay, setFileNameDisplay] = useState("Choose File...");

  // Logic Correction: Wrap fetchLRs in useCallback to prevent effect loops
  const fetchLRs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/lrdata");
      const allLrs = res.data.data || [];

      const filtered = allLrs.filter((lr) => {
        const lrTripId = typeof lr.trip_id === "object" ? lr.trip_id?._id : lr.trip_id;
        // Logic: Keep if unassigned OR if it belongs to the trip we are currently editing
        return !lrTripId || (editMode && editData && lrTripId === editData._id);
      });

      setAvailableLRs(filtered);
    } catch (err) {
      console.error("Error fetching LRs", err);
    }
  }, [editMode, editData]);

  useEffect(() => {
    const initializeForm = () => {
      if (editMode && editData) {
        setFormData({
          unloading_date: editData.unloading_date?.slice(0, 10) || "",
          broker: editData.broker || "",
          freight: editData.freight || "",
          advance: editData.advance || "",
          diesel: editData.diesel || "",
          driver_allowance: editData.driver_allowance || "",
          check_neft_advance: editData.check_neft_advance || "",
          balance: editData.balance || "",
          unloading_amt: editData.unloading_amt || "",
          detaintion: editData.detaintion || "",
          total_balance: editData.total_balance || "",
          check_neft_balance: editData.check_neft_balance || "",
          payment_status: editData.payment_status || "",
          lr_remark: editData.lr_remark || "",
        });
        setFileNameDisplay(editData.scanned_lr || "Choose File...");

        // Logic Correction: Extract IDs regardless of whether backend sent objects or strings
        if (editData.lr_ids) {
          const ids = editData.lr_ids.map((item) => (typeof item === "object" ? item._id : item));
          setSelectedLRs(ids);
        } else if (editData.lrs) {
          setSelectedLRs(editData.lrs.map((l) => l._id));
        }
      } else {
        // Reset form for "Add" mode
        if (id) setSelectedLRs([id]);
      }
    };

    initializeForm();
    fetchLRs();
  }, [editMode, editData, id, fetchLRs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Logic Correction: Ensure strings are parsed correctly for calculation
      const freight = parseFloat(updated.freight) || 0;
      const advance = parseFloat(updated.advance) || 0;
      const unloading = parseFloat(updated.unloading_amt) || 0;
      const detaintion = parseFloat(updated.detaintion) || 0;

      const balanceValue = freight - advance;
      const totalBalanceValue = balanceValue + unloading + detaintion;

      // Keep as strings for the state/backend as requested
      updated.balance = balanceValue.toString();
      updated.total_balance = totalBalanceValue.toString();

      return updated;
    });
  };

  const handleLRCheckboxChange = (lrId) => {
    setSelectedLRs((prev) =>
      prev.includes(lrId) ? prev.filter((i) => i !== lrId) : [...prev, lrId]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileNameDisplay(file.name);
    }
  };

  const handleSubmit = async () => {
    if (selectedLRs.length === 0) {
      return alert("Please select at least one LR for this trip.");
    }

    try {
      const data = new FormData();

      // Logic Correction: Ensure all fields are appended to FormData
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value || "");
      });

      // Logic: Send lr_ids as individual items or JSON string based on your Controller expectation
      // Sending as individual fields for Multer/Express to pick up as an array
      selectedLRs.forEach((lrId) => data.append("lr_ids", lrId));

      if (selectedFile) {
        data.append("scanned_lr", selectedFile);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editMode && editData?._id) {
        await axios.put(`http://localhost:8000/tripdata/${editData._id}`, data, config);
      } else {
        await axios.post(`http://localhost:8000/tripdata`, data, config);
      }

      refreshData();
      setOpenModel(false);
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to save trip data.");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0E334D]/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#0E334D] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{editMode ? "Edit Trip Logistics" : "Add Trip Details"}</h3>
            <p className="text-blue-200 text-xs mt-1">Select LRs and record financials</p>
          </div>
          <button onClick={() => setOpenModel(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <MdClose size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 bg-white overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LR Selection Section */}
            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-[10px] uppercase font-bold text-blue-500 ml-1">Assign LRs to this Trip</label>
              <div className="w-full p-3 bg-blue-50/30 border border-blue-100 rounded-xl max-h-37.5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableLRs.map((lr) => (
                  <label
                    key={lr._id}
                    className="flex items-center gap-3 p-2 hover:bg-blue-100/30 rounded-lg cursor-pointer transition-all border border-transparent hover:border-blue-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLRs.includes(lr._id)}
                      onChange={() => handleLRCheckboxChange(lr._id)}
                      className="w-4 h-4 rounded border-blue-300 text-[#0E334D] focus:ring-[#0E334D]"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-bold text-[#0E334D]">{lr.lr_no}</span> | {lr.truck_number}
                    </span>
                  </label>
                ))}
                {availableLRs.length === 0 && <p className="text-xs text-gray-400 p-2">No unassigned LRs available</p>}
              </div>
            </div>

            {/* Financial Inputs */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Unloading Date</label>
              <input type="date" name="unloading_date" value={formData.unloading_date} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Broker Name</label>
              <input type="text" name="broker" value={formData.broker} placeholder="Enter Broker" onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Freight Amount</label>
              <input type="number" name="freight" value={formData.freight} placeholder="0.00" onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-[#0E334D]" />
            </div>

            {[
              { label: "Advance Paid", name: "advance", type: "number" },
              { label: "Diesel", name: "diesel", type: "text" },
              { label: "Driver Allowance", name: "driver_allowance", type: "text" },
              { label: "Advance Mode", name: "check_neft_advance", type: "text" },
              { label: "Balance (Auto)", name: "balance", type: "number", readOnly: true },
              { label: "Unloading Charges", name: "unloading_amt", type: "number" },
              { label: "Detention", name: "detaintion", type: "number" },
              { label: "Total Balance (Auto)", name: "total_balance", type: "number", readOnly: true },
              { label: "Balance Mode", name: "check_neft_balance", type: "text" },
            ].map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  readOnly={f.readOnly}
                  className={`w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm ${f.readOnly ? "bg-gray-100 cursor-not-allowed font-bold" : "bg-gray-50"}`}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Status</label>
              <select name="payment_status" value={formData.payment_status} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                <option value="">Select Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">LR Remark</label>
              <input type="text" name="lr_remark" value={formData.lr_remark} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Scanned LR (PDF/JPG)</label>
              <div className="relative group">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full px-4 py-2.5 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl flex items-center gap-2 text-blue-600 text-sm font-medium group-hover:bg-blue-100/50 transition-all">
                  <MdCloudUpload size={20} />
                  <span className="truncate">{fileNameDisplay}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button onClick={() => setOpenModel(false)} className="px-6 py-2.5 text-gray-400 font-bold hover:text-gray-600 transition-colors">Discard</button>
          <button onClick={handleSubmit} className="bg-[#0E334D] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#1a4b6e] transition-all">
            {editMode ? "Update Trip" : "Save Trip"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Model;