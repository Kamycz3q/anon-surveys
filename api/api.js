const express = require("express")
const bodyparser = require("body-parser")
const app = express()
const mysql = require("mysql")



const dane = {
    user: "root",
    host: "localhost",
    password: "",
    db: "anon-surveys"
}

app.use(bodyparser.urlencoded({extended : true}));
app.use(bodyparser.json());


class DbConnection {
    constructor() {
        this.user = dane.user,
        this.host = dane.host, 
        this.password = dane.password, 
        this.db = dane.db
        
    }
    getConnection() {
        return mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.db
        })
    }
    query(Querystring, Arguments) {
        let conn = this.getConnection();
        return new Promise((resolve, reject) => {
            conn.query(Querystring, Arguments, (error, results) => {
                if (error) throw error;
                conn.destroy();
                resolve(results);
            })
            
            
        })
    }
    async addSurvey(tittle = "", description = "", options = "") {
        if (tittle == "" || description == "" || options == "") return {};
        var foundTittles = 0
        var newId;
        
        var newOptions = {}
        for (let i = 0; i < options.length; i++) {
            newOptions[options[i]] = 0
        }
        newOptions = JSON.stringify(newOptions)
        options = newOptions
        await this.query("SELECT tittle FROM surveys WHERE tittle = ?", [tittle]).then((data) => {foundTittles = data.length;})
        if (foundTittles == 0) {
            await this.query("INSERT INTO surveys SET ?", {tittle: tittle, description: description, options:options}).then((data) => {
                newId = data.insertId
            })
        }
        return {newId: newId};
    }
    async getSurveyData(id = "") {
        if (id == "") return;
        var newData = []
        await this.query("SELECT tittle, description, options FROM surveys WHERE id=? LIMIT 1",[id])
        .then((data) => {if (data[0] != undefined) newData = data[0]})
        return newData;
    }

    async refreshVotes(id) {
        let options;
        await this.query("SELECT options FROM surveys WHERE id=?", [id])
        .then((data) => {
            if (data[0] != undefined) {
                options = JSON.parse(data[0]["options"])

            }
        })
        console.log(options)
        for (let option in options) {
            await this.query("SELECT COUNT(id) FROM votes WHERE survey_id = ? AND opt_name = ?", [id, option])
            .then((data) => {
                if (data[0] != undefined) {
                    options[option] = data[0]["COUNT(id)"]

                }
                
            })
        }
        options = JSON.stringify(options)
        await this.query("UPDATE surveys SET options = ? WHERE id = ?", [options, id])
    }
    async addVote(id = "", option = "",  ip = undefined) {
        console.log(id, option, ip)
        if (id == "", option == "", ip == undefined) return success;
        let returnval;
        let foundData = {
            found: false,
            foundOptionName: undefined,
            foundId: undefined
        }
        
        await this.query("SELECT id, opt_name FROM votes WHERE ip = ? AND survey_id = ?", [ip,id])
        .then((data) => {
            if (data.length > 0) {
                foundData.found = true
                foundData.foundOptionName = data[0]["opt_name"]
                foundData.foundId = data[0]["id"]
            }
        })
        //if found with same name then end
        if (foundData.found && option == foundData.foundOptionName) {
            await this.query("DELETE FROM votes WHERE id = ?", [foundData.foundId])
            .then(() => {
                returnval = "Deleted the vote"
            })
        } else if (foundData.found && option != foundData.foundOptionName) {
            await this.query("UPDATE votes SET opt_name = ? WHERE id = ?", [option, foundData.foundId])

            .then(() => {
                returnval = "Changed the vote"
            })
        } else {
            await this.query("INSERT INTO votes SET ?", {survey_id: id, opt_name: option, ip: ip})
            .then(() => {
                returnval = "Made new vote"
            })
        }
        await this.refreshVotes(id)
        return returnval;

    }


    async getVoteForIp(id = "", ip) {
        if (id == "") return [];
        let returnVal = {option: undefined}
        await this.query("SELECT opt_name FROM votes WHERE ip = ? AND survey_id = ? LIMIT 1", [ip, id])
        .then((data) => {
            if (data[0]!= undefined) {
                returnVal.option = data[0]["opt_name"]

            }
        })
        return returnVal
    }
    

}
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const dbconn = new DbConnection();

app.post("/addSurvey", async (req, res) => {
    let code;
    const data = await dbconn.addSurvey(req.body.tittle || req.query.tittle, req.body.description || req.query.description, req.body.options || req.query.options)
    if (data.length > 0) {
        code = 202
    } else {
        code = 400
    }
    res.json({
        Code: code,
        data: data,
    });
})

app.get("/getSurveyData", async (req, res) => {
    let code;
    const data = await dbconn.getSurveyData(req.body.id || req.query.id)
    if (data != []) {
        code = 202
    } else {
        code = 400
    }
    res.json({
        Code: code,
        data: data,
    });
})

app.post("/addOptionVote", async (req, res) => {
    let code;
    const data = await dbconn.addVote(req.body.id || req.query.id,req.body.option || req.query.option, req.connection.remoteAddress)
    if (data != []) {
        code = 202
    } else {
        code = 400
    }
    res.json({
        Code: code,
        data: data,
    });
})


app.get("/getVoteForIp", async (req, res) => {
    let code;
    const data = await dbconn.getVoteForIp(req.body.id || req.query.id,req.connection.remoteAddress)
    if (data != []) {
        code = 202
    } else {
        code = 400
    }
    res.json({
        Code: code,
        data: data,
    });
})

app.listen(3333);