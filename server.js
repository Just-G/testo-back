//Addition
//Addition2
//Addition3
let express = require('express')
let cors = require('cors')


const PORT = process.env.PORT || 1234


const { Client } = require('pg')
const client = new Client({
    host: '13.76.33.58',
    user: 'postgres',
    password: 'P@$$',
    database: 'TueKan',
    ssl: true,
    port: '5432'
})

client.connect()

let app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post('/api/user/login', (req, res) => {
    let { username, password } = req.body
    if (!(username && password)) {
        res.status(400).send('Check username or password')
        return
    }

    client.query('SELECT * FROM account WHERE username=$1', [username], (err, data) => {
        if (err) {
            res.status(401).send('Unauthorized')
        }
        else if (data.rows[0] == undefined) {
            res.status(401).send('Unauthorized')
        }
        else {
            if (data.rows[0]['password'] != password) {
                res.status(401).send('Unauthorized')
            }
            else {
                res.status(202).send('success')
            }
        }
    })

})

app.post('/api/user', async (req, res) => {
    let { username, password } = req.body
    await client.query('INSERT INTO account(username,password) VALUES ($1,$2)', [username, password],
        (err) => {
            if (err) {
                console.log(err.stack)
                res.status(406).send("already has user")
            } else {
                res.status(201).send("User created")
            }
        })

})

app.get('/api/posts', async (req, res) => {
    client.query('SELECT * FROM post', (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            res.json(data.rows)
        }
    })
})

app.post('/api/posts', (req, res) => {
    let { name, topic, content } = req.body
    client.query('INSERT INTO post(username,topic,content) VALUES ($1,$2,$3) RETURNING id', [name, topic, content],
        (err,data) => {
            if (err) {
                console.log(err.stack)
            }else{
                res.status(201).send(data.rows[0].id.toString())
            }
        })
    
})

app.get('/api/posts/:id', (req, res) => {
    let { id } = req.params
    let forsend;
    client.query('SELECT * FROM post WHERE id=$1', [id], (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            forsend = data.rows[0]
        }
    })
    client.query('SELECT * FROM comment WHERE post_id=$1', [id], (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(data.rows)
            res.json({ ...forsend, comment: [...data.rows] })
        }
    })
})

app.post('/api/posts/:id/reply', (req, res) => {
    let { id } = req.params
    let { name, reply } = req.body
    client.query('INSERT INTO comment(post_id,username,reply) VALUES ($1,$2,$3)', [id, name, reply],
        (err) => {
            if (err) {
                console.log(err.stack)
            }
        })
    res.status(202).send('Reply success')
})

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})

