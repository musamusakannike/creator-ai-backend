const app = require('./app')
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
    console.log(`Visit http://localhost:${PORT}/auth to initiate OAuth flow`);
})
