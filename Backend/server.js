const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const querystring = require("querystring")
const { MongoClient, ObjectId } = require('mongodb');
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
            let str = ""
            data.forEach(user => {
                str += `<hr><div style="display:flex; justify-content: space-between">Name: ${user.name} <a href="http://localhost:3000/update?id=${user._id}">Edit</a></div>
                <div style="display:flex; justify-content: space-between">Password: ${user.phone} <a href="http://localhost:3000/delete?id=${user._id}">Delete</a></div><hr>`
            })
            const usersHtml = `
            <html>
            <head>
                <title>Data List</title>
            </head>
                <body>
                    <h1>Student List</h1>
                    <div>
                    ${str}
                    </div>
                    <div><a href="/">Back to Home</a></div>
                </body>
            </html>
            `
            res.writeHead(200, { "Content-Type": "text/html" })
            res.end(usersHtml)

        }

        if (parsedUrl.pathname === "/update") {
            const parsedUpdate = url.parse(req.url)
            console.log(parsedUpdate);
            console.log(parsedUpdate.query);
            let id = querystring.parse(parsedUpdate.query)
            console.log(id);
            
            console.log("#############################################");

            console.log(id);

            const data = await collection.find({_id:new ObjectId(id)}).toArray()
            console.log(data);
            
            
            let updateHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <form action="/updatedata?id=${id.id}" method="POST">
                    <label for="name">Name: </label>
                    <input type="text" name="name" id="name" placeholder="name" value="${data[0].name}"><br>
                    <label for="phone">Phone No.: </label>
                    <input type="text" name="phone" id="phone" placeholder="phone" value="${data[0].phone}">
                    <input type="submit" value="submit">
                </form>
                <a href="/">Back to Home</a>
            </body>
            </html>
            `

            res.writeHead(200, { "Content-Type": "text/Html" })
            res.end(updateHtml)

        }

        if (parsedUrl.pathname === "/delete") {
            const parsedUpdate = url.parse(req.url)
            console.log(parsedUpdate);
            console.log(parsedUpdate.query);
            let id = querystring.parse(parsedUpdate.query)
            console.log(id);
            
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
            
            collection.deleteOne({_id:new ObjectId(id)}).then(() => {
                console.log("deleted")
            }).catch((err) => {
                console.log(err.message)
            })

            let delHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <h1>Deleted</h1>
                <a href="/">Back to Home</a>
            </body>
            </html>
            `

            res.writeHead(200, { "Content-Type": "text/Html" })
            res.end(delHtml)

            

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

        if (parsedUrl.pathname === "/updatedata") {

            const parsedUpdate = url.parse(req.url)
            console.log(parsedUpdate);
            console.log(parsedUpdate.query);
            let id = querystring.parse(parsedUpdate.query)
            console.log(id)

            console.log("**********************************************");
            

            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
                console.log(body);
            });

            req.on("end", () => {
                console.log(body);
                const value = querystring.parse(body)
                console.log(value);
                
                collection.updateOne({_id:new ObjectId(id)}, {$set: value}).then(() => {
                    console.log("Updated")
                }).catch((err) => {
                    console.log(err.message)
                })
                let success = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <h1>updated</h1>
                <a href="/">Back to Home</a>
            </body>
            </html>
            `

            res.writeHead(200, { "Content-Type": "text/Html" })
            res.end(success)
            });
        }

    }



});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at port: ${port}\nhttp://localhost:${port}`);
});
