import axios from "axios";
import { useEffect, useState } from "react";
import { MdModeEdit, MdDelete, MdAdd, MdPrint } from "react-icons/md";
import LRCertificate from "../Homepage/LR";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const LR_Page = () => {
  const URL = "http://localhost:8000/lrdata";
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [panel, setPanel] = useState(null);
  const [search, setSearch] = useState("");

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await axios.get(URL);
      // 🔥 Ensure compatibility with new backend status logic
      const formattedData = (res.data.data || []).map((item) => ({
        ...item,
        status: item.status || "UNASSIGNED",
        trip_id: item.trip_id || null,
      }));
      setData(formattedData);
    } catch (error) {
      console.log("Failed to fetch LR data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 CLOSE PANEL
  useEffect(() => {
    const close = () => setPanel(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ================= ACTIONS (WITH SYNC PROTECTION) =================
  const handleEdit = (item) => {
    // Prevent editing if LR is already billed (locks data integrity)
    if (item.status === "BILLED") {
      alert("This LR is already billed and cannot be edited.");
      return;
    }
    setEditData(item);
    setOpenModal(true);
  };

  const handleDelete = async (item) => {
    // 🔥 SYNC BUG FIX: Prevent deleting LRs that are inside a Trip
    if (item.status !== "UNASSIGNED") {
      alert(`Cannot delete: This LR is currently ${item.status}. Remove it from the Trip first.`);
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this LR?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${URL}/${item._id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete LR");
    }
  };

  const handlePrint = (item) => {
    navigate("/print", {
      state: { data: item, type: "LR" },
    });
  };

  // ================= UTILS =================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "BILLED": return "bg-purple-100 text-purple-700 border-purple-200";
      case "ASSIGNED": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // 🔥 PANEL POSITION
  const handleCellClick = (e, value) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const panelWidth = 300;
    const gap = 10;
    let x = rect.right + gap;
    if (x + panelWidth > window.innerWidth) {
      x = rect.left - panelWidth - gap;
    }
    setPanel({ value: value || "-", x, y: rect.top });
  };

  // 🔥 FILTER
  const filteredData = data.filter((item) => {
    const text = search.toLowerCase();
    return (
      item.lr_no?.toLowerCase().includes(text) ||
      item.to?.toLowerCase().includes(text) ||
      item.truck_number?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="w-full px-6 py-8 bg-[#F8FAFC] min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-3xl font-extrabold text-[#0E334D] tracking-tight">
          LR Management
        </h2>

        <button
          onClick={() => { setEditData(null); setOpenModal(true); }}
          className="bg-[#0E334D] flex items-center gap-2 hover:bg-[#1a4a6d] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg"
        >
          <MdAdd size={20} />
          Add New LR
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by LR No, Destination, or Truck No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 shadow rounded-lg text-sm outline-none focus:border-blue-200 focus:shadow-blue-200"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-550">
            <thead className="bg-[#0E334D] text-white">
              <tr className="text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                <th className="px-6 py-5 sticky left-0 bg-[#0E334D] z-10">Actions</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-4 py-5">LR No</th>
                <th className="px-4 py-5">LR Date</th>
                <th className="px-4 py-5">E Waybill No</th>
                <th className="px-4 py-5">E-Waybill Exp</th>
                <th className="px-4 py-5">From</th>
                <th className="px-4 py-5">To</th>
                <th className="px-4 py-5">Consignor</th>
                <th className="px-4 py-5">Consignor GST</th>
                <th className="px-4 py-5">Consignee</th>
                <th className="px-4 py-5">Consignee GST</th>
                <th className="px-4 py-5 text-center">Articles</th>
                <th className="px-4 py-5">Description</th>
                <th className="px-4 py-5">Actual Wt.</th>
                <th className="px-4 py-5">Charged Wt.</th>
                <th className="px-4 py-5">Invoice No</th>
                <th className="px-4 py-5">Truck No</th>
                <th className="px-4 py-5">Shipment Doc</th>
                <th className="px-4 py-5">Shipment Cost</th>
                <th className="px-4 py-5">Declared Val</th>
              </tr>
            </thead>

            <tbody className="text-[11px] text-gray-800">
              {filteredData.map((item, index) => (
                <tr key={item._id} className={`hover:bg-blue-50/50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                  
                  {/* ACTIONS */}
                  <td className="px-6 py-4 sticky left-0 bg-inherit z-10 border-r border-gray-50">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className={`p-2 rounded-xl transition-all ${item.status === "BILLED" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-[#0E334D] hover:text-white"}`}
                      >
                        <MdModeEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item)} 
                        className={`p-2 rounded-xl transition-all ${item.status !== "UNASSIGNED" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-red-500 hover:text-white"}`}
                      >
                        <MdDelete size={14} />
                      </button>
                      <button onClick={() => handlePrint(item)} className="p-2 rounded-xl bg-gray-200 hover:bg-green-600 hover:text-white">
                        <MdPrint size={14} />
                      </button>
                    </div>
                  </td>

                  {/* SYNC STATUS BADGE */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-lg border text-[9px] font-bold ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  <td onClick={(e)=>handleCellClick(e,item.lr_no)} className="px-4 py-4 truncate max-w-30 font-bold text-[#0E334D]">{item.lr_no || "-"}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{formatDate(item.lr_date)}</td>
                  <td onClick={(e)=>handleCellClick(e,item.e_waybill_no)} className="px-4 py-4 truncate max-w-35">{item.e_waybill_no || "-"}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{formatDate(item.e_waybill_exp_date)}</td>
                  <td onClick={(e)=>handleCellClick(e,item.from)} className="px-4 py-4 truncate max-w-30">{item.from || "-"}</td>
                  <td onClick={(e)=>handleCellClick(e,item.to)} className="px-4 py-4 truncate max-w-30">{item.to || "-"}</td>
                  <td onClick={(e)=>handleCellClick(e,item.consignor_ms)} className="px-4 py-4 truncate max-w-45">{item.consignor_ms || "-"}</td>
                  <td className="px-4 py-4 uppercase">{item.consignor_GST || "-"}</td>
                  <td onClick={(e)=>handleCellClick(e,item.consignee_ms)} className="px-4 py-4 truncate max-w-45">{item.consignee_ms || "-"}</td>
                  <td className="px-4 py-4 uppercase">{item.consignee_GST || "-"}</td>

                  <td className="px-4 py-4 text-center">
                    {item.goods?.map((g,i)=>(<div key={i}>{g.no_of_article||"-"}</div>))}
                  </td>

                  <td onClick={(e)=>handleCellClick(e,item.goods?.map(g=>g.description).join(", "))} className="px-4 py-4 truncate max-w-50">
                    {item.goods?.map((g,i)=>(<div key={i} className="truncate">{g.description||"-"}</div>))}
                  </td>

                  <td className="px-4 py-4">{item.weight_actual||"-"}</td>
                  <td className="px-4 py-4">{item.weight_charged||"-"}</td>
                  <td onClick={(e)=>handleCellClick(e,item.invoice_number)} className="px-4 py-4 truncate max-w-30">{item.invoice_number||"-"}</td>
                  <td className="px-4 py-4 uppercase">{item.truck_number||"-"}</td>
                  <td onClick={(e)=>handleCellClick(e,item.shipment_document_no)} className="px-4 py-4 truncate max-w-30">{item.shipment_document_no||"-"}</td>
                  <td className="px-4 py-4">{item.shipment_cost?`₹${item.shipment_cost}`:"-"}</td>
                  <td className="px-4 py-4">{item.declare_value?`₹${item.declare_value}`:"-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANEL */}
      {panel && (
        <div className="fixed z-9999 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 text-sm text-gray-700 w-80 wrap-break-word whitespace-pre-wrap"
          style={{ top: panel.y, left: panel.x }}>
          {panel.value}
        </div>
      )}

      {/* MODAL */}
      {openModal && (
        <LRCertificate
          closeModal={() => {
            setOpenModal(false);
            setEditData(null);
          }}
          refreshData={fetchData}
          editData={editData}
        />
      )}
    </div>
  );
};

export default LR_Page;