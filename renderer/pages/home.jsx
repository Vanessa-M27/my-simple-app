import React, { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
// 1. Import the new libraries
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const chartRef = useRef(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await window.api.getItems();
    setItems(data);
  };

  const handleAddItem = async () => {
    if (!newItemName) return;
    await window.api.addItem(newItemName);
    setNewItemName('');
    loadItems();
  };

  const handleDeleteItem = async (id) => {
    await window.api.deleteItem(id);
    loadItems();
  };

  // Prepare Data
  const nameCounts = items.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(nameCounts),
    datasets: [{
      label: '# of Items',
      data: Object.values(nameCounts),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
      ],
      borderWidth: 1,
    }],
  };

  // 2. Logic to Download the PDF
  const handleDownloadPDF = async () => {
    const element = chartRef.current;
    if (!element) return;

    // Capture the chart div as a canvas
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // Create PDF (A4 size)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add a title and the image to the PDF
    pdf.setFontSize(18);
    pdf.text("Database Distribution Report", 10, 20);
    pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight);
    
    // Trigger actual download
    pdf.save("chart-report.pdf");
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', display: 'flex' }}>
      <div style={{ flex: 1, paddingRight: '2rem' }}>
        <h1>My Pure JS Desktop App</h1>
        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Type a new item..." 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{ padding: '0.5rem', marginRight: '0.5rem' }}
          />
          <button onClick={handleAddItem} style={{ padding: '0.5rem 1rem' }}>Add Item</button>
        </div>

        {/* --- REPLACED LIST WITH TABLE HERE --- */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '0.75rem' }}>Item Name</th>
              <th style={{ padding: '0.75rem', width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{item.name}</td>
                <td style={{ padding: '0.75rem' }}>
                  <button 
                    onClick={() => handleDeleteItem(item.id)} 
                    style={{ 
                      color: 'white', 
                      backgroundColor: '#dc3545', 
                      border: 'none', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="2" style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                  No items found. Add an item above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* ----------------------------------- */}

      </div>

      <div style={{ flex: 1, maxWidth: '400px', textAlign: 'center' }}>
        <h2>Database Distribution</h2>
        <div ref={chartRef} style={{ background: 'white', padding: '10px' }}>
          {items.length > 0 ? <Pie data={chartData} /> : <p>Add items to see the chart</p>}
        </div>

        {items.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={handleDownloadPDF} 
              style={{ 
                padding: '0.7rem 1.5rem', cursor: 'pointer',
                backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' 
              }}
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}