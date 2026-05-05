import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { MdModeEdit, MdDelete, MdClose } from "react-icons/md";

const UserManagement = () => {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [search, setSearch] = useState("");

  const URL = "http://localhost:8000/users";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    setLoading(false);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(URL, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user]);

  if (loading) return <div className="p-5">Loading...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" />;

  const handleOpen = (data = null) => {
    setEditData(data);
    setUsername(data?.username || "");
    setEmail(data?.email || "");
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`${URL}/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editData) {
        await axios.put(
          `${URL}/${editData._id}`,
          { username, email },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        await axios.post(
          `${URL}/signup`,
          { username, email, password: "123456" },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      setOpenModal(false);
      setEditData(null);
      setUsername("");
      setEmail("");
      fetchUsers();

    } catch (err) {
      console.log(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const text = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(text) ||
      u.email?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="w-full px-6 py-8 bg-[#F8FAFC] min-h-screen font-sans">

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-3xl font-extrabold text-[#0E334D]">
          User Management
        </h2>

        <button
          onClick={() => handleOpen()}
          className="bg-[#0E334D] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg"
        >
          + Add User
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 shadow rounded-lg text-sm outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0E334D] text-white">
              <tr className="text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-5 sticky left-0 bg-[#0E334D]">Actions</th>
                <th className="px-4 py-5">Username</th>
                <th className="px-4 py-5">Email</th>
                <th className="px-4 py-5">Role</th>
              </tr>
            </thead>

            <tbody className="text-[12px]">
              {filteredUsers.map((u, index) => (
                <tr key={u._id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                  <td className="px-6 py-4 sticky left-0 bg-inherit">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpen(u)} className="p-2 rounded-xl bg-gray-200 hover:bg-[#0E334D] hover:text-white">
                        <MdModeEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="p-2 rounded-xl bg-gray-200 hover:bg-red-500 hover:text-white">
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-4">{u.username}</td>
                  <td className="px-4 py-4">{u.email}</td>
                  <td className="px-4 py-4">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ FIXED MODAL INPUT UI */}
      {openModal && (
        <div className="fixed inset-0 bg-[#0E334D]/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            <div className="bg-[#0E334D] p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editData ? "Edit User" : "Add User"}
              </h3>

              <button onClick={() => setOpenModal(false)} className="p-2 rounded-full hover:bg-white/10">
                <MdClose size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* 🔥 MATCHED INPUT STYLE */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => setOpenModal(false)} className="px-6 py-2.5 text-gray-400 font-bold">
                    Discard
                  </button>

                  <button className="bg-[#0E334D] text-white px-6 py-2.5 rounded-xl font-bold">
                    {editData ? "Update" : "Save"}
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;