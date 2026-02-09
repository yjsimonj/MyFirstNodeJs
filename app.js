const http = require('http');
const fs = require('fs').promises;
const url = require('url');
const path = require('path');
const qs = require('querystring');

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

function templateHTML(list, id, body){

    return `<h1><a href="/">About Cat</a></h1>
    ${list}
    <a href="/create">create</a>
    <h2>cat ${id}</h2>
    ${body}`;

}
const app = http.createServer(async (request, response) => {
    const queryData = url.parse(request.url, true).query;
    const pathname = url.parse(request.url, true).pathname;

    if(pathname === '/'){
        const id = queryData.id || 'home'
        const description = await getFile(path.join(__dirname, 'description', id));
        const list = await getDirList(path.join(__dirname, 'description'));
        let template = templateHTML(list, id, description);
        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }
    else if(pathname === '/create'){
        const list = await getDirList(path.join(__dirname, 'description'));
        let template = templateHTML(list, 'creating', `<form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="tiltle"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit"></p>
                </form>
            `);
        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }
    else if(pathname === '/create_process'){
        let body=``;
        request.on('data', (data) => {body += data;});
        request.on('end', async () => {
            try{
                const post = qs.parse(body);
                const title = post.title;
                const description = post.description;
                await fs.writeFile(`description/${title}`, description);
                response.writeHead(302, {'Location': `/?id=${title}`});
                response.end();
            }
            catch(err){
                console.log("Can't write the file");
                response.writeHead(500);
                response.end('Server Error');
            }
        })
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