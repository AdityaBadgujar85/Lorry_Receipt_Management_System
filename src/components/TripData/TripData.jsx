import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { MdModeEdit, MdDelete, MdAdd } from "react-icons/md";
import Model from "../UI/Model";

const Tripdata = () => {
  const [data, setData] = useState([]);
  const [openModel, setOpenModel] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper to handle weights with commas or units (e.g., "1,200 kg" -> 1200)
  const cleanNumber = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^\d.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  const fetchData = useCallback(async () => {
    try {
      const [tripRes, lrRes] = await Promise.all([
        axios.get("http://localhost:8000/tripdata"),
        axios.get("http://localhost:8000/lrdata")
      ]);

      const trips = tripRes.data.data || [];
      const lrs = lrRes.data.data || [];

      const groupedData = trips.map((trip) => {
        const associatedLrs = lrs.filter(lr => {
          const lrTripId = typeof lr.trip_id === 'object' ? lr.trip_id?._id : lr.trip_id;
          return lrTripId === trip._id;
        });

        return {
          ...trip,
          nested_lrs: associatedLrs
        };
      });

      setData(groupedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this entire trip record?")) return;
    try {
      await axios.delete(`http://localhost:8000/tripdata/${tripId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleEditClick = (trip) => {
    setEditData(trip);
    setEditMode(true);
    setSelectedId(null);
    setOpenModel(true);
  };

  const handleAddClick = () => {
    setSelectedId(null);
    setEditMode(false);
    setEditData(null);
    setOpenModel(true);
  };

  const filteredData = useMemo(() => {
    const text = search.toLowerCase();
    return data.filter((trip) => (
      trip.broker?.toLowerCase().includes(text) ||
      trip.nested_lrs?.some(lr =>
        lr.lr_no?.toLowerCase().includes(text) ||
        lr.truck_number?.toLowerCase().includes(text)
      )
    ));
  }, [data, search]);

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === "COMPLETED") return "bg-green-100 text-green-700 border-green-200";
    if (s === "PENDING") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s === "PARTIAL") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const newLocal = "px-4 py-5 min-w-112.5 text-center";

  return (
    <div className="w-full px-6 py-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-3xl font-extrabold text-[#0E334D] tracking-tight">
          Trip Data Management
        </h2>
        <button
          onClick={handleAddClick}
          className="bg-[#0E334D] flex items-center gap-2 hover:bg-[#1a4a6d] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all"
        >
          <MdAdd size={20} />
          Add New Trip
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by LR No, Truck No, or Broker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 shadow rounded-lg text-sm outline-none focus:border-blue-200 focus:shadow-blue-200 transition-all"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-450">
            <thead className="bg-[#0E334D] text-white">
              <tr className="text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                <th className="px-6 py-5 sticky left-0 bg-[#0E334D] z-10 text-center">Actions</th>
                <th className={newLocal}>Lorry Receipt Details (Nested)</th>
                <th className="px-4 py-5">Total Weight</th>
                <th className="px-4 py-5">Unloading Date</th>
                <th className="px-4 py-5">Broker</th>
                <th className="px-4 py-5">Freight</th>
                <th className="px-4 py-5">Advance</th>
                <th className="px-4 py-5">Diesel</th>
                <th className="px-4 py-5">Driver Allowance</th>
                <th className="px-4 py-5">Chq/NEFT Adv</th>
                <th className="px-4 py-5">Balance</th>
                <th className="px-4 py-5">Unloading Amt</th>
                <th className="px-4 py-5">Detention</th>
                <th className="px-4 py-5 font-black">Total Balance</th>
                <th className="px-4 py-5">Chq/NEFT Bal</th>
                <th className="px-6 py-5">Payment Status</th>
                <th className="px-4 py-5">LR Remark</th>
                <th className="px-4 py-5">Scanned LR</th>
              </tr>
            </thead>

            <tbody className="text-[11px] text-gray-800">
              {filteredData.map((trip, index) => {
                // Fixed Total Weight calculation logic
                const totalWeight = (trip.nested_lrs || []).reduce((sum, lr) => {
                  return sum + cleanNumber(lr.weight_actual);
                }, 0);

                return (
                  <tr key={trip._id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-gray-50 transition-colors`}>
                    {/* ACTIONS */}
                    <td className="px-6 py-4 sticky left-0 bg-inherit z-10 border-r border-gray-50">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleEditClick(trip)} className="p-2 rounded-xl bg-gray-200 hover:bg-[#0E334D] hover:text-white transition-all shadow-sm">
                          <MdModeEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(trip._id)} className="p-2 rounded-xl bg-gray-200 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <MdDelete size={14} />
                        </button>
                      </div>
                    </td>

                    {/* NESTED LR TABLE CELL */}
                    <td className="px-4 py-4">
                      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px]">
                            <tr className="border-b border-gray-200">
                              <th className="p-2 text-left">LR Date</th>
                              <th className="p-2 text-left">LR No</th>
                              <th className="p-2 text-left">SD no</th>
                              <th className="p-2 text-left">Vehicle No</th>
                              <th className="p-2 text-left">Destination</th>
                              <th className="p-2 text-left">Weight</th>
                            </tr>
                          </thead>
                          <tbody className="text-[11px]">
                            {(trip.nested_lrs || []).map((lr) => (
                              <tr key={lr._id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30">
                                <td className="p-2 whitespace-nowrap">{formatDate(lr.lr_date || lr.createdAt)}</td>
                                <td className="p-2 whitespace-nowrap">{lr.lr_no || "-"}</td>
                                <td className="p-2 whitespace-nowrap">{lr.shipment_document_no ? `${lr.shipment_document_no}` : "-"}</td>
                                <td className="p-2 whitespace-nowrap">{lr.truck_number || "-"}</td>
                                <td className="p-2 whitespace-nowrap">{lr.to || "-"}</td>
                                <td className="p-2 whitespace-nowrap">{lr.weight_actual ? `${lr.weight_actual}` : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>

                    {/* TOTAL WEIGHT COLUMN */}
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-[#0E334D]">
                      {totalWeight > 0 ? totalWeight.toLocaleString('en-IN') : "-"}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">{formatDate(trip.unloading_date)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{trip.broker || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.freight || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.advance || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.diesel || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.driver_allowance || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{trip.check_neft_advance || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.balance || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.unloading_amt || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.detaintion || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">₹{trip.total_balance || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{trip.check_neft_balance || "-"}</td>

                    {/* STATUS BADGE */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex px-2 py-1 rounded-lg text-[9px] border font-bold ${getStatusColor(trip.payment_status)}`}>
                        {trip.payment_status || "PENDING"}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">{trip.lr_remark || "-"}</td>

                    <td className="px-4 py-4 text-center">
                      {trip.scanned_lr ? (
                        <button
                          className="text-gray-900 hover:text-blue-800 font-bold transition-colors"
                          onClick={() => window.open(`http://localhost:8000/file/tripdata/${trip.scanned_lr}`, "_blank")}
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {openModel && (
        <Model
          setOpenModel={setOpenModel}
          id={selectedId}
          editMode={editMode}
          editData={editData}
          refreshData={fetchData}
        />
      )}
    </div>
  );
};

export default Tripdata;