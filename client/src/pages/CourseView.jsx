import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function CourseView({ user }) {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('content');
  const [classData, setClassData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem('token');

  // Forms
  const [file, setFile] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'link', linkUrl: '', category: 'Week 1' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchClassData();
    fetchMaterials();
    fetchAssignments();
    if(activeTab === 'discussion') fetchMessages();
  }, [id, activeTab]);

  const fetchClassData = async () => {
    try {
      const res = await axios.get(`/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`/api/classes/${id}/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`/api/classes/${id}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/classes/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const handleUploadMaterial = async () => {
    const formData = new FormData();
    formData.append('title', materialForm.title);
    formData.append('type', materialForm.type);
    formData.append('classId', id);
    formData.append('category', materialForm.category);
    formData.append('linkUrl', materialForm.linkUrl);
    if (file) formData.append('file', file);

    try {
      await axios.post('/api/material', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchMaterials();
      alert('Uploaded!');
    } catch (err) { alert('Upload failed'); }
  };

  const handleCreateAssignment = async () => {
    try {
      await axios.post('/api/assignments', { ...assignmentForm, classId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAssignments();
      alert('Assignment Created!');
    } catch (err) { alert('Failed'); }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!submissionFile) return alert('Please select a file');
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', submissionFile);

    try {
      await axios.post('/api/submit-assignment', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('Submitted!');
      fetchAssignments();
    } catch (err) { alert('Submission failed'); }
  };

  const handleSendMessage = async () => {
    if(!newMessage.trim()) return;
    try {
      const res = await axios.post('/api/messages', { content: newMessage, classId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) { alert('Failed to send'); }
  };

  if (!classData) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="title">{classData.className} - Content Hub</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('content')} className={activeTab === 'content' ? 'active-tab' : 'tab'}>Content</button>
        <button onClick={() => setActiveTab('assignments')} className={activeTab === 'assignments' ? 'active-tab' : 'tab'}>Assignments</button>
        <button onClick={() => setActiveTab('discussion')} className={activeTab === 'discussion' ? 'active-tab' : 'tab'}>Discussion</button>
        <button onClick={() => setActiveTab('people')} className={activeTab === 'people' ? 'active-tab' : 'tab'}>Students</button>
      </div>

      <style>{`
        .tab { padding: 10px 20px; border: none; background: white; cursor: pointer; border-radius: 6px; }
        .active-tab { padding: 10px 20px; border: none; background: #0a58ca; color: white; cursor: pointer; border-radius: 6px; }
      `}</style>

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
        <div>
          {user.role === 'teacher' && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Upload Content</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <input placeholder="Title" onChange={e => setMaterialForm({...materialForm, title: e.target.value})} />
                <select onChange={e => setMaterialForm({...materialForm, type: e.target.value})}>
                  <option value="link">Link/URL</option>
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video File</option>
                </select>
                {materialForm.type === 'link' ? (
                  <input placeholder="URL (YouTube/Drive)" onChange={e => setMaterialForm({...materialForm, linkUrl: e.target.value})} />
                ) : (
                  <input type="file" onChange={e => setFile(e.target.files[0])} />
                )}
                <button onClick={handleUploadMaterial}>Upload</button>
              </div>
            </div>
          )}
          <div className="cards">
            {materials.map(mat => (
              <div key={mat.id} className="card">
                <span style={{ fontSize: '12px', background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>{mat.category}</span>
                <h3 style={{ marginTop: '10px' }}>{mat.title}</h3>
                {mat.type === 'link' ? (
                  <a href={mat.url} target="_blank" rel="noreferrer" style={{ color: '#0a58ca' }}>Open Link</a>
                ) : (
                  <a href={`${mat.url}`} target="_blank" rel="noreferrer" style={{ color: '#0a58ca' }}>Download {mat.type.toUpperCase()}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div>
          {user.role === 'teacher' && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Create Assignment</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <input placeholder="Title" onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} />
                <textarea placeholder="Description" onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} style={{ padding: '10px', borderRadius: '6px' }} />
                <input type="date" onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} />
                <button onClick={handleCreateAssignment}>Assign</button>
              </div>
            </div>
          )}
          <div className="cards">
            {assignments.map(assign => (
              <div key={assign.id} className="card">
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <h3>{assign.title}</h3>
                  <p>{assign.description}</p>
                  <p style={{ fontSize: '14px', color: '#666' }}>Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
                </div>
                {user.role === 'student' && (
                  <div>
                    {assign.Submissions && assign.Submissions.length > 0 ? (
                      <p style={{ color: 'green', fontWeight: 'bold' }}>✔ Submitted</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="file" onChange={e => setSubmissionFile(e.target.files[0])} />
                        <button onClick={() => handleSubmitAssignment(assign.id)}>Submit</button>
                      </div>
                    )}
                  </div>
                )}
                {user.role === 'teacher' && (
                  <div>
                    <h4>Submissions ({assign.Submissions ? assign.Submissions.length : 0})</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {assign.Submissions?.map(sub => (
                        <li key={sub.id} style={{ marginTop: '5px', fontSize: '14px' }}>
                          <strong>{sub.User?.fullName}:</strong> <a href={`${sub.fileUrl}`} target="_blank" rel="noreferrer">View File</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISCUSSION TAB */}
      {activeTab === 'discussion' && (
        <div className="card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '6px', borderLeft: msg.Sender?.role === 'teacher' ? '4px solid #0a58ca' : '4px solid #ccc' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{msg.Sender?.fullName} ({msg.Sender?.role})</div>
                <div style={{ marginTop: '4px' }}>{msg.content}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <input 
              style={{ flex: 1 }} 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} style={{ width: 'auto', marginTop: 0 }}>Send</button>
          </div>
        </div>
      )}

      {/* PEOPLE TAB */}
      {activeTab === 'people' && (
        <div className="table-box">
          <h3>Enrolled Students</h3>
          <table>
            <thead><tr><th>Name</th><th>Username</th></tr></thead>
            <tbody>
              {classData.Users?.map(u => (
                <tr key={u.id}><td>{u.fullName}</td><td>{u.username}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
