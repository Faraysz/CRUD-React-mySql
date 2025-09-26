// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function UserForm({ onSubmit, initial, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');

  useEffect(() => {
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return alert('Nama & email wajib diisi');
    onSubmit({ name: name.trim(), email: email.trim() });
    setName('');
    setEmail('');
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <div>
        <label>Nama</label><br />
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Email</label><br />
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit">{initial ? 'Update' : 'Tambah'}</button>
      {initial && <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Batal</button>}
    </form>
  );
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert('Gagal ambil data dari server');
    } finally { setLoading(false); }
  }

  async function createUser(data) {
    try {
      const res = await axios.post(`${API}/users`, data);
      setUsers(s => [...s, res.data]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Gagal membuat user');
    }
  }

  async function updateUser(data) {
    try {
      const res = await axios.put(`${API}/users/${editing.id}`, data);
      setUsers(s => s.map(u => u.id === res.data.id ? res.data : u));
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Gagal update');
    }
  }

  async function deleteUser(id) {
    if (!confirm('Yakin hapus?')) return;
    try {
      await axios.delete(`${API}/users/${id}`);
      setUsers(s => s.filter(u => u.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Gagal hapus');
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>CRUD React + MySQL</h1>

      <UserForm
        initial={editing}
        onCancel={() => setEditing(null)}
        onSubmit={(data) => (editing ? updateUser(data) : createUser(data))}
      />

      {loading ? <p>Memuat...</p> : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr><th>Nama</th><th>Email</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center' }}>Belum ada data</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <button onClick={() => setEditing(u)}>Edit</button>
                  <button onClick={() => deleteUser(u.id)} style={{ marginLeft: 8 }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
