const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});
const { ExpressPeerServer } = require("peer");
const opinions = {
	debug: true,
};

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));

app.get("/data", (req, res) => {
	const response = {
		message: "Hello, World!",
		data: {},
	};

	response.data.room = uuidv4();
	res.json(response);
});

app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	const referringUrl = req.query.ID;
	res.render("room", { roomId: req.params.room, referringUrl });
});

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, userName) => {
		socket.join(roomId);
		setTimeout(() => {
			socket.to(roomId).broadcast.emit("user-connected", userId);
		}, 1000);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);
		});
	});
});

server.listen(process.env.PORT || 3030);
