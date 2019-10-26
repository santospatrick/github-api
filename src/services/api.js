import axios from 'axios';

const { REACT_APP_GITHUB_API_TOKEN } = process.env;

const auth = {
    Authorization: `token ${REACT_APP_GITHUB_API_TOKEN}`,
};

const api = axios.create({
    baseURL: 'https://api.github.com',
    headers: REACT_APP_GITHUB_API_TOKEN ? auth : {},
});

export default api;
