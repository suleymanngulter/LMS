import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config({ path: "../.env" });

const Connection = async () => {
    try {
       
        await mongoose.connect(process.env.URL);
        console.log("Bağlantı başarılı");
    } catch (err) {
        console.error("Bağlantı hatası:", err);
    }
};

Connection();

export { Connection };
