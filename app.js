const http = require('http');
const fs = require('fs').promises;
const url = require('url');
const path = require('path');

async function getFile(filename){
    try{
        return await fs.readFile(filename, 'utf8');
    } catch(err){
        console.log("Can't find "+filename);
    }
}

async function getDirList(directoryname){
    try{
        let list=`<ol>`;
        const data = await fs.readdir(directoryname, 'utf8');
        for(const filename of data){
            if(filename !== 'home'){
                list += `<li><a href='/?id=${filename}'>${filename}</a></li>
                `
            }
        }
        list += `</ol>`;
        return list;
    } catch(err){
        console.log("Can't find"+directoryname);
    }
}

const app = http.createServer(async (request, response) => {
    const queryData = url.parse(request.url, true).query;
    const pathname = url.parse(request.url, true).pathname;

    if(pathname === '/'){
        const id = queryData.id || 'home'
        const description = await getFile(path.join(__dirname, 'description', id));
        const list = await getDirList(path.join(__dirname, 'description'));
        let template = `
        <h1><a href="/">About Cat</a></h1>
        ${list}
        <h2>cat ${id}</h2>
        <p>${description}</p>
        `;
        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }
    else{
        response.writeHead(404, {'content-type': 'text/html; charset=utf-8'});
        response.end('page not found');
    }

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});