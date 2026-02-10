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

function templateHTML(list, id, body, control){
    return `<h1><a href="/">About Cat</a></h1>
    ${list}
    ${control}
    <h2>cat ${id}</h2>
    ${body}`;
}

const app = http.createServer(async (request, response) => {
    const queryData = url.parse(request.url, true).query;
    const pathname = url.parse(request.url, true).pathname;

    if(pathname === '/' && queryData.id === undefined){
        const id = 'home'
        const description = await getFile(path.join(__dirname, 'description', id));
        const list = await getDirList(path.join(__dirname, 'description'));
        let template = templateHTML(list, id, description,
            `<a href="/create">create</a>`
        );

        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }

    else if(pathname === '/' && queryData !== undefined){
        const id = queryData.id;
        const description = await getFile(path.join(__dirname, 'description', id));
        const list = await getDirList(path.join(__dirname, 'description'));
        let template = templateHTML(list, id, description,
            `<a href="/create">create</a> <a href="/update?id=${id}">update</a> <form action="/delete_process" method="post" onsubmit="return confirm('do you really want to delete this file?');" style="display:inline;">
            <input type="hidden" name="id" value="${id}">
            <input type="submit" value="delete">
            </form>`
        );

        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }

    else if(pathname === '/create'){
        const list = await getDirList(path.join(__dirname, 'description'));
        let template = templateHTML(list, 'creating',
            `<form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="tiltle"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit"></p>
                </form>
            `,
            ``
        );

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
        });
    }

    else if(pathname === '/update'){
        const id = queryData.id;
        const description = await getFile(path.join(__dirname, 'description', id));
        const list = await getDirList(path.join(__dirname, 'description'));
        let template = templateHTML(list, `${id} updating`,
            `<form action="/update_process" method="post">
                <input type="hidden" name="id" value="${id}">
                <p><input type="text" name="title" placeholder="tiltle" value="${id}"></p>
                <p><textarea name="description" placeholder="description">${description}</textarea></p>
                <p><input type="submit"></p>
                </form>
            `,
            ``
        );

        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }

    else if(pathname === `/update_process`){
        let body=``;
        request.on('data', (data) => {body += data;});
        request.on('end', async () => {
            try{
                const post = qs.parse(body);
                const id = post.id;
                const title = post.title;
                const description = post.description;
                await fs.rename(`description/${id}`, `description/${title}`);
                await fs.writeFile(`description/${title}`, description);

                response.writeHead(302, {'Location': `/?id=${title}`});
                response.end();
            }
            catch(err){
                console.log("Can't update the file");
                response.writeHead(500);
                response.end('Server Error');
            }
        });
    }

    else if(pathname === '/delete_process'){
        let body=``;
        request.on('data', (data) => {body += data;});
        request.on('end', async () => {
            try{
                const post = qs.parse(body);
                const id = post.id;
                await fs.unlink(`description/${id}`);

                response.writeHead(302, {'Location': `/`});
                response.end();
            }
            catch(err){
                console.log("Can't delete the file");
                response.writeHead(500);
                response.end('Server Error');
            }
        });
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