import { default as ts } from "typescript";

import { resolve } from "path";
import { cwd } from "process";
import fs from "fs";
import * as path from "path";

import mkdirp from "mkdirp";

function main() {
  const configPath = resolve(cwd(), "./test/tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
    .config;

  const outDir =
    path.resolve(path.dirname(configPath), config.compilerOptions.outDir) +
    "_deno";

  const basePath = path.resolve(path.dirname(configPath), config.include[0]);

  const filePath = basePath + "/index.ts";
  const program = ts.createProgram([filePath], { lib: [], noLib: true, skipLibCheck: true, types: [] });

  const source = program.getSourceFiles();

  function denoTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
    return context => {
      const visit: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        node = ts.visitEachChild(node, visit, context);

        if (ts.isImportDeclaration(node)) {
          // console.log(node)
          let moduleSpecifier = node.moduleSpecifier;
          // @ts-ignore
          const fileName = moduleSpecifier.text;

          const filePath = path.resolve(basePath, fileName);

          if (fs.existsSync(filePath)) {
            if (fs.lstatSync(filePath).isDirectory()) {
              // @ts-ignore
              moduleSpecifier.text += "/index.ts";
            }
          }
          else {
            // @ts-ignore
            moduleSpecifier.text += ".ts";
          }



          return ts.createImportDeclaration(node.decorators, node.modifiers, node.importClause, moduleSpecifier);
        }
        // return ts.visitEachChild(node, child => visit(child), context);

        return node;
      };

      return node => ts.visitNode(node, visit);
    }
  };

  const printer = ts.createPrinter();
  // console.log(source);
  source.forEach(s => {
    // @ts-ignore
    // console.log(s.);
    let result = ts.transform(s,
      [denoTransformer()]
    );


    // console.log(result);
    const filePath = outDir + s.fileName.split(basePath)[1];
    const src = printer.printFile(result.transformed[0]);

    console.log(filePath);
    console.log(src);

    let dirPath = filePath.substring(0, filePath.lastIndexOf("/"));

    mkdirp(dirPath);

    fs.writeFileSync(filePath, src);
  })


}

main();
