import { useEffect, useState } from "react";
import axios from "axios";
import { MdModeEdit, MdDelete } from "react-icons/md";
import ExpenseModel from "../UI/ExpenseModel";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [openModel, setOpenModel] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");

  const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // 📅 Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // 📅 Get Month Key
  const getMonthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // 🔄 Fetch
  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:8000/expense");
      setExpenses(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 🗑 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`http://localhost:8000/expense/${id}`);
      fetchExpenses();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔍 FILTER ONLY FOR TABLE
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.description
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesMonth = selectedMonth
      ? getMonthKey(exp.date) === selectedMonth
      : true;

    return matchesSearch && matchesMonth;
  });

  // 🔥 BAR CHART DATA (NO FILTER USED HERE)
  const getLast12MonthsData = () => {
    const result = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      const total = expenses
        .filter((exp) => getMonthKey(exp.date) === key)
        .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

      result.push({
        month: d.toLocaleString("default", { month: "short" }),
        amount: total,
      });
    }

    return result;
  };

  const barData = getLast12MonthsData();

  return (
    <div className="w-full px-6 py-8 bg-[#F8FAFC] min-h-screen font-sans">

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-[#0E334D] tracking-tight">
          Expense Management
        </h2>

        <button
          onClick={() => {
            setSelectedId(null);
            setEditMode(false);
            setEditData(null);
            setOpenModel(true);
          }}
          className="px-5 py-2 bg-[#0E334D] text-white rounded-xl shadow"
        >
          + Add Expense
        </button>
      </div>

      {/* SEARCH + MONTH FILTER */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 shadow rounded-lg text-sm outline-none"
        />

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 shadow rounded-lg text-sm outline-none"
        />
      </div>

      {/* 🔥 BAR GRAPH (NO FILTER APPLIED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        <div className="bg-white rounded-3xl p-4 shadow border border-gray-100 col-span-2">
          <h3 className="text-sm font-bold text-[#0E334D] mb-2">
            Monthly Expense Trend
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#0E334D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TABLE (FILTER APPLIED HERE ONLY) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            <thead className="bg-[#0E334D] text-white">
              <tr className="text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">
                <th className="px-6 py-5 sticky left-0 bg-[#0E334D]">Actions</th>
                <th className="px-4 py-5">Date</th>
                <th className="px-4 py-5">Description</th>
                <th className="px-4 py-5">Amount</th>
                <th className="px-4 py-5">Receipt</th>
              </tr>
            </thead>

            <tbody className="text-[12px] text-gray-800">
              {filteredExpenses.map((exp, index) => (
                <tr
                  key={exp._id}
                  className={`group hover:bg-blue-50/50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  }`}
                >
                  <td className="px-6 py-4 sticky left-0 bg-inherit">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedId(exp._id);
                          setEditMode(true);
                          setEditData(exp);
                          setOpenModel(true);
                        }}
                        className="p-2 rounded-xl bg-gray-200 hover:bg-[#0E334D] hover:text-white"
                      >
                        <MdModeEdit size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-2 rounded-xl bg-gray-200 hover:bg-red-500 hover:text-white"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-4">{formatDate(exp.date)}</td>
                  <td className="px-4 py-4">{exp.description}</td>
                  <td className="px-4 py-4">₹{exp.amount}</td>

                  <td className="px-4 py-4">
                    {exp.uploadReceipt ? (
                      <span
                        className="text-blue-500 underline cursor-pointer"
                        onClick={() =>
                          window.open(
                            `http://localhost:8000/file/expenses/${exp.uploadReceipt}`,
                            "_blank"
                          )
                        }
                      >
                        View
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODEL */}
      {openModel && (
        <ExpenseModel
          setOpenModel={setOpenModel}
          id={selectedId}
          editMode={editMode}
          editData={editData}
          refreshData={fetchExpenses}
        />
      )}
    </div>
  );
};

export default ExpensePage;