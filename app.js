const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertdtObjecttoresponsiveObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_name,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const palyerDetails = `
    SELECT


      *
    FROM
      cricket_team;`;
  const playerArray = await db.all(palyerDetails);
  response.send(
    playerArray.map((eachPlayer) =>
      convertdtObjecttoresponsiveObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
    cricket_team
     
    WHERE
      player_id = ${playerId};`;
  const book = await db.get(getPlayerQuery);
  response.send(convertdtObjecttoresponsiveObject(book));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPostQuery = `
    INSERT INTO
      cricket_team (
player_name,
jersey_number,
role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         ${role}
         
      );`;

  const dbResponse = await db.run(addPostQuery);
  const playerId = dbResponse.lastID;
  response.send("'Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePutQuery = `
    UPDATE
     cricket_team
    SET
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      
      role='${role}'
     
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePutQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
