import React, { useEffect, useState } from 'react';

export default function Home() {
  const [items, setItems] = useState([]); // Removed <any[]>
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await window.api.getItems(); // Removed (window as any)
    setItems(data);
  };

  const handleAddItem = async () => {
    if (!newItemName) return;
    await window.api.addItem(newItemName);
    setNewItemName('');
    loadItems();
  };

  const handleDeleteItem = async (id) => { // Removed ": number"
    await window.api.deleteItem(id);
    loadItems();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>My Pure JS Desktop App</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Type a new item..." 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          style={{ padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button onClick={handleAddItem} style={{ padding: '0.5rem 1rem' }}>
          Add Item
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>
            {item.name} 
            <button 
              onClick={() => handleDeleteItem(item.id)}
              style={{ marginLeft: '1rem', color: 'red', cursor: 'pointer' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}