

//Express Dependicies
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser')
const express = require('express') 
const cors = require('cors');
const routes = require('./routes/routes');
const connectDB = require('./config/db');


connectDB();


const app = express();
const PORT = 3225;


//USE body parser to parse request
app.use(bodyParser.json())


app.use(cors());

//Routes
app.use('/api', routes)

app.listen(PORT, ()=>{
    console.log("Server Running")
})
