conn = new Mongo();
db = conn.getDB("NTBdb");

db.dropAllUsers();
db.dropDatabase();

db.createUser(
    {
        user: "NTBUser",
        pwd: "NTB",
        roles:
            [
                {
                    role: "userAdmin",
                    db: "NTBdb"
                }
            ]
    }
);

// some test data
db.scores.insert({name: "test", score: 72});
