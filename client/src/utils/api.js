export const fetchRuangan = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/ruangan');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ruangan:', error);
    return [];
  }
};

export const fetchJadwal = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/jadwal');
    return await response.json();
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    return [];
  }
};