import http from "http";
import fs from "fs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "randomlookingsecret7xyz";

http
  .createServer((req, res) => {
    console.log("Method:", req.method, "URL:", req.url);
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello Apache!\n");

      return;
    }

    if (req.method === "POST") {
      if (req.url.startsWith ("/node/login")) {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            body = JSON.parse(body);

            // Read users.txt
            const data = fs.readFileSync("./users.txt", "utf-8");

            // Parse User
            const users = data.split("\n").map(line => {
              const [username, password, userId, role] = line.trim().split(",");
              return {
                username,
                password,
                userId: Number(userId),
                role
              };
            });

            // find users
            const foundUser = users.find(
              (u) => u.username === body.username
            );

            // If username is not found
            if (!foundUser) {
              res.writeHead(404, { "Content-Type": "application/json"});
              res.end(JSON.stringify({ error: "User not Found"}));
              return;
            }

            // Invalid Password
            if (foundUser.password !== body.password) {
              res.writeHead(401, { "Content-Type": "application/json"});
              res.end(JSON.stringify({ error: "Invalid Password"}));
              return;
            }

            // Create JWT
            const token = jwt.sign(
              {
                userId: foundUser.userId,
                role: foundUser.role
              },
              JWT_SECRET,
              { expiresIn: "1h" }
            );

            // return token
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify ({ token }));
            
            // https://www.npmjs.com/package/jsonwebtoken
          } catch (err) {
            console.log(err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server error\n");
          }
        });

        return;
      }
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found\n");
  })
  .listen(8000, "0.0.0.0");

console.log("listening on port 8000");
