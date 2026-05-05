import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdCheckCircle, MdAddCircleOutline, MdPrint } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

  const BILL_API = "http://localhost:8000/billing";
  const TRIP_API = "http://localhost:8000/tripdata";
  const LR_API = "http://localhost:8000/lrdata"; // ✅ added

  const loadBills = async () => {
    try {
      const res = await axios.get(BILL_API);
      setBills(res.data.data || []);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  // ✅ FIX: attach ALL LRs to each trip
const loadTrips = async () => {
  try {
    const [tripRes, lrRes] = await Promise.all([
      axios.get(TRIP_API),
      axios.get(LR_API)
    ]);

    const tripsData = tripRes.data.data || [];
    const lrData = lrRes.data.data || [];

    const enrichedTrips = tripsData.map(trip => {
      const tripLrs = lrData.filter(lr => {
        const lrTripId =
          typeof lr.trip_id === "object"
            ? lr.trip_id?._id?.toString()
            : lr.trip_id?.toString();

        return lrTripId === trip._id.toString(); // ✅ FIXED
      });

      return {
        ...trip,
        lr_ids: tripLrs
      };
    });

    setTrips(enrichedTrips);
  } catch (err) {
    console.error("Error fetching Trip data:", err);
  }
};

  useEffect(() => {
    loadBills();
    loadTrips();
  }, []);

  const handlePrint = (bill) => {
    navigate("/print", { state: { data: bill, type: "BILL" } });
  };

  const getNum = (val) => {
    if (!val) return 0;
    return parseFloat(String(val).replace(/[^\d.]/g, "")) || 0;
  };

  // ✅ CORE LOGIC
  const calculateTripWeight = (trip) => {
    return (trip.lr_ids || []).reduce((sum, lr) => {
      const cleaned = String(lr.weight_actual || "").replace(/[^\d.]/g, "");
      return sum + (parseFloat(cleaned) || 0);
    }, 0);
  };

  const usedTripIds = useMemo(() => {
    return bills.flatMap(bill => (bill.tripList || []).map(item => item.tripId));
  }, [bills]);

  const filteredTrips = useMemo(() => {
    return trips
      .filter((trip) => {
        const searchTerm = search.toLowerCase();
        const lrNos = trip.lr_ids?.map(l => l.lr_no).join(" ") || "";

        const matchesSearch =
          lrNos.toLowerCase().includes(searchTerm) ||
          trip.broker?.toLowerCase().includes(searchTerm) ||
          trip.lr_ids?.some(l => l.to?.toLowerCase().includes(searchTerm));

        const isInCurrentEdit =
          editData?.tripList?.some((item) => item.tripId === trip._id);

        const allowed =
          trip.billing_status === "NOT_BILLED" || isInCurrentEdit;

        return matchesSearch && allowed;
      })
      .sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)));
  }, [trips, search, editData]);

  const toggleTripAdd = (id) => {
    setSelectedTrips(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // ✅ FIXED mapping
const mapTripToBillItem = (trip, existingItem = null) => {
  const lrNos = trip.lr_ids?.map(l => l.lr_no).join(", ") || "";
const vehicles = trip.lr_ids
  ?.map((l, i, arr) => l.truck_number || arr[i - 1]?.truck_number || arr[0]?.truck_number || "")
  .join(", ") || "";

const destinations = trip.lr_ids
  ?.map((l, i, arr) => l.to || arr[i - 1]?.to || arr[0]?.to || "")
  .join(", ") || "";

const sdNos = trip.lr_ids
  ?.map((l, i, arr) => l.shipment_document_no || arr[i - 1]?.shipment_document_no || arr[0]?.shipment_document_no || "")
  .join(", ") || "";

  const calculatedWeight = calculateTripWeight(trip);

  return {
    tripId: trip._id,
    lr_no: lrNos,
    sd_no: sdNos,
    vehicleNO: vehicles,
    destination: destinations,

    // ✅ ALWAYS from trip
    weight: calculatedWeight,

    // ✅ ONLY editable values
    rate: existingItem ? getNum(existingItem.rate) : 0,
    extraWeight: existingItem ? getNum(existingItem.extraWeight) : 0,
    detention: existingItem ? getNum(existingItem.detention) : 0,

    // ✅ FINAL CORRECT FORMULA
    total: (
      (existingItem ? getNum(existingItem.rate) : 0) +
      (existingItem ? getNum(existingItem.extraWeight) : 0) +
      (existingItem ? getNum(existingItem.detention) : 0)
    ).toFixed(2),

    unloadingdate: trip.unloading_date || "",
    date: trip.createdAt
  };
};
  const toggleTripEdit = (trip) => {
    setEditData(prev => {
      const exists = prev.tripList.find(item => item.tripId === trip._id);
      if (exists) {
        return { ...prev, tripList: prev.tripList.filter(item => item.tripId !== trip._id) };
      } else {
        return { ...prev, tripList: [...prev.tripList, mapTripToBillItem(trip)] };
      }
    });
  };

  const handleInputChange = (tripId, field, value) => {
    setEditData(prev => {
      const updatedTripList = prev.tripList.map(item => {
        if (item.tripId === tripId) {
          const updatedItem = { ...item, [field]: value };
          const r = getNum(updatedItem.rate);
          const ew = getNum(updatedItem.extraWeight);
          const d = getNum(updatedItem.detention);
          updatedItem.total = (r + ew + d).toFixed(2);
          return updatedItem;
        }
        return item;
      });
      return { ...prev, tripList: updatedTripList };
    });
  };

  const openModal = async () => {
    setShowModal(true);
    setSelectedTrips([]);
    setSearch("");
    await loadTrips();
  };

  const handleEdit = async (bill) => {
    await loadTrips();
    const updatedTripList = bill.tripList.map(billItem => {
      const latestTrip = trips.find(t => t._id === billItem.tripId);
      return latestTrip ? mapTripToBillItem(latestTrip, billItem) : billItem;
    });
    setEditData({ ...bill, tripList: updatedTripList });
    setSearch("");
    setEditModal(true);
  };

  const createBill = async () => {
    if (selectedTrips.length === 0) return;
    try {
      const fullTripList = selectedTrips.map(id => {
        const foundTrip = trips.find(t => t._id === id);
        return mapTripToBillItem(foundTrip);
      });

      const grandTotal = fullTripList.reduce((sum, item) => sum + getNum(item.total), 0);

      await axios.post(BILL_API, {
        tripIds: selectedTrips,
        tripList: fullTripList,
        grandTotal: grandTotal.toFixed(2)
      });

      setShowModal(false);
      loadBills();
    } catch {
      alert("Failed to create bill.");
    }
  };

  const saveEdit = async () => {
    try {
      const gTotal = editData.tripList.reduce((sum, i) => sum + getNum(i.total), 0);

      await axios.put(`${BILL_API}/${editData._id}`, {
        ...editData,
        grandTotal: gTotal.toFixed(2)
      });

      setEditModal(false);
      loadBills();
    } catch {
      alert("Update failed");
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    await axios.delete(`${BILL_API}/${id}`);
    loadBills();
  };

  const filteredBills = useMemo(() => {
  const term = search.toLowerCase();

  return bills.filter((bill) => {
    // ✅ match bill id
    const billMatch = bill.billingID?.toLowerCase().includes(term);

    // ✅ match LR inside trips
    const lrMatch = (bill.tripList || []).some((trip) =>
      (trip.lr_no || "")
  .split(",")
  .map(l => l.trim())
  .some(lr => lr === term)
    );

    return billMatch || lrMatch;
  });
}, [bills, search]);

  return (
    <div className="w-full px-6 py-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* ✅ UI EXACT SAME */}
            <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-extrabold text-[#0E334D]">Billing Management</h2>
        <button onClick={openModal} className="bg-[#0E334D] flex items-center gap-2 hover:bg-[#1a4a6d] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all">
          <MdAdd size={20} /> Generate New Bill
        </button>
      </div>
     <input
          type="text"
          placeholder="Search by LR No, Truck No, or Broker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 shadow rounded-lg text-sm outline-none focus:border-blue-200 focus:shadow-blue-200 transition-all"
        />
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-5">
        <table className="w-full text-left">
          <thead className="bg-[#0E334D] text-white text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-5">Bill ID</th>
              <th className="px-4 py-5">Bill Date</th>
              <th className="px-4 py-5 text-center">Nested Trip Data (Details)</th>
              <th className="px-6 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[12px] text-gray-800">
            {filteredBills.map((bill, index) => (
              <tr key={bill._id} className={`border-b border-gray-50 hover:bg-blue-50/20 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                <td className="px-6 py-4 font-bold text-[#0E334D]">{bill.billingID}</td>
                <td className="px-4 py-4">{new Date(bill.date).toLocaleDateString('en-GB')}</td>
                <td className="px-4 py-4">
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-gray-100 text-gray-500 font-bold">
                        <tr className="border-b border-gray-200">
                          <th className="p-2">L.R.NO</th>
                          <th className="p-2">S.D.NO</th>
                          <th className="p-2">VEHICLE NO</th>
                          <th className="p-2">DESTINATION</th>
                          <th className="p-2">UNLOAD DATE</th>
                          <th className="p-2 text-right">WEIGHT</th>
                          <th className="p-2 text-right">RATE</th>
                          <th className="p-2 text-right">EXTRA</th>
                          <th className="p-2 text-right">DETENTION</th>
                          <th className="p-2 text-right text-gray-800">TOTAL</th>
                        </tr>
                      </thead>
<tbody>
  {(bill.tripList || []).map((item, index) => {
    // 🔥 Split comma values back to arrays
    const lrArr = (item.lr_no || "").split(",").map(x => x.trim());
    const sdArr = (item.sd_no || "").split(",").map(x => x.trim());
    const vehicleArr = (item.vehicleNO || "").split(",").map(x => x.trim());
    const destArr = (item.destination || "").split(",").map(x => x.trim());

    const rowCount = lrArr.length;

    return (
      <React.Fragment key={item.tripId}>
        {lrArr.map((lr, i) => (
          <tr
  key={i}
  className={`border-t border-gray-100 hover:bg-gray-50 ${
    i === 0 && index !== 0 ? "border-t-4 border-gray-200" : ""
  }`}
>

            {/* ✅ LR DATA PER ROW */}
            <td className="p-2 font-medium">{lr}</td>
            <td className="p-2">{sdArr[i] || sdArr[i - 1] || sdArr[0] || "-"}</td>
            <td className="p-2 uppercase">{vehicleArr[i] || vehicleArr[i - 1] || vehicleArr[0] || "-"}</td>
            <td className="p-2 uppercase">{destArr[i] || destArr[i - 1] || destArr[0] || "-"}</td>

            {/* ✅ ONLY FIRST ROW SHOWS COMMON DATA */}
            {i === 0 && (
              <>
                <td className="p-2" rowSpan={rowCount}>
                  {item.unloadingdate
                    ? new Date(item.unloadingdate).toLocaleDateString("en-GB")
                    : "-"}
                </td>

                <td className="p-2 text-right" rowSpan={rowCount}>
                  {item.weight}
                </td>

                <td className="p-2 text-right" rowSpan={rowCount}>
                  {item.rate}
                </td>

                <td className="p-2 text-right" rowSpan={rowCount}>
                  ₹{item.extraWeight}
                </td>

                <td className="p-2 text-right" rowSpan={rowCount}>
                  ₹{item.detention}
                </td>

                <td
                  className="p-2 text-right font-bold text-[#0E334D]"
                  rowSpan={rowCount}
                >
                  ₹
                  {parseFloat(item.total).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </>
            )}
          </tr>
        ))}

        {/* ✅ EMPTY ROW BETWEEN TRIPS */}

      </React.Fragment>
    );
  })}
</tbody>
                      <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-200">
                        <tr>
                          <td colSpan="9" className="p-2 text-right text-gray-500 uppercase tracking-tighter">Total Bill Amount:</td>
                          <td className="p-2 text-right text-[#0E334D] text-[11px]">₹{parseFloat(bill.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(bill)} className="p-2 rounded-xl bg-gray-200 text-gray-600 hover:bg-[#0E334D] hover:text-white transition-all"><MdEdit size={16} /></button>
                    <button onClick={() => deleteBill(bill._id)} className="p-2 rounded-xl bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition-all"><MdDelete size={16} /></button>
                    <button onClick={() => handlePrint(bill)} className="p-2 rounded-xl bg-gray-200 text-gray-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"><MdPrint size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0E334D]/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#0E334D] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">New Bill Selection (Trips)</h3>
                <p className="text-blue-200 text-xs mt-1">{selectedTrips.length} Trips Selected</p>
              </div>
              <button onClick={() => setShowModal(false)}><MdClose size={24}/></button>
            </div>
            <div className="p-6 flex flex-col gap-4 overflow-hidden">
              <div className="relative">
                <MdSearch className="absolute left-3 top-3 text-gray-400" size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Trip LRs or Broker..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
              </div>
              <div className="flex-1 overflow-auto rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                    <tr className="text-[10px] uppercase text-gray-400 font-bold">
                      <th className="p-4 w-12 text-center">Select</th>
                      <th className="p-4">LRs in Trip</th>
                      <th className="p-4">Broker</th>
                      <th className="p-4 text-right">Freight Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((trip) => {
                      const isChecked = selectedTrips.includes(trip._id);
                      return (
                        <tr key={trip._id} onClick={() => toggleTripAdd(trip._id)} className={`cursor-pointer border-b border-gray-50 ${isChecked ? 'bg-blue-50/50' : ''}`}>
                          <td className="p-4 text-center">
                             <div className={`mx-auto w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                              {isChecked ? "✓" : ""}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-[#0E334D]">{trip.lr_ids?.map(l => l.lr_no).join(", ")}</div>
                            <div className="text-[10px] text-gray-400">Unloading: {trip.unloading_date}</div>
                          </td>
                          <td className="p-4 text-xs uppercase">{trip.broker}</td>
                          <td className="p-4 text-right font-bold text-gray-700">₹{calculateTripWeight(trip)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-400 font-bold">Cancel</button>
              <button onClick={createBill} disabled={selectedTrips.length === 0} className="bg-[#0E334D] text-white px-8 py-2.5 rounded-xl font-bold disabled:bg-gray-200 shadow-md">Create Bill ({selectedTrips.length})</button>
            </div>
          </div>
        </div>
      )}

      {editModal && editData && (
        <div className="fixed inset-0 bg-[#0E334D]/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[95vw] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#0E334D] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Edit Bill: {editData.billingID}</h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right pr-6 border-r border-white/10">
                  <p className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Grand Total</p>
                  <p className="text-2xl font-bold text-white">₹{editData.tripList.reduce((sum, i) => sum + getNum(i.total), 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
                <button onClick={() => setEditModal(false)} className="hover:text-red-400 transition-colors"><MdClose size={28}/></button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/4 border-r border-gray-100 p-6 flex flex-col gap-4 bg-gray-50/30">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search LRs..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm" />
                </div>
                <div className="flex-1 overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-left">
                    <tbody>
                      {filteredTrips.map((trip) => {
                        const isChecked = editData.tripList.some(item => item.tripId === trip._id);
                        return (
                          <tr key={trip._id} onClick={() => toggleTripEdit(trip)} className={`cursor-pointer hover:bg-blue-50/20 border-b border-gray-50 last:border-0 transition-colors ${isChecked ? 'bg-blue-50/60' : ''}`}>
                            <td className="p-3 w-10">
                              {isChecked ? <MdCheckCircle size={22} className="text-blue-600" /> : <MdAddCircleOutline size={22} className="text-gray-300" />}
                            </td>
                            <td className="p-3 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-[#0E334D] text-sm tracking-tight">{trip.lr_ids?.map(l => l.lr_no).join(", ")}</span>
                                <div className="text-[10px] text-gray-400 font-medium uppercase truncate">Broker: {trip.broker}</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="w-3/4 p-6 flex flex-col">
                <div className="flex-1 overflow-auto rounded-2xl border border-gray-100 shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0E334D] text-white sticky top-0 z-10">
                      <tr>
                        <th className="p-4">Trip Details</th>
                        <th className="p-4">Destination</th>
                        <th className="p-4 text-right">Weight</th>
                        <th className="p-4 text-right">Rate</th>
                        <th className="p-4 text-right">Extra</th>
                        <th className="p-4 text-right">Detention</th>
                        <th className="p-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {editData.tripList.map((item) => (
                        <tr key={item.tripId} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <div className="font-bold text-gray-700">{item.lr_no}</div>
                            <div className="text-[10px] text-gray-400">Veh: {item.vehicleNO}</div>
                          </td>
                          <td className="p-4 uppercase">{item.destination}</td>
                          <td className="p-4 text-right font-semibold text-gray-700">
                          {item.weight}
                          </td>
                          <td className="p-4 text-right">
                            <input type="number" value={item.rate} onChange={(e) => handleInputChange(item.tripId, 'rate', e.target.value)} className="w-20 p-1.5 border border-gray-200 rounded-lg text-right outline-none focus:ring-1 focus:ring-blue-300" />
                          </td>
                          <td className="p-4 text-right">
                            <input type="number" value={item.extraWeight} onChange={(e) => handleInputChange(item.tripId, 'extraWeight', e.target.value)} className="w-20 p-1.5 border border-gray-200 rounded-lg text-right outline-none focus:ring-1 focus:ring-blue-300" />
                          </td>
                          <td className="p-4 text-right">
                            <input type="number" value={item.detention} onChange={(e) => handleInputChange(item.tripId, 'detention', e.target.value)} className="w-20 p-1.5 border border-gray-200 rounded-lg text-right outline-none focus:ring-1 focus:ring-blue-300" />
                          </td>
                          <td className="p-4 text-right font-bold text-[#0E334D] bg-gray-50/30">₹{parseFloat(item.total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => setEditModal(false)} className="text-gray-400 font-bold hover:text-gray-600">Discard Changes</button>
              <button onClick={saveEdit} className="bg-[#0E334D] text-white px-12 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#1a4a6d]">Update and Save Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;