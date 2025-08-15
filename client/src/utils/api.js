export const fetchDataTV = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/data_tv');
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return []; // Return array kosong untuk hindari crash
    }
    return await response.json(); // Harus array dari backend
  } catch (error) {
    console.error('Fetch error:', error);
    return []; // Fallback aman
  }
};