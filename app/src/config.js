const config = {
    apiPath: 'http://192.168.64.2:3001',
    headers: () => {
        return {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        }
    }
}

export default config;
