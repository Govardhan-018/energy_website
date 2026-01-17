import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const predictLoad = async (startDate, endDate) => {
    try {
        const response = await axios.post(`${API_URL}/predict`, {
            start_date: startDate,
            end_date: endDate
        });
        return response.data;
    } catch (error) {
        console.error("Error predicting load:", error);
        throw error;
    }
};

export const checkHealth = async () => {
    try {
        const response = await axios.get(`${API_URL}/health`);
        return response.data;
    } catch (error) {
        return { status: "error", error };
    }
};
