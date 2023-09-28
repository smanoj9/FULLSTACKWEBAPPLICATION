const express = require("express");
const app = express();
const port = 3000;
const passwordHash = require("password-hash");
const bp = require("body-parser");
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.set("view engine", "ejs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Filter } = require("firebase-admin/firestore");
var serviceAccount = require("./key.json");
initializeApp({
    credential: cert(serviceAccount),
});
const db = getFirestore();

app.get("/",function(req,res){
    res.sendFile(__dirname+"/home.html");
})

app.get("/dashboard", function(req, res){
    res.sendFile(__dirname+"/dashboard.html");
});

app.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.post("/signupSubmit", function (req, res) {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.pwd;

    const hashedPassword = passwordHash.generate(password);

    db.collection("userDemo")
        .where("email", "==", email)
        .get()
        .then((docs) => {
            if (docs.size > 0) {
                res.send("An account with this email already exists.");
            } else {
                db.collection("userDemo")
                    .add({
                        fullname: fullname,
                        email: email,
                        password: hashedPassword,
                    })
                    .then((docRef) => {
                        console.log("User added with ID: ", docRef.id);
                        res.redirect("/login");
                    })
                    .catch((error) => {
                        console.error("Error adding user: ", error);
                        res.send("Something went wrong during signup.");
                    });
            }
        })
        .catch((error) => {
            console.error("Error checking for existing user: ", error);
            res.send("Something went wrong during signup.");
        });
});

app.post("/loginSubmit", function (req, res) {
    const email = req.body.email; 
    const password = req.body.pwd;

    db.collection("userDemo")
        .where("email", "==", email) 
        .get()
        .then((docs) => {
            if (docs.size === 0) {
                res.send("User not found.");
            } else {
                const userDoc = docs.docs[0];
                const storedPassword = userDoc.data().password;

                if (passwordHash.verify(password, storedPassword)) {
                    res.redirect("/dashboard");
                } else {
                    res.send("Login failed. Please check your credentials.");
                }
            }
        })
        .catch((error) => {
            console.error("Error during login: ", error);
            res.send("Something went wrong during login.");
        });
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
