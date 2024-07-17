import express from "express";
import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: "./.env"
})

//  Initialising the app
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Database connection
 const connectDB = async () => {
     try {
        const dbName = "users"
        const mongoUrl = await mongoose.connect(`${process.env.MONGO_URL}/${dbName}`);
        console.log(`MongoDB connected: ${mongoUrl.connection.host}`);
     } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
     }
 }
 connectDB()
 .then(() => {
    app.on("error", (error) => {
        throw error;
    })



    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/public/index.html");
    })
    app.get("/home", (req, res) => {
        res.sendFile(__dirname + "/public/home.html");
    })
    app.get("/error", (req, res) => {
        res.sendFile(__dirname + "/public/error.html");
    })
    app.post("/register", registerUser)



    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
 })
 .catch((error) => {
     console.log(`DB connection faliure! ${error}`);
 })



//  Mongoose User Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    }
},
{
    timestamps: true
})
const User = mongoose.model("User", userSchema);





// Registrartion Controller

const registerUser =  async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExist = await User.findOne({
            $or : [{email: email}, {phone: phone}]
        });

        if (!userExist) {
            await User.create({
                name,
                password,
                email,
                phone
            })
            return res.redirect("/home");
        } else {
            return res.redirect("/error");
        }
    } catch (error) {
        console.log(error);
        return res.redirect("/error");
    }
}