// dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
var path = require('path')

const baseDir = path.join(__dirname,'/.data/')

fetchAll = ()=>{
	let files = fs.readdirSync(baseDir)
	let eits = {}

	for (eit in files){
		eits[eit] = files[eit].replace('.json','')
	}
	return eits
}

fetch = (email)=>{
	try{
		let rawdata = fs.readFileSync(baseDir+email+'.json')
		let output = JSON.parse(rawdata)
		return JSON.stringify(output)
	}catch(err){
		return 'EIT with provided email does not exist fam'
	}
}

deleteEit = (email)=>{
	// delete eit
	fs.unlink(baseDir+email+'.json', function (err) {
	    if (err) {
	    	return 'EIT with provided email does not exist fam'
	    }
	    // if no error, file has been deleted successfully
	    return 'EIT deleted!'
	});
}

editEit = (email, eit)=>{
	let rawdata = fs.readFileSync(baseDir+email+'.json')
	let fetchedEit = JSON.parse(rawdata)

	if(eit.firstname != fetchedEit.firstname && eit.firstname != null){
		fetchedEit.firstname = eit.firstname
	}
	if(eit.lastname != fetchedEit.lastname && eit.lastname != null){
		fetchedEit.lastname = eit.lastname
	}
	if(eit.country != fetchedEit.country && eit.country != null){
		fetchedEit.country = eit.country
	}
	if(eit.age != fetchedEit.age && eit.age != null){
		fetchedEit.age = eit.age
	}

	fs.writeFile(baseDir+email+'.json', JSON.stringify(fetchedEit, null, 2), (err) => {
        if (err) console.log('Error writing file:', err)
    })
}

// write to json
create = (file, data, callback)=>{

	// open file 
	fs.open(baseDir+file+'.json','wx', (err, descriptor)=>{
		if(!err && descriptor)
		{

			// stringify data for ease of manipulation
			var fetchedData = JSON.stringify(data)

			//write to file and close it
			fs.writeFile(descriptor, fetchedData, (err)=>{
				if(!err){

					fs.close(descriptor, (err)=>{
						if(!err){
							callback(false);
						}else{
							callback("Error closing file")
						}
					})

				}else{
					callback("Writing to file failed!")
				}
			})

		}else{
			callback("Adding EIT failed! Might exist");
		}
	})
}

// respond to http requests
var httpServer = http.createServer((req, res)=>{
	serverHandling(req, res)
})

var httpsOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
}

// respond to http requests
var httpsServer = https.createServer(httpsOptions,(req, res)=>{
	serverHandling(req, res)
})

let serverHandling = (req, res)=>{
	// fetch url user is accessing and parse it
	let parsedUrl = url.parse(req.url, true)

	// get the path that the user is visiting
	let path = parsedUrl.pathname
	// path = path.replace(/^\/+|\/+$/g,'')

	//get query string
	let query = parsedUrl.query;

	//get http method
	let method = req.method.toLowerCase();

	if (method == 'get' && path == '/'){
		if(!query.email){
			// print out list of all eits ids/emails
			res.setHeader('Content-Type','application/json')
			res.end('List of EITS:'+JSON.stringify(fetchAll()))
		}else{
			// print selected eit object
			res.end('EIT Details : '+fetch(query.email))
		}
	}
	else if (method == 'post' && path == '/add'){

		if(query.firstname && query.lastname && query.email && query.country && query.age){
			let eit = {
				firstname: query.firstname,
				lastname: query.lastname,
				email: query.email,
				country: query.country,
				age: query.age
			}

			create(eit.email, eit, (err)=>{
				err ? res.end(err) : res.end('Added EIT successfully!')
			})

		}else{
			res.end("I'm not an idiot my friend these details are incomplete! Be serious")
		}
	}
	else if (method == 'put' && path =='/edit'){
		let eit = {
				firstname: query.firstname,
				lastname: query.lastname,
				email: query.email,
				country: query.country,
				age: query.age
			}
		res.setHeader('Content-Type','application/json')
		editEit(eit.email, eit)
		res.end('Edited EIT successfully!')
	}
	else if (method == 'delete' && path == '/delete' && query.email){
		deleteEit(query.email)
		res.end("EIT deleted successfully...")
	}
	else{
		res.end('Path not found')
	}
}

//start http server on port 3000 and print to console
httpServer.listen(3000, ()=>{
	console.log('Server running on port 3000')
})

//start https server on port 3001 and print to console
httpsServer.listen(3001, ()=>{
	console.log('Server running on port 3001')
})