const express = require('express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const mustacheExpress = require('mustache-express')
const app = express()


const connectionString = "postgres://localhost:5432/assignmentdb"
const db = pgp(connectionString)
app.use(bodyParser.urlencoded({ extended: false }))

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')


app.get('/',(req,res) => {
  res.render('index')
})

app.get('/view-posts',(req,res) => {
  db.any('SELECT postid,posttitle,postbody FROM blogstuff')
  .then((blogstuff) => {
    res.render('view-posts', {blogstuff: blogstuff})
  })
})

app.post('/add-post',(req,res) => {
  let postTitle = req.body.postTitle
  let postBody = req.body.postBody




  db.one('INSERT INTO blogstuff(posttitle, postbody) VALUES($1,$2) RETURNING postid;',[postTitle,postBody])
  .then((data) => {
    console.log(data)
    console.log("aw yeah")
  }).catch(error => console.log(error))
  res.redirect('/view-posts')
})

app.post('/delete-post',(req,res) => {
  let postId = parseInt(req.body.postId)

  db.none('DELETE FROM blogstuff WHERE postid = $1', [postId])
  .then(() => {
    res.redirect('view-posts')
  })
})

app.get('/edit-post',(req,res) => {
  db.any('SELECT postid,posttitle,postbody FROM blogstuff')
  .then((blogstuff) => {
    res.render('edit-post', {blogstuff: blogstuff})
  }).catch(error => console.log(error))

})

app.post('/selected-post', (req,res) =>  {
 let postid = parseInt(req.body.postId)
 db.any('SELECT postid,posttitle,postbody FROM blogstuff WHERE postid = $1', [postid])
 .then((blogstuff) => {
   res.render('edit-post',{blogstuff: blogstuff})
  })
})

app.post('/edit-post', (req,res) => {
 let posttitle = req.body.postTitle
 let postbody = req.body.postBody
 let postid = req.body.postId
 db.none('UPDATE blogstuff SET posttitle = $1 , postbody = $2 WHERE postid = $3',[posttitle, postbody, postid])
   .then(() => {
     res.redirect('/view-posts')
   })
})














app.listen(3000,() => {
  console.log('server is a go!')
})
