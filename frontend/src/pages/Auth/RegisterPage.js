import React, { useState } from "react";
import axios from "axios";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/auth/register", {
        username,
        password,
        email,
        phone,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          className="w-full mb-4 p-2 border rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Đăng ký
        </button>
        <p className="mt-4 text-center text-red-500">{message}</p>
      </form>
    </div>
  );
}

export default RegisterPage;
