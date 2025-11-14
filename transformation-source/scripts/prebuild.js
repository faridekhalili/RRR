
(function(){

    const fs = require('fs');
    const path = require('path');
    const indexPath = path.resolve(__dirname, '..', 'src', 'transformations', 'index.ts');
    const enumPath = path.resolve(__dirname, '..', 'src', 'enums', 'transformation-type.enum.ts');

    fs.rmSync(indexPath, { force: true });
    fs.rmSync(enumPath, { force: true });

    const fileList = fs.readdirSync(path.resolve(__dirname, '..', 'src', 'transformations'));

    const transformationTypes = fileList.map(names => names.replace('.ts', '').replace(/-/g, '_').toLowerCase());

    const enumTypes = transformationTypes.map(type => `\t'${type}' = '${type}'`).join(',\n')
    const newTypeEnum = '\n// This is an auto-generated file.\n// DO NOT UPDATE!\n\n' +
        `export enum TransformationType {\n${enumTypes}\n}\n`;

    let newIndex = '\n// This is an auto-generated file.\n// DO NOT UPDATE!\n\n';
    for(let i = 0; i < fileList.length; i++) {
        newIndex += `export { default as ${transformationTypes[i]} } from './${fileList[i].replace('.ts', '')}';\n`;
    }

    fs.writeFileSync(enumPath, newTypeEnum, 'utf8');
    fs.writeFileSync(indexPath, newIndex, 'utf8');

}());
