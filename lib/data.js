var fs = require('fs')
var path = require('path')

// container of module to export
var lib = {'baseDir': null}

// base direcrirty of data folder
lib.baseDir = path.join(__dirname,'/../.data/')

// write to json
lib.create = (file, data, callback)=>{

	// open file 
	fs.open(lib.baseDir+'/'+file+'.json','wx', (err, descriptor)=>{
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
			callback("File creation failed! Might exist");
		}
	})
}