
// parser will be the first stage for execution of JS
const { parse } = require('@babel/parser');
// next will be the compiler which is helps to convert the AST to equivalent JavaScript code
const { transformFromAstSync } = require('@babel/core');
// VM by node js will create an instance (JS sandbox environment) so that it can execute JS and
// produce output
const vm = require('vm');
const fs = require('fs');
const currentPath = process.cwd();
const filePath = currentPath + "/" + process.argv[2];


function requireModule(moduleName) {
    try {
        return require(moduleName);
    } catch (error) {
        throw new Error(`Module '${moduleName}' not found`);
    }
}





async function getFileContent() {
    if (filePath.endsWith('.js')) {
        try {
            const data = await fs.readFileSync(filePath, 'utf8');
            return data;
        } catch (err) {
            throw new Error('Error reading file:', err);
        }
    } else {
        throw new Error('The specified file is not a JavaScript file.');
    }
}
function start_execution(code) {
    // create vm context with require module
    const context = vm.createContext({
        require: requireModule,
        console: {
            log: (...args) => {
                console.log(...args);
            }
        }
    });

    let output = '';
    context.console.log = (...args) => {
        output += args.join(' ') + '\n';
    };

    // run the code on vm
    vm.runInContext(code, context);

    // spit out the output
    console.log(output);
}
async function start() {
    // get the file content
    let fileContent = await getFileContent();
    // start parsing
    const ast = parse(fileContent, { sourceType: 'module' });
    // transform AST into equivalent JS code
    const { code } = transformFromAstSync(ast, null, {
        configFile: false,
        plugins: [
            {
                visitor: {
                    Program(path) {
                        return path.toString();
                    },
                },
            },
        ],
    });
    // execute the code
    start_execution(code)
}
(async() => {
    start();
})();