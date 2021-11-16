import axios from "axios";

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5002' : process.env.REACT_APP_BACKEND;

export {
    baseUrl
}

const api = {
    initial: async () => {
        const { data } = await axios.post(`${baseUrl}/api/gameXO`);
        return data
    },
    getGameById: async (gameId) => {
        const { data } = await axios.get(`${baseUrl}/api/gameXO/${gameId}`);
        return data
    },
    markPosition: async (gameId, body) => {
        const { data } = await axios.put(`${baseUrl}/api/gameXO/${gameId}`, body);
        return data
    },
    resetGame: async (gameId) => {
        const { data } = await axios.delete(`${baseUrl}/api/gameXO/${gameId}`);
        return data
    },
};

export default api;