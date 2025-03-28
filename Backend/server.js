const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const querystring = require("querystring")
const { MongoClient } = require('mongodb');
const client = new MongoClient("mongodb://127.0.0.1:27017")
const fileIndexHtml = path.join(__dirname, "..", "Frontend", "index.html");
console.log(fileIndexHtml);

const server = http.createServer(async (req, res) => {
    const db = client.db("students")
    const collection = db.collection("data")
    const parsedUrl = url.parse(req.url);
    console.log(parsedUrl);

    if (req.method === "GET") {
        console.log(parsedUrl.pathname);
        if (parsedUrl.pathname === "/") {
            fs.readFile(fileIndexHtml, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end(err.message);
                } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(data);
                }
            });
        }
        if (parsedUrl.pathname == "/getdata") {

            const data = await collection.find().toArray()
            console.log(data);
            
            res.writeHead(200, { "Content-Type": "text/json" })
            res.end(JSON.stringify(data))
            
        }
    }

    if (req.method === "POST") {
        if (parsedUrl.pathname === "/send-data") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
                console.log(body);
            });

            req.on("end", () => {
                console.log(body);
                const value = querystring.parse(body)
                collection.insertOne(value).then(() => {
                    console.log("Inserted")
                }).catch((err) => {
                    console.log(err.message)
                })
                res.writeHead(200, { "Content-Type": "text/html" })
                res.end(fs.readFileSync(fileIndexHtml))
            });
        }
        
    }



});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at port: ${port}\nhttp://localhost:${port}`);
});
