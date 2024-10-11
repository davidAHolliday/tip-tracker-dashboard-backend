const mongoose = require('mongoose');


const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(
            "mongodb+srv://root:root@cluster0.ldhj71j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", 
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        
        )
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    }catch(error){
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }

}

module.exports = connectDB