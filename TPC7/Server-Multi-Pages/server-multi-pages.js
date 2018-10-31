var http = require('http')
var fs = require('fs')
var pug = require('pug')
var formidable = require('formidable')
var express = require ('express')
var logger = require('morgan')
var jsonfile = require('jsonfile')

var app = express()

var myBD = 'ficheiros.json'

app.use(logger('combined'))

app.all('*',(req,res,next)=>{
    if(req.url != '/w3.css'){
        res.writeHead(200,{'Content-Type': 'text/html;charset=utf-8'})
    }
    next()
})

app.get('/',(req,res) => {
    res.write(pug.renderFile('form-ficheiro.pug'))
    res.end()
})

app.get('/w3.css',(req,res)=>{
    res.writeHead(200,{'Content-Type': 'text/css'})
    fs.readFile('stylesheets/w3.css',(erro,dados)=>{
        if(!erro){
            res.write(dados)
        }
        else{
            res.write(pug.renderFile('erro.pug',{e : erro}))
        }
        res.end()
    })
})

app.post('/processaForm',(req,res) =>{
    var form = new formidable.IncomingForm()
    form.parse(req,(erro,fields,files) =>{
        var fenviado = files.ficheiro.path
        var fnovo = './uploaded/' + files.ficheiro.name
        fs.rename(fenviado,fnovo,(erro)=>{
            if(!erro){
                jsonfile.readFile(myBD, (err,ficheiros)=>{
                    if(!err){
                        const data = '{"desc":'  + '"' + fields.desc + '"'+ ',' + '"nome":'  + '"'+files.ficheiro.name + '"' + '}'
                        var jsondata = JSON.parse(data)
                        ficheiros.push(jsondata)
                        console.dir(ficheiros)
                        jsonfile.writeFile(myBD,ficheiros,erro2 =>{
                            if(!erro2){
                                console.log('Registo gravado com sucesso.')
                            }
                            else{
                                console.log('Erro: ' + erro2)
                            }
                        })
                    }
                    else{
                        console.log('Erro: ' + err)
                    }
                })
                res.write(pug.renderFile('ficheiro-recebido.pug', {ficheiro: files.ficheiro.name,
                                                                   status: "Ficheiro recebido e guardado com sucesso"}))
            }   
            else{
                res.write(pug.renderFile('erro.pug',{e: "Ocorreram erros na gravação do ficheiro enviado: " + erro}))
            }
            res.end()
        }) 
    })
})

app.get('/ficheiros',(req,res) =>{
    jsonfile.readFile(myBD,(erro,ficheiros) =>{
        if(!erro){
            res.write(pug.renderFile('lista-ficheiros.pug',{lista: ficheiros}))
        }
        else{
            res.write(pug.renderFile('erro.pug',{e: erro}))
        }
        res.end()
    })
})

http.createServer(app).listen(7077,() =>{
    console.log('Servidor à escuta na porta 7077...')
})

function saveData(request,callback){
    const FORM_URLENCODED = 'application/x-www-form-urlencoded'
    if(request.headers['content-type'] === FORM_URLENCODED ){
        let body = ''
        request.on('data', chunk =>{
            body += chunk.toString()
        })
        request.on('end', ()=>{
            callback(parse(body))
        })
    }
    else{
        callback(null)
    }
}